package handler

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/ncd/backend/internal/middleware"
)

type AccessKey struct {
	ID         string     `json:"id"`
	Key        string     `json:"key"`
	Role       string     `json:"role"`
	Assignee   string     `json:"assignee"`
	Position   string     `json:"position"`
	Email      string     `json:"email"`
	IsActive   bool       `json:"is_active"`
	CreatedAt  time.Time  `json:"created_at"`
	LastUsedAt *time.Time `json:"last_used_at,omitempty"`
}

type CreateTokenRequest struct {
	Key      string `json:"key,omitempty"`
	Role     string `json:"role"`
	Assignee string `json:"assignee"`
	Position string `json:"position"`
	Email    string `json:"email,omitempty"`
}

var (
	tokenLock sync.RWMutex
	accessKeys = []AccessKey{
		{
			ID:        "tok-god-1",
			Key:       "NCD-GOD-MASTER-2026",
			Role:      "GOD_ADMIN",
			Assignee:  "Rianszzz",
			Position:  "Developer Lead & System Architect",
			Email:     "godadmin@ncd.dev",
			IsActive:  true,
			CreatedAt: time.Date(2026, 1, 1, 0, 0, 0, 0, time.UTC),
		},
		{
			ID:        "tok-chair-1",
			Key:       "NCD-CHAIRMAN-2026",
			Role:      "SUPER_ADMIN",
			Assignee:  "Mirza Danisywar Noor Wahyu",
			Position:  "Chairman",
			Email:     "chairman@ncd.dev",
			IsActive:  true,
			CreatedAt: time.Date(2026, 1, 10, 0, 0, 0, 0, time.UTC),
		},
		{
			ID:        "tok-bend1-1",
			Key:       "NCD-BENDAHARA1-2026",
			Role:      "BENDAHARA_I",
			Assignee:  "Muhammad Iqbal Fajri",
			Position:  "Bendahara I (Maker)",
			Email:     "bendahara1@ncd.dev",
			IsActive:  true,
			CreatedAt: time.Date(2026, 1, 15, 0, 0, 0, 0, time.UTC),
		},
		{
			ID:        "tok-bend2-1",
			Key:       "NCD-BENDAHARA2-2026",
			Role:      "BENDAHARA_II",
			Assignee:  "Sri Gunarti Wijiastuti",
			Position:  "Bendahara II (Checker)",
			Email:     "bendahara2@ncd.dev",
			IsActive:  true,
			CreatedAt: time.Date(2026, 1, 15, 0, 0, 0, 0, time.UTC),
		},
		{
			ID:        "tok-sekr-1",
			Key:       "NCD-SEKRETARIS-2026",
			Role:      "SEKRETARIS",
			Assignee:  "Annisa Saskia",
			Position:  "Sekretaris I",
			Email:     "sekretaris1@ncd.dev",
			IsActive:  true,
			CreatedAt: time.Date(2026, 1, 20, 0, 0, 0, 0, time.UTC),
		},
		{
			ID:        "tok-member-1",
			Key:       "NCD-MEMBER-DEMO",
			Role:      "MEMBER",
			Assignee:  "Anggota Komunitas NCD",
			Position:  "Active Member",
			Email:     "member@ncd.dev",
			IsActive:  true,
			CreatedAt: time.Date(2026, 2, 1, 0, 0, 0, 0, time.UTC),
		},
	}
)

func getTokensFilePath() string {
	if _, err := os.Stat("backend/data"); err == nil {
		return "backend/data/tokens.json"
	}
	if _, err := os.Stat("data"); err == nil {
		return "data/tokens.json"
	}
	if _, err := os.Stat("../../data"); err == nil {
		return "../../data/tokens.json"
	}
	return "data/tokens.json"
}

func saveTokensToDiskLocked() {
	filePath := getTokensFilePath()
	bytes, err := json.MarshalIndent(accessKeys, "", "  ")
	if err == nil {
		_ = os.WriteFile(filePath, bytes, 0644)
	}
}

func loadTokensFromDisk() {
	tokenLock.Lock()
	defer tokenLock.Unlock()

	filePath := getTokensFilePath()
	bytes, err := os.ReadFile(filePath)
	if err == nil && len(bytes) > 0 {
		var loaded []AccessKey
		if err := json.Unmarshal(bytes, &loaded); err == nil && len(loaded) > 0 {
			accessKeys = loaded
			return
		}
	}
	// Initial save of default tokens if file does not exist yet
	saveTokensToDiskLocked()
}

