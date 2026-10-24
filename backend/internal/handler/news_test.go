package handler

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestGetPublicPosts(t *testing.T) {
	t.Run("returns all posts without filter", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/v1/public/posts", nil)
		rec := httptest.NewRecorder()

		GetPublicPosts(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("expected status 200, got %d", rec.Code)
		}

		if ct := rec.Header().Get("Content-Type"); ct != "application/json" {
			t.Errorf("expected Content-Type application/json, got %s", ct)
		}

		var posts []PostDTO
		if err := json.Unmarshal(rec.Body.Bytes(), &posts); err != nil {
			t.Fatalf("failed to decode response: %v", err)
		}

		if len(posts) == 0 {
			t.Fatal("expected at least one post, got 0")
		}

		// First post should be pinned
		if !posts[0].IsPinned {
			t.Errorf("expected first post to be pinned, but it was not")
		}
	})

	t.Run("filters by category Pengumuman", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/v1/public/posts?category=Pengumuman", nil)
		rec := httptest.NewRecorder()

		GetPublicPosts(rec, req)

		if rec.Code != http.StatusOK {
			t.Fatalf("expected status 200, got %d", rec.Code)
		}

		var posts []PostDTO
		if err := json.Unmarshal(rec.Body.Bytes(), &posts); err != nil {
			t.Fatalf("failed to decode response: %v", err)
		}

		if len(posts) == 0 {
			t.Fatal("expected posts for category Pengumuman, got 0")
		}

		for _, p := range posts {
			if p.Category != "Pengumuman" {
				t.Errorf("expected category Pengumuman, got %s", p.Category)
			}
		}
	})

	t.Run("handles category ALL properly", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/api/v1/public/posts?category=ALL", nil)
		rec := httptest.NewRecorder()

		GetPublicPosts(rec, req)

		var posts []PostDTO
		if err := json.Unmarshal(rec.Body.Bytes(), &posts); err != nil {
			t.Fatalf("failed to decode response: %v", err)
		}

		if len(posts) != len(defaultPosts) {
			t.Errorf("expected %d posts for ALL, got %d", len(defaultPosts), len(posts))
		}
	})
}
