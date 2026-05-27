-- =============================================================================
-- Todo List Application - Database Schema
-- Database  : PostgreSQL 17
-- Version   : 1.0.0
-- Created   : 2026-05-27
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 0. Extensions
-- -----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";  -- gen_random_uuid() 사용


-- -----------------------------------------------------------------------------
-- 1. Enum Types
-- -----------------------------------------------------------------------------
CREATE TYPE theme_type  AS ENUM ('light', 'dark');
CREATE TYPE locale_type AS ENUM ('ko', 'en');


-- -----------------------------------------------------------------------------
-- 2. Tables
-- -----------------------------------------------------------------------------

-- 2.1 user
CREATE TABLE "user" (
    id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    email      VARCHAR(255) NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,                            -- bcrypt hash
    name       VARCHAR(50)  NOT NULL CHECK (length(name) BETWEEN 1 AND 50),
    theme      theme_type   NOT NULL DEFAULT 'light',
    locale     locale_type  NOT NULL DEFAULT 'ko',
    created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2.2 category
CREATE TABLE category (
    id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID         NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    name       VARCHAR(50)  NOT NULL CHECK (length(name) BETWEEN 1 AND 50),
    is_default BOOLEAN      NOT NULL DEFAULT false,
    created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_category_user_name UNIQUE (user_id, name)
);

-- 2.3 todo
CREATE TABLE todo (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID         NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    category_id UUID         NOT NULL REFERENCES category(id),
    title       VARCHAR(200) NOT NULL CHECK (length(title) BETWEEN 1 AND 200),
    description TEXT,
    is_done     BOOLEAN      NOT NULL DEFAULT false,
    start_date  DATE,
    end_date    DATE,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_todo_date_range
        CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date)
);


-- -----------------------------------------------------------------------------
-- 3. Indexes
-- -----------------------------------------------------------------------------

-- category
CREATE INDEX idx_category_user_id
    ON category(user_id);

CREATE INDEX idx_category_user_default
    ON category(user_id, is_default)
    WHERE is_default = true;

-- todo
CREATE INDEX idx_todo_user_id
    ON todo(user_id);

CREATE INDEX idx_todo_category_id
    ON todo(category_id);

CREATE INDEX idx_todo_user_category
    ON todo(user_id, category_id);

CREATE INDEX idx_todo_is_done
    ON todo(is_done);

CREATE INDEX idx_todo_start_date
    ON todo(start_date)
    WHERE start_date IS NOT NULL;

CREATE INDEX idx_todo_end_date
    ON todo(end_date)
    WHERE end_date IS NOT NULL;


-- -----------------------------------------------------------------------------
-- 4. Functions & Triggers
-- -----------------------------------------------------------------------------

-- 4.1 updated_at 자동 갱신 함수
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

CREATE TRIGGER trg_category_updated_at
    BEFORE UPDATE ON category
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_todo_updated_at
    BEFORE UPDATE ON todo
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 4.2 신규 사용자 생성 시 기본 카테고리 자동 생성
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
