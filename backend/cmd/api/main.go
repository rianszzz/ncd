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
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/ncd/backend/internal/config"
	"github.com/ncd/backend/internal/handler"
	ncdMiddleware "github.com/ncd/backend/internal/middleware"
	"github.com/ncd/backend/internal/repository"
	"github.com/ncd/backend/internal/seed"
)

func main() {
	cfg := config.Load()

	// 1. Database Connection Pool & Auto-Seed
	ctx := context.Background()
	pool, err := pgxpool.New(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Printf("[NCD Database] Init pool PostgreSQL error: %v (running fallback)\n", err)
	} else if err := pool.Ping(ctx); err != nil {
		log.Printf("[NCD Database] Ping PostgreSQL error: %v (running fallback)\n", err)
		pool.Close()
	} else {
		log.Printf("[NCD Database] Berhasil terhubung ke PostgreSQL: %s\n", cfg.DatabaseURL)
		defer pool.Close()

		repo := repository.New(pool)
		handler.SetRepository(repo)

		if err := seed.Run(ctx, pool); err != nil {
			log.Printf("[NCD Seed] Peringatan error saat seed data: %v\n", err)
		}
	}

	// 2. HTTP Router Setup
	r := chi.NewRouter()

	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(60 * time.Second))

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{cfg.CORSOrigin, "http://localhost:5173", "http://127.0.0.1:5173"},
		AllowOriginFunc:  func(r *http.Request, origin string) bool { return true },
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

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

		// Public Finance Routes (Buku Kas Terbuka - Read-Only Publik)
		api.Get("/finance/summary", handler.GetCashSummary)
		api.Get("/finance/transactions", handler.ListTransactions)

		// Sensitive Protected Finance Routes (Hanya Pengurus Terautentikasi)
		api.Group(func(protected chi.Router) {
			protected.Use(ncdMiddleware.RequireAuth(cfg.JWTSecret))

			// Maker: Bendahara I
			protected.With(ncdMiddleware.RequireRole("BENDAHARA_I", "GOD_ADMIN", "SUPER_ADMIN")).
				Post("/finance/transactions", handler.CreateTransaction)

			// Checker: Bendahara II
			protected.With(ncdMiddleware.RequireRole("BENDAHARA_II", "GOD_ADMIN", "SUPER_ADMIN")).
				Post("/finance/transactions/{id}/verify", handler.VerifyTransaction)

			// Void Action: Super Admin & God Admin
			protected.With(ncdMiddleware.RequireRole("GOD_ADMIN", "SUPER_ADMIN")).
				Post("/finance/transactions/{id}/void", handler.VoidTransaction)
		})

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

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := server.Shutdown(shutdownCtx); err != nil {
		log.Printf("Forced shutdown due to error: %v\n", err)
	}

	log.Println("[NCD Backend] Server terminated successfully.")
}
