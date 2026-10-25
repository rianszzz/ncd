-- ============================================================================
-- NCD Database Migration (000002_performance_indexes.sql)
-- Optimizing lookup performance on high-traffic queries and auth checks
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_portal_applications_status ON portal_applications(status);
CREATE INDEX IF NOT EXISTS idx_portal_applications_created ON portal_applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_access_tokens_key ON access_tokens(key);
CREATE INDEX IF NOT EXISTS idx_access_tokens_role ON access_tokens(role);
CREATE INDEX IF NOT EXISTS idx_portal_posts_published ON portal_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_portal_competitions_status ON portal_competitions(status);
CREATE INDEX IF NOT EXISTS idx_finance_status_date ON finance_transactions(status, transaction_date DESC);
