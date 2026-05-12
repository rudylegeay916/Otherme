import PDFDocument from 'pdfkit'
import type { Trajectory } from '../../src/types'

const COLORS = {
  bg: '#0a0a18',
  primary: '#7c3aed',
  text: '#e2e8f0',
  muted: '#94a3b8',
  accent: '#a78bfa',
  white: '#ffffff',
  card: '#13131f',
  green: '#4ade80',
  amber: '#fbbf24',
  red: '#f87171',
}

function feasibilityColor(score: number): string {
  if (score >= 70) return COLORS.green
  if (score >= 50) return COLORS.amber
  return COLORS.red
}

export async function generatePDF(
  firstName: string,
  email: string,
  trajectories: Trajectory[]
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const buffers: Buffer[] = []
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 55, right: 55 },
      info: {
        Title: `OtherMe — Rapport de ${firstName}`,
        Author: 'OtherMe',
        Subject: 'Trajectoires de vie alternatives',
      },
    })

    doc.on('data', (chunk: Buffer) => buffers.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(buffers)))
    doc.on('error', reject)

    const W = doc.page.width - 110 // content width
    const L = 55 // left margin

    // ── Cover page ────────────────────────────────────────────
    doc.rect(0, 0, doc.page.width, doc.page.height).fill('#0a0a18')

    // Purple glow circle
    doc.circle(doc.page.width / 2, 280, 200).fill('#1a0a3e')

    // Title
    doc
      .fillColor('#a78bfa')
      .fontSize(14)
      .font('Helvetica-Bold')
      .text('OtherMe', L, 120, { align: 'center', width: W })

    doc
      .fillColor(COLORS.white)
      .fontSize(36)
      .font('Helvetica-Bold')
      .text('Tes Autres Vies', L, 200, { align: 'center', width: W })

    doc
      .fillColor(COLORS.muted)
      .fontSize(14)
      .font('Helvetica')
      .text(`Rapport personnalisé de ${firstName}`, L, 255, { align: 'center', width: W })

    // Date
    const dateStr = new Date().toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric',
    })
    doc
      .fillColor('#4a4a7a')
      .fontSize(11)
      .text(dateStr, L, 290, { align: 'center', width: W })

    // Separator
    doc
      .moveTo(L + W / 3, 340)
      .lineTo(L + (W * 2) / 3, 340)
      .strokeColor('#3a2a6e')
      .lineWidth(1)
      .stroke()

    // Summary
    doc
      .fillColor(COLORS.accent)
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('Ce rapport contient :', L, 370, { align: 'center', width: W })

    const summaryItems = [
      '3 trajectoires de vie alternatives personnalisées',
      'Un plan d\'action détaillé pour chaque trajectoire',
      'Un score de faisabilité personnalisé',
      'Les compétences clés à développer',
    ]
    doc.font('Helvetica').fillColor(COLORS.muted).fontSize(11)
    summaryItems.forEach((item, i) => {
      doc.text(`• ${item}`, L, 400 + i * 22, { align: 'center', width: W })
    })

    // Footer
    doc
      .fillColor('#2a2a4a')
      .fontSize(10)
      .text(`Généré pour ${email}`, L, doc.page.height - 80, { align: 'center', width: W })
    doc
      .fillColor('#1a1a3a')
      .text('otherme.app · Confidentiel', L, doc.page.height - 60, { align: 'center', width: W })

    // ── Trajectory pages ─────────────────────────────────────
    trajectories.forEach((traj, idx) => {
      doc.addPage()
      doc.rect(0, 0, doc.page.width, doc.page.height).fill('#0a0a18')

      // Top accent bar
      const barColors = ['#7c3aed', '#0ea5e9', '#f59e0b']
      doc.rect(0, 0, doc.page.width, 4).fill(barColors[idx] || COLORS.primary)

      // Trajectory number badge
      doc
        .roundedRect(L, 25, 120, 22, 11)
        .fill('#1e1040')

      doc
        .fillColor('#a78bfa')
        .fontSize(9)
        .font('Helvetica-Bold')
        .text(`TRAJECTOIRE #${traj.id}`, L + 10, 31, { width: 100 })

      // Title
      doc
        .fillColor(COLORS.white)
        .fontSize(24)
        .font('Helvetica-Bold')
        .text(traj.title, L, 60, { width: W - 90 })

      // Tagline
      doc
        .fillColor(COLORS.muted)
        .fontSize(12)
        .font('Helvetica-Oblique')
        .text(`"${traj.tagline}"`, L, doc.y + 6, { width: W - 90 })

      // Feasibility score
      const scoreColor = feasibilityColor(traj.feasibilityScore)
      const scoreX = doc.page.width - 55 - 70
      doc
        .fillColor(scoreColor)
        .fontSize(32)
        .font('Helvetica-Bold')
        .text(`${traj.feasibilityScore}%`, scoreX, 60, { width: 70, align: 'right' })
      doc
        .fillColor(COLORS.muted)
        .fontSize(9)
        .font('Helvetica')
        .text('Faisabilité', scoreX, 100, { width: 70, align: 'right' })

      // Separator
      let y = doc.y + 16
      doc.moveTo(L, y).lineTo(L + W, y).strokeColor('#1e1e38').lineWidth(1).stroke()
      y += 16

      // Description
      doc
        .fillColor('#94a3b8')
        .fontSize(8)
        .font('Helvetica-Bold')
        .text('DESCRIPTION', L, y)
      y += 14

      traj.description.forEach((para) => {
        doc
          .fillColor(COLORS.text)
          .fontSize(10)
          .font('Helvetica')
          .text(para, L, y, { width: W, lineGap: 3 })
        y = doc.y + 8
      })

      y += 4
      doc.moveTo(L, y).lineTo(L + W, y).strokeColor('#1e1e38').lineWidth(1).stroke()
      y += 14

      // Timeline
      const halfW = (W - 16) / 2

      doc
        .fillColor('#94a3b8')
        .fontSize(8)
        .font('Helvetica-Bold')
        .text('PLAN D\'ACTION', L, y)

      y += 14
      traj.timeline.forEach((step) => {
        // Bullet
        doc.circle(L + 4, y + 5, 3).fill('#4c1d95')

        doc
          .fillColor('#a78bfa')
          .fontSize(9)
          .font('Helvetica-Bold')
          .text(step.year, L + 12, y, { width: 80 })

        doc
          .fillColor(COLORS.text)
          .fontSize(9)
          .font('Helvetica')
          .text(step.event, L + 100, y, { width: W - 100, lineGap: 2 })

        y = doc.y + 6
      })

      y += 4
      doc.moveTo(L, y).lineTo(L + W, y).strokeColor('#1e1e38').lineWidth(1).stroke()
      y += 14

      // Skills
      doc
        .fillColor('#94a3b8')
        .fontSize(8)
        .font('Helvetica-Bold')
        .text('COMPÉTENCES À DÉVELOPPER', L, y)
      y += 14

      let skillX = L
      traj.skillsToDevlop.forEach((skill) => {
        const skillW = skill.length * 6.2 + 16
        if (skillX + skillW > L + W) {
          skillX = L
          y += 22
        }
        doc.roundedRect(skillX, y, skillW, 18, 9).fill('#1e1040')
        doc
          .fillColor('#a78bfa')
          .fontSize(8.5)
          .font('Helvetica')
          .text(skill, skillX + 8, y + 5, { width: skillW - 16 })
        skillX += skillW + 8
      })

      y += 28

      // Feasibility note
      if (traj.feasibilityNote) {
        doc
          .roundedRect(L, y, W, 40, 6)
          .fill('#0f0f24')

        doc
          .fillColor(scoreColor)
          .fontSize(8)
          .font('Helvetica-Bold')
          .text('NOTE DE FAISABILITÉ', L + 10, y + 8)

        doc
          .fillColor(COLORS.muted)
          .fontSize(9)
          .font('Helvetica')
          .text(traj.feasibilityNote, L + 10, y + 20, { width: W - 20 })
      }

      // Page footer
      doc
        .fillColor('#2a2a4a')
        .fontSize(9)
        .text(`OtherMe · Rapport de ${firstName} · ${dateStr}`, L, doc.page.height - 40, {
          align: 'center',
          width: W,
        })

      doc
        .fillColor('#1e1e38')
        .text(`${idx + 1} / ${trajectories.length}`, L, doc.page.height - 25, {
          align: 'right',
          width: W,
        })
    })

    doc.end()
  })
}
