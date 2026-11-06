package middleware

import (
	"fmt"
	"net"
	"net/http"
	"net/url"
	"os"
	"strings"
	"sync"
	"time"
)

type ipBucket struct {
	tokens     int
	lastRefill time.Time
}

type RateLimiter struct {
	mu         sync.Mutex
	buckets    map[string]*ipBucket
	limit      int
	refillRate time.Duration
}

func NewRateLimiter(limit int, per time.Duration) *RateLimiter {
	rl := &RateLimiter{
		buckets:    make(map[string]*ipBucket),
		limit:      limit,
		refillRate: per,
	}

	// Periodic cleanup of stale IPs to prevent memory leaks (runs every 5 minutes)
	go func() {
		ticker := time.NewTicker(5 * time.Minute)
		for range ticker.C {
			rl.mu.Lock()
			now := time.Now()
			for ip, b := range rl.buckets {
				if now.Sub(b.lastRefill) > 2*per {
					delete(rl.buckets, ip)
				}
			}
			rl.mu.Unlock()
		}
	}()

	return rl
}

func (rl *RateLimiter) Middleware() func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ip := getClientIP(r)

			rl.mu.Lock()
			b, exists := rl.buckets[ip]
			now := time.Now()

			if !exists {
				b = &ipBucket{
					tokens:     rl.limit - 1,
					lastRefill: now,
				}
				rl.buckets[ip] = b
				rl.mu.Unlock()
				w.Header().Set("X-RateLimit-Limit", fmt.Sprintf("%d", rl.limit))
				w.Header().Set("X-RateLimit-Remaining", fmt.Sprintf("%d", rl.limit-1))
				next.ServeHTTP(w, r)
				return
			}

			// Refill tokens based on elapsed duration
			elapsed := now.Sub(b.lastRefill)
			tokensToAdd := int(elapsed / rl.refillRate)
			if tokensToAdd > 0 {
				b.tokens += tokensToAdd
				if b.tokens > rl.limit {
					b.tokens = rl.limit
				}
				b.lastRefill = now
			}

			if b.tokens <= 0 {
				rl.mu.Unlock()
				w.Header().Set("Retry-After", "30")
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusTooManyRequests)
				_, _ = w.Write([]byte(`{"error":"Terlalu banyak permintaan (Rate limit exceeded). Silakan coba lagi dalam 30 detik."}`))
				return
			}

			b.tokens--
			remaining := b.tokens
			rl.mu.Unlock()

			w.Header().Set("X-RateLimit-Limit", fmt.Sprintf("%d", rl.limit))
			w.Header().Set("X-RateLimit-Remaining", fmt.Sprintf("%d", remaining))
			next.ServeHTTP(w, r)
		})
	}
}

// BodyLimit middleware batasi ukuran payload HTTP request body (mencegah memory exhaustion & DDoS)
func BodyLimit(maxBytes int64) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			r.Body = http.MaxBytesReader(w, r.Body, maxBytes)
			next.ServeHTTP(w, r)
		})
	}
}

// CacheHeaders middleware menetapkan cache browser/CDN untuk rute publik statis
func CacheHeaders(maxAgeSec int, staleSec int) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if r.Method == http.MethodGet {
				w.Header().Set("Cache-Control", fmt.Sprintf("public, max-age=%d, stale-while-revalidate=%d", maxAgeSec, staleSec))
				w.Header().Set("Vary", "Accept-Encoding")
			}
			next.ServeHTTP(w, r)
		})
	}
}

func isTrustedProxy(remoteAddr string) bool {
	host, _, err := net.SplitHostPort(remoteAddr)
	if err != nil {
		host = remoteAddr
	}
	ip := net.ParseIP(host)
	if ip == nil {
		return false
	}
	// Always trust loopback addresses (127.0.0.1, ::1)
	if ip.IsLoopback() {
		return true
	}
	// Trust private RFC 1918 / RFC 4193 addresses used by reverse proxies / internal load balancers
	if ip.IsPrivate() {
		return true
	}
	// Trust custom configured proxies from environment (comma-separated IPs/CIDRs)
	if custom := os.Getenv("TRUSTED_PROXIES"); custom != "" {
		for _, part := range strings.Split(custom, ",") {
			part = strings.TrimSpace(part)
			if part == "" {
				continue
			}
			if _, cidrNet, err := net.ParseCIDR(part); err == nil {
				if cidrNet.Contains(ip) {
					return true
				}
			} else if part == host {
				return true
			}
		}
	}
	return false
}

