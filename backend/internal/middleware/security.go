package middleware

import (
	"fmt"
	"net"
	"net/http"
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
