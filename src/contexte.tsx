import type { Session } from '@supabase/supabase-js'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { empreinteCode } from './lib/code'
import { evolutionApresEssai, reglagesDe, type Evolution } from './lib/progression'
import { reglerSons } from './lib/sons'
import {
  ajouterOperation,
  aujourdhui,
  donneesVides,
  ecrireLocal,
  fusionnerDistant,
  lireLocal,
  nouvelId,
  viderFile,
  type Donnees,
  type Operation,
} from './lib/store'
import { supabase } from './lib/supabase'
import type { Enfant, Essai, Niveau, Resultat } from './lib/types'

interface Contexte {
  session: Session | null
  pret: boolean
  enLigne: boolean
  donnees: Donnees
  enfant: Enfant | null
  parentDeverrouille: boolean
  choisirEnfant: (id: string | null) => void
  deverrouillerParent: (ok: boolean) => void
  definirCode: (code: string) => Promise<void>
  verifierCode: (code: string) => Promise<boolean>
  ajouterEnfant: (e: Omit<Enfant, 'id'>) => Promise<string>
  majEnfant: (id: string, patch: Partial<Enfant>) => Promise<void>
  supprimerEnfant: (id: string) => Promise<void>
  ajouterBilan: (niveau: Niveau, lignes: { exercice: string; resultat: Resultat }[]) => Promise<Evolution>
  ajouterTemps: (secondes: number) => void
  secondesAujourdhui: number
  deconnecter: () => Promise<void>
}

const Ctx = createContext<Contexte | null>(null)

export function useApp() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useApp hors du fournisseur')
  return c
}

const CLE_ENFANT = 'mon-eclosion:enfant-actif'

