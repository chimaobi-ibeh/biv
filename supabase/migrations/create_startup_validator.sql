-- Enable pgcrypto for UUID generation (optional)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create startup_validator table
CREATE TABLE IF NOT EXISTS public.startup_validator (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email text,
  name text,
  type text NOT NULL CHECK (type IN ('capture','report')),
  result jsonb NOT NULL,
  -- derived columns for quick filtering/sorting
  score integer GENERATED ALWAYS AS ((result->'scoreResult'->>'score')::int) STORED,
  score_level text GENERATED ALWAYS AS ((result->'scoreResult'->>'level')) STORED,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_startup_validator_created_at ON public.startup_validator (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_startup_validator_email ON public.startup_validator (email);
CREATE INDEX IF NOT EXISTS idx_startup_validator_result_gin ON public.startup_validator USING gin (result);
-- Optional functional index if generated columns are not supported
CREATE INDEX IF NOT EXISTS idx_startup_validator_score_expr ON public.startup_validator (((result->'scoreResult'->>'score')::int));
