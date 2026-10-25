package handler

import (
	"encoding/json"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/ncd/backend/internal/middleware"
)

type MemberProfile struct {
	UserID          string     `json:"user_id"`
	Email           string     `json:"email"`
	FullName        string     `json:"full_name"`
	Major           string     `json:"major"`
	CohortYear      string     `json:"cohort_year"`
	CampusDomicile  string     `json:"campus_domicile"`
	Interests       string     `json:"interests"`
	TargetSkills    string     `json:"target_skills"`
	Hobbies         string     `json:"hobbies"`
	SpecificFocus   string     `json:"specific_focus"`
	TopicsToLearn   string     `json:"topics_to_learn"`
	Expectations    []string   `json:"expectations"`
	ExpectationNote string     `json:"expectation_note"`
	InterestFields  []string   `json:"interest_fields"`
	OtherInterest   string     `json:"other_interest"`
	IsOnboarded     bool       `json:"is_onboarded"`
	CompletedAt     *time.Time `json:"completed_at,omitempty"`
	UpdatedAt       time.Time  `json:"updated_at"`
}

type OnboardingTrackerItem struct {
	UserID      string         `json:"user_id"`
	FullName    string         `json:"full_name"`
	Email       string         `json:"email"`
	Role        string         `json:"role"`
	Position    string         `json:"position"`
	TokenKey    string         `json:"token_key,omitempty"`
	IsOnboarded bool           `json:"is_onboarded"`
	CompletedAt *time.Time     `json:"completed_at,omitempty"`
	Profile     *MemberProfile `json:"profile,omitempty"`
}

type OnboardingTrackerResponse struct {
	TotalMembers   int                     `json:"total_members"`
	CompletedCount int                     `json:"completed_count"`
	PendingCount   int                     `json:"pending_count"`
	CompletionRate float64                 `json:"completion_rate"`
	Members        []OnboardingTrackerItem `json:"members"`
}

var (
	memberProfilesLock sync.RWMutex
	memberProfilesList = []MemberProfile{}
)

func init() {
	go func() {
		time.Sleep(150 * time.Millisecond)
		loadMemberProfilesFromDisk()
	}()
}

func getMemberProfilesFilePath() string {
	if _, err := os.Stat("backend/data"); err == nil {
		return "backend/data/member_onboarding.json"
	}
	if _, err := os.Stat("data"); err == nil {
		return "data/member_onboarding.json"
	}
	return "data/member_onboarding.json"
}

func loadMemberProfilesFromDisk() {
	memberProfilesLock.Lock()
	defer memberProfilesLock.Unlock()

	filePath := getMemberProfilesFilePath()
	bytes, err := os.ReadFile(filePath)
	if err == nil && len(bytes) > 0 {
		var loaded []MemberProfile
		if err := json.Unmarshal(bytes, &loaded); err == nil {
			memberProfilesList = loaded
			return
		}
	}
}

func saveMemberProfilesToDiskLocked() {
	filePath := getMemberProfilesFilePath()
	bytes, err := json.MarshalIndent(memberProfilesList, "", "  ")
	if err == nil {
		_ = os.WriteFile(filePath, bytes, 0644)
	}
}

// GetMemberProfile mengembalikan data profil onboarding milik user yang sedang login
func GetMemberProfile(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value(middleware.UserContextKey).(*middleware.UserClaims)
	if !ok || claims == nil {
		http.Error(w, `{"error": "Unauthorized"}`, http.StatusUnauthorized)
		return
	}

	memberProfilesLock.RLock()
	defer memberProfilesLock.RUnlock()

	for _, p := range memberProfilesList {
		if (p.UserID != "" && p.UserID == claims.UserID) ||
			(p.Email != "" && strings.EqualFold(p.Email, claims.Email)) {
			w.Header().Set("Content-Type", "application/json")
			_ = json.NewEncoder(w).Encode(p)
			return
		}
	}

	// Default jika belum ada profil
	defaultProfile := MemberProfile{
		UserID:         claims.UserID,
		Email:          claims.Email,
		FullName:       claims.FullName,
		Expectations:   []string{},
		InterestFields: []string{},
		IsOnboarded:    false,
		UpdatedAt:      time.Now(),
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(defaultProfile)
}

// SubmitMemberOnboarding menyimpan atau memperbarui profil onboarding member
func SubmitMemberOnboarding(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value(middleware.UserContextKey).(*middleware.UserClaims)
	if !ok || claims == nil {
		http.Error(w, `{"error": "Unauthorized"}`, http.StatusUnauthorized)
		return
	}

	var req MemberProfile
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Payload tidak valid"}`, http.StatusBadRequest)
		return
	}

	now := time.Now()
	req.UserID = claims.UserID
	if strings.TrimSpace(req.Email) == "" {
		req.Email = claims.Email
	}
	if strings.TrimSpace(req.FullName) == "" {
		req.FullName = claims.FullName
	}
	req.IsOnboarded = true
	req.CompletedAt = &now
	req.UpdatedAt = now

	if req.Expectations == nil {
		req.Expectations = []string{}
	}
	if req.InterestFields == nil {
		req.InterestFields = []string{}
	}

	memberProfilesLock.Lock()
	defer memberProfilesLock.Unlock()

	found := false
	for i, p := range memberProfilesList {
		if (p.UserID != "" && p.UserID == claims.UserID) ||
			(p.Email != "" && strings.EqualFold(p.Email, claims.Email)) {
			memberProfilesList[i] = req
			found = true
			break
		}
	}

	if !found {
		memberProfilesList = append(memberProfilesList, req)
	}

	saveMemberProfilesToDiskLocked()

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(req)
}

