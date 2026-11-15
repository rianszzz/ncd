package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/ncd/backend/internal/middleware"
	"github.com/ncd/backend/internal/storage"
)

type OrganizationDocument struct {
	ID        string    `json:"id"`
	Title     string    `json:"title"`
	Date      string    `json:"date"`
	Category  string    `json:"category"` // NOTULENSI, SOP, ARSIP, PANDUAN
	Summary   string    `json:"summary"`
	ContentMD string    `json:"content_md"`
	FileLink  string    `json:"file_link,omitempty"`
	Author    string    `json:"author"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

const documentsFileName = "documents.json"

var (
	docLock  sync.RWMutex
	docsList = []OrganizationDocument{}
	docsInit sync.Once
)

func initDocs() {
	var loaded []OrganizationDocument
	if err := storage.LoadJSON(documentsFileName, &loaded); err == nil {
		docsList = loaded
		return
	}
	docsList = []OrganizationDocument{}
	saveDocsToDiskLocked()
}

func saveDocsToDiskLocked() {
	_ = storage.SaveJSON(documentsFileName, docsList)
}

// ListDocuments mengembalikan daftar dokumen & notulensi organisasi
func ListDocuments(w http.ResponseWriter, r *http.Request) {
	docsInit.Do(initDocs)
	docLock.RLock()
	defer docLock.RUnlock()

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(docsList)
}

// CreateDocument menambahkan dokumen/notulensi baru (Sekretaris, Super Admin, God Admin)
func CreateDocument(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value(middleware.UserContextKey).(*middleware.UserClaims)
	if !ok || claims == nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	docsInit.Do(initDocs)

	var req OrganizationDocument
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid payload", http.StatusBadRequest)
		return
	}

	req.Title = strings.TrimSpace(req.Title)
	if req.Title == "" {
		http.Error(w, "Judul dokumen wajib diisi", http.StatusBadRequest)
		return
	}

	if req.ID == "" {
		req.ID = fmt.Sprintf("doc-%s", uuid.New().String()[:8])
	}
	if req.Date == "" {
		req.Date = time.Now().Format("2006-01-02")
	}
	if req.Category == "" {
		req.Category = "NOTULENSI"
	}
	authorName := claims.FullName
	if authorName == "" {
		authorName = claims.Email
	}
	req.Author = fmt.Sprintf("%s (%s)", authorName, claims.Role)
	req.CreatedAt = time.Now()
	req.UpdatedAt = time.Now()

	docLock.Lock()
	docsList = append([]OrganizationDocument{req}, docsList...)
	saveDocsToDiskLocked()
	docLock.Unlock()

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(req)
}

// DeleteDocument menghapus dokumen/notulensi
func DeleteDocument(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		http.Error(w, "ID dokumen wajib disertakan", http.StatusBadRequest)
		return
	}

	docsInit.Do(initDocs)
	docLock.Lock()
	defer docLock.Unlock()

	idx := -1
	for i, d := range docsList {
		if d.ID == id {
			idx = i
			break
		}
	}

	if idx == -1 {
		http.Error(w, "Dokumen tidak ditemukan", http.StatusNotFound)
		return
	}

	docsList = append(docsList[:idx], docsList[idx+1:]...)
	saveDocsToDiskLocked()

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]string{
		"status":  "success",
		"message": "Dokumen berhasil dihapus",
	})
}
