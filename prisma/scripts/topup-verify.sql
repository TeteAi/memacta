-- Insert a ledger row per user so CreditTransaction stays in sync with
-- User.credits. Uses a deterministic description so duplicate runs are
-- easy to spot in the transaction history.
INSERT INTO "CreditTransaction" (id, "userId", amount, balance, type, description, "createdAt")
SELECT
  'topup_' || id || '_' || extract(epoch FROM now())::bigint,
  id,
  500,
  500,
  'grant',
  'Beta top-up — manual grant',
  now()
FROM "User"
WHERE credits = 500;