// GetMemberOnboardingTracker mengembalikan daftar status onboarding seluruh member (Khusus Pengurus)
func GetMemberOnboardingTracker(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value(middleware.UserContextKey).(*middleware.UserClaims)
	if !ok || claims == nil {
		http.Error(w, `{"error": "Unauthorized"}`, http.StatusUnauthorized)
		return
	}

	// Hanya pengurus yang boleh mengakses tracker
	if claims.Role == "MEMBER" {
		http.Error(w, `{"error": "Forbidden: Akses khusus pengurus"}`, http.StatusForbidden)
		return
	}

	memberProfilesLock.RLock()
	defer memberProfilesLock.RUnlock()

	tokenLock.RLock()
	defer tokenLock.RUnlock()

	profileMapByID := make(map[string]MemberProfile)
	profileMapByEmail := make(map[string]MemberProfile)
	for _, p := range memberProfilesList {
		if p.UserID != "" {
			profileMapByID[p.UserID] = p
		}
		if p.Email != "" {
			profileMapByEmail[strings.ToLower(p.Email)] = p
		}
	}

	items := []OnboardingTrackerItem{}
	seenIDs := make(map[string]bool)

	// 1. Kumpulkan semua member dari tokens.json yang ber-role MEMBER
	for _, k := range accessKeys {
		if k.Role == "MEMBER" {
			item := OnboardingTrackerItem{
				UserID:   k.ID,
				FullName: k.Assignee,
				Email:    k.Email,
				Role:     k.Role,
				Position: k.Position,
				TokenKey: k.Key,
			}

			// Cocokkan profil jika sudah ada
			if prof, exists := profileMapByID[k.ID]; exists {
				item.IsOnboarded = prof.IsOnboarded
				item.CompletedAt = prof.CompletedAt
				copiedProf := prof
				item.Profile = &copiedProf
			} else if prof, exists := profileMapByEmail[strings.ToLower(k.Email)]; exists {
				item.IsOnboarded = prof.IsOnboarded
				item.CompletedAt = prof.CompletedAt
				copiedProf := prof
				item.Profile = &copiedProf
			}

			items = append(items, item)
			seenIDs[k.ID] = true
			if k.Email != "" {
				seenIDs[strings.ToLower(k.Email)] = true
			}
		}
	}

	// 2. Kumpulkan member yang ada di profil namun belum terdaftar di accessKeys
	for _, p := range memberProfilesList {
		if seenIDs[p.UserID] || (p.Email != "" && seenIDs[strings.ToLower(p.Email)]) {
			continue
		}
		copiedProf := p
		items = append(items, OnboardingTrackerItem{
			UserID:      p.UserID,
			FullName:    p.FullName,
			Email:       p.Email,
			Role:        "MEMBER",
			Position:    "Komunitas Member",
			IsOnboarded: p.IsOnboarded,
			CompletedAt: p.CompletedAt,
			Profile:     &copiedProf,
		})
	}

	total := len(items)
	completed := 0
	for _, item := range items {
		if item.IsOnboarded {
			completed++
		}
	}
	pending := total - completed
	rate := 0.0
	if total > 0 {
		rate = float64(completed) / float64(total) * 100.0
	}

	resp := OnboardingTrackerResponse{
		TotalMembers:   total,
		CompletedCount: completed,
		PendingCount:   pending,
		CompletionRate: rate,
		Members:        items,
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(resp)
}
