package handler

import (
	"context"
	"log"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/ncd/backend/internal/repository"
)

var (
	Repo         *repository.Queries
	DBPool       *pgxpool.Pool
	dbPoolMutex  sync.Mutex
)

func SetRepository(r *repository.Queries) {
	Repo = r
}

func SetDB(pool *pgxpool.Pool, r *repository.Queries) {
	DBPool = pool
	Repo = r
	InitTokensDB(pool)
	InitAchievementsDB(pool)
	InitNewsDB(pool)
	InitApplicationsDB(pool)
	InitFinanceDB(pool)
	InitLearningSessionsDB(pool)
	InitPerformanceIndexes(pool)
}

// GetDBPool mengembalikan DBPool yang aktif. Jika nil (misal cold-start Vercel atau delay koneksi),
// fungsi ini akan mencoba menghubungkan kembali secara lazy dan aman thread.
func GetDBPool() *pgxpool.Pool {
	if DBPool != nil {
		return DBPool
	}

	dbPoolMutex.Lock()
	defer dbPoolMutex.Unlock()

	if DBPool != nil {
		return DBPool
	}

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		return nil
	}

	if strings.Contains(dbURL, "pooler.supabase.com:5432") {
		dbURL = strings.Replace(dbURL, "pooler.supabase.com:5432", "pooler.supabase.com:6543", 1)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 8*time.Second)
	defer cancel()

	poolCfg, err := pgxpool.ParseConfig(dbURL)
	if err != nil {
		log.Printf("[NCD Database Lazy] Gagal parse database URL: %v\n", err)
		return nil
	}

	poolCfg.MaxConns = 4
	poolCfg.MinConns = 0
	poolCfg.MaxConnIdleTime = 15 * time.Second
	poolCfg.MaxConnLifetime = 5 * time.Minute
	poolCfg.ConnConfig.DefaultQueryExecMode = pgx.QueryExecModeSimpleProtocol

	pool, err := pgxpool.NewWithConfig(ctx, poolCfg)
	if err != nil {
		log.Printf("[NCD Database Lazy] Gagal inisialisasi pool PostgreSQL: %v\n", err)
		return nil
	}

	if err := pool.Ping(ctx); err != nil {
		log.Printf("[NCD Database Lazy] Ping PostgreSQL timeout/gagal: %v\n", err)
		pool.Close()
		return nil
	}

	log.Printf("[NCD Database Lazy] Berhasil terhubung ke PostgreSQL via Lazy Connect\n")
	repo := repository.New(pool)
	SetDB(pool, repo)
	return DBPool
}

func InitPerformanceIndexes(pool *pgxpool.Pool) {
	if pool == nil {
		return
	}
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	indexQueries := []string{
		"CREATE INDEX IF NOT EXISTS idx_portal_applications_status ON portal_applications(status);",
		"CREATE INDEX IF NOT EXISTS idx_portal_applications_created ON portal_applications(created_at DESC);",
		"CREATE INDEX IF NOT EXISTS idx_access_tokens_key ON access_tokens(key);",
		"CREATE INDEX IF NOT EXISTS idx_access_tokens_role ON access_tokens(role);",
		"CREATE INDEX IF NOT EXISTS idx_portal_posts_published ON portal_posts(published_at DESC);",
		"CREATE INDEX IF NOT EXISTS idx_portal_competitions_status ON portal_competitions(status);",
		"CREATE INDEX IF NOT EXISTS idx_finance_status_date ON finance_transactions(status, transaction_date DESC);",
	}

	for _, q := range indexQueries {
		_, _ = pool.Exec(ctx, q)
	}
}
