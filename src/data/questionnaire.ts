import type { Decor, Profil, Reglages, Scores } from '../lib/types'

export type Partie = 'parole' | 'comprehension' | 'communication'

export interface Question {
  id: string
  partie: Partie
  texte: string
}

export const PARTIES: Record<Partie, string> = {
  parole: 'La parole',
  comprehension: 'La compréhension',
  communication: 'La communication avec les autres',
}

export const QUESTIONS: Question[] = [
  { id: 'p1', partie: 'parole', texte: 'Votre enfant fait-il des sons ou des babillages pour attirer votre attention ?' },
  { id: 'p2', partie: 'parole', texte: 'Votre enfant dit-il quelques mots que vous reconnaissez ?' },
  { id: 'p3', partie: 'parole', texte: 'Votre enfant répète-t-il des mots ou des sons qu’il entend ?' },
  { id: 'p4', partie: 'parole', texte: 'Votre enfant assemble-t-il deux mots ou plus, comme « encore gâteau » ?' },
  { id: 'p5', partie: 'parole', texte: 'Votre enfant utilise-t-il des mots pour demander quelque chose ?' },
  { id: 'c1', partie: 'comprehension', texte: 'Votre enfant se tourne-t-il quand on l’appelle par son prénom ?' },
  { id: 'c2', partie: 'comprehension', texte: 'Votre enfant montre-t-il un objet connu quand vous le nommez, comme « où est le ballon ? » ?' },
  { id: 'c3', partie: 'comprehension', texte: 'Votre enfant suit-il une consigne simple, comme « donne-moi la cuillère » ?' },
  { id: 'c4', partie: 'comprehension', texte: 'Votre enfant suit-il une consigne en deux étapes, comme « prends ton manteau et viens à la porte » ?' },
  { id: 'c5', partie: 'comprehension', texte: 'Votre enfant reconnaît-il des images ou des pictogrammes du quotidien ?' },
  { id: 'm1', partie: 'communication', texte: 'Votre enfant vous regarde-t-il quand vous jouez ensemble ?' },
  { id: 'm2', partie: 'communication', texte: 'Votre enfant vous montre-t-il quelque chose qui l’intéresse, juste pour le partager ?' },
  { id: 'm3', partie: 'communication', texte: 'Votre enfant vous prend-il la main ou fait-il un geste pour obtenir ce qu’il veut ?' },
  { id: 'm4', partie: 'communication', texte: 'Votre enfant répond-il quand on lui pose une question ?' },
  { id: 'm5', partie: 'communication', texte: 'Votre enfant aime-t-il les jeux à tour de rôle, comme se passer un ballon ?' },
]

export const REPONSES = [
  { valeur: 0, label: 'Jamais' },
  { valeur: 1, label: 'Parfois' },
  { valeur: 2, label: 'Souvent' },
]

export const QUESTIONS_CONFORT = [
  { id: 'bruit', texte: 'Les bruits forts ou soudains gênent-ils votre enfant ?', options: REPONSES },
  { id: 'ecran', texte: 'Les écrans très colorés ou animés l’agitent-ils ?', options: REPONSES },
  {
    id: 'attention',
    texte: 'Combien de temps votre enfant reste-t-il concentré sur une activité qu’il aime ?',
    options: [
      { valeur: 0, label: 'Moins de 2 minutes' },
      { valeur: 1, label: 'De 2 à 5 minutes' },
      { valeur: 2, label: 'Plus de 5 minutes' },
    ],
  },
] as const

export const INTERETS = [
  { id: 'animaux', label: 'Les animaux' },
  { id: 'voitures', label: 'Les voitures' },
  { id: 'musique', label: 'La musique' },
  { id: 'couleurs', label: 'Les couleurs' },
  { id: 'autre', label: 'Autre chose' },
]

export type NiveauPartie = 'a_decouvrir' | 'en_progres' | 'acquis'

export function niveauPartie(score: number): NiveauPartie {
  if (score <= 3) return 'a_decouvrir'
  if (score <= 7) return 'en_progres'
  return 'acquis'
}

export const LIBELLES_NIVEAU: Record<NiveauPartie, string> = {
  a_decouvrir: 'À découvrir',
  en_progres: 'En progrès',
  acquis: 'Acquis',
}

export function calculerScores(reponses: Record<string, number>) {
  const somme = (p: Partie) => QUESTIONS.filter((q) => q.partie === p).reduce((t, q) => t + (reponses[q.id] ?? 0), 0)
  return { parole: somme('parole'), comprehension: somme('comprehension'), communication: somme('communication') }
}

// Tableau d'orientation du document Mon Éclosion.
export function profilDeDepart(s: { parole: number; comprehension: number; communication: number }): Profil {
  const p = niveauPartie(s.parole)
  const c = niveauPartie(s.comprehension)
  if (p === 'a_decouvrir') return c === 'a_decouvrir' ? 2 : 1
  if (c !== 'acquis') return 3
  return 4
}

export function decorDepuisInteret(interet: string | null): Decor {
  if (interet === 'voitures') return 'garage'
  if (interet === 'animaux') return 'ferme'
  return 'jardin'
}

export function reglagesDepuisConfort(confort: Scores['confort']): Partial<Reglages> {
  if (!confort) return {}
  return {
    sansBruitFort: confort.bruit >= 1,
    sansAnimation: confort.ecran === 2,
  }
}

// Nombre d'exercices par séance selon la concentration indiquée.
export function exercicesParSeance(confort: Scores['confort']) {
  if (!confort) return 5
  return [3, 4, 5][confort.attention] ?? 5
}
