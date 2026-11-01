package handler

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/ncd/backend/internal/middleware"
)

func TestLearningSessionFlow(t *testing.T) {
	// 1. Unauthenticated request should fail (401)
	body, _ := json.Marshal(map[string]string{
		"class_slug": "fawwaz-webdev",
		"full_name":  "Budi Santoso",
		"email":      "budi@example.com",
		"phone_wa":   "081234567890",
		"university": "Universitas Indonesia",
		"major":      "Ilmu Komputer",
	})

	req := httptest.NewRequest(http.MethodPost, "/portal/learning-sessions/register", bytes.NewReader(body))
	w := httptest.NewRecorder()
	RegisterLearningSession(w, req)
	if w.Code != http.StatusUnauthorized {
		t.Fatalf("expected status 401 for unauthenticated registration, got %d", w.Code)
	}

	// 2. Authenticated registration for Fawwaz class (201)
	userClaims := &middleware.UserClaims{
		UserID:   "user-test-ls-1",
		FullName: "Budi Santoso",
		Email:    "budi@example.com",
		Role:     "MEMBER",
	}

	reqAuth := httptest.NewRequest(http.MethodPost, "/portal/learning-sessions/register", bytes.NewReader(body))
	reqAuth = reqAuth.WithContext(context.WithValue(reqAuth.Context(), middleware.UserContextKey, userClaims))
	wAuth := httptest.NewRecorder()
	RegisterLearningSession(wAuth, reqAuth)
	if wAuth.Code != http.StatusCreated {
		t.Fatalf("expected status 201 for valid registration, got %d: %s", wAuth.Code, wAuth.Body.String())
	}

	// 3. Duplicate registration should be rejected with 409 Conflict
	reqDup := httptest.NewRequest(http.MethodPost, "/portal/learning-sessions/register", bytes.NewReader(body))
	reqDup = reqDup.WithContext(context.WithValue(reqDup.Context(), middleware.UserContextKey, userClaims))
	wDup := httptest.NewRecorder()
	RegisterLearningSession(wDup, reqDup)
	if wDup.Code != http.StatusConflict {
		t.Fatalf("expected status 409 for duplicate registration, got %d: %s", wDup.Code, wDup.Body.String())
	}

	// 4. GetMyLearningSessionRegistrations should return registered slug
	reqMy := httptest.NewRequest(http.MethodGet, "/portal/learning-sessions/my-registrations", nil)
	reqMy = reqMy.WithContext(context.WithValue(reqMy.Context(), middleware.UserContextKey, userClaims))
	wMy := httptest.NewRecorder()
	GetMyLearningSessionRegistrations(wMy, reqMy)
	if wMy.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", wMy.Code)
	}

	var myResp struct {
		RegisteredSlugs []string                      `json:"registered_slugs"`
		Registrations   []LearningSessionRegistration `json:"registrations"`
	}
	_ = json.Unmarshal(wMy.Body.Bytes(), &myResp)
	foundSlug := false
	for _, slug := range myResp.RegisteredSlugs {
		if slug == "fawwaz-webdev" {
			foundSlug = true
			break
		}
	}
	if !foundSlug {
		t.Fatalf("expected 'fawwaz-webdev' in registered slugs, got %v", myResp.RegisteredSlugs)
	}

	// 5. MEMBER role should be forbidden from admin list (403)
	reqAdminMem := httptest.NewRequest(http.MethodGet, "/portal/learning-sessions/admin/registrations", nil)
	reqAdminMem = reqAdminMem.WithContext(context.WithValue(reqAdminMem.Context(), middleware.UserContextKey, userClaims))
	wAdminMem := httptest.NewRecorder()
	ListLearningSessionRegistrations(wAdminMem, reqAdminMem)
	if wAdminMem.Code != http.StatusForbidden {
		t.Fatalf("expected status 403 for MEMBER role accessing admin list, got %d", wAdminMem.Code)
	}

	// 6. BENDAHARA role should be forbidden from admin list (403)
	bendClaims := &middleware.UserClaims{
		UserID:   "bend-test-1",
		FullName: "Bendahara Organisasi",
		Email:    "bendahara@ncd.dev",
		Role:     "BENDAHARA_I",
	}
	reqAdminBend := httptest.NewRequest(http.MethodGet, "/portal/learning-sessions/admin/registrations", nil)
	reqAdminBend = reqAdminBend.WithContext(context.WithValue(reqAdminBend.Context(), middleware.UserContextKey, bendClaims))
	wAdminBend := httptest.NewRecorder()
	ListLearningSessionRegistrations(wAdminBend, reqAdminBend)
	if wAdminBend.Code != http.StatusForbidden {
		t.Fatalf("expected status 403 for BENDAHARA_I accessing admin list, got %d", wAdminBend.Code)
	}

	// 7. SEKRETARIS role should be forbidden from admin list (403)
	sekrClaims := &middleware.UserClaims{
		UserID:   "sekr-test-1",
		FullName: "Sekretaris Organisasi",
		Email:    "sekretaris@ncd.dev",
		Role:     "SEKRETARIS",
	}
	reqAdminSekr := httptest.NewRequest(http.MethodGet, "/portal/learning-sessions/admin/registrations", nil)
	reqAdminSekr = reqAdminSekr.WithContext(context.WithValue(reqAdminSekr.Context(), middleware.UserContextKey, sekrClaims))
	wAdminSekr := httptest.NewRecorder()
	ListLearningSessionRegistrations(wAdminSekr, reqAdminSekr)
	if wAdminSekr.Code != http.StatusForbidden {
		t.Fatalf("expected status 403 for SEKRETARIS accessing admin list, got %d", wAdminSekr.Code)
	}

	// 8. SUPER_ADMIN role should succeed (200)
	adminClaims := &middleware.UserClaims{
		UserID:   "admin-test-1",
		FullName: "Super Admin",
		Email:    "admin@ncd.dev",
		Role:     "SUPER_ADMIN",
	}
	reqAdmin := httptest.NewRequest(http.MethodGet, "/portal/learning-sessions/admin/registrations", nil)
	reqAdmin = reqAdmin.WithContext(context.WithValue(reqAdmin.Context(), middleware.UserContextKey, adminClaims))
	wAdmin := httptest.NewRecorder()
	ListLearningSessionRegistrations(wAdmin, reqAdmin)
	if wAdmin.Code != http.StatusOK {
		t.Fatalf("expected status 200 for SUPER_ADMIN accessing admin list, got %d", wAdmin.Code)
	}

	// 9. GOD_ADMIN role should succeed (200)
	godClaims := &middleware.UserClaims{
		UserID:   "god-test-1",
		FullName: "God Admin",
		Email:    "god@ncd.dev",
		Role:     "GOD_ADMIN",
	}
	reqGod := httptest.NewRequest(http.MethodGet, "/portal/learning-sessions/admin/registrations", nil)
	reqGod = reqGod.WithContext(context.WithValue(reqGod.Context(), middleware.UserContextKey, godClaims))
	wGod := httptest.NewRecorder()
	ListLearningSessionRegistrations(wGod, reqGod)
	if wGod.Code != http.StatusOK {
		t.Fatalf("expected status 200 for GOD_ADMIN accessing admin list, got %d", wGod.Code)
	}

	// 10. ListLearningSessionClasses should return active classes
	reqClasses := httptest.NewRequest(http.MethodGet, "/portal/learning-sessions/classes", nil)
	wClasses := httptest.NewRecorder()
	ListLearningSessionClasses(wClasses, reqClasses)
	if wClasses.Code != http.StatusOK {
		t.Fatalf("expected status 200 for ListLearningSessionClasses, got %d", wClasses.Code)
	}
	var classList []LearningSessionClass
	_ = json.Unmarshal(wClasses.Body.Bytes(), &classList)
	if len(classList) < 2 {
		t.Fatalf("expected at least 2 default classes, got %d", len(classList))
	}

	// 11. Non-admin should be forbidden from creating class (403)
	newClassPayload, _ := json.Marshal(map[string]string{
		"class_number": "CLASS 03",
		"speaker_name": "Dr. Sarah Connor",
		"title":        "AI & CYBERSECURITY 101: Systems Defense",
		"description":  "Pelajari konsep dasar pertahanan siber dan implementasi keamanan AI.",
		"date_label":   "Jumat, 27 November 2026",
		"time_label":   "20.00–21.00 WIB",
		"discord_url":  "https://discord.com/events/123/456",
	})
	reqCreateForbidden := httptest.NewRequest(http.MethodPost, "/portal/learning-sessions/classes", bytes.NewReader(newClassPayload))
	reqCreateForbidden = reqCreateForbidden.WithContext(context.WithValue(reqCreateForbidden.Context(), middleware.UserContextKey, userClaims))
	wCreateForbidden := httptest.NewRecorder()
	CreateLearningSessionClass(wCreateForbidden, reqCreateForbidden)
	if wCreateForbidden.Code != http.StatusForbidden {
		t.Fatalf("expected status 403 when MEMBER creates class, got %d", wCreateForbidden.Code)
	}

	// 12. GOD_ADMIN should successfully create class (201)
	reqCreate := httptest.NewRequest(http.MethodPost, "/portal/learning-sessions/classes", bytes.NewReader(newClassPayload))
	reqCreate = reqCreate.WithContext(context.WithValue(reqCreate.Context(), middleware.UserContextKey, godClaims))
	wCreate := httptest.NewRecorder()
	CreateLearningSessionClass(wCreate, reqCreate)
	if wCreate.Code != http.StatusCreated {
		t.Fatalf("expected status 201 for class creation by GOD_ADMIN, got %d: %s", wCreate.Code, wCreate.Body.String())
	}

	var createResp struct {
		Message string               `json:"message"`
		Class   LearningSessionClass `json:"class"`
	}
	_ = json.Unmarshal(wCreate.Body.Bytes(), &createResp)
	if createResp.Class.Slug == "" {
		t.Fatalf("expected non-empty slug for newly created class")
	}

	// 13. Registration for newly created class should succeed
	bodyNewClass, _ := json.Marshal(map[string]string{
		"class_slug": createResp.Class.Slug,
		"full_name":  "Budi Santoso",
		"email":      "budi@example.com",
		"phone_wa":   "081234567890",
		"university": "Universitas Indonesia",
		"major":      "Ilmu Komputer",
	})
	reqRegNew := httptest.NewRequest(http.MethodPost, "/portal/learning-sessions/register", bytes.NewReader(bodyNewClass))
	reqRegNew = reqRegNew.WithContext(context.WithValue(reqRegNew.Context(), middleware.UserContextKey, userClaims))
	wRegNew := httptest.NewRecorder()
	RegisterLearningSession(wRegNew, reqRegNew)
	if wRegNew.Code != http.StatusCreated {
		t.Fatalf("expected status 201 for registration in new class, got %d: %s", wRegNew.Code, wRegNew.Body.String())
	}
}
