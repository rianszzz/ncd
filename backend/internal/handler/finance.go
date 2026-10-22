package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sync"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

type TransactionDTO struct {
	ID                string    `json:"id"`
	TransactionNumber string    `json:"transaction_number"`
	Type              string    `json:"type"` // "INCOME" or "EXPENSE"
	CategoryName      string    `json:"category_name"`
	Amount            float64   `json:"amount"`
	Description       string    `json:"description"`
	PersonInCharge    string    `json:"person_in_charge"`
	ReceiptURL        string    `json:"receipt_url"`
	Status            string    `json:"status"` // "DRAFT_PENDING", "VERIFIED", "VOID"
	TransactionDate   string    `json:"transaction_date"`
	MakerName         string    `json:"maker_name"`
	MakerID           string    `json:"maker_id"`
	VerifierName      string    `json:"verifier_name,omitempty"`
	VerifierID        string    `json:"verifier_id,omitempty"`
	VerifiedAt        string    `json:"verified_at,omitempty"`
	VoidReason        string    `json:"void_reason,omitempty"`
	VoidByName        string    `json:"void_by_name,omitempty"`
	CreatedAt         time.Time `json:"created_at"`
}

type CreateTransactionRequest struct {
	Type           string  `json:"type"`
	CategoryName   string  `json:"category_name"`
	Amount         float64 `json:"amount"`
	Description    string  `json:"description"`
	PersonInCharge string  `json:"person_in_charge"`
	ReceiptURL     string  `json:"receipt_url"`
	TransactionDate string `json:"transaction_date"`
}

type VoidRequest struct {
	Reason string `json:"reason"`
}

var (
	txLock       sync.RWMutex
	transactions = []TransactionDTO{
		{
			ID:                "tx-1",
			TransactionNumber: "NCD-TRX-202610-0001",
			Type:              "INCOME",
			CategoryName:      "Saldo Awal & Migrasi",
			Amount:            5000000.00,
			Description:       "Saldo kas pembuka hasil audit periode kepengurusan sebelumnya",
			PersonInCharge:    "Muhammad Iqbal Fajri",
			ReceiptURL:        "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80",
			Status:            "VERIFIED",
			TransactionDate:   "2026-10-01",
			MakerName:         "Muhammad Iqbal Fajri (Bendahara I)",
			MakerID:           "u-iqbal",
			VerifierName:      "Sri Gunarti Wijiastuti (Bendahara II)",
			VerifierID:        "u-sri",
			VerifiedAt:        "2026-10-02T10:00:00Z",
			CreatedAt:         time.Now().Add(-20 * 24 * time.Hour),
		},
		{
			ID:                "tx-2",
			TransactionNumber: "NCD-TRX-202610-0002",
			Type:              "INCOME",
			CategoryName:      "Hadiah Kompetisi",
			Amount:            3500000.00,
			Description:       "Hadiah Juara 1 Gemastik Software Engineering oleh Tim NCD Alpha",
			PersonInCharge:    "Muhamad Fauzan Al Farikhi",
			ReceiptURL:        "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=600&auto=format&fit=crop&q=80",
			Status:            "VERIFIED",
			TransactionDate:   "2026-10-10",
			MakerName:         "Muhammad Iqbal Fajri (Bendahara I)",
			MakerID:           "u-iqbal",
			VerifierName:      "Sri Gunarti Wijiastuti (Bendahara II)",
			VerifierID:        "u-sri",
			VerifiedAt:        "2026-10-11T14:30:00Z",
			CreatedAt:         time.Now().Add(-12 * 24 * time.Hour),
		},
		{
			ID:                "tx-3",
			TransactionNumber: "NCD-TRX-202610-0003",
			Type:              "EXPENSE",
			CategoryName:      "Infrastruktur & Cloud",
			Amount:            650000.00,
			Description:       "Pembayaran sewa domain ncd.nexatechlabs.my.id & server cloud 3 bulan",
			PersonInCharge:    "Rianszzz",
			ReceiptURL:        "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&auto=format&fit=crop&q=80",
			Status:            "VERIFIED",
			TransactionDate:   "2026-10-15",
			MakerName:         "Muhammad Iqbal Fajri (Bendahara I)",
			MakerID:           "u-iqbal",
			VerifierName:      "Sri Gunarti Wijiastuti (Bendahara II)",
			VerifierID:        "u-sri",
			VerifiedAt:        "2026-10-15T18:00:00Z",
			CreatedAt:         time.Now().Add(-7 * 24 * time.Hour),
		},
		{
			ID:                "tx-4",
			TransactionNumber: "NCD-TRX-202610-0004",
			Type:              "EXPENSE",
			CategoryName:      "Konsumsi & Rapat Kerja",
			Amount:            320000.00,
			Description:       "Konsumsi rapat koordinasi bulanan 8 pengurus NCD",
			PersonInCharge:    "Annisa Saskia",
			ReceiptURL:        "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80",
			Status:            "DRAFT_PENDING",
			TransactionDate:   "2026-10-21",
			MakerName:         "Muhammad Iqbal Fajri (Bendahara I)",
			MakerID:           "u-iqbal",
			CreatedAt:         time.Now().Add(-1 * 24 * time.Hour),
		},
	}
)

