package handler

import (
	"encoding/json"
	"net/http"
	"strings"
)

// AchievementDTO represents an achievement / trophy earned by NCD teams.
type AchievementDTO struct {
	ID             string   `json:"id"`
	Title          string   `json:"title"`
	EventName      string   `json:"event_name"`
	Competition    string   `json:"competition"`
	Organizer      string   `json:"organizer"`
	Tier           string   `json:"tier"` // "Internasional", "Nasional", "Regional / Kampus"
	Rank           string   `json:"rank"`
	Category       string   `json:"category"`
	Year           int      `json:"year"`
	Date           string   `json:"date"`
	AwardDate      string   `json:"award_date"`
	TeamName       string   `json:"team_name"`
	Members        []string `json:"members"`
	TeamMembers    []string `json:"team_members"`
	ProjectTitle   string   `json:"project_title,omitempty"`
	Description    string   `json:"description"`
	CertificateURL string   `json:"certificate_url,omitempty"`
}

// CompetitionDTO represents an upcoming or current competition tracked by NCD.
type CompetitionDTO struct {
	ID                   string `json:"id"`
	Name                 string `json:"name"`
	Organizer            string `json:"organizer"`
	Tier                 string `json:"tier"` // "Internasional", "Nasional", "Regional / Kampus"
	Category             string `json:"category"`
	RegistrationDeadline string `json:"registration_deadline"`
	EventDate            string `json:"event_date"`
	Status               string `json:"status"` // "Open Registration", "Upcoming", "In Progress", "Completed"
	Description          string `json:"description"`
	URL                  string `json:"url,omitempty"`
}

