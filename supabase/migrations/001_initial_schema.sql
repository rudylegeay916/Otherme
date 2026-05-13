-- ════════════════════════════════════════════════════════════════════
-- OtherMe / ParallelLife — Migration 001
-- Schéma complet : 6 tables, RLS, policies, triggers, index
--
-- Exécuter dans : Supabase Dashboard → SQL Editor → New query
-- Ou via CLI    : supabase db push
-- ════════════════════════════════════════════════════════════════════

-- ── 0. Nettoyage du schéma simple antérieur ──────────────────────
-- (supprime l'ancienne table "reports" mono-table si elle existe)
DROP TABLE IF EXISTS public.reports CASCADE;

-- ── 1. Extensions ────────────────────────────────────────────────
-- uuid-ossp : gen_random_uuid() disponible sur toutes versions PG
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── 2. Fonction trigger : updated_at automatique ─────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


-- ════════════════════════════════════════════════════════════════════
-- TABLE 1 : profiles
-- Miroir léger de auth.users, créé automatiquement à l'inscription.
-- Sert de pivot pour toutes les foreign keys utilisateur.
-- ════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.profiles (
  id         UUID        PRIMARY KEY
               REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT        NOT NULL,
  full_name  TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  public.profiles           IS 'Profils utilisateurs — miroir de auth.users';
COMMENT ON COLUMN public.profiles.id        IS 'Même UUID que auth.users.id';
COMMENT ON COLUMN public.profiles.email     IS 'Copie de auth.users.email pour jointures rapides';

-- Trigger updated_at
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-création du profil à l'inscription Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── RLS : profiles ───────────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Un utilisateur connecté lit uniquement son propre profil
CREATE POLICY "profiles: select own"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Un utilisateur connecté met à jour uniquement son propre profil
CREATE POLICY "profiles: update own"
  ON public.profiles
  FOR UPDATE
  USING     (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ── Index : profiles ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_profiles_email
  ON public.profiles (email);


-- ════════════════════════════════════════════════════════════════════
-- TABLE 2 : onboarding_responses
-- Stocke les réponses brutes + champs structurés du formulaire.
-- user_id nullable : flux anonyme autorisé avant connexion.
-- ════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.onboarding_responses (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  current_situation  TEXT,
  regrets_or_desires TEXT,
  goals              TEXT,
  cv_file_url        TEXT,
  raw_answers        JSONB       NOT NULL DEFAULT '{}',
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  public.onboarding_responses                 IS 'Réponses du formulaire d''onboarding';
COMMENT ON COLUMN public.onboarding_responses.user_id         IS 'NULL si soumis avant connexion (flux anonyme)';
COMMENT ON COLUMN public.onboarding_responses.current_situation IS 'Synthèse textuelle : métier actuel + secteur + expérience';
COMMENT ON COLUMN public.onboarding_responses.regrets_or_desires IS 'Synthèse : métier rêvé + valeurs';
COMMENT ON COLUMN public.onboarding_responses.goals           IS 'Synthèse : points forts + langues';
COMMENT ON COLUMN public.onboarding_responses.raw_answers     IS 'Objet JSON complet du formulaire (toutes les réponses)';

-- ── RLS : onboarding_responses ───────────────────────────────────
ALTER TABLE public.onboarding_responses ENABLE ROW LEVEL SECURITY;

-- Lecture : seulement ses propres réponses
CREATE POLICY "onboarding_responses: select own"
  ON public.onboarding_responses
  FOR SELECT
  USING (auth.uid() = user_id);

-- Insertion : utilisateur connecté (lié à son uid) OU anonyme (user_id NULL)
CREATE POLICY "onboarding_responses: insert own or anonymous"
  ON public.onboarding_responses
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    OR user_id IS NULL
  );

-- ── Index : onboarding_responses ─────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_onboarding_user_id
  ON public.onboarding_responses (user_id)
  WHERE user_id IS NOT NULL;


-- ════════════════════════════════════════════════════════════════════
-- TABLE 3 : reports
-- Rapport IA généré pour chaque onboarding.
-- Cycle de statut : draft → generated → paid → emailed | failed
-- user_id nullable : rapport peut exister avant connexion.
-- ════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.reports (
  id                     UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  onboarding_response_id UUID        REFERENCES public.onboarding_responses(id) ON DELETE SET NULL,
  title                  TEXT,
  summary                TEXT,
  full_report            JSONB       NOT NULL DEFAULT '{}',
  pdf_url                TEXT,
  status                 TEXT        NOT NULL DEFAULT 'draft'
                           CHECK (status IN ('draft', 'generated', 'paid', 'emailed', 'failed')),
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  public.reports                     IS 'Rapports IA — cycle : draft→generated→paid→emailed→failed';
COMMENT ON COLUMN public.reports.full_report         IS 'Tableau JSON des trajectoires générées par OpenAI';
COMMENT ON COLUMN public.reports.status              IS 'draft | generated | paid | emailed | failed';

-- Trigger updated_at
DROP TRIGGER IF EXISTS trg_reports_updated_at ON public.reports;
CREATE TRIGGER trg_reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── RLS : reports ────────────────────────────────────────────────
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Un utilisateur connecté lit uniquement ses propres rapports
CREATE POLICY "reports: select own"
  ON public.reports
  FOR SELECT
  USING (auth.uid() = user_id);

-- ── Index : reports ──────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_reports_user_id
  ON public.reports (user_id)
  WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_reports_onboarding_response_id
  ON public.reports (onboarding_response_id)
  WHERE onboarding_response_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_reports_status
  ON public.reports (status);


-- ════════════════════════════════════════════════════════════════════
-- TABLE 4 : payments
-- Enregistrements des transactions Stripe.
-- ACCÈS SERVEUR UNIQUEMENT — aucune policy publique → RLS bloque tout.
-- ════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.payments (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  report_id          UUID        REFERENCES public.reports(id)  ON DELETE SET NULL,
  stripe_session_id  TEXT        NOT NULL,
  stripe_customer_id TEXT,
  amount_total       INTEGER     NOT NULL,
  currency           TEXT        NOT NULL DEFAULT 'eur',
  payment_status     TEXT        NOT NULL,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_payments_stripe_session UNIQUE (stripe_session_id)
);

COMMENT ON TABLE  public.payments                  IS 'Transactions Stripe — service_role uniquement, RLS bloque accès public';
COMMENT ON COLUMN public.payments.amount_total     IS 'Montant en centimes (499 = 4,99 €)';
COMMENT ON COLUMN public.payments.stripe_session_id IS 'Clé d''unicité pour idempotence Stripe';

-- ── RLS : payments — AUCUNE POLICY PUBLIQUE ──────────────────────
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
-- La service_role key bypass le RLS automatiquement.
-- Les rôles anon/authenticated n'ont aucun accès.

-- ── Index : payments ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_payments_user_id
  ON public.payments (user_id)
  WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_payments_report_id
  ON public.payments (report_id)
  WHERE report_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_stripe_session_id
  ON public.payments (stripe_session_id);


-- ════════════════════════════════════════════════════════════════════
-- TABLE 5 : email_logs
-- Journal d'audit de chaque email envoyé via Resend.
-- ACCÈS SERVEUR UNIQUEMENT — aucune policy publique.
-- ════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.email_logs (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  report_id       UUID        REFERENCES public.reports(id)  ON DELETE SET NULL,
  payment_id      UUID        REFERENCES public.payments(id) ON DELETE SET NULL,
  resend_email_id TEXT,
  recipient_email TEXT        NOT NULL,
  status          TEXT        NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'sent', 'failed')),
  error_message   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  public.email_logs                  IS 'Journal des emails Resend — service_role uniquement';
COMMENT ON COLUMN public.email_logs.resend_email_id  IS 'ID retourné par l''API Resend après envoi';
COMMENT ON COLUMN public.email_logs.status           IS 'pending | sent | failed';

-- ── RLS : email_logs — AUCUNE POLICY PUBLIQUE ────────────────────
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- ── Index : email_logs ───────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_email_logs_user_id
  ON public.email_logs (user_id)
  WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_email_logs_report_id
  ON public.email_logs (report_id)
  WHERE report_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_email_logs_payment_id
  ON public.email_logs (payment_id)
  WHERE payment_id IS NOT NULL;


-- ════════════════════════════════════════════════════════════════════
-- TABLE 6 : webhook_events
-- Table d'idempotence pour tous les webhooks entrants (Stripe, etc.).
-- Garantit qu'un même event_id n'est jamais traité deux fois.
-- ACCÈS SERVEUR UNIQUEMENT — aucune policy publique.
-- ════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.webhook_events (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  provider   TEXT        NOT NULL,
  event_id   TEXT        NOT NULL,
  event_type TEXT        NOT NULL,
  processed  BOOLEAN     NOT NULL DEFAULT FALSE,
  payload    JSONB       NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_webhook_events_event_id UNIQUE (event_id)
);

COMMENT ON TABLE  public.webhook_events           IS 'Idempotence des webhooks — service_role uniquement';
COMMENT ON COLUMN public.webhook_events.provider  IS 'stripe | resend | ...';
COMMENT ON COLUMN public.webhook_events.event_id  IS 'ID unique de l''événement (ex: evt_xxx Stripe)';
COMMENT ON COLUMN public.webhook_events.processed IS 'TRUE quand le traitement est terminé avec succès';
COMMENT ON COLUMN public.webhook_events.payload   IS 'Corps brut de l''événement pour audit / rejeu';

-- ── RLS : webhook_events — AUCUNE POLICY PUBLIQUE ────────────────
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

-- ── Index : webhook_events ───────────────────────────────────────
CREATE UNIQUE INDEX IF NOT EXISTS idx_webhook_events_event_id
  ON public.webhook_events (event_id);

CREATE INDEX IF NOT EXISTS idx_webhook_events_provider
  ON public.webhook_events (provider);

-- Index partiel : optimise la requête "événements non traités"
CREATE INDEX IF NOT EXISTS idx_webhook_events_unprocessed
  ON public.webhook_events (created_at)
  WHERE processed = FALSE;


-- ════════════════════════════════════════════════════════════════════
-- VÉRIFICATION FINALE
-- Requête utile après migration pour contrôler les policies actives :
--
--   SELECT schemaname, tablename, policyname, cmd, qual
--   FROM pg_policies
--   WHERE schemaname = 'public'
--   ORDER BY tablename, policyname;
--
-- Et les index :
--
--   SELECT indexname, tablename, indexdef
--   FROM pg_indexes
--   WHERE schemaname = 'public'
--   ORDER BY tablename, indexname;
-- ════════════════════════════════════════════════════════════════════
