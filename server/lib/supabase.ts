import { createClient } from '@supabase/supabase-js'
import { env } from '../config/env'

export const supabase = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
  auth: { persistSession: false },
})

export interface ReportRow {
  id: string
  email: string
  first_name: string
  onboarding_data: Record<string, unknown>
  report_full: string | null
  status: 'generating' | 'ready' | 'paid' | 'complete'
  stripe_session_id: string | null
  created_at: string
  updated_at: string
}

export async function createReport(
  email: string,
  firstName: string,
  onboardingData: Record<string, unknown>
): Promise<ReportRow> {
  const { data, error } = await supabase
    .from('reports')
    .insert({
      email,
      first_name: firstName,
      onboarding_data: onboardingData,
      status: 'generating',
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as ReportRow
}

export async function updateReportContent(
  id: string,
  reportFull: string
): Promise<void> {
  const { error } = await supabase
    .from('reports')
    .update({ report_full: reportFull, status: 'ready', updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw new Error(error.message)
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

export async function getReportBySessionId(sessionId: string): Promise<ReportRow | null> {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('stripe_session_id', sessionId)
    .single()

  if (error) return null
  return data as ReportRow
}

export async function markReportPaid(id: string, sessionId: string): Promise<void> {
  const { error } = await supabase
    .from('reports')
    .update({
      status: 'paid',
      stripe_session_id: sessionId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) throw new Error(error.message)
}

export async function markReportComplete(id: string): Promise<void> {
  const { error } = await supabase
    .from('reports')
    .update({ status: 'complete', updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw new Error(error.message)
}
