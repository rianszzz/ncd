package handler

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/ncd/backend/internal/middleware"
)

type ApplicationVote struct {
	ID        string    `json:"id"`
	UserID    string    `json:"user_id"`
	UserName  string    `json:"user_name"`
	UserRole  string    `json:"user_role"`
	Decision  string    `json:"decision"` // "ACC" or "TIDAK_ACC"
	Note      string    `json:"note"`     // diskusi / pertimbangan opsional
	CreatedAt time.Time `json:"created_at"`
}

type ApplicationDTO struct {
	ID              string            `json:"id"`
	FullName        string            `json:"full_name"`
	Email           string            `json:"email"`
	PhoneWA         string            `json:"phone_whatsapp"`
	University      string            `json:"university"`
	Major           string            `json:"major"`
	Generation      string            `json:"generation"`      // diinput (cth: "2024")
	CampusDomicile  string            `json:"campus_domicile"` // Depok, Bekasi, Jakarta, Tangerang
	ReferralSource  string            `json:"referral_source"` // Darimana tau NCD?
	SkillsInterest  string            `json:"skills_interest"`
	Motivation      string            `json:"motivation"`
	PortfolioLinks  string            `json:"portfolio_links"`
	Status          string            `json:"status"` // "NEW", "ACCEPTED", "REJECTED"
	FinalDecisionBy    string            `json:"final_decision_by,omitempty"`
	FinalDecisionAt    *time.Time        `json:"final_decision_at,omitempty"`
	VerificationStatus string            `json:"verification_status,omitempty"` // "LENGKAP", "PERLU_REVISI", "TIDAK_LENGKAP"
	VerificationNote   string            `json:"verification_note,omitempty"`   // Catatan verifikator Sekretaris
	VerifiedBy         string            `json:"verified_by,omitempty"`
	VerifiedAt         *time.Time        `json:"verified_at,omitempty"`
	Votes              []ApplicationVote `json:"votes"`
	CreatedAt       time.Time         `json:"created_at"`
	UpdatedAt       time.Time         `json:"updated_at"`
}

var (
	appLock          sync.RWMutex
	applicationsList = []ApplicationDTO{}
	appDBPool        *pgxpool.Pool
)

func SendTelegramAlert(text string) {
	botToken := strings.TrimSpace(os.Getenv("TELEGRAM_BOT_TOKEN"))
	chatID := strings.TrimSpace(os.Getenv("TELEGRAM_CHAT_ID"))
	if botToken == "" || chatID == "" {
		return
	}

	go func() {
		apiURL := fmt.Sprintf("https://api.telegram.org/bot%s/sendMessage", botToken)
		data := url.Values{}
		data.Set("chat_id", chatID)
		data.Set("text", text)
		data.Set("parse_mode", "Markdown")

		client := &http.Client{Timeout: 5 * time.Second}
		_, _ = client.PostForm(apiURL, data)
	}()
}

func getApplicationsFilePath() string {
	if _, err := os.Stat("backend/data"); err == nil {
		return "backend/data/applications.json"
	}
	if _, err := os.Stat("data"); err == nil {
		return "data/applications.json"
	}
	return "data/applications.json"
}

func saveApplicationsToDiskLocked() {
	filePath := getApplicationsFilePath()
	bytes, err := json.MarshalIndent(applicationsList, "", "  ")
	if err == nil {
		_ = os.WriteFile(filePath, bytes, 0644)
	}
}

func loadApplicationsFromDisk() {
	appLock.Lock()
	defer appLock.Unlock()

	filePath := getApplicationsFilePath()
	bytes, err := os.ReadFile(filePath)
	if err == nil && len(bytes) > 0 {
		var loaded []ApplicationDTO
		if err := json.Unmarshal(bytes, &loaded); err == nil {
			applicationsList = loaded
			return
		}
	}

	applicationsList = []ApplicationDTO{}
	saveApplicationsToDiskLocked()
}

