package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/ncd/backend/internal/config"
	"github.com/ncd/backend/internal/handler"
)

func main() {
	cfg := config.Load()

	r := chi.NewRouter()

	// Base middlewares
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(60 * time.Second))

	// CORS Setup
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{cfg.CORSOrigin, "http://localhost:5173", "http://127.0.0.1:5173"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// Health check
	r.Get("/healthz", handler.HealthCheck)

	// API v1 routes group
	r.Route("/api/v1", func(api chi.Router) {
		api.Get("/health", handler.HealthCheck)

		// Public Routes
		api.Get("/public/stats", handler.GetPublicStats)
		api.Get("/public/members", handler.GetPublicMembers)
		api.Get("/public/projects", handler.GetPublicProjects)
		api.Get("/public/history", handler.GetPublicHistory)
		api.Post("/public/apply", handler.SubmitApplication)

		// Finance Routes (Maker-Checker Kas)
		api.Get("/finance/summary", handler.GetCashSummary)
		api.Get("/finance/transactions", handler.ListTransactions)
		api.Post("/finance/transactions", handler.CreateTransaction)
		api.Post("/finance/transactions/{id}/verify", handler.VerifyTransaction)
		api.Post("/finance/transactions/{id}/void", handler.VoidTransaction)

		// Auth Routes
		api.Post("/auth/login", handler.Login(cfg.JWTSecret))
		api.Post("/auth/logout", handler.Logout)
	})

	server := &http.Server{
		Addr:         fmt.Sprintf(":%s", cfg.Port),
		Handler:      r,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Graceful shutdown channel
	shutdownChan := make(chan os.Signal, 1)
	signal.Notify(shutdownChan, os.Interrupt, syscall.SIGTERM)

	go func() {
		log.Printf("[NCD Backend] Server running on port %s (env: %s)\n", cfg.Port, cfg.Environment)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server startup failed: %v\n", err)
		}
	}()

	<-shutdownChan
	log.Println("[NCD Backend] Shutting down gracefully...")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		log.Printf("Forced shutdown due to error: %v\n", err)
	}

	log.Println("[NCD Backend] Server terminated successfully.")
}
