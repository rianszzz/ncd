package handler

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/go-chi/chi/v5"
	"github.com/ncd/backend/internal/middleware"
)

func TestDualControlVoidVerifiedTransactionFlow(t *testing.T) {
	// 1. Setup Context Users
	bendahara1Claims := &middleware.UserClaims{
		UserID:   "user-ben1",
		FullName: "Bendahara Satu",
		Email:    "ben1@ncd.dev",
		Role:     "BENDAHARA_I",
	}

	bendahara2Claims := &middleware.UserClaims{
		UserID:   "user-ben2",
		FullName: "Bendahara Dua",
		Email:    "ben2@ncd.dev",
		Role:     "BENDAHARA_II",
	}

	// 2. Bendahara I membuat transaksi kas masuk (Income)
	createPayload := map[string]interface{}{
		"type":             "INCOME",
		"category_name":    "Uang Kas",
		"amount":           75000.0,
		"description":      "Uji Coba Maker-Checker Void Transaksi Sah",
		"person_in_charge": "Bendahara Satu",
		"receipt_url":      "https://example.com/receipt.jpg",
	}
	body, _ := json.Marshal(createPayload)

	req := httptest.NewRequest(http.MethodPost, "/api/v1/finance/transactions", bytes.NewReader(body))
	req = req.WithContext(context.WithValue(req.Context(), middleware.UserContextKey, bendahara1Claims))
	w := httptest.NewRecorder()
	CreateTransaction(w, req)

	if w.Code != http.StatusCreated {
		t.Fatalf("expected 201 Created for transaction creation, got %d: %s", w.Code, w.Body.String())
	}

	var createdTx TransactionDTO
	_ = json.NewDecoder(w.Body).Decode(&createdTx)

	// 3. Bendahara II memverifikasi transaksi menjadi "Sah" (VERIFIED)
	rctx := chi.NewRouteContext()
	rctx.URLParams.Add("id", createdTx.ID)

	reqVerify := httptest.NewRequest(http.MethodPost, "/api/v1/finance/transactions/"+createdTx.ID+"/verify", nil)
	reqVerify = reqVerify.WithContext(context.WithValue(reqVerify.Context(), chi.RouteCtxKey, rctx))
	reqVerify = reqVerify.WithContext(context.WithValue(reqVerify.Context(), middleware.UserContextKey, bendahara2Claims))
	wVerify := httptest.NewRecorder()
	VerifyTransaction(wVerify, reqVerify)

	if wVerify.Code != http.StatusOK {
		t.Fatalf("expected 200 OK for verification, got %d", wVerify.Code)
	}

	// 4. Saldo bertambah di Cash Summary
	reqSum1 := httptest.NewRequest(http.MethodGet, "/api/v1/finance/summary", nil)
	wSum1 := httptest.NewRecorder()
	GetCashSummary(wSum1, reqSum1)
	var sum1 map[string]interface{}
	_ = json.NewDecoder(wSum1.Body).Decode(&sum1)
	bal1 := sum1["current_balance"].(float64)

	// 5. Bendahara I mengajukan pembatalan (Request Void)
	reqVoidBody, _ := json.Marshal(map[string]string{
		"reason": "Salah input nominal oleh panitia",
	})
	reqVoid := httptest.NewRequest(http.MethodPost, "/api/v1/finance/transactions/"+createdTx.ID+"/request-void", bytes.NewReader(reqVoidBody))
	reqVoid = reqVoid.WithContext(context.WithValue(reqVoid.Context(), chi.RouteCtxKey, rctx))
	reqVoid = reqVoid.WithContext(context.WithValue(reqVoid.Context(), middleware.UserContextKey, bendahara1Claims))
	wVoid := httptest.NewRecorder()
	RequestVoidTransaction(wVoid, reqVoid)

	if wVoid.Code != http.StatusOK {
		t.Fatalf("expected 200 OK for request void, got %d: %s", wVoid.Code, wVoid.Body.String())
	}

	var pendingVoidTx TransactionDTO
	_ = json.NewDecoder(wVoid.Body).Decode(&pendingVoidTx)
	if pendingVoidTx.Status != "PENDING_VOID" {
		t.Fatalf("expected status PENDING_VOID, got %s", pendingVoidTx.Status)
	}
	if pendingVoidTx.VoidRequesterID != bendahara1Claims.UserID {
		t.Fatalf("expected void_requester_id to be %s, got %s", bendahara1Claims.UserID, pendingVoidTx.VoidRequesterID)
	}

	// 6. Verifikasi Saldo Kas TETAP AKTIF selama status PENDING_VOID (belum berkurang)
	reqSum2 := httptest.NewRequest(http.MethodGet, "/api/v1/finance/summary", nil)
	wSum2 := httptest.NewRecorder()
	GetCashSummary(wSum2, reqSum2)
	var sum2 map[string]interface{}
	_ = json.NewDecoder(wSum2.Body).Decode(&sum2)
	bal2 := sum2["current_balance"].(float64)
	if bal2 != bal1 {
		t.Fatalf("expected balance during PENDING_VOID to remain unchanged (%f), got %f", bal1, bal2)
	}

	// 7. Pengaju (Bendahara I) mencoba menyetujui pengajuannya sendiri -> HARUS DITOLAK (403)
	reqSelfApprove := httptest.NewRequest(http.MethodPost, "/api/v1/finance/transactions/"+createdTx.ID+"/approve-void", nil)
	reqSelfApprove = reqSelfApprove.WithContext(context.WithValue(reqSelfApprove.Context(), chi.RouteCtxKey, rctx))
	reqSelfApprove = reqSelfApprove.WithContext(context.WithValue(reqSelfApprove.Context(), middleware.UserContextKey, bendahara1Claims))
	wSelfApprove := httptest.NewRecorder()
	ApproveVoidTransaction(wSelfApprove, reqSelfApprove)

	if wSelfApprove.Code != http.StatusForbidden {
		t.Fatalf("expected 403 Forbidden for self-approval of void request, got %d", wSelfApprove.Code)
	}

	// 8. Bendahara pasangannya (Bendahara II) menyetujui pembatalan -> BERHASIL (VOID)
	reqApprove := httptest.NewRequest(http.MethodPost, "/api/v1/finance/transactions/"+createdTx.ID+"/approve-void", nil)
	reqApprove = reqApprove.WithContext(context.WithValue(reqApprove.Context(), chi.RouteCtxKey, rctx))
	reqApprove = reqApprove.WithContext(context.WithValue(reqApprove.Context(), middleware.UserContextKey, bendahara2Claims))
	wApprove := httptest.NewRecorder()
	ApproveVoidTransaction(wApprove, reqApprove)

	if wApprove.Code != http.StatusOK {
		t.Fatalf("expected 200 OK for peer approval, got %d: %s", wApprove.Code, wApprove.Body.String())
	}

	var finalVoidTx TransactionDTO
	_ = json.NewDecoder(wApprove.Body).Decode(&finalVoidTx)
	if finalVoidTx.Status != "VOID" {
		t.Fatalf("expected status VOID, got %s", finalVoidTx.Status)
	}

	// 9. Verifikasi Saldo Kas BERKURANG setelah disahkan VOID
	reqSum3 := httptest.NewRequest(http.MethodGet, "/api/v1/finance/summary", nil)
	wSum3 := httptest.NewRecorder()
	GetCashSummary(wSum3, reqSum3)
	var sum3 map[string]interface{}
	_ = json.NewDecoder(wSum3.Body).Decode(&sum3)
	bal3 := sum3["current_balance"].(float64)

	expectedBal3 := bal1 - 75000.0
	if bal3 != expectedBal3 {
		t.Fatalf("expected balance after VOID approval to be %f, got %f", expectedBal3, bal3)
	}
}