func getClientIP(r *http.Request) string {
	remoteHost, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		remoteHost = r.RemoteAddr
	}

	// Only inspect proxy headers if the direct network peer is verified as a trusted proxy
	if isTrustedProxy(r.RemoteAddr) {
		// 1. Cek Header X-Forwarded-For
		if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
			parts := strings.Split(xff, ",")
			clientIP := strings.TrimSpace(parts[0])
			if net.ParseIP(clientIP) != nil {
				return clientIP
			}
		}
		// 2. Cek X-Real-IP
		if xrip := strings.TrimSpace(r.Header.Get("X-Real-IP")); xrip != "" {
			if net.ParseIP(xrip) != nil {
				return xrip
			}
		}
	}

	// Direct client connection fallback
	return remoteHost
}

// SecurityHeaders injects defense-in-depth security headers into all HTTP responses
func SecurityHeaders(env string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			h := w.Header()

			// 1. MIME Sniffing protection
			h.Set("X-Content-Type-Options", "nosniff")

			// 2. Clickjacking protection
			h.Set("X-Frame-Options", "DENY")

			// 3. Legacy XSS filter
			h.Set("X-XSS-Protection", "1; mode=block")

			// 4. Referrer Policy
			h.Set("Referrer-Policy", "strict-origin-when-cross-origin")

			// 5. Restrict dangerous browser features
			h.Set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()")

			// 6. Content Security Policy (CSP)
			csp := "default-src 'self'; " +
				"script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com; " +
				"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
				"font-src 'self' https://fonts.gstatic.com data:; " +
				"img-src 'self' data: https: blob:; " +
				"connect-src 'self' https: ws: wss:; " +
				"frame-ancestors 'none'; " +
				"base-uri 'self'; " +
				"form-action 'self';"
			h.Set("Content-Security-Policy", csp)

			// 7. Strict-Transport-Security (HSTS): Enforce HTTPS in production or secure connections
			if env == "production" || r.TLS != nil || r.Header.Get("X-Forwarded-Proto") == "https" {
				h.Set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload")
			}

			next.ServeHTTP(w, r)
		})
	}
}

// HTTPSRedirect enforces HTTPS in production environments behind a reverse proxy
func HTTPSRedirect(env string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if env == "production" && r.Header.Get("X-Forwarded-Proto") == "http" {
				target := "https://" + r.Host + r.URL.RequestURI()
				http.Redirect(w, r, target, http.StatusMovedPermanently)
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}

// CSRFProtection validates Origin and Referer for state-mutating requests when authenticating via session cookie
func CSRFProtection(allowedOrigin string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Skip safe / read-only methods
			if r.Method == http.MethodGet || r.Method == http.MethodHead || r.Method == http.MethodOptions {
				next.ServeHTTP(w, r)
				return
			}

			// If the request uses Authorization: Bearer, it is an explicit API client and not susceptible to ambient cookie CSRF
			authHeader := r.Header.Get("Authorization")
			if strings.HasPrefix(authHeader, "Bearer ") {
				next.ServeHTTP(w, r)
				return
			}

			// If session cookie "ncd_token" is present, enforce strict Origin/Referer verification
			if _, err := r.Cookie("ncd_token"); err == nil {
				origin := r.Header.Get("Origin")
				referer := r.Header.Get("Referer")

				// If both are missing, reject state-mutating cookie request
				if origin == "" && referer == "" {
					http.Error(w, `{"error":"CSRF validation failed: Missing Origin and Referer headers"}`, http.StatusForbidden)
					return
				}

				allowed := false
				if origin != "" {
					allowed = isAllowedOrigin(origin, allowedOrigin, r.Host)
				} else if referer != "" {
					allowed = isAllowedReferer(referer, allowedOrigin, r.Host)
				}

				if !allowed {
					http.Error(w, `{"error":"CSRF validation failed: Request origin not authorized"}`, http.StatusForbidden)
					return
				}
			}

			next.ServeHTTP(w, r)
		})
	}
}

func isAllowedOrigin(origin string, allowedOrigin string, host string) bool {
	cleanOrigin := strings.TrimRight(origin, "/")
	cleanAllowed := strings.TrimRight(allowedOrigin, "/")
	if strings.EqualFold(cleanOrigin, cleanAllowed) {
		return true
	}
	// Check against request Host
	u, err := url.Parse(origin)
	if err == nil && (strings.EqualFold(u.Host, host) || strings.EqualFold(u.Hostname(), "localhost") || strings.EqualFold(u.Hostname(), "127.0.0.1")) {
		return true
	}
	return false
}

func isAllowedReferer(referer string, allowedOrigin string, host string) bool {
	u, err := url.Parse(referer)
	if err != nil {
		return false
	}
	refOrigin := fmt.Sprintf("%s://%s", u.Scheme, u.Host)
	return isAllowedOrigin(refOrigin, allowedOrigin, host)
}