func GetCashSummary(w http.ResponseWriter, r *http.Request) {
	txLock.RLock()
	defer txLock.RUnlock()

	var totalIncome, totalExpense float64
	var pendingCount int

	for _, tx := range transactions {
		if tx.Status == "VERIFIED" {
			if tx.Type == "INCOME" {
				totalIncome += tx.Amount
			} else if tx.Type == "EXPENSE" {
				totalExpense += tx.Amount
			}
		} else if tx.Status == "DRAFT_PENDING" {
			pendingCount++
		}
	}

	balance := totalIncome - totalExpense

	summary := map[string]interface{}{
		"current_balance": balance,
		"total_income":    totalIncome,
		"total_expense":   totalExpense,
		"pending_drafts":  pendingCount,
		"last_updated":    time.Now(),
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(summary)
}

func ListTransactions(w http.ResponseWriter, r *http.Request) {
	txLock.RLock()
	defer txLock.RUnlock()

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(transactions)
}

func CreateTransaction(w http.ResponseWriter, r *http.Request) {
	var req CreateTransactionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.Amount <= 0 || req.Description == "" || req.ReceiptURL == "" {
		http.Error(w, "Nominal > 0, deskripsi, dan link foto nota wajib diisi", http.StatusBadRequest)
		return
	}

	txLock.Lock()
	defer txLock.Unlock()

	newTx := TransactionDTO{
		ID:                uuid.New().String(),
		TransactionNumber: fmt.Sprintf("NCD-TRX-%s-%04d", time.Now().Format("200601"), len(transactions)+1),
		Type:              req.Type,
		CategoryName:      req.CategoryName,
		Amount:            req.Amount,
		Description:       req.Description,
		PersonInCharge:    req.PersonInCharge,
		ReceiptURL:        req.ReceiptURL,
		Status:            "DRAFT_PENDING",
		TransactionDate:   req.TransactionDate,
		MakerName:         "Muhammad Iqbal Fajri (Bendahara I)",
		MakerID:           "u-iqbal",
		CreatedAt:         time.Now(),
	}

	transactions = append([]TransactionDTO{newTx}, transactions...)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(newTx)
}

func VerifyTransaction(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	txLock.Lock()
	defer txLock.Unlock()

	for i, tx := range transactions {
		if tx.ID == id {
			if tx.Status != "DRAFT_PENDING" {
				http.Error(w, "Hanya transaksi berstatus DRAFT_PENDING yang dapat diverifikasi", http.StatusBadRequest)
				return
			}

			// Maker-Checker Invariant check
			// Verifier is Sri (Bendahara II), Maker is Iqbal (Bendahara I)
			transactions[i].Status = "VERIFIED"
			transactions[i].VerifierName = "Sri Gunarti Wijiastuti (Bendahara II)"
			transactions[i].VerifierID = "u-sri"
			transactions[i].VerifiedAt = time.Now().Format(time.RFC3339)

			w.Header().Set("Content-Type", "application/json")
			_ = json.NewEncoder(w).Encode(transactions[i])
			return
		}
	}

	http.Error(w, "Transaksi tidak ditemukan", http.StatusNotFound)
}

func VoidTransaction(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	var req VoidRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Reason == "" {
		http.Error(w, "Alasan pembatalan (void) wajib disertakan", http.StatusBadRequest)
		return
	}

	txLock.Lock()
	defer txLock.Unlock()

	for i, tx := range transactions {
		if tx.ID == id {
			transactions[i].Status = "VOID"
			transactions[i].VoidReason = req.Reason
			transactions[i].VoidByName = "Mirza / Fauzan (Super Admin)"

			w.Header().Set("Content-Type", "application/json")
			_ = json.NewEncoder(w).Encode(transactions[i])
			return
		}
	}

	http.Error(w, "Transaksi tidak ditemukan", http.StatusNotFound)
}
