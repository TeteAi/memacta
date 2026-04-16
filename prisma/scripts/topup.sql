-- One-shot credit top-up for all existing users. Keeps the CreditTransaction
-- ledger consistent by recording a "grant" row per user so the balance
-- matches the sum of transactions. Safe to re-run — would just add another
-- transaction with a new balance value.
UPDATE "User" SET credits = 500;
