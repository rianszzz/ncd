package middleware

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestSecurityHeaders(t *testing.T) {
	dummyHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	secMiddleware := SecurityHeaders("production")
	handler := secMiddleware(dummyHandler)

	req := httptest.NewRequest("GET", "https://ncd.web.id/api/v1/health", nil)
	rr := httptest.NewRecorder()

	handler.ServeHTTP(rr, req)

	if rr.Header().Get("X-Content-Type-Options") != "nosniff" {
		t.Errorf("expected nosniff, got %s", rr.Header().Get("X-Content-Type-Options"))
	}
	if rr.Header().Get("X-Frame-Options") != "DENY" {
		t.Errorf("expected DENY, got %s", rr.Header().Get("X-Frame-Options"))
	}
	if rr.Header().Get("X-XSS-Protection") != "1; mode=block" {
		t.Errorf("expected 1; mode=block, got %s", rr.Header().Get("X-XSS-Protection"))
	}
	if rr.Header().Get("Referrer-Policy") != "strict-origin-when-cross-origin" {
		t.Errorf("expected strict-origin-when-cross-origin, got %s", rr.Header().Get("Referrer-Policy"))
	}
	if !strings.Contains(rr.Header().Get("Strict-Transport-Security"), "max-age=") {
		t.Errorf("expected HSTS header in production, got %s", rr.Header().Get("Strict-Transport-Security"))
	}
	if !strings.Contains(rr.Header().Get("Content-Security-Policy"), "default-src 'self'") {
		t.Errorf("expected CSP default-src 'self', got %s", rr.Header().Get("Content-Security-Policy"))
	}
}

func TestHTTPSRedirect(t *testing.T) {
	dummyHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	redirectMiddleware := HTTPSRedirect("production")
	handler := redirectMiddleware(dummyHandler)

	// Simulating HTTP request forwarded by proxy
	req := httptest.NewRequest("GET", "http://ncd.web.id/api/v1/health", nil)
	req.Header.Set("X-Forwarded-Proto", "http")
	rr := httptest.NewRecorder()

	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusMovedPermanently {
		t.Fatalf("expected status 301, got %d", rr.Code)
	}
	loc := rr.Header().Get("Location")
	if !strings.HasPrefix(loc, "https://") {
		t.Fatalf("expected redirect to https, got %s", loc)
	}
}

func TestCSRFProtection(t *testing.T) {
	dummyHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte(`{"success":true}`))
	})

	csrfMiddleware := CSRFProtection("https://ncd.web.id")
	handler := csrfMiddleware(dummyHandler)

	// 1. GET requests should always pass
	getReq := httptest.NewRequest("GET", "/api/v1/finance/summary", nil)
	getRR := httptest.NewRecorder()
	handler.ServeHTTP(getRR, getReq)
	if getRR.Code != http.StatusOK {
		t.Errorf("GET should pass CSRF, got code %d", getRR.Code)
	}

	// 2. Bearer Authorization mutating request should pass (API client)
	bearerReq := httptest.NewRequest("POST", "/api/v1/finance/transactions", strings.NewReader(`{}`))
	bearerReq.Header.Set("Authorization", "Bearer valid-jwt-token")
	bearerRR := httptest.NewRecorder()
	handler.ServeHTTP(bearerRR, bearerReq)
	if bearerRR.Code != http.StatusOK {
		t.Errorf("Bearer auth should bypass CSRF check, got code %d", bearerRR.Code)
	}

	// 3. Cookie-authenticated mutating request WITHOUT Origin or Referer should be BLOCKED (403)
	cookieReq := httptest.NewRequest("POST", "/api/v1/finance/transactions", strings.NewReader(`{}`))
	cookieReq.AddCookie(&http.Cookie{Name: "ncd_token", Value: "session-token"})
	cookieRR := httptest.NewRecorder()
	handler.ServeHTTP(cookieRR, cookieReq)
	if cookieRR.Code != http.StatusForbidden {
		t.Fatalf("expected cookie request without origin to be rejected with 403, got %d", cookieRR.Code)
	}

	// 4. Cookie-authenticated mutating request WITH authorized Origin should PASS
	allowedReq := httptest.NewRequest("POST", "/api/v1/finance/transactions", strings.NewReader(`{}`))
	allowedReq.AddCookie(&http.Cookie{Name: "ncd_token", Value: "session-token"})
	allowedReq.Header.Set("Origin", "https://ncd.web.id")
	allowedRR := httptest.NewRecorder()
	handler.ServeHTTP(allowedRR, allowedReq)
	if allowedRR.Code != http.StatusOK {
		t.Fatalf("expected authorized origin to pass with 200, got %d", allowedRR.Code)
	}

	// 5. Cookie-authenticated mutating request WITH cross-site attacker origin should be BLOCKED (403)
	evilReq := httptest.NewRequest("POST", "/api/v1/finance/transactions", strings.NewReader(`{}`))
	evilReq.AddCookie(&http.Cookie{Name: "ncd_token", Value: "session-token"})
	evilReq.Header.Set("Origin", "https://evil-attacker.com")
	evilRR := httptest.NewRecorder()
	handler.ServeHTTP(evilRR, evilReq)
	if evilRR.Code != http.StatusForbidden {
		t.Fatalf("expected evil origin to be rejected with 403, got %d", evilRR.Code)
	}
}
