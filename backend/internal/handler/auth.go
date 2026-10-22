package handler

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type UserDTO struct {
	ID       string `json:"id"`
	Email    string `json:"email"`
	Role     string `json:"role"`
	FullName string `json:"full_name"`
	Position string `json:"position"`
}

func Login(jwtSecret string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req LoginRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid login body", http.StatusBadRequest)
			return
		}

		// Roster check for initial test users
		var user UserDTO
		switch req.Email {
		case "godadmin@ncd.dev":
			user = UserDTO{ID: "u-rian", Email: "godadmin@ncd.dev", Role: "GOD_ADMIN", FullName: "Rianszzz", Position: "Developer Lead"}
		case "chairman@ncd.dev":
			user = UserDTO{ID: "u-mirza", Email: "chairman@ncd.dev", Role: "SUPER_ADMIN", FullName: "Mirza Danisywar Noor Wahyu", Position: "Chairman"}
		case "vice1@ncd.dev":
			user = UserDTO{ID: "u-fauzan", Email: "vice1@ncd.dev", Role: "SUPER_ADMIN", FullName: "Muhamad Fauzan Al Farikhi", Position: "Vice Chairman I"}
		case "bendahara1@ncd.dev":
			user = UserDTO{ID: "u-iqbal", Email: "bendahara1@ncd.dev", Role: "BENDAHARA_I", FullName: "Muhammad Iqbal Fajri", Position: "Bendahara I"}
		case "bendahara2@ncd.dev":
			user = UserDTO{ID: "u-sri", Email: "bendahara2@ncd.dev", Role: "BENDAHARA_II", FullName: "Sri Gunarti Wijiastuti", Position: "Bendahara II"}
		case "sekretaris1@ncd.dev":
			user = UserDTO{ID: "u-annisa", Email: "sekretaris1@ncd.dev", Role: "SEKRETARIS", FullName: "Annisa Saskia", Position: "Sekretaris I"}
		default:
			// Default demo member
			user = UserDTO{ID: "u-member", Email: req.Email, Role: "MEMBER", FullName: "Anggota NCD", Position: "Member"}
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
			http.Error(w, "Failed to sign token", http.StatusInternalServerError)
			return
		}

		// Set httpOnly cookie
		http.SetCookie(w, &http.Cookie{
			Name:     "access_token",
			Value:    tokenString,
			Path:     "/",
			HttpOnly: true,
			SameSite: http.SameSiteLaxMode,
			MaxAge:   86400,
		})

		resp := map[string]interface{}{
			"status": "success",
			"user":   user,
			"token":  tokenString,
		}

		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(resp)
	}
}

func Logout(w http.ResponseWriter, r *http.Request) {
	http.SetCookie(w, &http.Cookie{
		Name:     "access_token",
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		MaxAge:   -1,
	})

	resp := map[string]string{"status": "logged out"}
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(resp)
}
