import { jsPDF } from 'jspdf'
import { FICHES, type Fiche } from '../data/exercices'
import { NOMS_NIVEAUX } from './progression'
import type { Niveau, Profil } from './types'

// Fiches à imprimer : tracés en pointillés et coloriages au trait, une page A4 par fiche.
const ENCRE: [number, number, number] = [31, 42, 68]
const GUIDE: [number, number, number] = [150, 165, 195]

function pointilles(doc: jsPDF) {
  doc.setDrawColor(...GUIDE)
  doc.setLineWidth(1.6)
  doc.setLineDashPattern([0.1, 3.2], 0)
  doc.setLineCap('round')
}

function trait(doc: jsPDF, epaisseur = 1.2) {
  doc.setDrawColor(...ENCRE)
  doc.setLineWidth(epaisseur)
  doc.setLineDashPattern([], 0)
  doc.setLineCap('round')
  doc.setLineJoin('round')
}

function depart(doc: jsPDF, x: number, y: number) {
  doc.setLineDashPattern([], 0)
  doc.setFillColor(43, 182, 115)
  doc.circle(x, y, 2.6, 'F')
}

function polyligne(doc: jsPDF, pts: [number, number][]) {
  for (let i = 1; i < pts.length; i++) doc.line(pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1])
}

function coloriage(doc: jsPDF, nom: string, cx: number, cy: number) {
  trait(doc, 1.4)
  const t = 1.6
  switch (nom) {
    case 'ballon':
      doc.ellipse(cx, cy - 10, 38, 42)
      doc.lines([[-3, 14], [4, 12], [-2, 14]], cx, cy + 32)
      break
    case 'pomme':
      doc.circle(cx - 14, cy, 34)
      doc.circle(cx + 14, cy, 34)
      doc.line(cx, cy - 34, cx + 6, cy - 52)
      doc.ellipse(cx + 18, cy - 46, 12, 6)
      break
    case 'chat':
      doc.circle(cx, cy, 40)
      doc.triangle(cx - 36, cy - 18, cx - 30, cy - 58, cx - 8, cy - 38)
      doc.triangle(cx + 36, cy - 18, cx + 30, cy - 58, cx + 8, cy - 38)
      doc.circle(cx - 14, cy - 6, 4)
      doc.circle(cx + 14, cy - 6, 4)
      doc.triangle(cx - 5, cy + 8, cx + 5, cy + 8, cx, cy + 14)
      doc.line(cx - 50, cy + 6, cx - 24, cy + 8)
      doc.line(cx + 50, cy + 6, cx + 24, cy + 8)
      break
    case 'soleil':
      doc.circle(cx, cy, 30)
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4
        doc.line(cx + Math.cos(a) * 38, cy + Math.sin(a) * 38, cx + Math.cos(a) * 56, cy + Math.sin(a) * 56)
      }
      break
    case 'maison':
      doc.triangle(cx - 55, cy - 10, cx, cy - 60, cx + 55, cy - 10)
      doc.rect(cx - 42, cy - 10, 84, 62)
      doc.rect(cx - 12, cy + 18, 24, 34)
      doc.rect(cx + 16, cy + 2, 16, 14)
      break
    case 'cadeau':
      doc.rect(cx - 40, cy - 20, 80, 64)
      doc.rect(cx - 46, cy - 36, 92, 16)
      doc.line(cx, cy - 36, cx, cy + 44)
      doc.ellipse(cx - 14, cy - 46, 14, 8)
      doc.ellipse(cx + 14, cy - 46, 14, 8)
      break
    case 'pain':
      doc.ellipse(cx, cy, 70, 26)
      doc.line(cx - 34, cy - 10, cx - 20, cy + 6)
      doc.line(cx - 6, cy - 12, cx + 8, cy + 6)
      doc.line(cx + 22, cy - 10, cx + 36, cy + 6)
      break
    default:
      doc.circle(cx, cy, 40)
  }
  doc.setLineWidth(t)
}

function dessinerFiche(doc: jsPDF, f: Fiche, enfant: string, profil: Profil, niveau: Niveau) {
  const W = 210
  doc.setTextColor(...ENCRE)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text(`Mon Éclosion · ${NOMS_NIVEAUX[profil][niveau]}`, 15, 15)
  doc.setFont('helvetica', 'normal')
  doc.text(`Prénom : ${enfant}`, W - 15, 15, { align: 'right' })
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(24)
  doc.text(f.titre, W / 2, 32, { align: 'center' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(14)
  doc.text(doc.splitTextToSize(f.consigne, 170), W / 2, 42, { align: 'center' })

  const haut = 60
  if (f.forme === 'ligne') {
    for (let r = 0; r < 5; r++) {
      const y = haut + 20 + r * 44
      pointilles(doc)
      doc.line(30, y, 180, y)
      depart(doc, 26, y)
    }
  } else if (f.forme === 'vague') {
    for (let r = 0; r < 4; r++) {
      const y = haut + 28 + r * 56
      const pts: [number, number][] = []
      for (let i = 0; i <= 120; i++) pts.push([28 + (154 * i) / 120, y + Math.sin((i / 120) * Math.PI * 6) * 12])
      pointilles(doc)
      polyligne(doc, pts)
      depart(doc, 24, y)
    }
  } else if (f.forme === 'rond') {
    pointilles(doc)
    doc.circle(W / 2, haut + 70, 55)
    doc.circle(50, haut + 185, 20)
    doc.circle(W / 2, haut + 185, 20)
    doc.circle(160, haut + 185, 20)
    depart(doc, W / 2 + 55, haut + 70)
  } else if (f.forme === 'lettre') {
    const L = f.lettre ?? 'A'
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(380)
    pointilles(doc)
    doc.setLineWidth(1.4)
    doc.text(L, W / 2, haut + 140, { align: 'center', renderingMode: 'stroke' })
    doc.setFontSize(80)
    doc.text(`${L}  ${L}  ${L}`, W / 2, haut + 215, { align: 'center', renderingMode: 'stroke' })
  } else if (f.forme === 'coloriage') {
    coloriage(doc, f.dessin ?? '', W / 2, haut + 110)
  } else if (f.forme === 'humeur') {
    trait(doc, 1.4)
    doc.circle(W / 2, haut + 95, 70)
    doc.setFontSize(14)
    doc.text('Moi aujourd’hui', W / 2, haut + 185, { align: 'center' })
  }

  doc.setLineDashPattern([], 0)
  doc.setFontSize(10)
  doc.setTextColor(...GUIDE)
  doc.text('Une fois la fiche faite, validez l’exercice dans l’espace parent.', W / 2, 285, { align: 'center' })
}

export function telechargerFiches(enfant: string, profil: Profil, niveaux: Niveau[]) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  let premiere = true
  for (const n of niveaux) {
    for (const f of FICHES[profil][n]) {
      if (!premiere) doc.addPage()
      premiere = false
      dessinerFiche(doc, f, enfant, profil, n)
    }
  }
  const nom = niveaux.length === 1 ? `niveau-${niveaux[0]}` : 'toutes'
  doc.save(`mon-eclosion-fiches-${enfant.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${nom}.pdf`)
}

export function nombreFiches(profil: Profil, niveau: Niveau) {
  return FICHES[profil][niveau].length
}
