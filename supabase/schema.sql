-- OtherMe — Supabase Schema
-- À exécuter dans le SQL Editor de ton projet Supabase

-- ── Table principale : rapports ────────────────────────────
CREATE TABLE IF NOT EXISTS reports (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email             TEXT NOT NULL,
  first_name        TEXT NOT NULL DEFAULT '',
  onboarding_data   JSONB NOT NULL DEFAULT '{}',
  report_full       TEXT,
  status            TEXT NOT NULL DEFAULT 'generating'
                    CHECK (status IN ('generating', 'ready', 'paid', 'complete')),
  stripe_session_id TEXT UNIQUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour retrouver un rapport par session Stripe
CREATE INDEX IF NOT EXISTS idx_reports_stripe_session
  ON reports (stripe_session_id)
  WHERE stripe_session_id IS NOT NULL;

-- Index pour lister les rapports par email
CREATE INDEX IF NOT EXISTS idx_reports_email ON reports (email);

-- Mise à jour automatique du champ updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_reports_updated_at ON reports;
CREATE TRIGGER set_reports_updated_at
  BEFORE UPDATE ON reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ── Row Level Security ─────────────────────────────────────
-- Le backend utilise la service_role key (bypass RLS).
-- On désactive le RLS public — les données sont privées.
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Aucun accès via la clé anon (tout passe par le backend)
-- Si tu veux permettre à un utilisateur de voir SON rapport :
-- CREATE POLICY "Lecture par id" ON reports FOR SELECT USING (true);
-- (adapter selon tes besoins d'auth)
