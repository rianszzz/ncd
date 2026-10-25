package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/ncd/backend/internal/middleware"
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
	transactions = []TransactionDTO{}
)

func getTransactionsFilePath() string {
	if _, err := os.Stat("backend/data"); err == nil {
		return "backend/data/transactions.json"
	}
	if _, err := os.Stat("data"); err == nil {
		return "data/transactions.json"
	}
	if _, err := os.Stat("../../data"); err == nil {
		return "../../data/transactions.json"
	}
	return "data/transactions.json"
}

func saveTransactionsToDiskLocked() {
	filePath := getTransactionsFilePath()
	bytes, err := json.MarshalIndent(transactions, "", "  ")
	if err == nil {
		_ = os.WriteFile(filePath, bytes, 0644)
	}
}

func loadTransactionsFromDisk() {
	txLock.Lock()
	defer txLock.Unlock()

	filePath := getTransactionsFilePath()
	bytes, err := os.ReadFile(filePath)
	if err == nil && len(bytes) > 0 {
		var loaded []TransactionDTO
		if err := json.Unmarshal(bytes, &loaded); err == nil {
			transactions = loaded
			return
		}
	}
	saveTransactionsToDiskLocked()
}

func init() {
	loadTransactionsFromDisk()
}

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
		"last_updated":    time.Now().Format("02 Jan 2006, 15:04 WIB"),
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(summary)
}

func ListTransactions(w http.ResponseWriter, r *http.Request) {
	if Repo != nil {
		rows, err := Repo.ListTransactions(r.Context())
		if err == nil && len(rows) > 0 {
			txs := make([]TransactionDTO, 0, len(rows))
			for _, t := range rows {
				var amount float64
				if t.Amount.Valid {
					v, _ := t.Amount.Float64Value()
					amount = v.Float64
				}
				dto := TransactionDTO{
					ID:                uuid.UUID(t.ID.Bytes).String(),
					TransactionNumber: t.TransactionNumber,
					Type:              string(t.Type),
					CategoryName:      t.CategoryName,
					Amount:            amount,
					Description:       t.Description,
					PersonInCharge:    t.PersonInCharge,
					ReceiptURL:        t.ReceiptUrl,
					Status:            string(t.Status),
					TransactionDate:   t.TransactionDate.Time.Format("2006-01-02"),
					MakerName:         "Maker",
					CreatedAt:         t.CreatedAt.Time,
				}
				if t.VoidReason.Valid {
					dto.VoidReason = t.VoidReason.String
				}
				txs = append(txs, dto)
			}
			w.Header().Set("Content-Type", "application/json")
			_ = json.NewEncoder(w).Encode(txs)
			return
		}
	}

	txLock.RLock()
	defer txLock.RUnlock()

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(transactions)
}

func CreateTransaction(w http.ResponseWriter, r *http.Request) {
	claims, _ := r.Context().Value(middleware.UserContextKey).(*middleware.UserClaims)

	var req CreateTransactionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.Amount <= 0 || req.Description == "" || req.ReceiptURL == "" {
		http.Error(w, "Nominal > 0, deskripsi, dan link foto nota wajib diisi", http.StatusBadRequest)
		return
	}

	makerName := "Bendahara"
	makerID := "u-bendahara"
	if claims != nil {
		makerName = fmt.Sprintf("%s (%s)", claims.FullName, claims.Role)
		makerID = claims.UserID
	}

	txDate := strings.TrimSpace(req.TransactionDate)
	if txDate == "" {
		txDate = time.Now().Format("2006-01-02")
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
		TransactionDate:   txDate,
		MakerName:         makerName,
		MakerID:           makerID,
		CreatedAt:         time.Now(),
	}

	transactions = append([]TransactionDTO{newTx}, transactions...)
	saveTransactionsToDiskLocked()

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(newTx)
}

