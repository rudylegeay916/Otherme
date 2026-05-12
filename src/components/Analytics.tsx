/**
 * Injecte Google Analytics 4 et Microsoft Clarity de façon non bloquante.
 * Ne charge les scripts que si les IDs correspondants sont définis dans .env.
 * Rend null — pas de rendu visible.
 */
import { useEffect } from 'react'
import { clientEnv } from '../config/env'

declare global {
  interface Window {
    dataLayer: unknown[]
    gtag: (...args: unknown[]) => void
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    clarity: (...args: any[]) => void
  }
}

function injectScript(src: string): void {
  if (document.querySelector(`script[src="${src}"]`)) return
  const s = document.createElement('script')
  s.src = src
  s.async = true
  document.head.appendChild(s)
}

function initGA4(measurementId: string): void {
  injectScript(`https://www.googletagmanager.com/gtag/js?id=${measurementId}`)
  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer.push(args)
  }
  window.gtag('js', new Date())
  window.gtag('config', measurementId)
}

function initClarity(projectId: string): void {
  // Snippet officiel Microsoft Clarity (adapté TypeScript)
  const c = window as typeof window & Record<string, unknown>
  if (c['clarity']) return
  c['clarity'] = function (...args: unknown[]) {
    const fn = c['clarity'] as { q?: unknown[] }
    fn.q = fn.q || []
    fn.q.push(args)
  }
  injectScript(`https://www.clarity.ms/tag/${projectId}`)
}

export default function Analytics() {
  useEffect(() => {
    if (clientEnv.gaMeasurementId) {
      initGA4(clientEnv.gaMeasurementId)
    }
    if (clientEnv.clarityProjectId) {
      initClarity(clientEnv.clarityProjectId)
    }
  }, [])

  return null
}
