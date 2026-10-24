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

func TestTokenLoginFlow(t *testing.T) {
	jwtSecret := "test-secret-key-32-bytes-minimum"
	loginHandler := Login(jwtSecret)

	// 1. Valid God Admin Token
	payload := []byte(`{"key": "NCD-GOD-MASTER-2026"}`)
	req := httptest.NewRequest("POST", "/api/v1/auth/login", bytes.NewBuffer(payload))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	loginHandler.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200 OK for valid God Admin token, got %d. Body: %s", w.Code, w.Body.String())
	}

	var res map[string]interface{}
	if err := json.Unmarshal(w.Body.Bytes(), &res); err != nil {
		t.Fatalf("invalid json response: %v", err)
	}

	user, ok := res["user"].(map[string]interface{})
	if !ok || user["role"] != "GOD_ADMIN" {
		t.Fatalf("expected role GOD_ADMIN, got %v", user)
	}

	// 2. Invalid Token
	invalidPayload := []byte(`{"key": "INVALID-TOKEN-999"}`)
	req2 := httptest.NewRequest("POST", "/api/v1/auth/login", bytes.NewBuffer(invalidPayload))
	req2.Header.Set("Content-Type", "application/json")
	w2 := httptest.NewRecorder()

	loginHandler.ServeHTTP(w2, req2)
	if w2.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401 Unauthorized for invalid token, got %d", w2.Code)
	}
}

func TestTokenManagement(t *testing.T) {
	// 1. Create Token
	createPayload := []byte(`{"role": "BENDAHARA_I", "assignee": "Ahmad Tester", "position": "Bendahara Tim"}`)
	req := httptest.NewRequest("POST", "/api/v1/portal/tokens", bytes.NewBuffer(createPayload))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	CreateToken(w, req)
	if w.Code != http.StatusCreated {
		t.Fatalf("expected 201 Created, got %d. Body: %s", w.Code, w.Body.String())
	}

	var created AccessKey
	if err := json.Unmarshal(w.Body.Bytes(), &created); err != nil {
		t.Fatalf("failed to decode created token: %v", err)
	}

	if created.Role != "BENDAHARA_I" || created.Assignee != "Ahmad Tester" {
		t.Fatalf("unexpected token fields: %+v", created)
	}

	// 2. Authenticate with newly created token
	acc, ok := AuthenticateByKey(created.Key)
	if !ok || acc.ID != created.ID {
		t.Fatalf("expected to authenticate newly created token %s", created.Key)
	}
}

func TestUpdateTokenPrefixRequirement(t *testing.T) {
	// 1. Updating token without NCD- prefix must fail (400)
	claims := &middleware.UserClaims{
		UserID: "tok-god-1",
		Role:   "GOD_ADMIN",
	}
	ctx := context.WithValue(context.Background(), middleware.UserContextKey, claims)

	invalidPayload := []byte(`{"new_key": "INVALID-PREFIX-123"}`)
	req := httptest.NewRequest("PUT", "/api/v1/portal/tokens/my-token", bytes.NewBuffer(invalidPayload)).WithContext(ctx)
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	UpdateToken(w, req)
	if w.Code != http.StatusBadRequest {
		t.Fatalf("expected 400 Bad Request for non-NCD prefix, got %d. Body: %s", w.Code, w.Body.String())
	}

	// 2. Updating token with valid NCD- prefix must succeed (200)
	validPayload := []byte(`{"new_key": "NCD-CUSTOM-ADMIN-88"}`)
	req2 := httptest.NewRequest("PUT", "/api/v1/portal/tokens/my-token", bytes.NewBuffer(validPayload)).WithContext(ctx)
	req2.Header.Set("Content-Type", "application/json")
	w2 := httptest.NewRecorder()

	UpdateToken(w2, req2)
	if w2.Code != http.StatusOK {
		t.Fatalf("expected 200 OK for valid NCD- prefix, got %d. Body: %s", w2.Code, w2.Body.String())
	}

	// 3. Authenticate with updated token
	acc, ok := AuthenticateByKey("NCD-CUSTOM-ADMIN-88")
	if !ok || acc.ID != "tok-god-1" {
		t.Fatalf("expected newly updated token to authenticate successfully")
	}

	// Reset key back to default
	resetPayload := []byte(`{"new_key": "NCD-GOD-MASTER-2026"}`)
	req3 := httptest.NewRequest("PUT", "/api/v1/portal/tokens/my-token", bytes.NewBuffer(resetPayload)).WithContext(ctx)
	req3.Header.Set("Content-Type", "application/json")
	w3 := httptest.NewRecorder()
	UpdateToken(w3, req3)
}
