package handler

import (
	"context"
	"encoding/json"
	"fmt"
	"html"
	"net/http"
	"os"
	"regexp"
	"strings"
	"sync"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/ncd/backend/internal/middleware"
)

type LearningSessionClass struct {
	ID          string    `json:"id"`
	Slug        string    `json:"slug"`
	ClassNumber string    `json:"class_number"`
	SpeakerName string    `json:"speaker_name"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	DateLabel   string    `json:"date_label"`
	TimeLabel   string    `json:"time_label"`
	Platform    string    `json:"platform"`
	Mode        string    `json:"mode"`
	PosterURL   string    `json:"poster_url"`
	AccentColor string    `json:"accent_color"`
	DiscordURL  string    `json:"discord_url"`
	CreatedAt   time.Time `json:"created_at"`
}

type LearningSessionRegistration struct {
	ID          string    `json:"id"`
	UserID      string    `json:"user_id"`
	ClassSlug   string    `json:"class_slug"`
	ClassName   string    `json:"class_name"`
	SpeakerName string    `json:"speaker_name"`
	FullName    string    `json:"full_name"`
	Email       string    `json:"email"`
	PhoneWA     string    `json:"phone_wa"`
	University  string    `json:"university"`
	Major       string    `json:"major"`
	CreatedAt   time.Time `json:"created_at"`
}

type LearningSessionStats struct {
	TotalCount   int                           `json:"total_count"`
	FawwazCount  int                           `json:"fawwaz_count"`
	FauzanCount  int                           `json:"fauzan_count"`
	Participants []LearningSessionRegistration `json:"participants"`
}

var (
	lsLock            sync.RWMutex
	lsRegistrations   = []LearningSessionRegistration{}
	lsDBPool          *pgxpool.Pool

	lsClassLock       sync.RWMutex
	lsClasses         = []LearningSessionClass{}

	defaultLearningClasses = []LearningSessionClass{
		{
			ID:          "class-fawwaz-01",
			Slug:        "fawwaz-webdev",
			ClassNumber: "CLASS 01",
			SpeakerName: "Muhammad Fawwaz Rayyan Khalish",
			Title:       "WEB DEVELOPMENT FUNDAMENTALS: From Internet to Website",
			Description: "Pelajari dasar cara kerja internet, HTTP/HTTPS, domain, hosting, DNS, serta bagaimana browser dan server bekerja dalam menampilkan sebuah website.",
			DateLabel:   "Sabtu, 07 November 2026",
			TimeLabel:   "20.00–21.00 WIB",
			Platform:    "Discord",
			Mode:        "Online Live Session",
			PosterURL:   "fawwaz-poster",
			AccentColor: "#3B82F6",
			DiscordURL:  "https://discord.com/events/1566134369398034514/1566142733561634877",
			CreatedAt:   time.Date(2026, 10, 31, 20, 0, 0, 0, time.UTC),
		},
		{
			ID:          "class-fauzan-02",
			Slug:        "fauzan-team101",
			ClassNumber: "CLASS 02",
			SpeakerName: "Muhamad Fauzan Al Farikhi",
			Title:       "TEAM FORMATION 101: From Strangers to One Team",
			Description: "Pelajari cara membangun chemistry, mengenali potensi anggota, membagi tanggung jawab, dan menciptakan kolaborasi tim lintas jurusan yang efektif.",
			DateLabel:   "Senin, 16 November 2026",
			TimeLabel:   "20.00–21.00 WIB",
			Platform:    "Discord",
			Mode:        "Online Live Session",
			PosterURL:   "fauzan-poster",
			AccentColor: "#6366F1",
			DiscordURL:  "https://discord.com/events/1566134369398034514/1566143302619767078",
			CreatedAt:   time.Date(2026, 10, 31, 20, 0, 0, 0, time.UTC),
		},
	}
)

func init() {
	go func() {
		time.Sleep(100 * time.Millisecond)
		loadLearningSessionClassesFromDisk()
		loadLearningSessionRegistrationsFromDisk()
	}()
}

func getLearningSessionsFilePath() string {
	if _, err := os.Stat("backend/data"); err == nil {
		return "backend/data/learning_session_registrations.json"
	}
	if _, err := os.Stat("data"); err == nil {
		return "data/learning_session_registrations.json"
	}
	return "data/learning_session_registrations.json"
}

func getLearningClassesFilePath() string {
	if _, err := os.Stat("backend/data"); err == nil {
		return "backend/data/learning_session_classes.json"
	}
	if _, err := os.Stat("data"); err == nil {
		return "data/learning_session_classes.json"
	}
	return "data/learning_session_classes.json"
}

func loadLearningSessionClassesFromDisk() {
	lsClassLock.Lock()
	defer lsClassLock.Unlock()

	filePath := getLearningClassesFilePath()
	data, err := os.ReadFile(filePath)
	if err != nil || len(data) == 0 {
		lsClasses = append([]LearningSessionClass{}, defaultLearningClasses...)
		saveLearningSessionClassesLocked()
		return
	}

	var list []LearningSessionClass
	if err := json.Unmarshal(data, &list); err != nil || len(list) == 0 {
		lsClasses = append([]LearningSessionClass{}, defaultLearningClasses...)
		saveLearningSessionClassesLocked()
		return
	}
	lsClasses = list
}

func saveLearningSessionClassesLocked() {
	filePath := getLearningClassesFilePath()
	bytes, err := json.MarshalIndent(lsClasses, "", "  ")
	if err == nil {
		_ = os.WriteFile(filePath, bytes, 0644)
	}
}

func loadLearningSessionRegistrationsFromDisk() {
	lsLock.Lock()
	defer lsLock.Unlock()

	filePath := getLearningSessionsFilePath()
	data, err := os.ReadFile(filePath)
	if err != nil {
		lsRegistrations = []LearningSessionRegistration{}
		return
	}

	var list []LearningSessionRegistration
	if err := json.Unmarshal(data, &list); err != nil {
		lsRegistrations = []LearningSessionRegistration{}
		return
	}
	lsRegistrations = list
}

func saveLearningSessionRegistrationsLocked() {
	filePath := getLearningSessionsFilePath()
	bytes, err := json.MarshalIndent(lsRegistrations, "", "  ")
	if err == nil {
		_ = os.WriteFile(filePath, bytes, 0644)
	}
}

// InitLearningSessionsDB initializes DB tables and syncs existing registrations & classes
func InitLearningSessionsDB(pool *pgxpool.Pool) {
	if pool == nil {
		return
	}
	lsDBPool = pool

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	query := `
	CREATE TABLE IF NOT EXISTS learning_session_classes (
		id VARCHAR(64) PRIMARY KEY,
		slug VARCHAR(64) NOT NULL UNIQUE,
		class_number VARCHAR(32) NOT NULL,
		speaker_name VARCHAR(150) NOT NULL,
		title VARCHAR(255) NOT NULL,
		description TEXT NOT NULL,
		date_label VARCHAR(100) NOT NULL,
		time_label VARCHAR(100) NOT NULL,
		platform VARCHAR(100) NOT NULL,
		mode VARCHAR(100) NOT NULL,
		poster_url TEXT NOT NULL,
		accent_color VARCHAR(32) NOT NULL DEFAULT '#6456EB',
		discord_url TEXT NOT NULL,
		created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	);
	CREATE INDEX IF NOT EXISTS idx_ls_classes_slug ON learning_session_classes(slug);

	CREATE TABLE IF NOT EXISTS learning_session_registrations (
		id VARCHAR(64) PRIMARY KEY,
		user_id VARCHAR(64) NOT NULL,
		class_slug VARCHAR(64) NOT NULL,
		class_name VARCHAR(255) NOT NULL,
		speaker_name VARCHAR(150) NOT NULL,
		full_name VARCHAR(150) NOT NULL,
		email VARCHAR(255) NOT NULL,
		phone_wa VARCHAR(50) NOT NULL,
		university VARCHAR(150) NOT NULL,
		major VARCHAR(150) NOT NULL,
		created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
		CONSTRAINT uq_user_class UNIQUE (user_id, class_slug)
	);
	CREATE INDEX IF NOT EXISTS idx_ls_registrations_class ON learning_session_registrations(class_slug);
	CREATE INDEX IF NOT EXISTS idx_ls_registrations_user ON learning_session_registrations(user_id);
	`
	_, _ = pool.Exec(ctx, query)

	// Sync Classes from DB
	rowsClasses, errClasses := pool.Query(ctx, `
		SELECT id, slug, class_number, speaker_name, title, description, date_label, time_label, platform, mode, poster_url, accent_color, discord_url, created_at
		FROM learning_session_classes
		ORDER BY created_at ASC;
	`)
	if errClasses == nil {
		defer rowsClasses.Close()
		lsClassLock.Lock()
		var dbClasses []LearningSessionClass
		for rowsClasses.Next() {
			var c LearningSessionClass
			if err := rowsClasses.Scan(
				&c.ID, &c.Slug, &c.ClassNumber, &c.SpeakerName, &c.Title, &c.Description,
				&c.DateLabel, &c.TimeLabel, &c.Platform, &c.Mode, &c.PosterURL, &c.AccentColor, &c.DiscordURL, &c.CreatedAt,
			); err == nil {
				dbClasses = append(dbClasses, c)
			}
		}
		if len(dbClasses) > 0 {
			lsClasses = dbClasses
			saveLearningSessionClassesLocked()
		} else {
			// Seed default classes into DB if table is empty
			for _, defC := range defaultLearningClasses {
				_, _ = pool.Exec(ctx, `
					INSERT INTO learning_session_classes (
						id, slug, class_number, speaker_name, title, description, date_label, time_label, platform, mode, poster_url, accent_color, discord_url, created_at
					) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
					ON CONFLICT (slug) DO NOTHING;
				`, defC.ID, defC.Slug, defC.ClassNumber, defC.SpeakerName, defC.Title, defC.Description,
					defC.DateLabel, defC.TimeLabel, defC.Platform, defC.Mode, defC.PosterURL, defC.AccentColor, defC.DiscordURL, defC.CreatedAt)
			}
			lsClasses = append([]LearningSessionClass{}, defaultLearningClasses...)
			saveLearningSessionClassesLocked()
		}
		lsClassLock.Unlock()
	}

	// Read registrations rows from database into memory
	rows, err := pool.Query(ctx, `
		SELECT id, user_id, class_slug, class_name, speaker_name, full_name, email, phone_wa, university, major, created_at
		FROM learning_session_registrations
		ORDER BY created_at DESC;
	`)
	if err == nil {
		defer rows.Close()
		lsLock.Lock()
		defer lsLock.Unlock()

		dbMap := make(map[string]bool)
		for rows.Next() {
			var reg LearningSessionRegistration
			if err := rows.Scan(
				&reg.ID, &reg.UserID, &reg.ClassSlug, &reg.ClassName, &reg.SpeakerName,
				&reg.FullName, &reg.Email, &reg.PhoneWA, &reg.University, &reg.Major, &reg.CreatedAt,
			); err == nil {
				key := reg.UserID + ":" + reg.ClassSlug
				if !dbMap[key] {
					dbMap[key] = true
					found := false
					for i, existing := range lsRegistrations {
						if existing.UserID == reg.UserID && existing.ClassSlug == reg.ClassSlug {
							lsRegistrations[i] = reg
							found = true
							break
						}
					}
					if !found {
						lsRegistrations = append(lsRegistrations, reg)
					}
				}
			}
		}
		saveLearningSessionRegistrationsLocked()
	}
}

// ListLearningSessionClasses returns all active classes for members & admins
func ListLearningSessionClasses(w http.ResponseWriter, r *http.Request) {
	lsClassLock.RLock()
	defer lsClassLock.RUnlock()

	w.Header().Set("Content-Type", "application/json")
	if len(lsClasses) == 0 {
		_ = json.NewEncoder(w).Encode(defaultLearningClasses)
		return
	}
	_ = json.NewEncoder(w).Encode(lsClasses)
}

// CreateLearningSessionClass allows GOD_ADMIN and SUPER_ADMIN to add a new class
func CreateLearningSessionClass(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value(middleware.UserContextKey).(*middleware.UserClaims)
	if !ok || claims == nil {
		http.Error(w, `{"error":"Akses ditolak: Autentikasi diperlukan"}`, http.StatusUnauthorized)
		return
	}

	// Strictly restricted to GOD_ADMIN and SUPER_ADMIN
	if claims.Role != "GOD_ADMIN" && claims.Role != "SUPER_ADMIN" {
		http.Error(w, `{"error":"Akses ditolak: Hanya God Admin dan Super Admin yang berwenang menambahkan kelas"}`, http.StatusForbidden)
		return
	}

	type createClassReq struct {
		ClassNumber string `json:"class_number"`
		SpeakerName string `json:"speaker_name"`
		Title       string `json:"title"`
		Description string `json:"description"`
		DateLabel   string `json:"date_label"`
		TimeLabel   string `json:"time_label"`
		Platform    string `json:"platform"`
		Mode        string `json:"mode"`
		PosterURL   string `json:"poster_url"`
		AccentColor string `json:"accent_color"`
		DiscordURL  string `json:"discord_url"`
	}

	var req createClassReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"Format payload tidak valid"}`, http.StatusBadRequest)
		return
	}

	req.Title = strings.TrimSpace(html.EscapeString(req.Title))
	req.SpeakerName = strings.TrimSpace(html.EscapeString(req.SpeakerName))
	req.Description = strings.TrimSpace(html.EscapeString(req.Description))
	req.DateLabel = strings.TrimSpace(html.EscapeString(req.DateLabel))
	req.TimeLabel = strings.TrimSpace(html.EscapeString(req.TimeLabel))
	req.Platform = strings.TrimSpace(html.EscapeString(req.Platform))
	req.Mode = strings.TrimSpace(html.EscapeString(req.Mode))
	req.ClassNumber = strings.TrimSpace(html.EscapeString(req.ClassNumber))
	req.DiscordURL = strings.TrimSpace(req.DiscordURL)
	req.PosterURL = strings.TrimSpace(req.PosterURL)
	req.AccentColor = strings.TrimSpace(req.AccentColor)

	if req.Title == "" || req.SpeakerName == "" || req.DateLabel == "" || req.DiscordURL == "" {
		http.Error(w, `{"error":"Judul kelas, nama pembicara, tanggal pelaksanaan, dan tautan Discord wajib diisi"}`, http.StatusBadRequest)
		return
	}

	if req.ClassNumber == "" {
		lsClassLock.RLock()
		req.ClassNumber = fmt.Sprintf("CLASS %02d", len(lsClasses)+1)
		lsClassLock.RUnlock()
	}
	if req.Platform == "" {
		req.Platform = "Discord"
	}
	if req.Mode == "" {
		req.Mode = "Online Live Session"
	}
	if req.AccentColor == "" {
		req.AccentColor = "#6456EB"
	}

	// Generate slug from title
	re := regexp.MustCompile(`[^a-z0-9]+`)
	slugRaw := strings.ToLower(req.SpeakerName + " " + req.Title)
	slug := strings.Trim(re.ReplaceAllString(slugRaw, "-"), "-")
	if len(slug) > 40 {
		slug = slug[:40]
	}
	if slug == "" {
		slug = "class-" + uuid.New().String()[:6]
	}

	lsClassLock.Lock()
	// Ensure unique slug
	for _, c := range lsClasses {
		if c.Slug == slug {
			slug = fmt.Sprintf("%s-%s", slug, uuid.New().String()[:4])
			break
		}
	}

	newClass := LearningSessionClass{
		ID:          "class-" + uuid.New().String()[:8],
		Slug:        slug,
		ClassNumber: req.ClassNumber,
		SpeakerName: req.SpeakerName,
		Title:       req.Title,
		Description: req.Description,
		DateLabel:   req.DateLabel,
		TimeLabel:   req.TimeLabel,
		Platform:    req.Platform,
		Mode:        req.Mode,
		PosterURL:   req.PosterURL,
		AccentColor: req.AccentColor,
		DiscordURL:  req.DiscordURL,
		CreatedAt:   time.Now(),
	}

	lsClasses = append(lsClasses, newClass)
	saveLearningSessionClassesLocked()
	lsClassLock.Unlock()

	// Async save to PostgreSQL
	if lsDBPool != nil {
		go func(item LearningSessionClass) {
			ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
			defer cancel()
			_, _ = lsDBPool.Exec(ctx, `
				INSERT INTO learning_session_classes (
					id, slug, class_number, speaker_name, title, description, date_label, time_label, platform, mode, poster_url, accent_color, discord_url, created_at
				) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
				ON CONFLICT (slug) DO UPDATE SET
					class_number = EXCLUDED.class_number,
					speaker_name = EXCLUDED.speaker_name,
					title = EXCLUDED.title,
					description = EXCLUDED.description,
					date_label = EXCLUDED.date_label,
					time_label = EXCLUDED.time_label,
					platform = EXCLUDED.platform,
					mode = EXCLUDED.mode,
					poster_url = EXCLUDED.poster_url,
					accent_color = EXCLUDED.accent_color,
					discord_url = EXCLUDED.discord_url;
			`, item.ID, item.Slug, item.ClassNumber, item.SpeakerName, item.Title, item.Description,
				item.DateLabel, item.TimeLabel, item.Platform, item.Mode, item.PosterURL, item.AccentColor, item.DiscordURL, item.CreatedAt)
		}(newClass)
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Kelas baru berhasil ditambahkan",
		"class":   newClass,
	})
}

