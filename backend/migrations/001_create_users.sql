-- =============================================================================
-- Migration 001 · users
-- =============================================================================
-- Rollback:
--   DROP TRIGGER IF EXISTS trg_user_updated_at ON "user";
--   DROP FUNCTION IF EXISTS set_updated_at();
--   DROP TABLE IF EXISTS "user";
--   DROP TYPE IF EXISTS locale_type;
--   DROP TYPE IF EXISTS theme_type;
--   DROP EXTENSION IF EXISTS "pgcrypto";
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE theme_type  AS ENUM ('light', 'dark');
CREATE TYPE locale_type AS ENUM ('ko', 'en');

CREATE TABLE "user" (
    id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    email      VARCHAR(255) NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,
    name       VARCHAR(50)  NOT NULL CHECK (length(name) BETWEEN 1 AND 50),
    theme      theme_type   NOT NULL DEFAULT 'light',
    locale     locale_type  NOT NULL DEFAULT 'ko',
    created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_user_updated_at
    BEFORE UPDATE ON "user"
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
