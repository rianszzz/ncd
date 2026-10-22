package handler

import (
	"encoding/json"
	"net/http"
	"sync"
	"time"

	"github.com/google/uuid"
)

type MemberDTO struct {
	ID            string   `json:"id"`
	FullName      string   `json:"full_name"`
	Nickname      string   `json:"nickname"`
	AvatarURL     string   `json:"avatar_url"`
	PositionTitle string   `json:"position_title"`
	PositionLevel int      `json:"position_level"`
	Division      string   `json:"division"`
	Generation    string   `json:"generation"`
	Major         string   `json:"major"`
	University    string   `json:"university"`
	Skills        []string `json:"skills"`
	Bio           string   `json:"bio"`
	LinkedInURL   string   `json:"linkedin_url"`
	GitHubURL     string   `json:"github_url"`
	IsLeader      bool     `json:"is_leader"`
}

type ProjectDTO struct {
	ID          string   `json:"id"`
	Title       string   `json:"title"`
	Slug        string   `json:"slug"`
	Summary     string   `json:"summary"`
	TechStack   []string `json:"tech_stack"`
	Status      string   `json:"status"`
	Progress    int      `json:"progress"`
	Thumbnail   string   `json:"thumbnail_url"`
	RepoURL     string   `json:"repo_url"`
	DemoURL     string   `json:"demo_url"`
	TeamLeader  string   `json:"team_leader"`
}

type HistoryDTO struct {
	ID          string `json:"id"`
	Year        int    `json:"year"`
	Month       string `json:"month"`
	Title       string `json:"title"`
	Description string `json:"description"`
}

type ApplicationRequest struct {
	FullName    string `json:"full_name"`
	Email       string `json:"email"`
	PhoneWA     string `json:"phone_whatsapp"`
	University  string `json:"university"`
	Major       string `json:"major"`
	Generation  string `json:"generation"`
	Interest    string `json:"skills_interest"`
	Motivation  string `json:"motivation"`
	Portfolio   string `json:"portfolio_links"`
}

var (
	appsLock     sync.Mutex
	applications = make([]ApplicationRequest, 0)
)

