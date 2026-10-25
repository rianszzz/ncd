package handler

import (
	"context"
	"encoding/json"
	"net/http"
	"runtime"
	"time"
)

var serverStartTime = time.Now()

type HealthResponse struct {
	Status        string  `json:"status"`
	Timestamp     string  `json:"timestamp"`
	Service       string  `json:"service"`
	Version       string  `json:"version"`
	UptimeHuman   string  `json:"uptime_human"`
	UptimeSeconds int64   `json:"uptime_seconds"`
	Database      string  `json:"database"`
	Goroutines    int     `json:"goroutines"`
	MemoryAllocMB float64 `json:"memory_alloc_mb"`
}

func HealthCheck(w http.ResponseWriter, r *http.Request) {
	dbStatus := "connected"
	if DBPool != nil {
		ctx, cancel := context.WithTimeout(r.Context(), 1*time.Second)
		defer cancel()
		if err := DBPool.Ping(ctx); err != nil {
			dbStatus = "error: " + err.Error()
		}
	} else {
		dbStatus = "fallback_local_disk"
	}

	var m runtime.MemStats
	runtime.ReadMemStats(&m)

	uptime := time.Since(serverStartTime)

	resp := HealthResponse{
		Status:        "ok",
		Timestamp:     time.Now().Format(time.RFC3339),
		Service:       "ncd-backend",
		Version:       "1.0.0",
		UptimeHuman:   uptime.Round(time.Second).String(),
		UptimeSeconds: int64(uptime.Seconds()),
		Database:      dbStatus,
		Goroutines:    runtime.NumGoroutine(),
		MemoryAllocMB: float64(int(float64(m.Alloc)/1024/1024*100)) / 100,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(resp)
}