func init() {
	loadTokensFromDisk()
}

func AuthenticateByKey(rawKey string) (*AccessKey, bool) {
	cleanKey := strings.TrimSpace(rawKey)
	if cleanKey == "" {
		return nil, false
	}

	tokenLock.Lock()
	defer tokenLock.Unlock()

	for i := range accessKeys {
		if strings.EqualFold(accessKeys[i].Key, cleanKey) && accessKeys[i].IsActive {
			now := time.Now()
			accessKeys[i].LastUsedAt = &now
			copied := accessKeys[i]
			return &copied, true
		}
	}
	return nil, false
}

func IsTokenActive(keyOrID string) bool {
	clean := strings.TrimSpace(keyOrID)
	if clean == "" {
		return false
	}
	tokenLock.RLock()
	defer tokenLock.RUnlock()
	for i := range accessKeys {
		if accessKeys[i].ID == clean || strings.EqualFold(accessKeys[i].Key, clean) {
			return accessKeys[i].IsActive
		}
	}
	return true
}

func ListTokens(w http.ResponseWriter, r *http.Request) {
	tokenLock.RLock()
	defer tokenLock.RUnlock()

	result := make([]AccessKey, len(accessKeys))
	copy(result, accessKeys)

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(result)
}

func CreateToken(w http.ResponseWriter, r *http.Request) {
	var req CreateTokenRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "Format payload token tidak valid"})
		return
	}

	role := strings.ToUpper(strings.TrimSpace(req.Role))
	if role == "" {
		role = "MEMBER"
	}
	assignee := strings.TrimSpace(req.Assignee)
	if assignee == "" {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "Nama penerima token wajib diisi"})
		return
	}
	position := strings.TrimSpace(req.Position)
	if position == "" {
		position = role
	}
	email := strings.TrimSpace(req.Email)
	if email == "" {
		email = fmt.Sprintf("%s@ncd.dev", strings.ToLower(strings.ReplaceAll(assignee, " ", ".")))
	}

	tokenLock.Lock()
	defer tokenLock.Unlock()

	// Tolak jika terdapat token dengan nama (assignee) yang sama (case-insensitive)
	for _, k := range accessKeys {
		if strings.EqualFold(strings.TrimSpace(k.Assignee), assignee) {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusConflict)
			_ = json.NewEncoder(w).Encode(map[string]string{
				"error": fmt.Sprintf("Token dengan nama penerima '%s' sudah terdaftar dalam sistem", assignee),
			})
			return
		}
	}

	var generatedKey string
	if req.Key != "" {
		cleanKey := strings.ToUpper(strings.TrimSpace(req.Key))
		if !strings.HasPrefix(cleanKey, "NCD-") {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusBadRequest)
			_ = json.NewEncoder(w).Encode(map[string]string{"error": "Kode token wajib diawali dengan 'NCD-'"})
			return
		}
		for _, k := range accessKeys {
			if strings.EqualFold(k.Key, cleanKey) {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusConflict)
				_ = json.NewEncoder(w).Encode(map[string]string{
					"error": fmt.Sprintf("Token dengan kode '%s' sudah terdaftar", cleanKey),
				})
				return
			}
		}
		generatedKey = cleanKey
	} else {
		// Generate clean human-readable access key: NCD-{ROLE}-{RAND8}
		for {
			randomBytes := make([]byte, 4)
			_, _ = rand.Read(randomBytes)
			suffix := strings.ToUpper(hex.EncodeToString(randomBytes))
			candidate := fmt.Sprintf("NCD-%s-%s", strings.ReplaceAll(role, "_", ""), suffix)
			exists := false
			for _, k := range accessKeys {
				if strings.EqualFold(k.Key, candidate) {
					exists = true
					break
				}
			}
			if !exists {
				generatedKey = candidate
				break
			}
		}
	}

	newKey := AccessKey{
		ID:        "tok-" + uuid.New().String()[:8],
		Key:       generatedKey,
		Role:      role,
		Assignee:  assignee,
		Position:  position,
		Email:     email,
		IsActive:  true,
		CreatedAt: time.Now(),
	}

	// Prepend so the newest token appears at the top
	accessKeys = append([]AccessKey{newKey}, accessKeys...)
	saveTokensToDiskLocked()

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(newKey)
}