// UpdateTransaction memperbarui draft transaksi kas atau transaksi yang sebelumnya ditolak (VOID)
func UpdateTransaction(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	claims, _ := r.Context().Value(middleware.UserContextKey).(*middleware.UserClaims)

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

	for i, tx := range transactions {
		if tx.ID == id {
			if tx.Status == "VERIFIED" {
				http.Error(w, "Transaksi berstatus VERIFIED (Sah) terkunci dan tidak dapat diubah demi integritas audit", http.StatusBadRequest)
				return
			}

			transactions[i].Type = req.Type
			transactions[i].CategoryName = req.CategoryName
			transactions[i].Amount = req.Amount
			transactions[i].Description = req.Description
			transactions[i].PersonInCharge = req.PersonInCharge
			transactions[i].ReceiptURL = req.ReceiptURL
			if strings.TrimSpace(req.TransactionDate) != "" {
				transactions[i].TransactionDate = strings.TrimSpace(req.TransactionDate)
			}

			// Jika sebelumnya ditolak (VOID), ajukan ulang ke DRAFT_PENDING
			if transactions[i].Status == "VOID" {
				transactions[i].Status = "DRAFT_PENDING"
				reviser := "Bendahara"
				if claims != nil {
					reviser = fmt.Sprintf("%s (%s)", claims.FullName, claims.Role)
				}
				transactions[i].VoidReason = fmt.Sprintf("Direvisi & diajukan ulang oleh %s (Catatan penolakan sebelumnya: %s)", reviser, transactions[i].VoidReason)
			}

			saveTransactionsToDiskLocked()

			w.Header().Set("Content-Type", "application/json")
			_ = json.NewEncoder(w).Encode(transactions[i])
			return
		}
	}

	http.Error(w, "Transaksi tidak ditemukan", http.StatusNotFound)
}

// DeleteTransaction menghapus draft transaksi kas atau transaksi yang dibatalkan
func DeleteTransaction(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	txLock.Lock()
	defer txLock.Unlock()

	for i, tx := range transactions {
		if tx.ID == id {
			if tx.Status == "VERIFIED" {
				http.Error(w, "Transaksi sah (VERIFIED) tidak dapat dihapus", http.StatusBadRequest)
				return
			}
			transactions = append(transactions[:i], transactions[i+1:]...)
			saveTransactionsToDiskLocked()

			w.Header().Set("Content-Type", "application/json")
			_ = json.NewEncoder(w).Encode(map[string]string{
				"status":  "success",
				"message": "Draft transaksi berhasil dihapus",
			})
			return
		}
	}

	http.Error(w, "Transaksi tidak ditemukan", http.StatusNotFound)
}

func VerifyTransaction(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	claims, _ := r.Context().Value(middleware.UserContextKey).(*middleware.UserClaims)

	txLock.Lock()
	defer txLock.Unlock()

	for i, tx := range transactions {
		if tx.ID == id {
			if tx.Status != "DRAFT_PENDING" {
				http.Error(w, "Hanya transaksi berstatus DRAFT_PENDING yang dapat diverifikasi / disetujui", http.StatusBadRequest)
				return
			}

			transactions[i].Status = "VERIFIED"
			if claims != nil && (claims.Role == "SUPER_ADMIN" || strings.Contains(strings.ToLower(claims.Role), "chair")) {
				transactions[i].VerifierName = fmt.Sprintf("%s (Persetujuan Chairman)", claims.FullName)
				transactions[i].VerifierID = claims.UserID
			} else if claims != nil {
				transactions[i].VerifierName = fmt.Sprintf("%s (%s)", claims.FullName, claims.Role)
				transactions[i].VerifierID = claims.UserID
			} else {
				transactions[i].VerifierName = "Sri Gunarti Wijiastuti (Bendahara II)"
				transactions[i].VerifierID = "u-sri"
			}
			transactions[i].VerifiedAt = time.Now().Format("2006-01-02 15:04 WIB")
			saveTransactionsToDiskLocked()

			w.Header().Set("Content-Type", "application/json")
			_ = json.NewEncoder(w).Encode(transactions[i])
			return
		}
	}

	http.Error(w, "Transaksi tidak ditemukan", http.StatusNotFound)
}

func VoidTransaction(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	claims, _ := r.Context().Value(middleware.UserContextKey).(*middleware.UserClaims)

	var req VoidRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Reason == "" {
		http.Error(w, "Alasan penolakan / void wajib disertakan", http.StatusBadRequest)
		return
	}

	txLock.Lock()
	defer txLock.Unlock()

	for i, tx := range transactions {
		if tx.ID == id {
			transactions[i].Status = "VOID"
			transactions[i].VoidReason = req.Reason
			if claims != nil {
				transactions[i].VoidByName = fmt.Sprintf("%s (%s)", claims.FullName, claims.Role)
			} else {
				transactions[i].VoidByName = "Mirza Danisywar (Chairman)"
			}
			saveTransactionsToDiskLocked()

			w.Header().Set("Content-Type", "application/json")
			_ = json.NewEncoder(w).Encode(transactions[i])
			return
		}
	}

	http.Error(w, "Transaksi tidak ditemukan", http.StatusNotFound)
}
