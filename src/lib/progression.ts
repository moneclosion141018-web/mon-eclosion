import { DUREE_MAX_DEFAUT, ESSAIS_POUR_PASSER, FENETRE_ESSAIS } from '../config'
import type { Enfant, Essai, Niveau, Profil, Reglages } from './types'

export const reglagesDefaut: Reglages = {
  dureeMax: DUREE_MAX_DEFAUT,
  grandsBoutons: false,
  sansAnimation: false,
  sons: true,
  sansBruitFort: false,
}

export function reglagesDe(enfant: Enfant | null | undefined): Reglages {
  return { ...reglagesDefaut, ...(enfant?.reglages ?? {}) }
}

// Durée autorisée aujourd'hui en secondes (0 = sans limite).
export function limiteSecondes(enfant: Enfant | null | undefined, jour: string) {
  const r = reglagesDe(enfant)
  if (!r.dureeMax) return 0
  const bonus = r.bonusJour === jour ? (r.bonusMinutes ?? 0) : 0
  return (r.dureeMax + bonus) * 60
}

export function essaisDuNiveau(essais: Essai[], enfant: Enfant, profil: Profil = enfant.profil, niveau: Niveau = enfant.niveau) {
  return essais.filter((e) => e.enfant_id === enfant.id && e.profil === profil && e.niveau === niveau)
}

export function etatNiveau(essais: Essai[], enfant: Enfant) {
  const recents = essaisDuNiveau(essais, enfant).slice(0, FENETRE_ESSAIS)
  const reussis = recents.filter((e) => e.resultat === 'reussi').length
  return { recents: recents.length, reussis, pret: recents.length >= ESSAIS_POUR_PASSER && reussis >= ESSAIS_POUR_PASSER }
}

export type Evolution = 'niveau_suivant' | 'parcours_termine' | 'niveau_precedent' | null

// Appelée après chaque essai (essais triés du plus récent au plus ancien).
export function evolutionApresEssai(essais: Essai[], enfant: Enfant): { evolution: Evolution; patch: Partial<Enfant> } {
  const { recents, reussis, pret } = etatNiveau(essais, enfant)
  const jardin = enfant.scores.jardin ?? { fleurs: 0, arbres: 0 }
  if (pret) {
    if (enfant.niveau < 4) {
      return {
        evolution: 'niveau_suivant',
        patch: { niveau: (enfant.niveau + 1) as Niveau, scores: { ...enfant.scores, jardin: { ...jardin, fleurs: jardin.fleurs + 1 } } },
      }
    }
    if (!enfant.parcours_termine) {
      return {
        evolution: 'parcours_termine',
        patch: { parcours_termine: true, scores: { ...enfant.scores, jardin: { fleurs: jardin.fleurs + 1, arbres: jardin.arbres + 1 } } },
      }
    }
  }
  // Retour discret au niveau précédent si le niveau est clairement trop difficile.
  if (recents >= FENETRE_ESSAIS && reussis <= 2 && enfant.niveau > 1) {
    return { evolution: 'niveau_precedent', patch: { niveau: (enfant.niveau - 1) as Niveau } }
  }
  return { evolution: null, patch: {} }
}

// Profil proposé au parent quand un parcours est terminé (tableau du document).
export function profilSuivant(profil: Profil): Profil | null {
  if (profil === 2) return 1
  if (profil === 1) return 4
  if (profil === 3) return 4
  return null
}

export const NOMS_PROFILS: Record<Profil, { court: string; long: string }> = {
  1: { court: 'Imiter et dire', long: 'Imiter et répéter des sons et des mots' },
  2: { court: 'Comprendre d’abord', long: 'Comprendre d’abord, puis inciter à parler' },
  3: { court: 'Donner du sens', long: 'Accompagner la compréhension des mots' },
  4: { court: 'Échanger', long: 'Communiquer et échanger avec les autres' },
}

export const DESCRIPTIONS_PROFILS: Record<Profil, string> = {
  1: 'Des jeux de sons, de souffle et de gestes, puis les premiers mots.',
  2: 'Regarder, associer des images, découvrir les voyelles, puis les premiers sons.',
  3: 'Relier les mots à leur sens, suivre des consignes, comprendre de petites histoires.',
  4: 'Partager, attendre son tour, reconnaître les émotions et faire de petites conversations.',
}

export const NOMS_NIVEAUX: Record<Profil, Record<Niveau, string>> = {
  1: { 1: 'Les sons et le souffle', 2: 'Les syllabes', 3: 'Je montre, je dis', 4: 'La demande' },
  2: { 1: 'Regarder et associer', 2: 'Un mot, une image', 3: 'La famille de la voyelle', 4: 'Les premiers mots' },
  3: { 1: 'Le mot et la chose', 2: 'Les consignes simples', 3: 'Les mots qui changent le sens', 4: 'Comprendre une petite histoire' },
  4: { 1: 'Regarder et partager', 2: 'Chacun son tour', 3: 'Les émotions', 4: 'Les petites conversations' },
}