// DeleteLearningSessionClass allows GOD_ADMIN and SUPER_ADMIN to remove a class
func DeleteLearningSessionClass(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value(middleware.UserContextKey).(*middleware.UserClaims)
	if !ok || claims == nil {
		http.Error(w, `{"error":"Akses ditolak: Autentikasi diperlukan"}`, http.StatusUnauthorized)
		return
	}

	if claims.Role != "GOD_ADMIN" && claims.Role != "SUPER_ADMIN" {
		http.Error(w, `{"error":"Akses ditolak: Hanya God Admin dan Super Admin yang berwenang menghapus kelas"}`, http.StatusForbidden)
		return
	}

	classID := chi.URLParam(r, "id")
	if classID == "" {
		http.Error(w, `{"error":"ID kelas wajib diisi"}`, http.StatusBadRequest)
		return
	}

	lsClassLock.Lock()
	found := false
	var updatedClasses []LearningSessionClass
	for _, c := range lsClasses {
		if c.ID == classID {
			found = true
			continue
		}
		updatedClasses = append(updatedClasses, c)
	}
	if !found {
		lsClassLock.Unlock()
		http.Error(w, `{"error":"Kelas tidak ditemukan"}`, http.StatusNotFound)
		return
	}
	lsClasses = updatedClasses
	saveLearningSessionClassesLocked()
	lsClassLock.Unlock()

	// Async delete from PostgreSQL
	if lsDBPool != nil {
		go func(id string) {
			ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
			defer cancel()
			_, _ = lsDBPool.Exec(ctx, `DELETE FROM learning_session_classes WHERE id = $1;`, id)
		}(classID)
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]string{
		"message": "Kelas berhasil dihapus",
	})
}

