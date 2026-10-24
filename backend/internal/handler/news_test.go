package handler

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/go-chi/chi/v5"
)

func TestPublicPostsAndManagement(t *testing.T) {
	// 1. Initially should return JSON array (empty or whatever is saved)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/public/posts", nil)
	rec := httptest.NewRecorder()
	GetPublicPosts(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", rec.Code)
	}

	var posts []PostDTO
	if err := json.Unmarshal(rec.Body.Bytes(), &posts); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}

	// 2. Test CreatePost
	newPost := PostDTO{
		Title:       "Test Announcement NCD",
		Summary:     "Rangkuman pengujian",
		ContentMD:   "### Pengujian Sistem\nKonten pengujian.",
		Category:    "Pengumuman",
		Tags:        []string{"Test", "CI"},
		AuthorName:  "Lead Architect",
		IsPinned:    true,
		PublishedAt: time.Now(),
	}
	body, _ := json.Marshal(newPost)
	createReq := httptest.NewRequest(http.MethodPost, "/api/v1/portal/posts", bytes.NewReader(body))
	createRec := httptest.NewRecorder()
	CreatePost(createRec, createReq)

	if createRec.Code != http.StatusCreated {
		t.Fatalf("expected 201 Created, got %d", createRec.Code)
	}

	var created PostDTO
	if err := json.Unmarshal(createRec.Body.Bytes(), &created); err != nil {
		t.Fatalf("failed to decode created post: %v", err)
	}
	if created.ID == "" || created.Title != newPost.Title {
		t.Fatalf("mismatched created post: %+v", created)
	}

	// 3. Test GetPublicPosts finds the newly created post
	rec2 := httptest.NewRecorder()
	GetPublicPosts(rec2, httptest.NewRequest(http.MethodGet, "/api/v1/public/posts?category=Pengumuman", nil))
	var filtered []PostDTO
	_ = json.Unmarshal(rec2.Body.Bytes(), &filtered)
	found := false
	for _, p := range filtered {
		if p.ID == created.ID {
			found = true
			break
		}
	}
	if !found {
		t.Fatalf("expected to find created post %s in public posts", created.ID)
	}

	// 4. Test DeletePost
	deleteReq := httptest.NewRequest(http.MethodDelete, "/api/v1/portal/posts/"+created.ID, nil)
	rctx := chi.NewRouteContext()
	rctx.URLParams.Add("id", created.ID)
	deleteReq = deleteReq.WithContext(context.WithValue(deleteReq.Context(), chi.RouteCtxKey, rctx))
	deleteRec := httptest.NewRecorder()
	DeletePost(deleteRec, deleteReq)

	if deleteRec.Code != http.StatusOK {
		t.Fatalf("expected 200 OK for delete, got %d", deleteRec.Code)
	}
}