export function FournisseurApp({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [pret, setPret] = useState(false)
  const [enLigne, setEnLigne] = useState(navigator.onLine)
  const [donnees, setDonnees] = useState<Donnees>(donneesVides())
  const [enfantId, setEnfantId] = useState<string | null>(() => localStorage.getItem(CLE_ENFANT))
  const [parentDeverrouille, setParentDeverrouille] = useState(false)
  const ref = useRef(donnees)
  const userId = session?.user.id ?? null

  // Sauvegarde locale + tentative d'envoi
  const enregistrer = useCallback(
    async (suivant: Donnees, operations: Operation[] = []) => {
      if (!userId) return
      let file = suivant.file
      for (const op of operations) file = ajouterOperation(file, op)
      let d = { ...suivant, file }
      ref.current = d
      setDonnees(d)
      await ecrireLocal(userId, d)
      if (navigator.onLine && file.length) {
        const reste = await viderFile(file)
        d = { ...ref.current, file: reste.concat(ref.current.file.slice(file.length)) }
        ref.current = d
        setDonnees(d)
        await ecrireLocal(userId, d)
      }
    },
    [userId],
  )

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      if (!data.session) setPret(true)
    })
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    const enLigneOn = () => setEnLigne(true)
    const enLigneOff = () => setEnLigne(false)
    window.addEventListener('online', enLigneOn)
    window.addEventListener('offline', enLigneOff)
    return () => {
      data.subscription.unsubscribe()
      window.removeEventListener('online', enLigneOn)
      window.removeEventListener('offline', enLigneOff)
    }
  }, [])

  // Chargement des données du compte
  useEffect(() => {
    if (!userId) {
      setDonnees(donneesVides())
      ref.current = donneesVides()
      return
    }
    let annule = false
    ;(async () => {
      const local = await lireLocal(userId)
      if (annule) return
      ref.current = local
      setDonnees(local)
      setPret(true)
      if (navigator.onLine) {
        try {
          const reste = await viderFile(local.file)
          const fusion = await fusionnerDistant(userId, { ...local, file: reste })
          if (annule) return
          ref.current = fusion
          setDonnees(fusion)
          await ecrireLocal(userId, fusion)
          // Crée la ligne parent si elle n'existe pas encore.
          await supabase.from('parents').upsert({ id: userId, code_parent_hash: fusion.codeHash }, { onConflict: 'id' })
        } catch {
          /* hors connexion ou serveur injoignable : on reste sur les données locales */
        }
      }
    })()
    return () => {
      annule = true
    }
  }, [userId])

  // Renvoi de la file au retour de la connexion
  useEffect(() => {
    if (enLigne && userId && ref.current.file.length) void enregistrer(ref.current)
  }, [enLigne, userId, enregistrer])

  const enfant = useMemo(() => donnees.enfants.find((e) => e.id === enfantId) ?? null, [donnees.enfants, enfantId])

  useEffect(() => {
    const r = reglagesDe(enfant)
    reglerSons(r.sons, r.sansBruitFort)
    document.documentElement.dataset.grandsBoutons = String(r.grandsBoutons)
    document.documentElement.dataset.sansAnimation = String(r.sansAnimation)
  }, [enfant])

  const choisirEnfant = useCallback((id: string | null) => {
    setEnfantId(id)
    if (id) localStorage.setItem(CLE_ENFANT, id)
    else localStorage.removeItem(CLE_ENFANT)
  }, [])

  const definirCode = useCallback(
    async (code: string) => {
      if (!userId) return
      const h = await empreinteCode(code, userId)
      await enregistrer({ ...ref.current, codeHash: h }, [{ table: 'parents', type: 'upsert', ligne: { id: userId, code_parent_hash: h } }])
    },
    [userId, enregistrer],
  )

  const verifierCode = useCallback(
    async (code: string) => {
      if (!userId || !ref.current.codeHash) return false
      return (await empreinteCode(code, userId)) === ref.current.codeHash
    },
    [userId],
  )

  const ligneEnfant = (e: Enfant) => ({
    id: e.id,
    parent_id: userId,
    surnom: e.surnom,
    age: e.age,
    interet: e.interet,
    profil: e.profil,
    niveau: e.niveau,
    decor: e.decor,
    scores: e.scores,
    reglages: e.reglages,
    parcours_termine: e.parcours_termine,
  })

  const ajouterEnfant = useCallback(
    async (e: Omit<Enfant, 'id'>) => {
      const nouvel: Enfant = { ...e, id: nouvelId() }
      await enregistrer({ ...ref.current, enfants: [...ref.current.enfants, nouvel] }, [
        { table: 'enfants', type: 'upsert', ligne: ligneEnfant(nouvel) },
      ])
      return nouvel.id
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [enregistrer, userId],
  )

  const majEnfant = useCallback(
    async (id: string, patch: Partial<Enfant>) => {
      const avant = ref.current.enfants.find((e) => e.id === id)
      if (!avant) return
      const apres = { ...avant, ...patch }
      await enregistrer({ ...ref.current, enfants: ref.current.enfants.map((e) => (e.id === id ? apres : e)) }, [
        { table: 'enfants', type: 'upsert', ligne: ligneEnfant(apres) },
      ])
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [enregistrer, userId],
  )

  const supprimerEnfant = useCallback(
    async (id: string) => {
      await enregistrer(
        {
          ...ref.current,
          enfants: ref.current.enfants.filter((e) => e.id !== id),
          essais: ref.current.essais.filter((e) => e.enfant_id !== id),
          temps: ref.current.temps.filter((t) => t.enfant_id !== id),
        },
        [{ table: 'enfants', type: 'delete', ligne: { id } }],
      )
      if (enfantId === id) choisirEnfant(null)
    },
    [enregistrer, enfantId, choisirEnfant],
  )

  // Enregistre le bilan de fin de séance fait par le parent.
  const ajouterBilan = useCallback(
    async (niveau: Niveau, lignes: { exercice: string; resultat: Resultat }[]): Promise<Evolution> => {
      const e = ref.current.enfants.find((x) => x.id === enfantId)
      if (!e || !userId || !lignes.length) return null
      const t0 = Date.now()
      // Le plus récent en premier, comme le reste de la liste.
      const nouveaux: Essai[] = lignes
        .map((l, i) => ({
          id: nouvelId(),
          enfant_id: e.id,
          profil: e.profil,
          niveau,
          exercice: l.exercice,
          resultat: l.resultat,
          created_at: new Date(t0 + i).toISOString(),
        }))
        .reverse()
      const essais = [...nouveaux, ...ref.current.essais]
      // La progression ne bouge que si l'enfant a joué son niveau en cours.
      const { evolution, patch } = niveau === e.niveau ? evolutionApresEssai(essais, e) : { evolution: null, patch: {} }
      const ops: Operation[] = nouveaux.map((essai) => ({ table: 'essais', type: 'upsert', ligne: { ...essai, parent_id: userId } }))
      let enfants = ref.current.enfants
      if (evolution) {
        const apres = { ...e, ...patch }
        enfants = enfants.map((x) => (x.id === e.id ? apres : x))
        ops.push({ table: 'enfants', type: 'upsert', ligne: ligneEnfant(apres) })
      }
      await enregistrer({ ...ref.current, essais, enfants }, ops)
      return evolution
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [enfantId, userId, enregistrer],
  )

  const ajouterTemps = useCallback(
    (secondes: number) => {
      if (!enfantId || !userId || secondes <= 0) return
      const jour = aujourdhui()
      const avant = ref.current.temps.find((t) => t.enfant_id === enfantId && t.jour === jour)
      const ligne = { enfant_id: enfantId, jour, secondes: (avant?.secondes ?? 0) + secondes }
      const temps = [...ref.current.temps.filter((t) => !(t.enfant_id === enfantId && t.jour === jour)), ligne]
      void enregistrer({ ...ref.current, temps }, [{ table: 'temps_jeu', type: 'upsert', ligne: { ...ligne, parent_id: userId } }])
    },
    [enfantId, userId, enregistrer],
  )

  const secondesAujourdhui = useMemo(() => {
    const jour = aujourdhui()
    return donnees.temps.find((t) => t.enfant_id === enfantId && t.jour === jour)?.secondes ?? 0
  }, [donnees.temps, enfantId])

  const deconnecter = useCallback(async () => {
    await supabase.auth.signOut()
    setParentDeverrouille(false)
    choisirEnfant(null)
  }, [choisirEnfant])

  const valeur: Contexte = {
    session,
    pret,
    enLigne,
    donnees,
    enfant,
    parentDeverrouille,
    choisirEnfant,
    deverrouillerParent: setParentDeverrouille,
    definirCode,
    verifierCode,
    ajouterEnfant,
    majEnfant,
    supprimerEnfant,
    ajouterBilan,
    ajouterTemps,
    secondesAujourdhui,
    deconnecter,
  }

  return <Ctx.Provider value={valeur}>{children}</Ctx.Provider>
}
