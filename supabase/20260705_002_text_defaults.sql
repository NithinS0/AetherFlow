-- ====================================================================
-- AetherFlow Enterprise
-- Migration: Normalize unset TEXT fields to empty string defaults
-- ====================================================================

-- This script is safe to run on existing Supabase / PostgreSQL databases.
-- It updates any NULL TEXT values to empty strings and sets empty-string
-- defaults for TEXT columns so missing text input becomes an explicit '' value.

DO $$
DECLARE
    rec RECORD;
BEGIN
    FOR rec IN
        SELECT table_schema, table_name, column_name
        FROM information_schema.columns
        WHERE data_type = 'text'
          AND table_schema = 'public'
          AND table_name NOT LIKE 'pg_%'
          AND table_name NOT LIKE 'sql_%'
    LOOP
        EXECUTE format(
            'UPDATE %I.%I SET %I = '''' WHERE %I IS NULL;', 
            rec.table_schema, rec.table_name, rec.column_name, rec.column_name
        );
        EXECUTE format(
            'ALTER TABLE %I.%I ALTER COLUMN %I SET DEFAULT '''';',
            rec.table_schema, rec.table_name, rec.column_name
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;
