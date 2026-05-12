import { Resend } from 'resend'
import { env } from '../config/env'

const resend = new Resend(env.resendApiKey)
const FROM = env.fromEmail || 'OtherMe <noreply@otherme.app>'

export async function sendReportEmail(
  to: string,
  firstName: string,
  pdfBuffer: Buffer
): Promise<void> {
  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject: `${firstName}, ton rapport OtherMe est prêt !`,
    html: buildEmailHTML(firstName),
    attachments: [
      {
        filename: `OtherMe-rapport-${firstName}.pdf`,
        content: pdfBuffer.toString('base64'),
      },
    ],
  })

  if (error) throw new Error(`Erreur Resend : ${error.message}`)
}

function buildEmailHTML(firstName: string): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Ton rapport OtherMe</title>
</head>
<body style="margin:0;padding:0;background:#0a0a18;font-family:Inter,Arial,sans-serif;color:#e2e8f0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a18;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#4c1d95,#7c3aed);padding:40px 40px 30px;border-radius:16px 16px 0 0;text-align:center;">
              <p style="margin:0 0 8px;color:#c4b5fd;font-size:13px;font-weight:600;letter-spacing:2px;text-transform:uppercase;">OtherMe</p>
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:800;">Tes autres vies sont prêtes</h1>
              <p style="margin:12px 0 0;color:#ddd6fe;font-size:15px;">Bonjour ${firstName}, ton rapport personnalisé est en pièce jointe.</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#13131f;padding:36px 40px;">
              <p style="margin:0 0 20px;color:#94a3b8;font-size:15px;line-height:1.7;">
                Ton rapport <strong style="color:#e2e8f0;">OtherMe</strong> contient 3 trajectoires de vie alternatives
                générées spécialement pour toi, avec pour chacune :
              </p>

              <table cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:28px;">
                ${[
                  ['🛤️', '3 trajectoires personnalisées', 'Basées sur ton parcours et tes aspirations'],
                  ['📅', 'Plan d\'action concret', 'Des jalons précis pour chaque trajectoire'],
                  ['📊', 'Score de faisabilité', 'Une analyse honnête de chaque voie'],
                  ['🎯', 'Compétences clés', 'Ce que tu dois développer pour y arriver'],
                ]
                  .map(
                    ([icon, title, desc]) => `
                <tr>
                  <td style="padding:8px 0;vertical-align:top;">
                    <table cellpadding="0" cellspacing="0" style="width:100%;">
                      <tr>
                        <td style="width:40px;vertical-align:middle;font-size:20px;">${icon}</td>
                        <td style="vertical-align:middle;">
                          <strong style="color:#e2e8f0;font-size:14px;">${title}</strong>
                          <p style="margin:2px 0 0;color:#64748b;font-size:13px;">${desc}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>`,
                  )
                  .join('')}
              </table>

              <div style="background:#1e1040;border-radius:10px;padding:20px;border-left:3px solid #7c3aed;margin-bottom:28px;">
                <p style="margin:0;color:#c4b5fd;font-size:14px;font-style:italic;">
                  "La meilleure façon de prédire ton avenir, c'est de le créer."
                </p>
              </div>

              <p style="margin:0;color:#64748b;font-size:13px;line-height:1.6;">
                Ce rapport est confidentiel et généré uniquement pour toi. Si tu as des questions,
                réponds simplement à cet email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#0d0d1e;padding:24px 40px;border-radius:0 0 16px 16px;text-align:center;">
              <p style="margin:0 0 6px;color:#4a4a7a;font-size:12px;">
                © ${new Date().getFullYear()} OtherMe · Tous droits réservés
              </p>
              <p style="margin:0;color:#2a2a4a;font-size:11px;">
                Tu as reçu cet email car tu as généré un rapport sur OtherMe.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}
