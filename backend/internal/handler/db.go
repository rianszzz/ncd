package handler

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/ncd/backend/internal/repository"
)

var (
	Repo   *repository.Queries
	DBPool *pgxpool.Pool
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
	InitPerformanceIndexes(pool)
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
