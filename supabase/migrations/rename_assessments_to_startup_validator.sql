BEGIN;

-- Rename table
ALTER TABLE IF EXISTS public.assessments RENAME TO startup_validator;

-- Rename indexes if they exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_assessments_created_at') THEN
    EXECUTE 'ALTER INDEX idx_assessments_created_at RENAME TO idx_startup_validator_created_at';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_assessments_email') THEN
    EXECUTE 'ALTER INDEX idx_assessments_email RENAME TO idx_startup_validator_email';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_assessments_result_gin') THEN
    EXECUTE 'ALTER INDEX idx_assessments_result_gin RENAME TO idx_startup_validator_result_gin';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_assessments_score_expr') THEN
    EXECUTE 'ALTER INDEX idx_assessments_score_expr RENAME TO idx_startup_validator_score_expr';
  END IF;
END$$;

COMMIT;
