package handler

import "github.com/ncd/backend/internal/repository"

var Repo *repository.Queries

func SetRepository(r *repository.Queries) {
	Repo = r
}
