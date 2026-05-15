import { createClient } from '@supabase/supabase-js'
import ws from 'ws'
import { env } from '../config/env'

// Client service_role : bypass RLS — réservé au backend uniquement
export const supabase = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
  auth: { persistSession: false },
  realtime: { transport: ws },
})

// ── Types ─────────────────────────────────────────────────────────

export interface ProfileRow {
  id: string
  email: string
  full_name: string | null
  created_at: string
  updated_at: string
}

export interface OnboardingResponseRow {
  id: string
  user_id: string | null
  current_situation: string | null
  regrets_or_desires: string | null
  goals: string | null
  cv_file_url: string | null
  raw_answers: Record<string, unknown>
  created_at: string
}

export interface ReportRow {
  id: string
  user_id: string | null
  onboarding_response_id: string | null
  title: string | null
  summary: string | null
  full_report: unknown     // GeneratedReport object (new) or Trajectory[] (legacy)
  pdf_url: string | null
  status: 'draft' | 'generated' | 'paid' | 'emailed' | 'failed'
  created_at: string
  updated_at: string
}

export interface PaymentRow {
  id: string
  user_id: string | null
  report_id: string | null
  stripe_session_id: string
  stripe_customer_id: string | null
  amount_total: number
  currency: string
  payment_status: string
  created_at: string
}

export interface EmailLogRow {
  id: string
  user_id: string | null
  report_id: string | null
  payment_id: string | null
  resend_email_id: string | null
  recipient_email: string
  status: 'pending' | 'sent' | 'failed'
  error_message: string | null
  created_at: string
}

export interface WebhookEventRow {
  id: string
  provider: string
  event_id: string
  event_type: string
  processed: boolean
  payload: Record<string, unknown>
  created_at: string
}

// ── onboarding_responses ──────────────────────────────────────────

export interface CreateOnboardingResponseInput {
  user_id?: string | null
  current_situation: string
  regrets_or_desires: string
  goals: string
  cv_file_url?: string | null
  raw_answers: Record<string, unknown>
}

export async function createOnboardingResponse(
  input: CreateOnboardingResponseInput
): Promise<OnboardingResponseRow> {
  const { data, error } = await supabase
    .from('onboarding_responses')
    .insert({
      user_id:            input.user_id ?? null,
      current_situation:  input.current_situation,
      regrets_or_desires: input.regrets_or_desires,
      goals:              input.goals,
      cv_file_url:        input.cv_file_url ?? null,
      raw_answers:        input.raw_answers,
    })
    .select()
    .single()

  if (error) throw new Error(`[supabase] createOnboardingResponse: ${error.message}`)
  return data as OnboardingResponseRow
}

// ── reports ───────────────────────────────────────────────────────

export interface CreateReportInput {
  user_id?: string | null
  onboarding_response_id: string
  title: string
  summary: string
  full_report: unknown
}

export async function createReport(input: CreateReportInput): Promise<ReportRow> {
  const { data, error } = await supabase
    .from('reports')
    .insert({
      user_id:                input.user_id ?? null,
      onboarding_response_id: input.onboarding_response_id,
      title:                  input.title,
      summary:                input.summary,
      full_report:            input.full_report,
      status:                 'generated',
    })
    .select()
    .single()

  if (error) throw new Error(`[supabase] createReport: ${error.message}`)
  return data as ReportRow
}

export async function getReport(id: string): Promise<ReportRow | null> {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data as ReportRow
}

export async function updateReportStatus(
  id: string,
  status: ReportRow['status']
): Promise<void> {
  const { error } = await supabase
    .from('reports')
    .update({ status })
    .eq('id', id)

  if (error) throw new Error(`[supabase] updateReportStatus: ${error.message}`)
}

// ── payments ──────────────────────────────────────────────────────

export interface CreatePaymentInput {
  user_id?: string | null
  report_id?: string | null
  stripe_session_id: string
  stripe_customer_id?: string | null
  amount_total: number
  currency?: string
  payment_status: string
}

export async function createPayment(input: CreatePaymentInput): Promise<PaymentRow> {
  const { data, error } = await supabase
    .from('payments')
    .insert({
      user_id:            input.user_id ?? null,
      report_id:          input.report_id ?? null,
      stripe_session_id:  input.stripe_session_id,
      stripe_customer_id: input.stripe_customer_id ?? null,
      amount_total:       input.amount_total,
      currency:           input.currency ?? 'eur',
      payment_status:     input.payment_status,
    })
    .select()
    .single()

  if (error) throw new Error(`[supabase] createPayment: ${error.message}`)
  return data as PaymentRow
}

// ── email_logs ────────────────────────────────────────────────────

export interface CreateEmailLogInput {
  user_id?: string | null
  report_id?: string | null
  payment_id?: string | null
  recipient_email: string
  status?: EmailLogRow['status']
}

export async function createEmailLog(input: CreateEmailLogInput): Promise<EmailLogRow> {
  const { data, error } = await supabase
    .from('email_logs')
    .insert({
      user_id:         input.user_id ?? null,
      report_id:       input.report_id ?? null,
      payment_id:      input.payment_id ?? null,
      recipient_email: input.recipient_email,
      status:          input.status ?? 'pending',
    })
    .select()
    .single()

  if (error) throw new Error(`[supabase] createEmailLog: ${error.message}`)
  return data as EmailLogRow
}

export async function updateEmailLog(
  id: string,
  status: EmailLogRow['status'],
  resendEmailId?: string,
  errorMessage?: string
): Promise<void> {
  const { error } = await supabase
    .from('email_logs')
    .update({
      status,
      resend_email_id: resendEmailId ?? null,
      error_message:   errorMessage ?? null,
    })
    .eq('id', id)

  if (error) throw new Error(`[supabase] updateEmailLog: ${error.message}`)
}

// ── webhook_events ────────────────────────────────────────────────

export async function isWebhookProcessed(eventId: string): Promise<boolean> {
  const { data } = await supabase
    .from('webhook_events')
    .select('id, processed')
    .eq('event_id', eventId)
    .single()

  return data?.processed === true
}

export async function insertWebhookEvent(
  provider: string,
  eventId: string,
  eventType: string,
  payload: Record<string, unknown>
): Promise<WebhookEventRow> {
  const { data, error } = await supabase
    .from('webhook_events')
    .insert({ provider, event_id: eventId, event_type: eventType, payload })
    .select()
    .single()

  if (error) {
    // Contrainte UNIQUE violée = événement déjà enregistré → idempotent
    if (error.code === '23505') {
      const { data: existing } = await supabase
        .from('webhook_events')
        .select('*')
        .eq('event_id', eventId)
        .single()
      return existing as WebhookEventRow
    }
    throw new Error(`[supabase] insertWebhookEvent: ${error.message}`)
  }

  return data as WebhookEventRow
}

export async function markWebhookProcessed(id: string): Promise<void> {
  const { error } = await supabase
    .from('webhook_events')
    .update({ processed: true })
    .eq('id', id)

  if (error) throw new Error(`[supabase] markWebhookProcessed: ${error.message}`)
}
