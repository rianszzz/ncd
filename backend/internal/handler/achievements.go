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

var (
	achLock          sync.RWMutex
	achievementsList = []AchievementDTO{}

	compLock         sync.RWMutex
	competitionsList = []CompetitionDTO{}
)

func getAchievementsFilePath() string {
	if _, err := os.Stat("backend/data"); err == nil {
		return "backend/data/achievements.json"
	}
	if _, err := os.Stat("data"); err == nil {
		return "data/achievements.json"
	}
	if _, err := os.Stat("../../data"); err == nil {
		return "../../data/achievements.json"
	}
	return "data/achievements.json"
}

func getCompetitionsFilePath() string {
	if _, err := os.Stat("backend/data"); err == nil {
		return "backend/data/competitions.json"
	}
	if _, err := os.Stat("data"); err == nil {
		return "data/competitions.json"
	}
	if _, err := os.Stat("../../data"); err == nil {
		return "../../data/competitions.json"
	}
	return "data/competitions.json"
}

func saveAchievementsToDiskLocked() {
	filePath := getAchievementsFilePath()
	bytes, err := json.MarshalIndent(achievementsList, "", "  ")
	if err == nil {
		_ = os.WriteFile(filePath, bytes, 0644)
	}
}

func saveCompetitionsToDiskLocked() {
	filePath := getCompetitionsFilePath()
	bytes, err := json.MarshalIndent(competitionsList, "", "  ")
	if err == nil {
		_ = os.WriteFile(filePath, bytes, 0644)
	}
}

func loadAchievementsFromDisk() {
	achLock.Lock()
	defer achLock.Unlock()

	filePath := getAchievementsFilePath()
	bytes, err := os.ReadFile(filePath)
	if err == nil && len(bytes) > 0 {
		var loaded []AchievementDTO
		if err := json.Unmarshal(bytes, &loaded); err == nil {
			achievementsList = loaded
			return
		}
	}
	achievementsList = []AchievementDTO{}
	saveAchievementsToDiskLocked()
}

func loadCompetitionsFromDisk() {
	compLock.Lock()
	defer compLock.Unlock()

	filePath := getCompetitionsFilePath()
	bytes, err := os.ReadFile(filePath)
	if err == nil && len(bytes) > 0 {
		var loaded []CompetitionDTO
		if err := json.Unmarshal(bytes, &loaded); err == nil {
			competitionsList = loaded
			return
		}
	}
	competitionsList = []CompetitionDTO{}
	saveCompetitionsToDiskLocked()
}

func init() {
	loadAchievementsFromDisk()
	loadCompetitionsFromDisk()
}

// GetPublicAchievements returns public achievements, filtered by ?tier=... if provided.
func GetPublicAchievements(w http.ResponseWriter, r *http.Request) {
	achLock.RLock()
	defer achLock.RUnlock()

	tierFilter := strings.TrimSpace(r.URL.Query().Get("tier"))
	results := make([]AchievementDTO, 0, len(achievementsList))

	for _, ach := range achievementsList {
		if tierFilter != "" && !strings.EqualFold(tierFilter, "all") {
			if !strings.EqualFold(ach.Tier, tierFilter) {
				continue
			}
		}
		results = append(results, ach)
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(results)
}

// CreateAchievement allows GOD_ADMIN and SUPER_ADMIN to add a new achievement.
func CreateAchievement(w http.ResponseWriter, r *http.Request) {
	var req AchievementDTO
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"Invalid request payload"}`, http.StatusBadRequest)
		return
	}

	req.Title = strings.TrimSpace(req.Title)
	if req.Title == "" {
		http.Error(w, `{"error":"Judul prestasi wajib diisi"}`, http.StatusBadRequest)
		return
	}

	if req.ID == "" {
		req.ID = fmt.Sprintf("ach-%s", uuid.New().String()[:8])
	}
	if req.Year == 0 {
		req.Year = time.Now().Year()
	}
	if req.Date == "" && req.AwardDate != "" {
		req.Date = req.AwardDate
	}
	if req.AwardDate == "" && req.Date != "" {
		req.AwardDate = req.Date
	}
	if len(req.Members) > 0 && len(req.TeamMembers) == 0 {
		req.TeamMembers = req.Members
	}
	if len(req.TeamMembers) > 0 && len(req.Members) == 0 {
		req.Members = req.TeamMembers
	}
	if req.Competition == "" && req.EventName != "" {
		req.Competition = req.EventName
	}

	achLock.Lock()
	achievementsList = append([]AchievementDTO{req}, achievementsList...)
	saveAchievementsToDiskLocked()
	achLock.Unlock()

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(req)
}

// DeleteAchievement allows GOD_ADMIN and SUPER_ADMIN to remove an achievement.
func DeleteAchievement(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		http.Error(w, `{"error":"ID wajib disertakan"}`, http.StatusBadRequest)
		return
	}

	achLock.Lock()
	defer achLock.Unlock()

	found := false
	updated := make([]AchievementDTO, 0, len(achievementsList))
	for _, item := range achievementsList {
		if item.ID == id {
			found = true
			continue
		}
		updated = append(updated, item)
	}

	if !found {
		http.Error(w, `{"error":"Prestasi tidak ditemukan"}`, http.StatusNotFound)
		return
	}

	achievementsList = updated
	saveAchievementsToDiskLocked()

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]string{
		"message": "Prestasi berhasil dihapus",
		"id":      id,
	})
}

// GetPublicCompetitions returns active, upcoming, or tracked competitions.
func GetPublicCompetitions(w http.ResponseWriter, r *http.Request) {
	compLock.RLock()
	defer compLock.RUnlock()

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(competitionsList)
}

// CreateCompetition allows GOD_ADMIN and SUPER_ADMIN to add a tracked competition.
func CreateCompetition(w http.ResponseWriter, r *http.Request) {
	var req CompetitionDTO
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"Invalid request payload"}`, http.StatusBadRequest)
		return
	}

	req.Name = strings.TrimSpace(req.Name)
	if req.Name == "" {
		http.Error(w, `{"error":"Nama kompetisi wajib diisi"}`, http.StatusBadRequest)
		return
	}

	if req.ID == "" {
		req.ID = fmt.Sprintf("comp-%s", uuid.New().String()[:8])
	}
	if req.Status == "" {
		req.Status = "Open Registration"
	}

	compLock.Lock()
	competitionsList = append([]CompetitionDTO{req}, competitionsList...)
	saveCompetitionsToDiskLocked()
	compLock.Unlock()

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(req)
}

// DeleteCompetition allows GOD_ADMIN and SUPER_ADMIN to remove a competition.
func DeleteCompetition(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		http.Error(w, `{"error":"ID wajib disertakan"}`, http.StatusBadRequest)
		return
	}

	compLock.Lock()
	defer compLock.Unlock()

	found := false
	updated := make([]CompetitionDTO, 0, len(competitionsList))
	for _, item := range competitionsList {
		if item.ID == id {
			found = true
			continue
		}
		updated = append(updated, item)
	}

	if !found {
		http.Error(w, `{"error":"Kompetisi tidak ditemukan"}`, http.StatusNotFound)
		return
	}

	competitionsList = updated
	saveCompetitionsToDiskLocked()

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]string{
		"message": "Kompetisi berhasil dihapus",
		"id":      id,
	})
}