// RegisterLearningSession handles participant sign up for a specific class
func RegisterLearningSession(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value(middleware.UserContextKey).(*middleware.UserClaims)
	if !ok || claims == nil {
		http.Error(w, `{"error":"Akses ditolak: Anda harus login untuk mendaftar kelas"}`, http.StatusUnauthorized)
		return
	}

	type reqBody struct {
		ClassSlug  string `json:"class_slug"`
		FullName   string `json:"full_name"`
		Email      string `json:"email"`
		PhoneWA    string `json:"phone_wa"`
		University string `json:"university"`
		Major      string `json:"major"`
	}

	var req reqBody
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"Payload permintaan tidak valid"}`, http.StatusBadRequest)
		return
	}

	req.ClassSlug = strings.TrimSpace(req.ClassSlug)
	var className, speakerName string

	// 1. Check in dynamic classes
	lsClassLock.RLock()
	for _, c := range lsClasses {
		if c.Slug == req.ClassSlug {
			className = c.Title
			speakerName = c.SpeakerName
			break
		}
	}
	lsClassLock.RUnlock()

	// 2. Fallback check default classes
	if className == "" {
		for _, defC := range defaultLearningClasses {
			if defC.Slug == req.ClassSlug {
				className = defC.Title
				speakerName = defC.SpeakerName
				break
			}
		}
	}

	if className == "" {
		http.Error(w, `{"error":"Kelas tidak valid. Pilih kelas yang tersedia."}`, http.StatusBadRequest)
		return
	}

	req.FullName = strings.TrimSpace(html.EscapeString(req.FullName))
	req.Email = strings.TrimSpace(html.EscapeString(req.Email))
	req.PhoneWA = strings.TrimSpace(html.EscapeString(req.PhoneWA))
	req.University = strings.TrimSpace(html.EscapeString(req.University))
	req.Major = strings.TrimSpace(html.EscapeString(req.Major))

	if req.FullName == "" || req.Email == "" || req.PhoneWA == "" || req.University == "" || req.Major == "" {
		http.Error(w, `{"error":"Semua bidang isian formulir pendaftaran wajib diisi lengkap"}`, http.StatusBadRequest)
		return
	}

	lsLock.Lock()
	// Check duplicate registration
	for _, reg := range lsRegistrations {
		if reg.UserID == claims.UserID && reg.ClassSlug == req.ClassSlug {
			lsLock.Unlock()
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusConflict)
			_ = json.NewEncoder(w).Encode(map[string]interface{}{
				"error":         "Anda sudah terdaftar dalam kelas ini. Pendaftaran ganda tidak diizinkan.",
				"status":        "conflict",
				"is_registered": true,
			})
			return
		}
	}

	newReg := LearningSessionRegistration{
		ID:          "ls-" + uuid.New().String()[:8],
		UserID:      claims.UserID,
		ClassSlug:   req.ClassSlug,
		ClassName:   className,
		SpeakerName: speakerName,
		FullName:    req.FullName,
		Email:       req.Email,
		PhoneWA:     req.PhoneWA,
		University:  req.University,
		Major:       req.Major,
		CreatedAt:   time.Now(),
	}

	lsRegistrations = append(lsRegistrations, newReg)
	saveLearningSessionRegistrationsLocked()
	lsLock.Unlock()

	// Async save to PostgreSQL
	if lsDBPool != nil {
		go func(item LearningSessionRegistration) {
			ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
			defer cancel()
			_, _ = lsDBPool.Exec(ctx, `
				INSERT INTO learning_session_registrations (
					id, user_id, class_slug, class_name, speaker_name, full_name, email, phone_wa, university, major, created_at
				) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
				ON CONFLICT (user_id, class_slug) DO NOTHING;
			`, item.ID, item.UserID, item.ClassSlug, item.ClassName, item.SpeakerName,
				item.FullName, item.Email, item.PhoneWA, item.University, item.Major, item.CreatedAt)
		}(newReg)
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"message":      "Pendaftaran berhasil! Silakan simpan jadwal dan akses link Discord kelas.",
		"registration": newReg,
	})
}

// GetMyLearningSessionRegistrations returns all registered class slugs for the current member
func GetMyLearningSessionRegistrations(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value(middleware.UserContextKey).(*middleware.UserClaims)
	if !ok || claims == nil {
		http.Error(w, `{"error":"Akses ditolak: Autentikasi diperlukan"}`, http.StatusUnauthorized)
		return
	}

	lsLock.RLock()
	defer lsLock.RUnlock()

	var myClasses []string
	var myRegs []LearningSessionRegistration

	for _, reg := range lsRegistrations {
		if reg.UserID == claims.UserID {
			myClasses = append(myClasses, reg.ClassSlug)
			myRegs = append(myRegs, reg)
		}
	}

	if myClasses == nil {
		myClasses = []string{}
	}
	if myRegs == nil {
		myRegs = []LearningSessionRegistration{}
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"registered_slugs": myClasses,
		"registrations":   myRegs,
	})
}

// ListLearningSessionRegistrations allows ONLY God Admin and Super Admin to view and export participant lists
func ListLearningSessionRegistrations(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value(middleware.UserContextKey).(*middleware.UserClaims)
	if !ok || claims == nil {
		http.Error(w, `{"error":"Akses ditolak: Autentikasi diperlukan"}`, http.StatusUnauthorized)
		return
	}

	// Strictly restricted to GOD_ADMIN and SUPER_ADMIN
	if claims.Role != "GOD_ADMIN" && claims.Role != "SUPER_ADMIN" {
		http.Error(w, `{"error":"Akses ditolak: Hanya God Admin dan Super Admin NCD yang berwenang melihat data pendaftaran"}`, http.StatusForbidden)
		return
	}

	filterClass := strings.TrimSpace(r.URL.Query().Get("class"))

	lsLock.RLock()
	defer lsLock.RUnlock()

	fawwazCount := 0
	fauzanCount := 0
	var filtered []LearningSessionRegistration

	for _, reg := range lsRegistrations {
		if reg.ClassSlug == "fawwaz-webdev" {
			fawwazCount++
		} else if reg.ClassSlug == "fauzan-team101" {
			fauzanCount++
		}

		if filterClass == "" || filterClass == "ALL" || reg.ClassSlug == filterClass {
			filtered = append(filtered, reg)
		}
	}

	if filtered == nil {
		filtered = []LearningSessionRegistration{}
	}

	stats := LearningSessionStats{
		TotalCount:   len(lsRegistrations),
		FawwazCount:  fawwazCount,
		FauzanCount:  fauzanCount,
		Participants: filtered,
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(stats)
}
