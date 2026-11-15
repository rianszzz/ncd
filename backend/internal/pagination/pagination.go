package pagination

import (
	"fmt"
	"net/http"
	"strconv"
)

// Parse extracts page and limit from query parameters with validation and bounds clamping.
func Parse(r *http.Request, defaultLimit, maxLimit int) (page, limit int) {
	page = 1
	limit = defaultLimit

	if pStr := r.URL.Query().Get("page"); pStr != "" {
		if p, err := strconv.Atoi(pStr); err == nil && p > 0 {
			page = p
		}
	}

	if lStr := r.URL.Query().Get("limit"); lStr != "" {
		if l, err := strconv.Atoi(lStr); err == nil && l > 0 {
			if l > maxLimit {
				limit = maxLimit
			} else {
				limit = l
			}
		}
	}

	return page, limit
}

// Slice returns a paginated slice of items based on page and limit (1-indexed).
func Slice[T any](items []T, page, limit int) ([]T, int) {
	total := len(items)
	if total == 0 {
		return []T{}, 0
	}

	start := (page - 1) * limit
	if start >= total {
		return []T{}, total
	}

	end := start + limit
	if end > total {
		end = total
	}

	return items[start:end], total
}

// SetHeaders attaches standard pagination headers (X-Total-Count, X-Page, X-Per-Page).
func SetHeaders(w http.ResponseWriter, total, page, limit int) {
	w.Header().Set("X-Total-Count", fmt.Sprintf("%d", total))
	w.Header().Set("X-Page", fmt.Sprintf("%d", page))
	w.Header().Set("X-Per-Page", fmt.Sprintf("%d", limit))
}