func TestDualControlRejectVoidTransactionFlow(t *testing.T) {
	bendahara1Claims := &middleware.UserClaims{
		UserID:   "user-ben1",
		FullName: "Bendahara Satu",
		Role:     "BENDAHARA_I",
	}

	bendahara2Claims := &middleware.UserClaims{
		UserID:   "user-ben2",
		FullName: "Bendahara Dua",
		Role:     "BENDAHARA_II",
	}

	// 1. Buat & Sahkan transaksi
	createPayload := map[string]interface{}{
		"type":             "INCOME",
		"category_name":    "Uang Kas",
		"amount":           30000.0,
		"description":      "Uji Coba Reject Permohonan Void",
		"person_in_charge": "Bendahara Satu",
		"receipt_url":      "https://example.com/receipt.jpg",
	}
	body, _ := json.Marshal(createPayload)
	req := httptest.NewRequest(http.MethodPost, "/api/v1/finance/transactions", bytes.NewReader(body))
	req = req.WithContext(context.WithValue(req.Context(), middleware.UserContextKey, bendahara1Claims))
	w := httptest.NewRecorder()
	CreateTransaction(w, req)
	var tx TransactionDTO
	_ = json.NewDecoder(w.Body).Decode(&tx)

	rctx := chi.NewRouteContext()
	rctx.URLParams.Add("id", tx.ID)

	reqVerify := httptest.NewRequest(http.MethodPost, "/api/v1/finance/transactions/"+tx.ID+"/verify", nil)
	reqVerify = reqVerify.WithContext(context.WithValue(reqVerify.Context(), chi.RouteCtxKey, rctx))
	reqVerify = reqVerify.WithContext(context.WithValue(reqVerify.Context(), middleware.UserContextKey, bendahara2Claims))
	wVerify := httptest.NewRecorder()
	VerifyTransaction(wVerify, reqVerify)

	// 2. Bendahara II mengajukan pembatalan (Request Void)
	reqVoidBody, _ := json.Marshal(map[string]string{
		"reason": "Salah tanggal transaksi",
	})
	reqVoid := httptest.NewRequest(http.MethodPost, "/api/v1/finance/transactions/"+tx.ID+"/request-void", bytes.NewReader(reqVoidBody))
	reqVoid = reqVoid.WithContext(context.WithValue(reqVoid.Context(), chi.RouteCtxKey, rctx))
	reqVoid = reqVoid.WithContext(context.WithValue(reqVoid.Context(), middleware.UserContextKey, bendahara2Claims))
	wVoid := httptest.NewRecorder()
	RequestVoidTransaction(wVoid, reqVoid)

	// 3. Bendahara I menolak permohonan pembatalan
	rejectBody, _ := json.Marshal(map[string]string{
		"reason": "Sudah diverifikasi dengan bukti fisik valid",
	})
	reqReject := httptest.NewRequest(http.MethodPost, "/api/v1/finance/transactions/"+tx.ID+"/reject-void", bytes.NewReader(rejectBody))
	reqReject = reqReject.WithContext(context.WithValue(reqReject.Context(), chi.RouteCtxKey, rctx))
	reqReject = reqReject.WithContext(context.WithValue(reqReject.Context(), middleware.UserContextKey, bendahara1Claims))
	wReject := httptest.NewRecorder()
	RejectVoidTransaction(wReject, reqReject)

	if wReject.Code != http.StatusOK {
		t.Fatalf("expected 200 OK for reject void, got %d", wReject.Code)
	}

	var revertedTx TransactionDTO
	_ = json.NewDecoder(wReject.Body).Decode(&revertedTx)
	if revertedTx.Status != "VERIFIED" {
		t.Fatalf("expected status to revert to VERIFIED, got %s", revertedTx.Status)
	}
}
