-- =============================================================================
-- Migration 003 · todos
-- =============================================================================
-- Rollback:
--   DROP TRIGGER IF EXISTS trg_todo_updated_at ON todo;
--   DROP INDEX IF EXISTS idx_todo_end_date;
--   DROP INDEX IF EXISTS idx_todo_start_date;
--   DROP INDEX IF EXISTS idx_todo_is_done;
--   DROP INDEX IF EXISTS idx_todo_user_category;
--   DROP INDEX IF EXISTS idx_todo_category_id;
--   DROP INDEX IF EXISTS idx_todo_user_id;
--   DROP TABLE IF EXISTS todo;
-- =============================================================================

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

CREATE TRIGGER trg_todo_updated_at
    BEFORE UPDATE ON todo
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
