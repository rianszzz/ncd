package handler

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
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
	txLock        sync.RWMutex
	transactions  = []TransactionDTO{}
	financeDBPool *pgxpool.Pool
)

// InitFinanceDB sets up PostgreSQL persistence for finance transactions and syncs initial state.
func InitFinanceDB(pool *pgxpool.Pool) {
	if pool == nil {
		return
	}
	financeDBPool = pool

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	createTableQuery := `
	CREATE TABLE IF NOT EXISTS portal_finance_transactions (
		id VARCHAR(100) PRIMARY KEY,
		transaction_number VARCHAR(100) NOT NULL UNIQUE,
		type VARCHAR(50) NOT NULL,
		category_name VARCHAR(150) NOT NULL,
		amount NUMERIC(14, 2) NOT NULL,
		description TEXT NOT NULL,
		person_in_charge VARCHAR(150) NOT NULL,
		receipt_url TEXT NOT NULL,
		status VARCHAR(50) NOT NULL DEFAULT 'DRAFT_PENDING',
		transaction_date VARCHAR(50) NOT NULL,
		maker_name VARCHAR(150) NOT NULL,
		maker_id VARCHAR(100) NOT NULL,
		verifier_name VARCHAR(150) DEFAULT '',
		verifier_id VARCHAR(100) DEFAULT '',
		verified_at VARCHAR(100) DEFAULT '',
		void_reason TEXT DEFAULT '',
		void_by_name VARCHAR(150) DEFAULT '',
		created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	);
	CREATE INDEX IF NOT EXISTS idx_portal_finance_status_date ON portal_finance_transactions(status, transaction_date DESC);
	`
	if _, err := pool.Exec(ctx, createTableQuery); err != nil {
		return
	}

	SyncFinanceFromDB(ctx, pool)
}

// SyncFinanceFromDB loads transactions from PostgreSQL into memory and updates disk cache.
func SyncFinanceFromDB(ctx context.Context, pool *pgxpool.Pool) {
	if pool == nil {
		return
	}

	rows, err := pool.Query(ctx, `
		SELECT id, transaction_number, type, category_name, amount, description, person_in_charge, receipt_url, status, transaction_date, maker_name, maker_id, verifier_name, verifier_id, verified_at, void_reason, void_by_name, created_at
		FROM portal_finance_transactions
		ORDER BY transaction_date DESC, created_at DESC
	`)
	if err != nil {
		return
	}
	defer rows.Close()

	loaded := []TransactionDTO{}
	for rows.Next() {
		var t TransactionDTO
		if err := rows.Scan(
			&t.ID,
			&t.TransactionNumber,
			&t.Type,
			&t.CategoryName,
			&t.Amount,
			&t.Description,
			&t.PersonInCharge,
			&t.ReceiptURL,
			&t.Status,
			&t.TransactionDate,
			&t.MakerName,
			&t.MakerID,
			&t.VerifierName,
			&t.VerifierID,
			&t.VerifiedAt,
			&t.VoidReason,
			&t.VoidByName,
			&t.CreatedAt,
		); err == nil {
			loaded = append(loaded, t)
		}
	}

	txLock.Lock()
	transactions = loaded
	saveTransactionsToDiskLocked()
	txLock.Unlock()
}

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
		loaded := []TransactionDTO{}
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
	if financeDBPool != nil {
		SyncFinanceFromDB(r.Context(), financeDBPool)
	}

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
	if financeDBPool != nil {
		SyncFinanceFromDB(r.Context(), financeDBPool)
	}

	txLock.RLock()
	defer txLock.RUnlock()

	paginateTransactions(w, r, transactions)
}

