/**
 * Traduit les messages d'erreur Supabase Auth (anglais) en français.
 * Supabase ne retourne pas encore de messages localisés nativement.
 */

const ERROR_MAP: Record<string, string> = {
  // Connexion
  'Invalid login credentials':
    'Email ou mot de passe incorrect.',
  'Email not confirmed':
    'Veuillez confirmer votre email avant de vous connecter.',
  'Too many requests':
    'Trop de tentatives. Réessayez dans quelques minutes.',

  // Inscription
  'User already registered':
    'Un compte existe déjà avec cet email.',
  'Password should be at least 6 characters':
    'Le mot de passe doit contenir au moins 6 caractères.',
  'Signup requires a valid password':
    'Mot de passe invalide.',
  'Unable to validate email address: invalid format':
    'Adresse email invalide.',

  // Session / token
  'Token has expired or is invalid':
    'Session expirée. Veuillez vous reconnecter.',
  'JWT expired':
    'Session expirée. Veuillez vous reconnecter.',
  'refresh_token_not_found':
    'Session introuvable. Veuillez vous reconnecter.',

  // Réinitialisation
  'Email rate limit exceeded':
    'Trop d\'emails envoyés. Réessayez dans quelques minutes.',

  // Génériques
  'Network request failed':
    'Erreur réseau. Vérifiez votre connexion.',
  'AuthRetryableFetchError':
    'Erreur réseau. Vérifiez votre connexion.',
}

export function translateAuthError(message: string): string {
  // Correspondance exacte
  if (ERROR_MAP[message]) return ERROR_MAP[message]

  // Correspondance partielle (certains messages Supabase contiennent des détails variables)
  for (const [key, value] of Object.entries(ERROR_MAP)) {
    if (message.toLowerCase().includes(key.toLowerCase())) return value
  }

  return message
}
