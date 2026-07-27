-- Pre-existing bug fix: the shared `update_updated_at_column()` trigger function
-- sets `NEW.updated_at`, but the `users` table (unlike every other table) has no
-- snake_case mapping for its timestamp columns -- the real column is `"updatedAt"`.
-- Any UPDATE on `users` therefore fails with "column \"updated_at\" does not exist".
-- Give `users` its own trigger function that references the correct column.

CREATE OR REPLACE FUNCTION update_users_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;

CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_users_updated_at_column();