func paginateTransactions(w http.ResponseWriter, r *http.Request, all []TransactionDTO) {
	total := len(all)
	pageStr := r.URL.Query().Get("page")
	limitStr := r.URL.Query().Get("limit")

	w.Header().Set("X-Total-Count", strconv.Itoa(total))

	if pageStr != "" || limitStr != "" {
		page, _ := strconv.Atoi(pageStr)
		if page < 1 {
			page = 1
		}
		limit, _ := strconv.Atoi(limitStr)
		if limit < 1 || limit > 100 {
			limit = 20
		}

		start := (page - 1) * limit
		if start > total {
			start = total
		}
		end := start + limit
		if end > total {
			end = total
		}

		w.Header().Set("X-Page", strconv.Itoa(page))
		w.Header().Set("X-Per-Page", strconv.Itoa(limit))
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(all[start:end])
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(all)
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

	if financeDBPool != nil {
		ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
		defer cancel()
		_, _ = financeDBPool.Exec(ctx, `
			INSERT INTO portal_finance_transactions (
				id, transaction_number, type, category_name, amount, description, person_in_charge, receipt_url, status, transaction_date, maker_name, maker_id, created_at
			) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
		`, newTx.ID, newTx.TransactionNumber, newTx.Type, newTx.CategoryName, newTx.Amount, newTx.Description, newTx.PersonInCharge, newTx.ReceiptURL, newTx.Status, newTx.TransactionDate, newTx.MakerName, newTx.MakerID, newTx.CreatedAt)
	}

	txLock.Lock()
	transactions = append([]TransactionDTO{newTx}, transactions...)
	saveTransactionsToDiskLocked()
	txLock.Unlock()

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

			// Validasi kepemilikan draft: Hanya pembuat draft atau SUPER_ADMIN / GOD_ADMIN yang boleh mengubah
			isOwner := claims != nil && tx.MakerID != "" && tx.MakerID == claims.UserID
			isAdmin := claims != nil && (claims.Role == "SUPER_ADMIN" || claims.Role == "GOD_ADMIN")
			if !isOwner && !isAdmin {
				http.Error(w, "Forbidden: Anda tidak berhak mengubah draft transaksi milik pembuat lain", http.StatusForbidden)
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

			if financeDBPool != nil {
				ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
				defer cancel()
				_, _ = financeDBPool.Exec(ctx, `
					UPDATE portal_finance_transactions
					SET type = $1, category_name = $2, amount = $3, description = $4, person_in_charge = $5, receipt_url = $6, transaction_date = $7, status = $8, void_reason = $9
					WHERE id = $10
				`, transactions[i].Type, transactions[i].CategoryName, transactions[i].Amount, transactions[i].Description, transactions[i].PersonInCharge, transactions[i].ReceiptURL, transactions[i].TransactionDate, transactions[i].Status, transactions[i].VoidReason, id)
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
	claims, _ := r.Context().Value(middleware.UserContextKey).(*middleware.UserClaims)

	txLock.Lock()
	defer txLock.Unlock()

	for i, tx := range transactions {
		if tx.ID == id {
			if tx.Status == "VERIFIED" {
				http.Error(w, "Transaksi sah (VERIFIED) tidak dapat dihapus", http.StatusBadRequest)
				return
			}

			// Validasi kepemilikan draft: Hanya pembuat draft atau SUPER_ADMIN / GOD_ADMIN yang boleh menghapus
			isOwner := claims != nil && tx.MakerID != "" && tx.MakerID == claims.UserID
			isAdmin := claims != nil && (claims.Role == "SUPER_ADMIN" || claims.Role == "GOD_ADMIN")
			if !isOwner && !isAdmin {
				http.Error(w, "Forbidden: Anda tidak berhak menghapus draft transaksi milik pembuat lain", http.StatusForbidden)
				return
			}

			if financeDBPool != nil {
				ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
				defer cancel()
				_, _ = financeDBPool.Exec(ctx, `DELETE FROM portal_finance_transactions WHERE id = $1`, id)
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

			// Invariant Maker-Checker: Pembuat dilarang memverifikasi transaksinya sendiri
			if claims != nil && tx.MakerID != "" && tx.MakerID == claims.UserID {
				http.Error(w, "Maker-checker violation: Pembuat dilarang memverifikasi transaksinya sendiri demi integritas audit", http.StatusForbidden)
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

			if financeDBPool != nil {
				ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
				defer cancel()
				_, _ = financeDBPool.Exec(ctx, `
					UPDATE portal_finance_transactions
					SET status = 'VERIFIED', verifier_name = $1, verifier_id = $2, verified_at = $3
					WHERE id = $4 AND status = 'DRAFT_PENDING' AND maker_id != $2
				`, transactions[i].VerifierName, transactions[i].VerifierID, transactions[i].VerifiedAt, id)
			}

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

			if financeDBPool != nil {
				ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
				defer cancel()
				_, _ = financeDBPool.Exec(ctx, `
					UPDATE portal_finance_transactions
					SET status = 'VOID', void_reason = $1, void_by_name = $2
					WHERE id = $3
				`, transactions[i].VoidReason, transactions[i].VoidByName, id)
			}

			saveTransactionsToDiskLocked()

			w.Header().Set("Content-Type", "application/json")
			_ = json.NewEncoder(w).Encode(transactions[i])
			return
		}
	}

	http.Error(w, "Transaksi tidak ditemukan", http.StatusNotFound)
}
