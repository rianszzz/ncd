-- name: ListPublicMembers :many
SELECT 
  m.id, m.full_name, m.nickname, m.avatar_url, m.generation, 
  m.major, m.university, m.division, m.skills, m.bio,
  m.linkedin_url, m.github_url, m.portfolio_url,
  p.title as position_title, p.level as position_level, p.order_priority
FROM members m
LEFT JOIN positions p ON m.position_id = p.id
WHERE m.show_in_public = TRUE AND m.status = 'ACTIVE'
ORDER BY p.order_priority ASC, m.full_name ASC;

-- name: GetMemberByUserID :one
SELECT 
  m.id, m.user_id, m.full_name, m.nickname, m.avatar_url, m.generation, 
  m.major, m.university, m.division, m.skills, m.bio, m.phone_number,
  m.linkedin_url, m.github_url, m.portfolio_url, m.show_in_public, m.status,
  p.title as position_title
FROM members m
LEFT JOIN positions p ON m.position_id = p.id
WHERE m.user_id = $1 LIMIT 1;

-- name: CountActiveMembers :one
SELECT COUNT(*) FROM members WHERE status = 'ACTIVE';
