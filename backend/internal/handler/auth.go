package handler

import (
	"encoding/json"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/ncd/backend/internal/middleware"
)

type LoginRequest struct {
	Key string `json:"key"`
}

type UserDTO struct {
	ID       string `json:"id"`
	Email    string `json:"email"`
	Role     string `json:"role"`
	FullName string `json:"full_name"`
	Position string `json:"position"`
	Key      string `json:"key,omitempty"`
}

func isSecureRequest(r *http.Request) bool {
	return r.TLS != nil || r.Header.Get("X-Forwarded-Proto") == "https" || os.Getenv("APP_ENV") == "production"
}

func Login(jwtSecret string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req LoginRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, `{"error": "Format data login tidak valid"}`, http.StatusBadRequest)
			return
		}

		cleanKey := strings.TrimSpace(req.Key)
		if cleanKey == "" {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusBadRequest)
			_ = json.NewEncoder(w).Encode(map[string]string{
				"error": "Kunci akses / token portal wajib diisi",
			})
			return
		}

		// Direct Access Key / Token Flow (Only authenticated via Token)
		accessKey, ok := AuthenticateByKey(cleanKey)
		if !ok {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusUnauthorized)
			_ = json.NewEncoder(w).Encode(map[string]string{
				"error": "Kunci akses / token tidak valid atau telah dicabut",
			})
			return
		}

		user := UserDTO{
			ID:       accessKey.ID,
			Email:    accessKey.Email,
			Role:     accessKey.Role,
			FullName: accessKey.Assignee,
			Position: accessKey.Position,
			Key:      accessKey.Key,
		}

		// Create JWT token
		claims := jwt.MapClaims{
			"user_id":   user.ID,
			"email":     user.Email,
			"role":      user.Role,
			"full_name": user.FullName,
			"exp":       time.Now().Add(24 * time.Hour).Unix(),
		}

		token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
		tokenString, err := token.SignedString([]byte(jwtSecret))
		if err != nil {
			http.Error(w, "Could not generate auth token", http.StatusInternalServerError)
			return
		}

		// Set HTTP-Only Cookie with Secure flag enforcement over HTTPS/production
		http.SetCookie(w, &http.Cookie{
			Name:     "ncd_token",
			Value:    tokenString,
			Path:     "/",
			HttpOnly: true,
			Secure:   isSecureRequest(r),
			SameSite: http.SameSiteLaxMode,
			MaxAge:   86400,
		})

		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]interface{}{
			"message": "Login berhasil",
			"token":   tokenString,
			"user":    user,
		})
	}
}

func Logout(w http.ResponseWriter, r *http.Request) {
	http.SetCookie(w, &http.Cookie{
		Name:     "ncd_token",
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		Secure:   isSecureRequest(r),
		SameSite: http.SameSiteLaxMode,
		MaxAge:   -1,
	})

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]string{
		"message": "Logout berhasil",
	})
}

func GetMe(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value(middleware.UserContextKey).(*middleware.UserClaims)
	if !ok || claims == nil {
		http.Error(w, `{"error": "Unauthorized: Sesi tidak ditemukan"}`, http.StatusUnauthorized)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"id":        claims.UserID,
		"email":     claims.Email,
		"role":      claims.Role,
		"full_name": claims.FullName,
	})
}
