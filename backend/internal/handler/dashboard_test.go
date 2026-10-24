package handler

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestGetPortalDashboard(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/api/v1/portal/dashboard", nil)
	rr := httptest.NewRecorder()

	GetPortalDashboard(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", rr.Code)
	}

	var res DashboardSummaryDTO
	if err := json.NewDecoder(rr.Body).Decode(&res); err != nil {
		t.Fatalf("failed to decode dashboard response: %v", err)
	}

	if res.User.Name == "" {
		t.Errorf("expected non-empty user name, got %q", res.User.Name)
	}

	if res.TotalMembersCount <= 0 {
		t.Errorf("expected positive total members count, got %d", res.TotalMembersCount)
	}

	if len(res.RecentActivity) == 0 {
		t.Errorf("expected recent activity items, got 0")
	}

	if res.Stats.TotalMembersCount <= 0 {
		t.Errorf("expected positive stats.total_members_count, got %d", res.Stats.TotalMembersCount)
	}
}