// GetPublicAchievements returns the hall of fame achievements list with realistic NCD records.
func GetPublicAchievements(w http.ResponseWriter, r *http.Request) {
	achievements := []AchievementDTO{
		{
			ID:             "ach-1",
			Title:          "Juara 1 Divisi Piranti Lunak (Software Engineering)",
			EventName:      "GEMASTIK XVII 2024",
			Competition:    "GEMASTIK XVII 2024 (Puspresnas Kemendikbudristek)",
			Organizer:      "Pusat Prestasi Nasional (Puspresnas) & Kemendikbudristek",
			Tier:           "Nasional",
			Rank:           "Juara 1 (Medali Emas)",
			Category:       "Software Engineering",
			Year:           2024,
			Date:           "September 2024",
			AwardDate:      "September 2024",
			TeamName:       "NCD Alpha Core",
			Members:        []string{"Mirza Danisywar Noor Wahyu", "Muhamad Fauzan Al Farikhi", "Rianszzz"},
			TeamMembers:    []string{"Mirza Danisywar Noor Wahyu", "Muhamad Fauzan Al Farikhi", "Rianszzz"},
			ProjectTitle:   "OpenKas: Realtime Public Ledger & Transparent Financial Stack",
			Description:    "Merancang sistem pembukuan kas berbasis transparansi tinggi dengan arsitektur dual maker-checker audit trail dan verifikasi kriptografis.",
			CertificateURL: "https://gemastik.kemdikbud.go.id",
		},
		{
			ID:             "ach-2",
			Title:          "1st Runner Up (Juara 2) & Best Defensive Strategy",
			EventName:      "ASEAN Cyber Shield Hackathon 2024",
			Competition:    "ASEAN Cyber Shield 2024",
			Organizer:      "ASEAN Cyber University & KISA",
			Tier:           "Internasional",
			Rank:           "Juara 2 (1st Runner Up)",
			Category:       "Cybersecurity & Defense",
			Year:           2024,
			Date:           "Agustus 2024",
			AwardDate:      "Agustus 2024",
			TeamName:       "NCD Redacted",
			Members:        []string{"Rianszzz", "Rafly Syahputra", "Mirza Danisywar Noor Wahyu"},
			TeamMembers:    []string{"Rianszzz", "Rafly Syahputra", "Mirza Danisywar Noor Wahyu"},
			ProjectTitle:   "Defensive API Mesh & Runtime Memory Sanitization",
			Description:    "Menuntaskan simulasi serangan siber regional dan merancang mitigasi exploit memory-corruption pada arsitektur cloud native terdistribusi.",
			CertificateURL: "https://aseancybershield.org",
		},
		{
			ID:             "ach-3",
			Title:          "Top 5 Finalist & Best Technical Innovation",
			EventName:      "Hacktiv Open Hackathon Indonesia 2024",
			Competition:    "Hacktiv Open Hackathon Indonesia 2024",
			Organizer:      "Hacktiv8 & Google Cloud Developer Community",
			Tier:           "Nasional",
			Rank:           "Top 5 Finalist",
			Category:       "Cloud & Distributed Systems",
			Year:           2024,
			Date:           "November 2024",
			AwardDate:      "November 2024",
			TeamName:       "NCD CloudForge",
			Members:        []string{"Rayyan Fathan Addani", "Rafly Syahputra", "Nabil Athallah"},
			TeamMembers:    []string{"Rayyan Fathan Addani", "Rafly Syahputra", "Nabil Athallah"},
			ProjectTitle:   "EdgeSentinel: Low-latency Anomaly Detection on Edge K8s",
			Description:    "Platform monitoring anomali lalu lintas jaringan zero-trust hemat konsumsi daya untuk klaster micro-datacenter.",
			CertificateURL: "https://hacktiv8.com",
		},
		{
			ID:             "ach-4",
			Title:          "Best Open Source Innovation Award",
			EventName:      "Southeast Asia Open Source Challenge (SEA-OSC) 2024",
			Competition:    "SEA Open Source Challenge 2024",
			Organizer:      "Open Source Initiative (OSI) Southeast Asia",
			Tier:           "Internasional",
			Rank:           "Best Open Source Innovation",
			Category:       "Open Source Engineering",
			Year:           2024,
			Date:           "Oktober 2024",
			AwardDate:      "Oktober 2024",
			TeamName:       "NCD OSS Guild",
			Members:        []string{"Muhamad Fauzan Al Farikhi", "Rayyan Fathan Addani", "Aurel Maharani"},
			TeamMembers:    []string{"Muhamad Fauzan Al Farikhi", "Rayyan Fathan Addani", "Aurel Maharani"},
			ProjectTitle:   "NCD Chi Core: Ultra-Lightweight Microservices Boilerplate",
			Description:    "Kerangka kerja arsitektur modular Go dengan jejak memori di bawah 12MB dan integrasi pengujian end-to-end otomatis.",
			CertificateURL: "https://sea-osc.org",
		},
		{
			ID:             "ach-5",
			Title:          "Juara 1 UI/UX Design & Frontend Engineering",
			EventName:      "National Techfest & Competition (COMPFEST 16) 2024",
			Competition:    "COMPFEST 16 Universitas Indonesia",
			Organizer:      "Fasilkom Universitas Indonesia",
			Tier:           "Nasional",
			Rank:           "Juara 1 (Gold Winner)",
			Category:       "UI/UX & Frontend",
			Year:           2024,
			Date:           "Mei 2024",
			AwardDate:      "Mei 2024",
			TeamName:       "NCD PixelCraft",
			Members:        []string{"Mirza Danisywar Noor Wahyu", "Aurel Maharani", "Nadya Eka Putri"},
			TeamMembers:    []string{"Mirza Danisywar Noor Wahyu", "Aurel Maharani", "Nadya Eka Putri"},
			ProjectTitle:   "GovFlow: Portal Administrasi Terpadu Layanan Publik",
			Description:    "Desain sistem UI/UX dengan pemenuhan standar aksesibilitas WCAG 2.1 AAA serta implementasi interaksi visual fluid.",
			CertificateURL: "https://compfest.id",
		},
		{
			ID:             "ach-6",
			Title:          "Juara 1 Capture The Flag (CTF) Jabodetabek",
			EventName:      "Jabodetabek Inter-Campus Cyber Challenge 2024",
			Competition:    "Jabodetabek Inter-Campus CTF Invitational",
			Organizer:      "BSSN & Ikatan Mahasiswa Komputer Jabodetabek",
			Tier:           "Regional / Kampus",
			Rank:           "Juara 1 (Champion)",
			Category:       "Cybersecurity & CTF",
			Year:           2024,
			Date:           "Maret 2024",
			AwardDate:      "Maret 2024",
			TeamName:       "NCD CyberPwn",
			Members:        []string{"Rafly Syahputra", "Rianszzz"},
			TeamMembers:    []string{"Rafly Syahputra", "Rianszzz"},
			ProjectTitle:   "Binary Exploitation & Cryptography Solving Toolset",
			Description:    "Mendominasi perolehan poin sempurna pada kategori Reverse Engineering, Web Exploitation, dan Memory Forensics.",
			CertificateURL: "https://gunadarma.ac.id",
		},
		{
			ID:             "ach-7",
			Title:          "Juara 2 Tech Pitching & Business Case Competition",
			EventName:      "UG Techno Venture Fair 2024",
			Competition:    "UG Techno Venture Fair 2024",
			Organizer:      "Universitas Gunadarma Business Incubator",
			Tier:           "Regional / Kampus",
			Rank:           "Juara 2 (Silver Award)",
			Category:       "Tech Product & Business",
			Year:           2024,
			Date:           "Februari 2024",
			AwardDate:      "Februari 2024",
			TeamName:       "NCD Ventures",
			Members:        []string{"Muhamad Fauzan Al Farikhi", "Nadya Eka Putri", "Rayyan Fathan Addani"},
			TeamMembers:    []string{"Muhamad Fauzan Al Farikhi", "Nadya Eka Putri", "Rayyan Fathan Addani"},
			ProjectTitle:   "CampusSync: Integrated Student Organization ERP",
			Description:    "Validasi kelayakan produk dan purwarupa sistem tata kelola administrasi organisasi kemahasiswaan berbasis cloud multi-tenant.",
			CertificateURL: "https://gunadarma.ac.id",
		},
		{
			ID:             "ach-8",
			Title:          "Top 10 Global Finalist - Open Source AI Track",
			EventName:      "Global Open Innovation Challenge 2024",
			Competition:    "Global Open Innovation Challenge 2024",
			Organizer:      "Linux Foundation & CNCF Community",
			Tier:           "Internasional",
			Rank:           "Top 10 Global Finalist",
			Category:       "AI & Cloud Native",
			Year:           2024,
			Date:           "Desember 2024",
			AwardDate:      "Desember 2024",
			TeamName:       "NCD NeuroSys",
			Members:        []string{"Rianszzz", "Mirza Danisywar Noor Wahyu", "Rafly Syahputra"},
			TeamMembers:    []string{"Rianszzz", "Mirza Danisywar Noor Wahyu", "Rafly Syahputra"},
			ProjectTitle:   "KubeLlama: Lightweight Distributed SLM Runner",
			Description:    "Solusi orkestrasi inferensi small language model hemat biaya dengan auto-scaling berbasis beban permintaan real-time.",
			CertificateURL: "https://linuxfoundation.org",
		},
	}

	tierFilter := strings.TrimSpace(r.URL.Query().Get("tier"))
	if tierFilter != "" && !strings.EqualFold(tierFilter, "all") {
		filtered := make([]AchievementDTO, 0)
		for _, ach := range achievements {
			if strings.EqualFold(ach.Tier, tierFilter) {
				filtered = append(filtered, ach)
			}
		}
		achievements = filtered
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(achievements)
}

// GetPublicCompetitions returns active, upcoming, or tracked competitions.
func GetPublicCompetitions(w http.ResponseWriter, r *http.Request) {
	competitions := []CompetitionDTO{
		{
			ID:                   "comp-1",
			Name:                 "GEMASTIK XVIII 2025",
			Organizer:            "Balai Pengembangan Talenta Indonesia (BPTI) & Puspresnas",
			Tier:                 "Nasional",
			Category:             "Software Engineering & Data Mining",
			RegistrationDeadline: "15 Juni 2025",
			EventDate:            "Agustus - September 2025",
			Status:               "Open Registration",
			Description:          "Pagelaran Mahasiswa Nasional Bidang TIK paling bergengsi tingkat nasional di Indonesia.",
			URL:                  "https://puspresnas.kemdikbud.go.id",
		},
		{
			ID:                   "comp-2",
			Name:                 "ASEAN Cyber Shield 2025",
			Organizer:            "ASEAN Cyber University & KISA",
			Tier:                 "Internasional",
			Category:             "Cybersecurity & Incident Response",
			RegistrationDeadline: "30 Juli 2025",
			EventDate:            "Oktober 2025",
			Status:               "Open Registration",
			Description:          "Kompetisi pertahanan siber dan threat hunting antar perwakilan kampus negara anggota ASEAN.",
			URL:                  "https://aseancybershield.org",
		},
		{
			ID:                   "comp-3",
			Name:                 "Google Solution Challenge 2025",
			Organizer:            "Google Developer Student Clubs",
			Tier:                 "Internasional",
			Category:             "Cloud, AI & Mobile",
			RegistrationDeadline: "31 Maret 2025",
			EventDate:            "Mei 2025",
			Status:               "In Progress",
			Description:          "Membangun solusi perangkat lunak menggunakan ekosistem teknologi Google untuk 17 UN SDGs.",
			URL:                  "https://developers.google.com",
		},
		{
			ID:                   "comp-4",
			Name:                 "Hackathon Merdeka 2025",
			Organizer:            "Kemenkomdigi & Komunitas Open Source Indonesia",
			Tier:                 "Nasional",
			Category:             "Civic Tech & Public Services",
			RegistrationDeadline: "10 Agustus 2025",
			EventDate:            "Agustus 2025",
			Status:               "Upcoming",
			Description:          "Ajang hackathon 48 jam pembuatan aplikasi untuk transparansi publik dan digitalisasi daerah.",
			URL:                  "https://komdigi.go.id",
		},
		{
			ID:                   "comp-5",
			Name:                 "Gunadarma IT Championship 2025",
			Organizer:            "BEM FIKTI Universitas Gunadarma",
			Tier:                 "Regional / Kampus",
			Category:             "Web Development & Competitive Programming",
			RegistrationDeadline: "20 Mei 2025",
			EventDate:            "Juni 2025",
			Status:               "Upcoming",
			Description:          "Ajang tahunan kompetisi pengembangan aplikasi dan algoritma untuk mahasiswa internal kampus.",
			URL:                  "https://gunadarma.ac.id",
		},
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(competitions)
}
