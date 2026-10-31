package handler

import (
	"encoding/json"
	"net/http"
	"sort"
	"strings"

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
	if Repo != nil {
		rows, err := Repo.ListPublicMembers(r.Context())
		if err == nil && len(rows) > 0 {
			members := make([]MemberDTO, 0, len(rows))
			for _, m := range rows {
				dto := MemberDTO{
					ID:            uuid.UUID(m.ID.Bytes).String(),
					FullName:      m.FullName,
					Nickname:      m.Nickname.String,
					AvatarURL:     m.AvatarUrl.String,
					PositionTitle: m.PositionTitle.String,
					PositionLevel: int(m.PositionLevel.Int32),
					Division:      m.Division.String,
					Generation:    m.Generation,
					Major:         m.Major.String,
					University:    m.University.String,
					Skills:        m.Skills,
					Bio:           m.Bio.String,
					LinkedInURL:   m.LinkedinUrl.String,
					GitHubURL:     m.GithubUrl.String,
					IsLeader:      m.PositionLevel.Int32 <= 2,
				}
				if strings.EqualFold(m.FullName, "Rianszzz") || strings.EqualFold(m.Nickname.String, "Rian") {
					dto.PositionTitle = "Solo Dev"
					dto.Bio = ""
					dto.Skills = []string{}
				}
				members = append(members, dto)
			}
			sort.SliceStable(members, func(i, j int) bool {
				if strings.EqualFold(members[i].FullName, "Rianszzz") {
					return false
				}
				if strings.EqualFold(members[j].FullName, "Rianszzz") {
					return true
				}
				return false
			})
			w.Header().Set("Content-Type", "application/json")
			_ = json.NewEncoder(w).Encode(members)
			return
		}
	}

	members := []MemberDTO{
		{
			ID:            "m-2",
			FullName:      "Mirza Danisywar Noor Wahyu",
			Nickname:      "Mirza",
			AvatarURL:     "",
			PositionTitle: "Chairman",
			PositionLevel: 1,
			Division:      "Executive Committee",
			Generation:    "Angkatan 2025",
			Major:         "Informatika",
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
			AvatarURL:     "",
			PositionTitle: "Vice Chairman I",
			PositionLevel: 1,
			Division:      "Product & Operations",
			Generation:    "Angkatan 2025",
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
			AvatarURL:     "",
			PositionTitle: "Vice Chairman II",
			PositionLevel: 1,
			Division:      "Content & Projects",
			Generation:    "Angkatan 2025",
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
			AvatarURL:     "",
			PositionTitle: "Sekretaris I",
			PositionLevel: 2,
			Division:      "Administration & Records",
			Generation:    "Angkatan 2025",
			Major:         "Informatika",
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
			AvatarURL:     "",
			PositionTitle: "Sekretaris II",
			PositionLevel: 2,
			Division:      "Administration & Correspondence",
			Generation:    "Angkatan 2025",
			Major:         "Informatika",
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
			AvatarURL:     "",
			PositionTitle: "Bendahara I",
			PositionLevel: 2,
			Division:      "Treasury & Kas Maker",
			Generation:    "Angkatan 2025",
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
			AvatarURL:     "",
			PositionTitle: "Bendahara II",
			PositionLevel: 2,
			Division:      "Audit & Kas Checker",
			Generation:    "Angkatan 2025",
			Major:         "Informatika",
			University:    "Universitas Gunadarma",
			Skills:        []string{"Financial Audit", "Reconciliation", "Verification Guard"},
			Bio:           "Checker mutasi kas: verifikator bukti transfer, nota belanja, dan pengesah saldo resmi.",
			LinkedInURL:   "https://linkedin.com",
			GitHubURL:     "https://github.com",
			IsLeader:      true,
		},
		{
			ID:            "m-1",
			FullName:      "Rianszzz",
			Nickname:      "Rian",
			AvatarURL:     "",
			PositionTitle: "Solo Dev",
			PositionLevel: 1,
			Division:      "Engineering & Infrastructure",
			Generation:    "Angkatan 20--",
			Major:         "Anonymous",
			University:    "Universitas Gunadarma",
			Skills:        []string{},
			Bio:           "",
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
			Thumbnail:  "",
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
			Thumbnail:  "",
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
			Thumbnail:  "",
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