func GetPublicStats(w http.ResponseWriter, r *http.Request) {
	stats := map[string]interface{}{
		"total_members":      35,
		"core_leaders":      8,
		"active_projects":   5,
		"competitions_won":  8,
		"established_year":  2024,
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(stats)
}

func GetPublicMembers(w http.ResponseWriter, r *http.Request) {
	members := []MemberDTO{
		{
			ID:            "m-1",
			FullName:      "Rianszzz",
			Nickname:      "Rian",
			AvatarURL:     "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
			PositionTitle: "Developer Lead",
			PositionLevel: 1,
			Division:      "Engineering & Infrastructure",
			Generation:    "Angkatan 2023",
			Major:         "Informatika",
			University:    "Universitas Gunadarma",
			Skills:        []string{"Go", "React", "PostgreSQL", "Docker", "Next.js"},
			Bio:           "Arsitek sistem NCD dan pengembang ekosistem teknologi komunitas.",
			LinkedInURL:   "https://linkedin.com",
			GitHubURL:     "https://github.com",
			IsLeader:      true,
		},
		{
			ID:            "m-2",
			FullName:      "Mirza Danisywar Noor Wahyu",
			Nickname:      "Mirza",
			AvatarURL:     "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
			PositionTitle: "Chairman",
			PositionLevel: 1,
			Division:      "Executive Committee",
			Generation:    "Angkatan 2023",
			Major:         "Sistem Informasi",
			University:    "Universitas Gunadarma",
			Skills:        []string{"Strategic Leadership", "Product Management", "Community Growth"},
			Bio:           "Pemimpin umum NCD dalam ekspansi talenta dan kemitraan eksternal.",
			LinkedInURL:   "https://linkedin.com",
			GitHubURL:     "https://github.com",
			IsLeader:      true,
		},
		{
			ID:            "m-3",
			FullName:      "Muhamad Fauzan Al Farikhi",
			Nickname:      "Fauzan",
			AvatarURL:     "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
			PositionTitle: "Vice Chairman I",
			PositionLevel: 1,
			Division:      "Product & Operations",
			Generation:    "Angkatan 2023",
			Major:         "Informatika",
			University:    "Universitas Gunadarma",
			Skills:        []string{"Product Owner", "Agile Management", "System Analysis"},
			Bio:           "Product Owner Website NCD dan koordinator strategi operasional komunitas.",
			LinkedInURL:   "https://linkedin.com",
			GitHubURL:     "https://github.com",
			IsLeader:      true,
		},
		{
			ID:            "m-4",
			FullName:      "Rayyan Fathan Addani",
			Nickname:      "Rayyan",
			AvatarURL:     "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&auto=format&fit=crop&q=80",
			PositionTitle: "Vice Chairman II",
			PositionLevel: 1,
			Division:      "Content & Projects",
			Generation:    "Angkatan 2023",
			Major:         "Informatika",
			University:    "Universitas Gunadarma",
			Skills:        []string{"Project Delivery", "UI/UX Review", "Tech Strategy"},
			Bio:           "Penanggung jawab kurasi proyek teknologi internal dan eksternal.",
			LinkedInURL:   "https://linkedin.com",
			GitHubURL:     "https://github.com",
			IsLeader:      true,
		},
		{
			ID:            "m-5",
			FullName:      "Annisa Saskia",
			Nickname:      "Annisa",
			AvatarURL:     "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80",
			PositionTitle: "Sekretaris I",
			PositionLevel: 2,
			Division:      "Administration & Records",
			Generation:    "Angkatan 2024",
			Major:         "Sistem Informasi",
			University:    "Universitas Gunadarma",
			Skills:        []string{"Documentation", "Content Writing", "Regulation & Governance"},
			Bio:           "Pengelola arsip hukum AD/ART, notulen rapat, dan warta resmi NCD.",
			LinkedInURL:   "https://linkedin.com",
			GitHubURL:     "https://github.com",
			IsLeader:      true,
		},
		{
			ID:            "m-6",
			FullName:      "Putri Aura Wening",
			Nickname:      "Putri",
			AvatarURL:     "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80",
			PositionTitle: "Sekretaris II",
			PositionLevel: 2,
			Division:      "Administration & Correspondence",
			Generation:    "Angkatan 2024",
			Major:         "Sistem Informasi",
			University:    "Universitas Gunadarma",
			Skills:        []string{"Public Relations", "Archiving", "Editorial Review"},
			Bio:           "Koordinator korespondensi rekrutmen dan penerbitan berkas organisasi.",
			LinkedInURL:   "https://linkedin.com",
			GitHubURL:     "https://github.com",
			IsLeader:      true,
		},
		{
			ID:            "m-7",
			FullName:      "Muhammad Iqbal Fajri",
			Nickname:      "Iqbal",
			AvatarURL:     "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80",
			PositionTitle: "Bendahara I",
			PositionLevel: 2,
			Division:      "Treasury & Kas Maker",
			Generation:    "Angkatan 2024",
			Major:         "Informatika",
			University:    "Universitas Gunadarma",
			Skills:        []string{"Financial Planning", "Budgeting", "Cash Flow Logging"},
			Bio:           "Maker mutasi kas: pencatat seluruh arus kas masuk, pengeluaran, dan bukti nota.",
			LinkedInURL:   "https://linkedin.com",
			GitHubURL:     "https://github.com",
			IsLeader:      true,
		},
		{
			ID:            "m-8",
			FullName:      "Sri Gunarti Wijiastuti",
			Nickname:      "Sri",
			AvatarURL:     "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80",
			PositionTitle: "Bendahara II",
			PositionLevel: 2,
			Division:      "Audit & Kas Checker",
			Generation:    "Angkatan 2024",
			Major:         "Sistem Informasi",
			University:    "Universitas Gunadarma",
			Skills:        []string{"Financial Audit", "Reconciliation", "Verification Guard"},
			Bio:           "Checker mutasi kas: verifikator bukti transfer, nota belanja, dan pengesah saldo resmi.",
			LinkedInURL:   "https://linkedin.com",
			GitHubURL:     "https://github.com",
			IsLeader:      true,
		},
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(members)
}

func GetPublicProjects(w http.ResponseWriter, r *http.Request) {
	projects := []ProjectDTO{
		{
			ID:         "p-1",
			Title:      "NCD Integrated Platform",
			Slug:       "ncd-integrated-platform",
			Summary:    "Platform resmi NCD dengan arsitektur Decoupled Go + React dan transparansi kas Maker-Checker.",
			TechStack:  []string{"Go", "React 19", "PostgreSQL", "Tailwind CSS", "Chi"},
			Status:     "ACTIVE",
			Progress:   85,
			Thumbnail:  "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80",
			RepoURL:    "https://github.com/ncd/ncd-platform",
			DemoURL:    "https://ncd.nexatechlabs.my.id",
			TeamLeader: "Rianszzz",
		},
		{
			ID:         "p-2",
			Title:      "NEXA Smart Attendance",
			Slug:       "nexa-smart-attendance",
			Summary:    "Sistem presensi kegiatan berbasis QR dinamis dengan enkripsi timestamp dan validasi geolokasi.",
			TechStack:  []string{"Go", "WebRTC", "Postgres", "Redis"},
			Status:     "ACTIVE",
			Progress:   60,
			Thumbnail:  "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80",
			RepoURL:    "https://github.com/ncd/smart-attendance",
			DemoURL:    "",
			TeamLeader: "Rayyan Fathan Addani",
		},
		{
			ID:         "p-3",
			Title:      "Community Competitive Programming Hub",
			Slug:       "competitive-programming-hub",
			Summary:    "Pelacak jadwal lomba hackathon dan latihan algoritma intensif untuk delegasi kompetisi.",
			TechStack:  []string{"React", "TypeScript", "Python", "FastAPI"},
			Status:     "COMPLETED",
			Progress:   100,
			Thumbnail:  "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80",
			RepoURL:    "https://github.com/ncd/cp-hub",
			DemoURL:    "https://cp.nexatechlabs.my.id",
			TeamLeader: "Muhamad Fauzan Al Farikhi",
		},
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(projects)
}

func GetPublicHistory(w http.ResponseWriter, r *http.Request) {
	history := []HistoryDTO{
		{
			ID:          "h-1",
			Year:        2024,
			Month:       "Februari",
			Title:       "Inisiasi Pendirian NCD",
			Description: "Dibentuk di bawah naungan NEXA Tech Labs oleh mahasiswa teknologi yang berfokus pada rekayasa perangkat lunak mandiri dan riset aplikatif.",
		},
		{
			ID:          "h-2",
			Year:        2024,
			Month:       "Agustus",
			Title:       "Ekspansi 35 Anggota & Struktur Pengurus",
			Description: "Pembentukan divisi resmi: Engineering, Product, Administration, dan Keuangan dengan 8 pengurus inti.",
		},
		{
			ID:          "h-3",
			Year:        2024,
			Month:       "November",
			Title:       "Penyusunan AD/ART & Standar Transparansi Kas",
			Description: "Penetapan prinsip Maker-Checker dalam pengelolaan kas komunitas untuk menjamin akuntabilitas 100% terbuka.",
		},
		{
			ID:          "h-4",
			Year:        2026,
			Month:       "Oktober",
			Title:       "Peluncuran Platform V1 Terpadu",
			Description: "Rilis platform Satu Platform Dua Wajah untuk etalase publik dan workspace kolaborasi anggota.",
		},
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(history)
}

func SubmitApplication(w http.ResponseWriter, r *http.Request) {
	var req ApplicationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.FullName == "" || req.Email == "" || req.PhoneWA == "" {
		http.Error(w, "Nama, email, dan WhatsApp wajib diisi", http.StatusBadRequest)
		return
	}

	appsLock.Lock()
	applications = append(applications, req)
	appsLock.Unlock()

	resp := map[string]interface{}{
		"status":     "success",
		"message":    "Formulir pendaftaran berhasil terkirim. Tim Sekretaris NCD akan meninjau berkas Anda.",
		"request_id": uuid.New().String(),
		"timestamp":  time.Now(),
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(resp)
}