func RevokeToken(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		http.Error(w, `{"error": "ID token wajib disertakan"}`, http.StatusBadRequest)
		return
	}

	tokenLock.Lock()
	defer tokenLock.Unlock()

	for i := range accessKeys {
		if accessKeys[i].ID == id {
			accessKeys[i].IsActive = !accessKeys[i].IsActive
			saveTokensToDiskLocked()
			w.Header().Set("Content-Type", "application/json")
			_ = json.NewEncoder(w).Encode(accessKeys[i])
			return
		}
	}

	http.Error(w, `{"error": "Token tidak ditemukan"}`, http.StatusNotFound)
}

func DeleteToken(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		http.Error(w, `{"error": "ID token wajib disertakan"}`, http.StatusBadRequest)
		return
	}

	tokenLock.Lock()
	defer tokenLock.Unlock()

	for i := range accessKeys {
		if accessKeys[i].ID == id {
			if accessKeys[i].Key == "NCD-GOD-MASTER-2026" {
				http.Error(w, `{"error": "Master God Admin key tidak dapat dihapus"}`, http.StatusBadRequest)
				return
			}
			accessKeys = append(accessKeys[:i], accessKeys[i+1:]...)
			saveTokensToDiskLocked()
			w.Header().Set("Content-Type", "application/json")
			_ = json.NewEncoder(w).Encode(map[string]string{"message": "Token berhasil dihapus"})
			return
		}
	}

	http.Error(w, `{"error": "Token tidak ditemukan"}`, http.StatusNotFound)
}

type UpdateTokenRequest struct {
	NewKey string `json:"new_key"`
}

func UpdateToken(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value(middleware.UserContextKey).(*middleware.UserClaims)
	if !ok || claims == nil {
		http.Error(w, `{"error": "Unauthorized: Sesi login diperlukan"}`, http.StatusUnauthorized)
		return
	}

	targetID := chi.URLParam(r, "id")
	if targetID == "" || targetID == "me" || targetID == "my-token" {
		targetID = claims.UserID
	}

	// IDOR Protection: regular users can only update their own token
	if claims.Role != "GOD_ADMIN" && claims.UserID != targetID {
		http.Error(w, `{"error": "Forbidden: Anda hanya berhak mengubah token milik akun Anda sendiri"}`, http.StatusForbidden)
		return
	}

	var req UpdateTokenRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Format payload tidak valid"}`, http.StatusBadRequest)
		return
	}

	cleanKey := strings.ToUpper(strings.TrimSpace(req.NewKey))

	// Requirement: Token harus berawalan dengan NCD-
	if !strings.HasPrefix(cleanKey, "NCD-") {
		http.Error(w, `{"error": "Token tidak valid: Kode token wajib diawali dengan awalan 'NCD-'" }`, http.StatusBadRequest)
		return
	}

	if len(cleanKey) < 5 || len(cleanKey) > 64 {
		http.Error(w, `{"error": "Panjang token minimal 5 karakter dan maksimal 64 karakter"}`, http.StatusBadRequest)
		return
	}

	// Valid character check: only A-Z, 0-9, '-', '_'
	for _, ch := range cleanKey {
		if !((ch >= 'A' && ch <= 'Z') || (ch >= '0' && ch <= '9') || ch == '-' || ch == '_') {
			http.Error(w, `{"error": "Token hanya boleh mengandung huruf kapital, angka, tanda minus (-), dan garis bawah (_)"}`, http.StatusBadRequest)
			return
		}
	}

	tokenLock.Lock()
	defer tokenLock.Unlock()

	// Check collision with another user's token
	for i := range accessKeys {
		if strings.EqualFold(accessKeys[i].Key, cleanKey) && accessKeys[i].ID != targetID {
			http.Error(w, fmt.Sprintf(`{"error": "Token '%s' sudah digunakan oleh akun lain. Silakan pilih kombinasi unik lain."}`, cleanKey), http.StatusConflict)
			return
		}
	}

	for i := range accessKeys {
		if accessKeys[i].ID == targetID {
			accessKeys[i].Key = cleanKey
			saveTokensToDiskLocked()
			w.Header().Set("Content-Type", "application/json")
			_ = json.NewEncoder(w).Encode(map[string]interface{}{
				"message": "Kode token berhasil diperbarui",
				"token":   accessKeys[i],
			})
			return
		}
	}

	http.Error(w, `{"error": "Akun token tidak ditemukan"}`, http.StatusNotFound)
}
