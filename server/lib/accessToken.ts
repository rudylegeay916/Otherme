import { createHmac, timingSafeEqual } from 'crypto'

const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 jours

function hmac(data: string, secret: string): string {
  return createHmac('sha256', secret).update(data).digest('hex')
}

/**
 * Génère un token signé HMAC-SHA256 lié à un reportId + sessionId.
 * Format : base64url(payload).<hmac_hex>
 */
export function signAccessToken(reportId: string, sessionId: string): string {
  const payload = JSON.stringify({
    reportId,
    sessionId,
    exp: Date.now() + TOKEN_TTL_MS,
  })
  const encoded = Buffer.from(payload).toString('base64url')
  const secret  = process.env.ACCESS_TOKEN_SECRET ?? ''
  return `${encoded}.${hmac(encoded, secret)}`
}

/**
 * Génère un token admin signé HMAC-SHA256.
 * Identique à signAccessToken mais avec isAdmin: true dans le payload.
 * Ce flag permet au serveur de bypasser la vérification de paiement.
 */
export function signAdminAccessToken(reportId: string, adminEmail: string): string {
  const payload = JSON.stringify({
    reportId,
    sessionId: `admin_${adminEmail}`,
    isAdmin: true,
    exp: Date.now() + TOKEN_TTL_MS,
  })
  const encoded = Buffer.from(payload).toString('base64url')
  const secret  = process.env.ACCESS_TOKEN_SECRET ?? ''
  return `${encoded}.${hmac(encoded, secret)}`
}

/**
 * Vérifie un token et retourne sa validité.
 * Rejette : signature incorrecte, token expiré, reportId ne correspondant pas.
 */
export function verifyAccessToken(
  token: string,
  expectedReportId: string
): { valid: boolean; sessionId?: string; isAdmin?: boolean } {
  try {
    const dot = token.lastIndexOf('.')
    if (dot === -1) return { valid: false }

    const encoded = token.slice(0, dot)
    const sig     = token.slice(dot + 1)

    const secret = process.env.ACCESS_TOKEN_SECRET ?? ''
    if (!secret) return { valid: false }

    const expected = hmac(encoded, secret)

    // Comparaison à temps constant pour éviter les timing attacks
    const a = Buffer.from(sig,      'hex')
    const b = Buffer.from(expected, 'hex')
    if (a.length !== b.length || !timingSafeEqual(a, b)) return { valid: false }

    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString()) as {
      reportId:  string
      sessionId: string
      isAdmin?:  boolean
      exp:       number
    }

    if (Date.now() > payload.exp)                    return { valid: false }
    if (payload.reportId !== expectedReportId)       return { valid: false }

    return { valid: true, sessionId: payload.sessionId, isAdmin: payload.isAdmin ?? false }
  } catch {
    return { valid: false }
  }
}

/** Parse la valeur d'un cookie nommé depuis l'en-tête Cookie. */
export function parseCookieHeader(header: string | undefined, name: string): string | undefined {
  if (!header) return undefined
  const entry = header.split(';').find(c => c.trim().startsWith(`${name}=`))
  return entry ? decodeURIComponent(entry.trim().slice(name.length + 1)) : undefined
}

/** Construit la valeur de l'en-tête Set-Cookie pour le token d'accès. */
export function buildAccessCookie(token: string, isProd: boolean): string {
  const encoded = encodeURIComponent(token)
  const secure  = isProd ? ' Secure;' : ''
  return `otherme_report_access=${encoded}; HttpOnly;${secure} SameSite=Strict; Path=/; Max-Age=604800`
}
