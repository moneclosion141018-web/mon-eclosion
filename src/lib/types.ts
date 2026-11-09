export type Profil = 1 | 2 | 3 | 4
export type Niveau = 1 | 2 | 3 | 4
export type Decor = 'jardin' | 'garage' | 'ferme'
export type Resultat = 'reussi' | 'en_cours' | 'a_retravailler' | 'inconnu'

export interface Reglages {
  dureeMax: number // minutes par jour, 0 = sans limite
  grandsBoutons: boolean
  sansAnimation: boolean
  sons: boolean
  sansBruitFort: boolean
  niveauxOuverts: boolean // version de test : tous les niveaux jouables
  bonusJour?: string // jour où le parent a ajouté du temps
  bonusMinutes?: number
}

export interface Scores {
  parole?: number
  comprehension?: number
  communication?: number
  confort?: { bruit: number; ecran: number; attention: number }
  jardin?: { fleurs: number; arbres: number }
}

export interface Enfant {
  id: string
  parent_id?: string
  surnom: string
  age: number | null
  interet: string | null
  profil: Profil
  niveau: Niveau
  decor: Decor
  scores: Scores
  reglages: Partial<Reglages>
  parcours_termine: boolean
  updated_at?: string
}

export interface Essai {
  id: string
  enfant_id: string
  profil: Profil
  niveau: Niveau
  exercice: string
  resultat: Resultat
  created_at: string
}

export interface TempsJeu {
  enfant_id: string
  jour: string // AAAA-MM-JJ
  secondes: number
}
