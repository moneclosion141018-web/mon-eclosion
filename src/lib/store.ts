// Stockage « d'abord sur l'appareil » : tout est gardé dans IndexedDB,
// puis envoyé à Supabase dès que la connexion le permet.
import { get, set } from 'idb-keyval'
import { supabase } from './supabase'
import type { Enfant, Essai, TempsJeu } from './types'

type Table = 'enfants' | 'essais' | 'temps_jeu' | 'parents'

export interface Operation {
  table: Table
  type: 'upsert' | 'delete'
  ligne: Record<string, unknown>
}

export interface Donnees {
  enfants: Enfant[]
  essais: Essai[]
  temps: TempsJeu[]
  codeHash: string | null
  file: Operation[]
}

export const donneesVides = (): Donnees => ({ enfants: [], essais: [], temps: [], codeHash: null, file: [] })

const cle = (userId: string) => `mon-eclosion:${userId}`

export async function lireLocal(userId: string): Promise<Donnees> {
  try {
    const d = (await get(cle(userId))) as Donnees | undefined
    return d ? { ...donneesVides(), ...d } : donneesVides()
  } catch {
    return donneesVides()
  }
}

export async function ecrireLocal(userId: string, d: Donnees) {
  try {
    await set(cle(userId), d)
  } catch {
    /* stockage indisponible : l'application continue en mémoire */
  }
}

function cleOperation(op: Operation) {
  if (op.table === 'temps_jeu') return `${op.table}:${op.ligne.enfant_id}:${op.ligne.jour}`
  return `${op.table}:${op.ligne.id}`
}

// Ajoute une opération en remplaçant une opération plus ancienne sur la même ligne.
export function ajouterOperation(file: Operation[], op: Operation): Operation[] {
  const k = cleOperation(op)
  return [...file.filter((o) => cleOperation(o) !== k), op]
}

// Envoie les opérations en attente. Renvoie celles qui n'ont pas pu partir.
export async function viderFile(file: Operation[]): Promise<Operation[]> {
  const reste: Operation[] = []
  let bloque = false
  for (const op of file) {
    if (bloque) {
      reste.push(op)
      continue
    }
    try {
      const requete =
        op.type === 'delete'
          ? supabase.from(op.table).delete().eq('id', op.ligne.id as string)
          : supabase
              .from(op.table)
              .upsert(op.ligne, op.table === 'temps_jeu' ? { onConflict: 'enfant_id,jour' } : undefined)
      const { error } = await requete
      if (error) {
        // Erreur réseau : on garde tout pour plus tard. Erreur de données : on abandonne cette ligne.
        if (/fetch|network|Failed/i.test(error.message)) {
          bloque = true
          reste.push(op)
        } else {
          console.warn('Synchronisation refusée', op.table, error.message)
        }
      }
    } catch {
      bloque = true
      reste.push(op)
    }
  }
  return reste
}

// Récupère les données du compte et les fusionne avec celles de l'appareil.
export async function fusionnerDistant(userId: string, local: Donnees): Promise<Donnees> {
  const [enf, ess, tps, par] = await Promise.all([
    supabase.from('enfants').select('*').order('created_at'),
    supabase.from('essais').select('*').order('created_at', { ascending: false }).limit(2000),
    supabase.from('temps_jeu').select('*'),
    supabase.from('parents').select('code_parent_hash').eq('id', userId).maybeSingle(),
  ])
  if (enf.error || ess.error || tps.error) throw new Error('lecture impossible')

  const enAttente = new Set(local.file.filter((o) => o.table === 'enfants').map((o) => o.ligne.id as string))
  const supprimes = new Set(
    local.file.filter((o) => o.table === 'enfants' && o.type === 'delete').map((o) => o.ligne.id as string),
  )
  const distants = (enf.data as Enfant[]).filter((e) => !supprimes.has(e.id))
  const enfants = [
    ...distants.map((e) => (enAttente.has(e.id) ? local.enfants.find((l) => l.id === e.id) ?? e : e)),
    ...local.enfants.filter((l) => enAttente.has(l.id) && !distants.some((e) => e.id === l.id)),
  ].filter((e) => !supprimes.has(e.id))

  const essaisMap = new Map<string, Essai>()
  for (const e of ess.data as Essai[]) essaisMap.set(e.id, e)
  for (const e of local.essais) essaisMap.set(e.id, e)

  const tempsMap = new Map<string, TempsJeu>()
  for (const t of [...(tps.data as TempsJeu[]), ...local.temps]) {
    const k = `${t.enfant_id}:${t.jour}`
    const avant = tempsMap.get(k)
    if (!avant || t.secondes > avant.secondes) tempsMap.set(k, { enfant_id: t.enfant_id, jour: t.jour, secondes: t.secondes })
  }

  return {
    ...local,
    enfants,
    essais: [...essaisMap.values()].sort((a, b) => b.created_at.localeCompare(a.created_at)),
    temps: [...tempsMap.values()],
    codeHash: local.codeHash ?? (par.data?.code_parent_hash as string | undefined) ?? null,
  }
}

export function aujourdhui() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function nouvelId() {
  return crypto.randomUUID()
}
