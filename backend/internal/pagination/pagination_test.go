package pagination

import (
	"net/http/httptest"
	"testing"
)

func TestPaginationParseAndSlice(t *testing.T) {
	req := httptest.NewRequest("GET", "/test?page=2&limit=3", nil)
	page, limit := Parse(req, 10, 50)

	if page != 2 || limit != 3 {
		t.Fatalf("expected page 2, limit 3, got page %d, limit %d", page, limit)
	}

	items := []int{10, 20, 30, 40, 50, 60, 70}
	paged, total := Slice(items, page, limit)

	if total != 7 {
		t.Fatalf("expected total 7, got %d", total)
	}
	if len(paged) != 3 || paged[0] != 40 || paged[2] != 60 {
		t.Fatalf("expected [40, 50, 60], got %v", paged)
	}

	w := httptest.NewRecorder()
	SetHeaders(w, total, page, limit)

	if w.Header().Get("X-Total-Count") != "7" {
		t.Fatalf("unexpected X-Total-Count: %s", w.Header().Get("X-Total-Count"))
	}
	if w.Header().Get("X-Page") != "2" {
		t.Fatalf("unexpected X-Page: %s", w.Header().Get("X-Page"))
	}
	if w.Header().Get("X-Per-Page") != "3" {
		t.Fatalf("unexpected X-Per-Page: %s", w.Header().Get("X-Per-Page"))
	}
}
