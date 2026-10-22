-- name: ListTransactions :many
SELECT 
  t.id, t.transaction_number, t.type, t.category_id, c.name as category_name,
  t.amount, t.description, t.person_in_charge, t.receipt_url,
  t.status, t.transaction_date, t.maker_id, t.verifier_id, t.verified_at,
  t.void_by_id, t.void_reason, t.void_at, t.created_at
FROM finance_transactions t
JOIN finance_categories c ON t.category_id = c.id
ORDER BY t.transaction_date DESC, t.created_at DESC;

-- name: GetTransactionByID :one
SELECT 
  t.id, t.transaction_number, t.type, t.category_id,
  t.amount, t.description, t.person_in_charge, t.receipt_url,
  t.status, t.transaction_date, t.maker_id, t.verifier_id, t.verified_at,
  t.void_by_id, t.void_reason, t.void_at, t.created_at
FROM finance_transactions t
WHERE t.id = $1 LIMIT 1;

-- name: CreateTransactionDraft :one
INSERT INTO finance_transactions (
  transaction_number, type, category_id, amount, description, 
  person_in_charge, receipt_url, status, transaction_date, maker_id
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, 'DRAFT_PENDING', $8, $9
)
RETURNING id, transaction_number, status, created_at;

-- name: VerifyTransaction :exec
UPDATE finance_transactions
SET status = 'VERIFIED', verifier_id = $2, verified_at = NOW()
WHERE id = $1 AND status = 'DRAFT_PENDING' AND maker_id != $2;

-- name: VoidTransaction :exec
UPDATE finance_transactions
SET status = 'VOID', void_by_id = $2, void_reason = $3, void_at = NOW()
WHERE id = $1;

-- name: GetCashSummary :one
SELECT 
  COALESCE(SUM(CASE WHEN type = 'INCOME' AND status = 'VERIFIED' THEN amount ELSE 0 END), 0)::NUMERIC(14, 2) AS total_income,
  COALESCE(SUM(CASE WHEN type = 'EXPENSE' AND status = 'VERIFIED' THEN amount ELSE 0 END), 0)::NUMERIC(14, 2) AS total_expense,
  (
    COALESCE(SUM(CASE WHEN type = 'INCOME' AND status = 'VERIFIED' THEN amount ELSE 0 END), 0) -
    COALESCE(SUM(CASE WHEN type = 'EXPENSE' AND status = 'VERIFIED' THEN amount ELSE 0 END), 0)
  )::NUMERIC(14, 2) AS current_balance
FROM finance_transactions;
