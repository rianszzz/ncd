.PHONY: help dev-frontend dev-backend build-frontend build-backend build sqlc test clean

help:
	@echo "NCD Platform Development Commands:"
	@echo "  make dev-backend    - Run Go REST API server (port 8080)"
	@echo "  make dev-frontend   - Run Vite React frontend (port 5173)"
	@echo "  make build          - Build both frontend and backend binaries"
	@echo "  make sqlc           - Regenerate Go database code from SQL queries"
	@echo "  make test           - Run backend unit tests"

dev-backend:
	cd backend && go run cmd/api/main.go

dev-frontend:
	cd frontend && npm run dev

build-frontend:
	cd frontend && npm run build

build-backend:
	cd backend && go build -o bin/api cmd/api/main.go

build: build-frontend build-backend

sqlc:
	cd backend && $(shell go env GOPATH)/bin/sqlc generate

test:
	cd backend && go test -v ./...

clean:
	rm -rf backend/bin frontend/dist
