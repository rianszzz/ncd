-- name: GetUserByEmail :one
SELECT id, email, password_hash, role, is_active, created_at, updated_at
FROM users
WHERE email = $1 LIMIT 1;

-- name: GetUserByID :one
SELECT id, email, password_hash, role, is_active, created_at, updated_at
FROM users
WHERE id = $1 LIMIT 1;

-- name: CreateUser :one
INSERT INTO users (email, password_hash, role, is_active, invited_by)
VALUES ($1, $2, $3, $4, $5)
RETURNING id, email, role, is_active, created_at;

-- name: UpdateUserRole :exec
UPDATE users
SET role = $2, updated_at = NOW()
WHERE id = $1;

-- name: SetUserActiveStatus :exec
UPDATE users
SET is_active = $2, updated_at = NOW()
WHERE id = $1;
