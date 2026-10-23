package middleware

import (
	"context"
	"fmt"
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

type contextKey string

const (
	UserContextKey contextKey = "user_claims"
)

type UserClaims struct {
	UserID   string `json:"user_id"`
	Email    string `json:"email"`
	Role     string `json:"role"`
	FullName string `json:"full_name"`
	jwt.RegisteredClaims
}

// RequireAuth memverifikasi token JWT dari Header Authorization (Bearer) atau Cookie (ncd_token)
func RequireAuth(jwtSecret string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			var tokenString string

			// 1. Cek Header Authorization
			authHeader := r.Header.Get("Authorization")
			if strings.HasPrefix(authHeader, "Bearer ") {
				tokenString = strings.TrimPrefix(authHeader, "Bearer ")
			}

			// 2. Cek Cookie jika header kosong
			if tokenString == "" {
				if cookie, err := r.Cookie("ncd_token"); err == nil {
					tokenString = cookie.Value
				}
			}

			if tokenString == "" {
				http.Error(w, `{"error": "Unauthorized: Sesi login diperlukan untuk mengakses endpoint privat ini"}`, http.StatusUnauthorized)
				return
			}

			// 3. Parse dan validasi token
			claims := &UserClaims{}
			token, err := jwt.ParseWithClaims(tokenString, claims, func(t *jwt.Token) (interface{}, error) {
				if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
					return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
				}
				return []byte(jwtSecret), nil
			})

			if err != nil || !token.Valid {
				http.Error(w, `{"error": "Unauthorized: Token tidak valid atau telah kedaluwarsa"}`, http.StatusUnauthorized)
				return
			}

			// 4. Inject claims ke context
			ctx := context.WithValue(r.Context(), UserContextKey, claims)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// RequireRole membatasi hak akses berdasarkan role pengguna
func RequireRole(allowedRoles ...string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			claims, ok := r.Context().Value(UserContextKey).(*UserClaims)
			if !ok || claims == nil {
				http.Error(w, `{"error": "Unauthorized: Data pengguna tidak ditemukan"}`, http.StatusUnauthorized)
				return
			}

			// GOD_ADMIN selalu memiliki akses penuh (bypass)
			if claims.Role == "GOD_ADMIN" {
				next.ServeHTTP(w, r)
				return
			}

			hasRole := false
			for _, role := range allowedRoles {
				if claims.Role == role {
					hasRole = true
					break
				}
			}

			if !hasRole {
				http.Error(w, fmt.Sprintf(`{"error": "Forbidden: Hak akses role %s tidak diizinkan untuk tindakan ini"}`, claims.Role), http.StatusForbidden)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}
