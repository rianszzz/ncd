package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"regexp"
	"sort"
	"strings"
	"sync"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

// PostDTO represents a public news or announcement entry for NCD.
type PostDTO struct {
	ID          string    `json:"id"`
	Title       string    `json:"title"`
	Slug        string    `json:"slug"`
	Summary     string    `json:"summary"`
	ContentMD   string    `json:"content_md"`
	Category    string    `json:"category"`
	Tags        []string  `json:"tags"`
	AuthorName  string    `json:"author_name"`
	IsPinned    bool      `json:"is_pinned"`
	PublishedAt time.Time `json:"published_at"`
}

var (
	postLock  sync.RWMutex
	postsList = []PostDTO{}
)

func getPostsFilePath() string {
	if _, err := os.Stat("backend/data"); err == nil {
		return "backend/data/posts.json"
	}
	if _, err := os.Stat("data"); err == nil {
		return "data/posts.json"
	}
	if _, err := os.Stat("../../data"); err == nil {
		return "../../data/posts.json"
	}
	return "data/posts.json"
}

func savePostsToDiskLocked() {
	filePath := getPostsFilePath()
	bytes, err := json.MarshalIndent(postsList, "", "  ")
	if err == nil {
		_ = os.WriteFile(filePath, bytes, 0644)
	}
}

func loadPostsFromDisk() {
	postLock.Lock()
	defer postLock.Unlock()

	filePath := getPostsFilePath()
	bytes, err := os.ReadFile(filePath)
	if err == nil && len(bytes) > 0 {
		var loaded []PostDTO
		if err := json.Unmarshal(bytes, &loaded); err == nil {
			postsList = loaded
			return
		}
	}
	postsList = []PostDTO{}
	savePostsToDiskLocked()
}

func init() {
	loadPostsFromDisk()
}

func slugify(text string) string {
	lower := strings.ToLower(text)
	reg := regexp.MustCompile(`[^a-z0-9]+`)
	slug := reg.ReplaceAllString(lower, "-")
	return strings.Trim(slug, "-")
}

// GetPublicPosts returns the list of public announcements and news articles.
// It supports filtering by category via query parameter ?category=... (e.g. Pengumuman, Rilis Produk, Riset & Edukasi).
// Pinned posts are prioritized at the top, followed by reverse chronological order.
func GetPublicPosts(w http.ResponseWriter, r *http.Request) {
	postLock.RLock()
	defer postLock.RUnlock()

	category := strings.TrimSpace(r.URL.Query().Get("category"))

	// Create working copy of posts
	posts := make([]PostDTO, 0, len(postsList))
	for _, p := range postsList {
		if category != "" && !strings.EqualFold(category, "ALL") {
			if !strings.EqualFold(p.Category, category) {
				continue
			}
		}
		posts = append(posts, p)
	}

	// Sort: Pinned first, then PublishedAt descending
	sort.SliceStable(posts, func(i, j int) bool {
		if posts[i].IsPinned != posts[j].IsPinned {
			return posts[i].IsPinned
		}
		return posts[i].PublishedAt.After(posts[j].PublishedAt)
	})

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(posts)
}

// CreatePost allows GOD_ADMIN and SUPER_ADMIN to publish a new article/post.
func CreatePost(w http.ResponseWriter, r *http.Request) {
	var req PostDTO
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"Invalid request payload"}`, http.StatusBadRequest)
		return
	}

	req.Title = strings.TrimSpace(req.Title)
	if req.Title == "" {
		http.Error(w, `{"error":"Judul warta wajib diisi"}`, http.StatusBadRequest)
		return
	}

	if req.ID == "" {
		req.ID = fmt.Sprintf("post-%s", uuid.New().String()[:8])
	}
	if req.Slug == "" {
		req.Slug = fmt.Sprintf("%s-%s", slugify(req.Title), uuid.New().String()[:4])
	}
	if req.Category == "" {
		req.Category = "Pengumuman"
	}
	if req.PublishedAt.IsZero() {
		req.PublishedAt = time.Now()
	}
	if req.AuthorName == "" {
		req.AuthorName = "Pengurus NCD"
	}
	if req.Tags == nil {
		req.Tags = []string{}
	}

	postLock.Lock()
	postsList = append([]PostDTO{req}, postsList...)
	savePostsToDiskLocked()
	postLock.Unlock()

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(req)
}

// DeletePost allows GOD_ADMIN and SUPER_ADMIN to delete an article/post.
func DeletePost(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		http.Error(w, `{"error":"ID wajib disertakan"}`, http.StatusBadRequest)
		return
	}

	postLock.Lock()
	defer postLock.Unlock()

	found := false
	updated := make([]PostDTO, 0, len(postsList))
	for _, item := range postsList {
		if item.ID == id {
			found = true
			continue
		}
		updated = append(updated, item)
	}

	if !found {
		http.Error(w, `{"error":"Warta tidak ditemukan"}`, http.StatusNotFound)
		return
	}

	postsList = updated
	savePostsToDiskLocked()

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]string{
		"message": "Warta berhasil dihapus",
		"id":      id,
	})
}
