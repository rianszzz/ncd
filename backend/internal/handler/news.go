package handler

import (
	"context"
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
	"github.com/jackc/pgx/v5/pgxpool"
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
		loaded := []PostDTO{}
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

// InitNewsDB creates the PostgreSQL table for portal posts if not existing.
func InitNewsDB(pool *pgxpool.Pool) {
	if pool == nil {
		return
	}
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	createTableQuery := `
	CREATE TABLE IF NOT EXISTS portal_posts (
		id VARCHAR(100) PRIMARY KEY,
		title VARCHAR(255) NOT NULL,
		slug VARCHAR(280) NOT NULL UNIQUE,
		summary TEXT NOT NULL,
		content_md TEXT NOT NULL,
		category VARCHAR(50) NOT NULL,
		tags TEXT[] DEFAULT '{}',
		author_name VARCHAR(150) NOT NULL,
		is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
		published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
		created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	);
	`
	if _, err := pool.Exec(ctx, createTableQuery); err != nil {
		return
	}

	SyncPostsFromDB(ctx, pool)
}

// SyncPostsFromDB loads news posts from PostgreSQL into memory and disk cache.
func SyncPostsFromDB(ctx context.Context, pool *pgxpool.Pool) {
	if pool == nil {
		return
	}

	rows, err := pool.Query(ctx, `
		SELECT id, title, slug, summary, content_md, category, tags, author_name, is_pinned, published_at
		FROM portal_posts
		ORDER BY published_at DESC
	`)
	if err != nil {
		return
	}
	defer rows.Close()

	loaded := []PostDTO{}
	for rows.Next() {
		var p PostDTO
		if err := rows.Scan(&p.ID, &p.Title, &p.Slug, &p.Summary, &p.ContentMD, &p.Category, &p.Tags, &p.AuthorName, &p.IsPinned, &p.PublishedAt); err == nil {
			loaded = append(loaded, p)
		}
	}

	postLock.Lock()
	postsList = loaded
	savePostsToDiskLocked()
	postLock.Unlock()
}

// GetPublicPosts returns the list of public announcements and news articles.
// It supports filtering by category via query parameter ?category=... (e.g. Pengumuman, Rilis Produk, Riset & Edukasi).
// Pinned posts are prioritized at the top, followed by reverse chronological order.
func GetPublicPosts(w http.ResponseWriter, r *http.Request) {
	if DBPool != nil {
		SyncPostsFromDB(r.Context(), DBPool)
	}

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

	if DBPool != nil {
		ctx, cancel := context.WithTimeout(r.Context(), 3*time.Second)
		defer cancel()
		_, err := DBPool.Exec(ctx, `
			INSERT INTO portal_posts (id, title, slug, summary, content_md, category, tags, author_name, is_pinned, published_at)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		`, req.ID, req.Title, req.Slug, req.Summary, req.ContentMD, req.Category, req.Tags, req.AuthorName, req.IsPinned, req.PublishedAt)
		if err != nil {
			http.Error(w, `{"error":"Gagal menyimpan warta ke database"}`, http.StatusInternalServerError)
			return
		}
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

	if DBPool != nil {
		ctx, cancel := context.WithTimeout(r.Context(), 3*time.Second)
		defer cancel()
		_, _ = DBPool.Exec(ctx, "DELETE FROM portal_posts WHERE id = $1", id)
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

	if !found && DBPool == nil {
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
