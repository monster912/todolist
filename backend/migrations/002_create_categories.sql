-- =============================================================================
-- Migration 002 · categories
-- =============================================================================
-- Rollback:
--   DROP TRIGGER IF EXISTS trg_user_create_default_category ON "user";
--   DROP FUNCTION IF EXISTS create_default_category();
--   DROP TRIGGER IF EXISTS trg_category_updated_at ON category;
--   DROP INDEX IF EXISTS idx_category_user_default;
--   DROP INDEX IF EXISTS idx_category_user_id;
--   DROP TABLE IF EXISTS category;
-- =============================================================================

CREATE TABLE category (
    id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID         NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    name       VARCHAR(50)  NOT NULL CHECK (length(name) BETWEEN 1 AND 50),
    is_default BOOLEAN      NOT NULL DEFAULT false,
    created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_category_user_name UNIQUE (user_id, name)
);

CREATE INDEX idx_category_user_id
    ON category(user_id);

CREATE INDEX idx_category_user_default
    ON category(user_id, is_default)
    WHERE is_default = true;

CREATE TRIGGER trg_category_updated_at
    BEFORE UPDATE ON category
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE FUNCTION create_default_category()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO category (user_id, name, is_default)
    VALUES (NEW.id, '기본', true);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_user_create_default_category
    AFTER INSERT ON "user"
    FOR EACH ROW EXECUTE FUNCTION create_default_category();