func InitApplicationsDB(pool *pgxpool.Pool) {
	loadApplicationsFromDisk()
	if pool == nil {
		return
	}
	appDBPool = pool

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	createTableQuery := `
	CREATE TABLE IF NOT EXISTS portal_applications (
		id VARCHAR(100) PRIMARY KEY,
		full_name VARCHAR(150) NOT NULL,
		email VARCHAR(255) NOT NULL,
		phone_whatsapp VARCHAR(50) NOT NULL,
		university VARCHAR(100) NOT NULL,
		major VARCHAR(100) NOT NULL,
		generation VARCHAR(50) NOT NULL,
		campus_domicile VARCHAR(50) NOT NULL,
		referral_source VARCHAR(255) NOT NULL,
		skills_interest TEXT NOT NULL,
		motivation TEXT NOT NULL,
		portfolio_links TEXT DEFAULT '',
		status VARCHAR(50) NOT NULL DEFAULT 'NEW',
		final_decision_by VARCHAR(150) DEFAULT '',
		final_decision_at TIMESTAMPTZ,
		votes JSONB DEFAULT '[]'::jsonb,
		created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
		updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	);`
	_, _ = pool.Exec(ctx, createTableQuery)
}

// SubmitApplication menerima pendaftaran baru dari publik (/join)
func SubmitApplication(w http.ResponseWriter, r *http.Request) {
	var input struct {
		FullName       string `json:"full_name"`
		Email          string `json:"email"`
		PhoneWA        string `json:"phone_whatsapp"`
		University     string `json:"university"`
		Major          string `json:"major"`
		Generation     string `json:"generation"`
		CampusDomicile string `json:"campus_domicile"`
		ReferralSource string `json:"referral_source"`
		SkillsInterest string `json:"skills_interest"`
		Motivation     string `json:"motivation"`
		PortfolioLinks string `json:"portfolio_links"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if input.FullName == "" || input.Email == "" || input.PhoneWA == "" || input.Generation == "" || input.CampusDomicile == "" {
		http.Error(w, "Nama lengkap, email, WhatsApp, angkatan, dan domisili kampus wajib diisi", http.StatusBadRequest)
		return
	}

	if input.University == "" {
		input.University = "Universitas Gunadarma"
	}

	app := ApplicationDTO{
		ID:             uuid.New().String(),
		FullName:       input.FullName,
		Email:          input.Email,
		PhoneWA:        input.PhoneWA,
		University:     input.University,
		Major:          input.Major,
		Generation:     input.Generation,
		CampusDomicile: input.CampusDomicile,
		ReferralSource: input.ReferralSource,
		SkillsInterest: input.SkillsInterest,
		Motivation:     input.Motivation,
		PortfolioLinks: input.PortfolioLinks,
		Status:         "NEW",
		Votes:          []ApplicationVote{},
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}

	appLock.Lock()
	applicationsList = append([]ApplicationDTO{app}, applicationsList...)
	saveApplicationsToDiskLocked()
	appLock.Unlock()

	// Async sync to DB
	if appDBPool != nil {
		go func(item ApplicationDTO) {
			ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
			defer cancel()
			votesJSON, _ := json.Marshal(item.Votes)
			_, _ = appDBPool.Exec(ctx, `
				INSERT INTO portal_applications (
					id, full_name, email, phone_whatsapp, university, major, generation,
					campus_domicile, referral_source, skills_interest, motivation,
					portfolio_links, status, votes, created_at, updated_at
				) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
				ON CONFLICT (id) DO UPDATE SET updated_at = NOW();
			`, item.ID, item.FullName, item.Email, item.PhoneWA, item.University, item.Major, item.Generation,
				item.CampusDomicile, item.ReferralSource, item.SkillsInterest, item.Motivation,
				item.PortfolioLinks, item.Status, votesJSON, item.CreatedAt, item.UpdatedAt)
		}(app)
	}

	// Kirim notifikasi Telegram ke Pengurus
	notifText := fmt.Sprintf(
		"📥 *Pendaftaran Anggota Baru NCD!*\n\n"+
			"👤 *Nama:* %s\n"+
			"🎓 *Jurusan & Angkatan:* %s (%s)\n"+
			"📍 *Domisili Kampus:* %s\n"+
			"🔍 *Mengetahui NCD:* %s\n"+
			"💡 *Minat:* %s\n"+
			"📱 *WhatsApp:* %s\n\n"+
			"👉 *Status:* Menunggu Voting Pengurus di Dasbor Portal.",
		app.FullName, app.Major, app.Generation, app.CampusDomicile, app.ReferralSource, app.SkillsInterest, app.PhoneWA,
	)
	SendTelegramAlert(notifText)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"status":  "success",
		"message": "Formulir pendaftaran berhasil terkirim. Pengurus NCD akan meninjau berkas pendaftaran Anda.",
		"id":      app.ID,
	})
}

// ListApplications mengembalikan daftar pendaftar untuk semua role pengurus KECUALI 'MEMBER'.
// Khusus SUPER_ADMIN: melihat semua rincian voting pengurus (nama, pilihan, catatan).
// Selain SUPER_ADMIN: rincian voting pengurus lain adalah RAHASIA.
func ListApplications(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value(middleware.UserContextKey).(*middleware.UserClaims)
	if !ok || claims == nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Aturan Hak Akses: Masuk ke semua role pengurus, TERKECUALI role "MEMBER" (Member Komunitas)
	if claims.Role == "MEMBER" {
		http.Error(w, "Akses ditolak: role Member Komunitas tidak memiliki akses data rekrutmen", http.StatusForbidden)
		return
	}

	appLock.RLock()
	defer appLock.RUnlock()

	w.Header().Set("Content-Type", "application/json")

	// Super Admin mendapatkan transparansi penuh seluruh voting pengurus
	if claims.Role == "SUPER_ADMIN" {
		if applicationsList == nil {
			applicationsList = []ApplicationDTO{}
		}
		_ = json.NewEncoder(w).Encode(applicationsList)
		return
	}

	// Selain Super Admin: voting pengurus lain dirahasiakan (hanya kembalikan voting milik sendiri)
	if applicationsList == nil {
		applicationsList = []ApplicationDTO{}
	}
	sanitized := make([]ApplicationDTO, len(applicationsList))
	for i, app := range applicationsList {
		sanitized[i] = app
		var myVotes []ApplicationVote
		for _, v := range app.Votes {
			if v.UserID == claims.UserID {
				myVotes = append(myVotes, v)
			}
		}
		sanitized[i].Votes = myVotes
	}

	_ = json.NewEncoder(w).Encode(sanitized)
}

// VoteApplication mencatat voting ACC / TIDAK_ACC beserta diskusi opsional dari pengurus
func VoteApplication(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value(middleware.UserContextKey).(*middleware.UserClaims)
	if !ok || claims == nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	if claims.Role == "MEMBER" {
		http.Error(w, "Akses ditolak: role Member Komunitas tidak dapat memberikan voting", http.StatusForbidden)
		return
	}

	appID := chi.URLParam(r, "id")
	if appID == "" {
		http.Error(w, "ID pendaftaran tidak valid", http.StatusBadRequest)
		return
	}

	var req struct {
		Decision string `json:"decision"` // "ACC" or "TIDAK_ACC"
		Note     string `json:"note"`     // opsional
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.Decision != "ACC" && req.Decision != "TIDAK_ACC" {
		http.Error(w, "Keputusan voting harus 'ACC' atau 'TIDAK_ACC'", http.StatusBadRequest)
		return
	}

	appLock.Lock()
	defer appLock.Unlock()

	var target *ApplicationDTO
	for i := range applicationsList {
		if applicationsList[i].ID == appID {
			target = &applicationsList[i]
			break
		}
	}

	if target == nil {
		http.Error(w, "Data pendaftaran tidak ditemukan", http.StatusNotFound)
		return
	}

	// Status konkrit: jika keputusan akhir sudah dibuat, voting ditutup
	if target.Status == "ACCEPTED" || target.Status == "REJECTED" {
		http.Error(w, "Voting ditutup: keputusan akhir telah ditetapkan dan terkunci", http.StatusConflict)
		return
	}

	// Cari apakah pengurus ini sudah voting sebelumnya (update vote jika ada)
	foundVote := false
	for i := range target.Votes {
		if target.Votes[i].UserID == claims.UserID {
			target.Votes[i].Decision = req.Decision
			target.Votes[i].Note = req.Note
			target.Votes[i].CreatedAt = time.Now()
			foundVote = true
			break
		}
	}

	if !foundVote {
		target.Votes = append(target.Votes, ApplicationVote{
			ID:        uuid.New().String(),
			UserID:    claims.UserID,
			UserName:  claims.FullName,
			UserRole:  claims.Role,
			Decision:  req.Decision,
			Note:      req.Note,
			CreatedAt: time.Now(),
		})
	}

	target.UpdatedAt = time.Now()
	saveApplicationsToDiskLocked()

	// Async sync DB
	if appDBPool != nil {
		go func(item ApplicationDTO) {
			ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
			defer cancel()
			votesJSON, _ := json.Marshal(item.Votes)
			_, _ = appDBPool.Exec(ctx, `
				UPDATE portal_applications SET votes = $1, updated_at = NOW() WHERE id = $2;
			`, votesJSON, item.ID)
		}(*target)
	}

	var returnVotes []ApplicationVote
	if claims.Role == "SUPER_ADMIN" {
		returnVotes = target.Votes
	} else {
		for _, v := range target.Votes {
			if v.UserID == claims.UserID {
				returnVotes = append(returnVotes, v)
			}
		}
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"status":  "success",
		"message": fmt.Sprintf("Voting %s berhasil disimpan", req.Decision),
		"votes":   returnVotes,
	})
}

// DecideApplication menetapkan keputusan akhir (Eksklusif SUPER_ADMIN)
func DecideApplication(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value(middleware.UserContextKey).(*middleware.UserClaims)
	if !ok || claims == nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Aturan Hak Akses: Yang menentukan keputusan akhirnya MUTLAK hanya SUPERADMIN (Role lain termasuk GOD_ADMIN ditolak)
	if claims.Role != "SUPER_ADMIN" {
		http.Error(w, "Akses ditolak: Hanya SUPERADMIN yang berwenang menentukan keputusan akhir penerimaan anggota", http.StatusForbidden)
		return
	}

	appID := chi.URLParam(r, "id")
	if appID == "" {
		http.Error(w, "ID pendaftaran tidak valid", http.StatusBadRequest)
		return
	}

	var req struct {
		Status string `json:"status"` // "ACCEPTED" or "REJECTED"
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.Status != "ACCEPTED" && req.Status != "REJECTED" {
		http.Error(w, "Keputusan akhir harus 'ACCEPTED' atau 'REJECTED'", http.StatusBadRequest)
		return
	}

	appLock.Lock()
	defer appLock.Unlock()

	var target *ApplicationDTO
	for i := range applicationsList {
		if applicationsList[i].ID == appID {
			target = &applicationsList[i]
			break
		}
	}

	if target == nil {
		http.Error(w, "Data pendaftaran tidak ditemukan", http.StatusNotFound)
		return
	}

	// Status konkrit: jika keputusan akhir sudah dibuat, tidak dapat diubah lagi
	if target.Status == "ACCEPTED" || target.Status == "REJECTED" {
		http.Error(w, "Keputusan akhir sudah ditetapkan dan bersifat permanen (terkunci)", http.StatusConflict)
		return
	}

	now := time.Now()
	target.Status = req.Status
	target.FinalDecisionBy = fmt.Sprintf("%s (%s)", claims.FullName, claims.Role)
	target.FinalDecisionAt = &now
	target.UpdatedAt = now
	saveApplicationsToDiskLocked()

	// Async sync DB
	if appDBPool != nil {
		go func(item ApplicationDTO) {
			ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
			defer cancel()
			_, _ = appDBPool.Exec(ctx, `
				UPDATE portal_applications SET status = $1, final_decision_by = $2, final_decision_at = $3, updated_at = NOW() WHERE id = $4;
			`, item.Status, item.FinalDecisionBy, item.FinalDecisionAt, item.ID)
		}(*target)
	}

	// Notifikasi Telegram keputusan akhir
	statusLabel := "DITERIMA"
	if req.Status == "REJECTED" {
		statusLabel = "DITOLAK"
	}
	SendTelegramAlert(fmt.Sprintf(
		"Keputusan Akhir Rekrutmen NCD\n\n"+
			"*Nama:* %s\n"+
			"*Angkatan/Domisili:* %s - %s\n"+
			"*Keputusan:* %s\n"+
			"*Otoritas:* %s\n"+
			"*Total Vote Pengurus:* %d suara",
		target.FullName, target.Generation, target.CampusDomicile, statusLabel, target.FinalDecisionBy, len(target.Votes),
	))

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"status":  "success",
		"message": fmt.Sprintf("Keputusan akhir berhasil ditetapkan: %s", target.Status),
		"data":    target,
	})
}

// DeleteApplication removes a single application record (SUPER_ADMIN only).
func DeleteApplication(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value(middleware.UserContextKey).(*middleware.UserClaims)
	if !ok || claims == nil || claims.Role != "SUPER_ADMIN" {
		http.Error(w, `{"error":"Akses ditolak: Hanya SUPER_ADMIN yang berwenang menghapus berkas"}`, http.StatusForbidden)
		return
	}

	appID := chi.URLParam(r, "id")
	if appID == "" {
		http.Error(w, `{"error":"ID pendaftaran wajib diisi"}`, http.StatusBadRequest)
		return
	}

	appLock.Lock()
	targetIndex := -1
	var deletedItem ApplicationDTO
	for i, a := range applicationsList {
		if a.ID == appID {
			targetIndex = i
			deletedItem = a
			break
		}
	}

	if targetIndex == -1 {
		appLock.Unlock()
		http.Error(w, `{"error":"Berkas pendaftaran tidak ditemukan"}`, http.StatusNotFound)
		return
	}

	// Remove from slice
	applicationsList = append(applicationsList[:targetIndex], applicationsList[targetIndex+1:]...)
	saveApplicationsToDiskLocked()
	appLock.Unlock()

	// Async sync DB if pool is available
	if appDBPool != nil {
		go func(id string) {
			ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
			defer cancel()
			_, _ = appDBPool.Exec(ctx, `DELETE FROM portal_applications WHERE id = $1;`, id)
		}(appID)
	}

	// Telegram audit notification
	SendTelegramAlert(fmt.Sprintf(
		"PENGHAPUSAN BERKAS PENDAFTARAN\n\n"+
			"*Nama Calon:* %s\n"+
			"*Angkatan/Domisili:* %s - %s\n"+
			"*Status Terakhir:* %s\n"+
			"*Dihapus Oleh:* %s (%s)\n"+
			"*Waktu:* %s WIB",
		deletedItem.FullName, deletedItem.Generation, deletedItem.CampusDomicile, deletedItem.Status,
		claims.FullName, claims.Role, time.Now().Format("02 Jan 2006 15:04"),
	))

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"status":  "success",
		"message": fmt.Sprintf("Berkas pendaftaran '%s' berhasil dihapus", deletedItem.FullName),
		"id":      appID,
	})
}

// DeleteApplicationsByDate removes all applications for a given date or batch of IDs (SUPER_ADMIN only).
func DeleteApplicationsByDate(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value(middleware.UserContextKey).(*middleware.UserClaims)
	if !ok || claims == nil || claims.Role != "SUPER_ADMIN" {
		http.Error(w, `{"error":"Akses ditolak: Hanya SUPER_ADMIN yang berwenang menghapus berkas"}`, http.StatusForbidden)
		return
	}

	dateParam := r.URL.Query().Get("date")
	type batchReq struct {
		Date string   `json:"date"`
		IDs  []string `json:"ids"`
	}
	var req batchReq
	_ = json.NewDecoder(r.Body).Decode(&req)
	if dateParam == "" && req.Date != "" {
		dateParam = req.Date
	}

	appLock.Lock()
	var remaining []ApplicationDTO
	var deletedNames []string
	deletedCount := 0

	idMap := make(map[string]bool)
	for _, id := range req.IDs {
		idMap[id] = true
	}

	for _, a := range applicationsList {
		matchDate := false
		if dateParam != "" {
			if a.CreatedAt.Format("2006-01-02") == dateParam ||
				a.CreatedAt.In(time.Local).Format("2006-01-02") == dateParam ||
				(len(dateParam) <= 10 && len(a.CreatedAt.Format(time.RFC3339)) >= len(dateParam) && a.CreatedAt.Format(time.RFC3339)[:len(dateParam)] == dateParam) {
				matchDate = true
			}
		}

		if matchDate || idMap[a.ID] {
			deletedCount++
			deletedNames = append(deletedNames, a.FullName)
		} else {
			remaining = append(remaining, a)
		}
	}

	if deletedCount == 0 {
		appLock.Unlock()
		http.Error(w, `{"error":"Tidak ada berkas yang ditemukan untuk tanggal atau kriteria tersebut"}`, http.StatusNotFound)
		return
	}

	if remaining == nil {
		remaining = []ApplicationDTO{}
	}
	applicationsList = remaining
	saveApplicationsToDiskLocked()
	appLock.Unlock()

	// Async sync DB if pool is available
	if appDBPool != nil {
		go func(dateStr string, ids []string) {
			ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
			defer cancel()
			if len(ids) > 0 {
				_, _ = appDBPool.Exec(ctx, `DELETE FROM portal_applications WHERE id = ANY($1);`, ids)
			} else if dateStr != "" {
				_, _ = appDBPool.Exec(ctx, `DELETE FROM portal_applications WHERE DATE(created_at) = $1;`, dateStr)
			}
		}(dateParam, req.IDs)
	}

	// Telegram audit alert
	namesPreview := ""
	for i, name := range deletedNames {
		if i >= 5 {
			namesPreview += fmt.Sprintf("\n- ...dan %d calon lainnya", len(deletedNames)-5)
			break
		}
		namesPreview += fmt.Sprintf("\n- %s", name)
	}

	SendTelegramAlert(fmt.Sprintf(
		"PENGHAPUSAN MASSAL BERKAS PENDAFTARAN\n\n"+
			"*Tanggal/Kriteria:* %s\n"+
			"*Total Dihapus:* %d berkas\n"+
			"*Daftar Calon:*%s\n"+
			"*Dihapus Oleh:* %s (%s)\n"+
			"*Waktu:* %s WIB",
		dateParam, deletedCount, namesPreview,
		claims.FullName, claims.Role, time.Now().Format("02 Jan 2006 15:04"),
	))

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"status":        "success",
		"message":       fmt.Sprintf("Berhasil menghapus %d berkas pendaftaran", deletedCount),
		"deleted_count": deletedCount,
	})
}

// VerifyApplication allows SEKRETARIS, SUPER_ADMIN, and GOD_ADMIN to verify an applicant's dossier
func VerifyApplication(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value(middleware.UserContextKey).(*middleware.UserClaims)
	if !ok || claims == nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	if claims.Role != "SEKRETARIS" && claims.Role != "SUPER_ADMIN" && claims.Role != "GOD_ADMIN" {
		http.Error(w, "Akses ditolak: Hanya Sekretaris atau Pimpinan yang berwenang memverifikasi kelengkapan berkas", http.StatusForbidden)
		return
	}

	appID := chi.URLParam(r, "id")
	if appID == "" {
		http.Error(w, "ID pendaftaran tidak valid", http.StatusBadRequest)
		return
	}

	var req struct {
		VerificationStatus string `json:"verification_status"` // "LENGKAP", "PERLU_REVISI", "TIDAK_LENGKAP"
		VerificationNote   string `json:"verification_note"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	req.VerificationStatus = strings.ToUpper(strings.TrimSpace(req.VerificationStatus))
	if req.VerificationStatus != "LENGKAP" && req.VerificationStatus != "PERLU_REVISI" && req.VerificationStatus != "TIDAK_LENGKAP" {
		http.Error(w, "Status verifikasi harus salah satu dari: LENGKAP, PERLU_REVISI, atau TIDAK_LENGKAP", http.StatusBadRequest)
		return
	}

	now := time.Now()
	appLock.Lock()
	defer appLock.Unlock()

	idx := -1
	for i, a := range applicationsList {
		if a.ID == appID {
			idx = i
			break
		}
	}

	if idx == -1 {
		http.Error(w, "Pendaftaran tidak ditemukan", http.StatusNotFound)
		return
	}

	applicationsList[idx].VerificationStatus = req.VerificationStatus
	applicationsList[idx].VerificationNote = strings.TrimSpace(req.VerificationNote)
	verifierName := claims.FullName
	if verifierName == "" {
		verifierName = claims.Email
	}
	applicationsList[idx].VerifiedBy = fmt.Sprintf("%s (%s)", verifierName, claims.Role)
	applicationsList[idx].VerifiedAt = &now
	applicationsList[idx].UpdatedAt = now

	saveApplicationsToDiskLocked()

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"status":      "success",
		"message":     "Status verifikasi berkas berhasil diperbarui",
		"application": applicationsList[idx],
	})
}
