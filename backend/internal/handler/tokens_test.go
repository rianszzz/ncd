package handler

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/ncd/backend/internal/middleware"
)

func TestTokenLoginFlow(t *testing.T) {
	jwtSecret := "test-secret-key-32-bytes-minimum"
	loginHandler := Login(jwtSecret)

	// 1. Valid God Admin Token (dynamically fetch current active key)
	var godKey string
	tokenLock.RLock()
	for _, k := range accessKeys {
		if k.Role == "GOD_ADMIN" && k.IsActive {
			godKey = k.Key
			break
		}
	}
	tokenLock.RUnlock()
	if godKey == "" {
		godKey = "NCD-GOD-MASTER-2026"
	}

	payload, _ := json.Marshal(map[string]string{"key": godKey})
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
	testName := fmt.Sprintf("Ahmad Tester %d", time.Now().UnixNano())

	// 1. Create Token
	createPayload, _ := json.Marshal(map[string]string{
		"role":     "BENDAHARA_I",
		"assignee": testName,
		"position": "Bendahara Tim",
	})
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

	if created.Role != "BENDAHARA_I" || created.Assignee != testName {
		t.Fatalf("unexpected token fields: %+v", created)
	}

	// 2. Reject duplicate token with same name (409 Conflict)
	dupReq := httptest.NewRequest("POST", "/api/v1/portal/tokens", bytes.NewBuffer(createPayload))
	dupReq.Header.Set("Content-Type", "application/json")
	wDup := httptest.NewRecorder()

	CreateToken(wDup, dupReq)
	if wDup.Code != http.StatusConflict {
		t.Fatalf("expected 409 Conflict for duplicate token name, got %d. Body: %s", wDup.Code, wDup.Body.String())
	}

	// 3. Reject duplicate with different case
	casePayload, _ := json.Marshal(map[string]string{
		"role":     "MEMBER",
		"assignee": strings.ToUpper(testName),
	})
	caseReq := httptest.NewRequest("POST", "/api/v1/portal/tokens", bytes.NewBuffer(casePayload))
	caseReq.Header.Set("Content-Type", "application/json")
	wCase := httptest.NewRecorder()

	CreateToken(wCase, caseReq)
	if wCase.Code != http.StatusConflict {
		t.Fatalf("expected 409 Conflict for case-insensitive duplicate token name, got %d", wCase.Code)
	}

	// 4. Authenticate with newly created token
	acc, ok := AuthenticateByKey(created.Key)
	if !ok || acc.ID != created.ID {
		t.Fatalf("expected to authenticate newly created token %s", created.Key)
	}

	// Clean up created test token
	tokenLock.Lock()
	for i := range accessKeys {
		if accessKeys[i].ID == created.ID {
			accessKeys = append(accessKeys[:i], accessKeys[i+1:]...)
			saveTokensToDiskLocked()
			break
		}
	}
	tokenLock.Unlock()
}

func TestUpdateTokenPrefixRequirement(t *testing.T) {
	// Preserve current god key
	tokenLock.RLock()
	var origGodKey string
	for _, k := range accessKeys {
		if k.ID == "tok-god-1" {
			origGodKey = k.Key
			break
		}
	}
	tokenLock.RUnlock()
	if origGodKey == "" {
		origGodKey = "NCD-GOD-MASTER-2026"
	}

	claims := &middleware.UserClaims{
		UserID: "tok-god-1",
		Role:   "GOD_ADMIN",
	}
	ctx := context.WithValue(context.Background(), middleware.UserContextKey, claims)

	// 1. Updating token without NCD- prefix must fail (400)
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

	// Reset key back to original
	resetPayload, _ := json.Marshal(map[string]string{"new_key": origGodKey})
	req3 := httptest.NewRequest("PUT", "/api/v1/portal/tokens/my-token", bytes.NewBuffer(resetPayload)).WithContext(ctx)
	req3.Header.Set("Content-Type", "application/json")
	w3 := httptest.NewRecorder()
	UpdateToken(w3, req3)
}
