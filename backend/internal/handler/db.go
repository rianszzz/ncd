package handler

import (
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
}
