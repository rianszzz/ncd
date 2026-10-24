package handler

import (
	"encoding/json"
	"net/http"

	"github.com/ncd/backend/internal/middleware"
)

type ActivityDTO struct {
	ID        string `json:"id"`
	Title     string `json:"title"`
	Timestamp string `json:"timestamp"`
	Type      string `json:"type"` // "TRANSACTION", "PROJECT", "MEMBER", "ANNOUNCEMENT"
	Actor     string `json:"actor,omitempty"`
	Badge     string `json:"badge,omitempty"`
}

type DashboardUserDTO struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	FullName string `json:"full_name"`
	Email    string `json:"email"`
	Role     string `json:"role"`
	Position string `json:"position"`
}

type DashboardStatsDTO struct {
	CashBalance              float64 `json:"cash_balance"`
	PendingVerificationCount int     `json:"pending_verification_count"`
	TotalTransactionsCount   int     `json:"total_transactions_count"`
	ActiveProjectsCount      int     `json:"active_projects_count"`
	TotalMembersCount        int     `json:"total_members_count"`
}

type DashboardSummaryDTO struct {
	User                     DashboardUserDTO  `json:"user"`
	PendingVerificationCount int               `json:"pending_verification_count"`
	TotalTransactionsCount   int               `json:"total_transactions_count"`
	ActiveProjectsCount      int               `json:"active_projects_count"`
	TotalMembersCount        int               `json:"total_members_count"`
	CashBalance              float64           `json:"cash_balance"`
	Stats                    DashboardStatsDTO `json:"stats"`
	RecentActivity           []ActivityDTO     `json:"recent_activity"`
}

// GetPortalDashboard mengembalikan ringkasan data operasional workspace pengurus NCD
func GetPortalDashboard(w http.ResponseWriter, r *http.Request) {
	// 1. Resolve User dari Context (JWT) atau fallback default
	user := DashboardUserDTO{
		ID:       "u-pengurus",
		Name:     "Pengurus NCD",
		FullName: "Pengurus NCD",
		Email:    "pengurus@ncd.dev",
		Role:     "PENGURUS",
		Position: "Pengurus Komunitas",
	}

	if claims, ok := r.Context().Value(middleware.UserContextKey).(*middleware.UserClaims); ok && claims != nil {
		user.ID = claims.UserID
		user.Name = claims.FullName
		user.FullName = claims.FullName
		user.Email = claims.Email
		user.Role = claims.Role
		user.Position = claims.Role
	}

	// 2. Kalkulasi Keuangan & Draft Transaksi
	var currentBalance float64
	var pendingCount int
	var totalTxCount int

	txLock.RLock()
	totalTxCount = len(transactions)
	for _, tx := range transactions {
		if tx.Status == "VERIFIED" {
			if tx.Type == "INCOME" {
				currentBalance += tx.Amount
			} else if tx.Type == "EXPENSE" {
				currentBalance -= tx.Amount
			}
		} else if tx.Status == "DRAFT_PENDING" {
			pendingCount++
		}
	}
	txLock.RUnlock()

	// Jika koneksi PostgreSQL aktif, periksa saldo dari database
	if Repo != nil {
		if row, err := Repo.GetCashSummary(r.Context()); err == nil && row.CurrentBalance.Valid {
			if v, err := row.CurrentBalance.Float64Value(); err == nil {
				currentBalance = v.Float64
			}
		}
	}

	// 3. Jumlah Anggota Aktif
	totalMembers := 35
	if Repo != nil {
		if cnt, err := Repo.CountActiveMembers(r.Context()); err == nil && cnt > 0 {
			totalMembers = int(cnt)
		}
	}

	// 4. Jumlah Proyek Aktif
	activeProjects := 2

	// 5. Daftar Aktivitas Terkini / Notifikasi Operasional
	activities := []ActivityDTO{
		{
			ID:        "act-1",
			Title:     "Pencatatan Hadiah Kompetisi Gemastik terverifikasi",
			Timestamp: "2 jam yang lalu",
			Type:      "TRANSACTION",
			Actor:     "Sri Gunarti Wijiastuti (Bendahara II)",
			Badge:     "TERVERIFIKASI",
		},
		{
			ID:        "act-2",
			Title:     "Sprint 4: Decoupled Go API & Web UI terintegrasi ke staging",
			Timestamp: "5 jam yang lalu",
			Type:      "PROJECT",
			Actor:     "Rianszzz (Solo Dev)",
			Badge:     "DEVELOPMENT",
		},
		{
			ID:        "act-3",
			Title:     "Draft pengajuan operasional server cloud & domain menunggu verifikasi",
			Timestamp: "1 hari yang lalu",
			Type:      "TRANSACTION",
			Actor:     "Muhammad Iqbal Fajri (Bendahara I)",
			Badge:     "MENUNGGU",
		},
		{
			ID:        "act-4",
			Title:     "Rapat Koordinasi Pengurus Inti & Evaluasi Roadmap Q4 2026",
			Timestamp: "2 hari yang lalu",
			Type:      "ANNOUNCEMENT",
			Actor:     "Mirza Danisywar (Chairman)",
			Badge:     "OPERASIONAL",
		},
		{
			ID:        "act-5",
			Title:     "Pendaftaran Terbuka Anggota Baru Angkatan 2026 telah dibuka",
			Timestamp: "3 hari yang lalu",
			Type:      "MEMBER",
			Actor:     "Annisa Saskia (Sekretaris I)",
			Badge:     "REKRUTMEN",
		},
	}

	stats := DashboardStatsDTO{
		CashBalance:              currentBalance,
		PendingVerificationCount: pendingCount,
		TotalTransactionsCount:   totalTxCount,
		ActiveProjectsCount:      activeProjects,
		TotalMembersCount:        totalMembers,
	}

	summary := DashboardSummaryDTO{
		User:                     user,
		PendingVerificationCount: pendingCount,
		TotalTransactionsCount:   totalTxCount,
		ActiveProjectsCount:      activeProjects,
		TotalMembersCount:        totalMembers,
		CashBalance:              currentBalance,
		Stats:                    stats,
		RecentActivity:           activities,
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(summary)
}
