import { useMemo, useState, type ReactNode } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { IconeTelecharger } from '../components/Icones'
import { useApp } from '../contexte'
import { FICHES } from '../data/exercices'
import { DESCRIPTIONS_PROFILS, essaisDuNiveau, etatNiveau, NOMS_NIVEAUX, NOMS_PROFILS, profilSuivant, reglagesDe } from '../lib/progression'
import { aujourdhui } from '../lib/store'
import type { Decor, Enfant, Niveau, Profil, Reglages } from '../lib/types'
import { parler } from '../lib/voix'
import { COULEURS_ENFANTS, TEXTE_SUR } from './Enfants'

// Le générateur de PDF n'est chargé qu'au moment du téléchargement.
const telechargerFiches = (enfant: string, profil: Profil, niveaux: Niveau[]) =>
  void import('../lib/fiches').then((m) => m.telechargerFiches(enfant, profil, niveaux))

type Onglet = 'progres' | 'fiches' | 'reglages' | 'enfant' | 'compte'

const ONGLETS: [Onglet, string][] = [
  ['progres', 'Progrès'],
  ['fiches', 'Fiches à imprimer'],
  ['reglages', 'Réglages'],
  ['enfant', 'Parcours de l’enfant'],
  ['compte', 'Mon compte'],
]

function Section({ titre, children }: { titre: string; children: ReactNode }) {
  return (
    <section className="carte" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <h2 style={{ fontSize: 20, fontWeight: 800 }}>{titre}</h2>
      {children}
    </section>
  )
}

function Interrupteur({ id, label, aide, valeur, surChange }: { id: string; label: string; aide?: string; valeur: boolean; surChange: (v: boolean) => void }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
      <label htmlFor={id} style={{ fontSize: 17, display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontWeight: 700 }}>{label}</span>
        {aide && <span style={{ fontSize: 14, color: 'var(--encre-douce)' }}>{aide}</span>}
      </label>
      <input id={id} type="checkbox" checked={valeur} onChange={(e) => surChange(e.target.checked)} style={{ width: 28, height: 28, accentColor: 'var(--ciel)', flexShrink: 0 }} />
    </div>
  )
}

export default function Parent() {
  const app = useApp()
  const { donnees, enfant, parentDeverrouille, choisirEnfant, majEnfant, supprimerEnfant, deconnecter, deverrouillerParent, enLigne } = app
  const nav = useNavigate()
  const [onglet, setOnglet] = useState<Onglet>('progres')
  const [confirmer, setConfirmer] = useState<string | null>(null)

  if (!parentDeverrouille) return <Navigate to="/code?suite=/parent" replace />
  if (!donnees.enfants.length) return <Navigate to="/enfant/nouveau" replace />
  const e = enfant ?? donnees.enfants[0]

  const majReglages = (patch: Partial<Reglages>) => majEnfant(e.id, { reglages: { ...e.reglages, ...patch } })
  const sortir = () => {
    deverrouillerParent(false)
    choisirEnfant(e.id)
    nav('/carte')
  }

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexWrap: 'wrap', background: '#F5F7FB' }}>
      <nav style={{ flex: '1 1 220px', maxWidth: 280, background: 'var(--blanc)', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 6, borderRight: '1px solid var(--gris)' }} aria-label="Espace parent">
        <span className="titre" style={{ fontSize: 26, padding: '0 12px 12px' }}>
          Mon Éclosion
        </span>
        {ONGLETS.map(([id, label]) => (
          <button key={id} onClick={() => setOnglet(id)} aria-current={onglet === id ? 'page' : undefined} style={{ minHeight: 52, borderRadius: 16, border: 'none', textAlign: 'left', padding: '0 14px', fontSize: 17, fontWeight: onglet === id ? 800 : 700, background: onglet === id ? '#E8F1FD' : 'transparent', cursor: 'pointer' }}>
            {label}
          </button>
        ))}
        <button className="btn btn-soleil" style={{ marginTop: 'auto' }} onClick={sortir}>
          Retour au jeu
        </button>
        {!enLigne && <p style={{ fontSize: 14, color: 'var(--encre-douce)', padding: '0 8px' }}>Hors connexion : tout est gardé sur l’appareil et sera envoyé plus tard.</p>}
      </nav>

      <main style={{ flex: '999 1 560px', minWidth: 0, padding: 'clamp(16px, 3vw, 36px)', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          {donnees.enfants.map((x, i) => {
            const c = COULEURS_ENFANTS[i % COULEURS_ENFANTS.length]
            const actif = x.id === e.id
            return (
              <button key={x.id} onClick={() => choisirEnfant(x.id)} aria-pressed={actif} style={{ display: 'flex', alignItems: 'center', gap: 10, minHeight: 52, padding: '0 18px 0 6px', borderRadius: 26, border: `3px solid ${actif ? c : 'transparent'}`, background: 'var(--blanc)', fontSize: 18, fontWeight: 800, cursor: 'pointer' }}>
                <span style={{ width: 38, height: 38, borderRadius: 19, background: c, color: TEXTE_SUR(c), display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--titre)' }}>{x.surnom.slice(0, 1).toUpperCase()}</span>
                {x.surnom}
              </button>
            )
          })}
          <button className="btn btn-contour" style={{ minHeight: 52 }} onClick={() => nav('/enfant/nouveau')}>
            Ajouter un enfant
          </button>
        </div>

        {onglet === 'progres' && <Progres enfant={e} surChangerProfil={(p) => majEnfant(e.id, { profil: p, niveau: 1, parcours_termine: false })} />}
        {onglet === 'fiches' && <Fiches enfant={e} />}
        {onglet === 'reglages' && <OngletReglages enfant={e} maj={majReglages} majDecor={(d) => majEnfant(e.id, { decor: d })} />}
        {onglet === 'enfant' && (
          <OngletEnfant
            enfant={e}
            maj={(p) => majEnfant(e.id, p)}
            supprimer={() => setConfirmer('enfant')}
            refaire={() => nav(`/questionnaire/${e.id}`)}
          />
        )}
        {onglet === 'compte' && (
          <Section titre="Mon compte">
            <p style={{ margin: 0, fontSize: 17 }}>Connecté avec {app.session?.user.email}</p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button className="btn btn-contour" onClick={() => nav('/code/changer?suite=/parent')}>
                Changer le code parent
              </button>
              <button className="btn btn-contour" onClick={() => void deconnecter().then(() => nav('/', { replace: true }))}>
                Me déconnecter
              </button>
              <button className="btn btn-contour" style={{ borderColor: '#E8463A' }} onClick={() => setConfirmer('tout')}>
                Supprimer toutes les données
              </button>
            </div>
            <p style={{ margin: 0, fontSize: 15, color: 'var(--encre-douce)' }}>
              Mon Éclosion n’enregistre ni la voix ni des photos. Seuls le surnom, l’âge, les réponses au questionnaire, les essais évalués et le temps de jeu sont gardés, hébergés en Europe.
            </p>
          </Section>
        )}

        {confirmer && (
          <div role="dialog" aria-modal="true" aria-label="Confirmation" style={{ position: 'fixed', inset: 0, background: 'rgba(31,42,68,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 50 }}>
            <div className="carte" style={{ maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800 }}>{confirmer === 'tout' ? 'Supprimer toutes les données ?' : `Supprimer ${e.surnom} ?`}</h2>
              <p style={{ margin: 0, fontSize: 17 }}>
                {confirmer === 'tout'
                  ? 'Tous les enfants, leurs progrès et leur temps de jeu seront effacés définitivement, sur cet appareil et sur le serveur. Le compte reste ouvert.'
                  : 'Son parcours, ses progrès et son temps de jeu seront effacés définitivement.'}
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <button className="btn btn-contour" onClick={() => setConfirmer(null)}>
                  Annuler
                </button>
                <button
                  className="btn"
                  style={{ background: '#E8463A', color: '#fff' }}
                  onClick={async () => {
                    const ids = confirmer === 'tout' ? donnees.enfants.map((x) => x.id) : [e.id]
                    for (const id of ids) await supprimerEnfant(id)
                    setConfirmer(null)
                    nav(confirmer === 'tout' ? '/' : '/parent', { replace: true })
                  }}
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function Progres({ enfant, surChangerProfil }: { enfant: Enfant; surChangerProfil: (p: Profil) => void }) {
  const { donnees } = useApp()
  const etat = etatNiveau(donnees.essais, enfant)
  const suivant = profilSuivant(enfant.profil)

  const semaine = useMemo(() => {
    const jours: { jour: string; label: string; minutes: number }[] = []
    const noms = ['D', 'L', 'M', 'M', 'J', 'V', 'S']
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const jour = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      const s = donnees.temps.find((t) => t.enfant_id === enfant.id && t.jour === jour)?.secondes ?? 0
      jours.push({ jour, label: noms[d.getDay()], minutes: Math.round(s / 60) })
    }
    return jours
  }, [donnees.temps, enfant.id])

  const limite = reglagesDe(enfant).dureeMax
  const max = Math.max(limite || 0, ...semaine.map((j) => j.minutes), 10)
  const essaisSemaine = donnees.essais.filter((x) => x.enfant_id === enfant.id && x.created_at >= new Date(Date.now() - 7 * 864e5).toISOString())
  const compte = (r: string) => essaisSemaine.filter((x) => x.resultat === r).length

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
      {enfant.parcours_termine && (
        <div className="carte" style={{ gridColumn: '1 / -1', background: 'var(--soleil-clair)', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800 }}>{enfant.surnom} a terminé le parcours « {NOMS_PROFILS[enfant.profil].long} »</h2>
          {suivant ? (
            <>
              <p style={{ margin: 0, fontSize: 17 }}>
                Nous vous proposons de passer au parcours « {NOMS_PROFILS[suivant].long} ». {DESCRIPTIONS_PROFILS[suivant]}
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button className="btn btn-sombre" onClick={() => surChangerProfil(suivant)}>
                  Passer à ce parcours
                </button>
                <span style={{ alignSelf: 'center', fontSize: 15 }}>Vous pouvez aussi garder le parcours actuel pour réviser.</span>
              </div>
            </>
          ) : (
            <p style={{ margin: 0, fontSize: 17 }}>C’est le dernier parcours. Votre enfant peut continuer à rejouer pour réviser.</p>
          )}
        </div>
      )}
      <Section titre="Parcours en cours">
        <p style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{NOMS_PROFILS[enfant.profil].long}</p>
        {([1, 2, 3, 4] as Niveau[]).map((n) => {
          const termine = n < enfant.niveau || (enfant.parcours_termine && n === 4)
          const actuel = n === enfant.niveau && !enfant.parcours_termine
          return (
            <div key={n} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 16 }}>
                <span>
                  Niveau {n}, {NOMS_NIVEAUX[enfant.profil][n]}
                </span>
                <strong style={{ color: termine ? 'var(--feuille-fonce)' : actuel ? 'var(--encre)' : 'var(--encre-douce)', whiteSpace: 'nowrap' }}>
                  {termine ? 'Terminé' : actuel ? `${etat.reussis} réussite${etat.reussis > 1 ? 's' : ''} sur 8 pour passer` : 'À venir'}
                </strong>
              </div>
              {actuel && (
                <div style={{ height: 12, borderRadius: 6, background: 'var(--gris)' }}>
                  <div style={{ width: `${(etat.reussis / 8) * 100}%`, maxWidth: '100%', height: 12, borderRadius: 6, background: 'var(--feuille)' }} />
                </div>
              )}
            </div>
          )
        })}
        <p style={{ margin: 0, fontSize: 14, color: 'var(--encre-douce)' }}>Le niveau suivant devient le niveau en cours après 8 réussites sur les 10 derniers essais, notées dans les bilans de fin de séance.</p>
      </Section>
      <Section titre="Temps de jeu, 7 derniers jours">
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 160, borderBottom: '2px solid var(--gris)', position: 'relative' }} role="img" aria-label={`Temps de jeu par jour : ${semaine.map((j) => `${j.minutes} minutes`).join(', ')}`}>
          {limite > 0 && <div style={{ position: 'absolute', left: 0, right: 0, bottom: `${(limite / max) * 100}%`, borderTop: '2px dashed var(--bec)' }} />}
          {semaine.map((j) => (
            <div key={j.jour} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
              <span style={{ fontSize: 12, fontWeight: 700 }}>{j.minutes || ''}</span>
              <div style={{ width: '100%', height: `${(j.minutes / max) * 100}%`, minHeight: j.minutes ? 4 : 0, background: 'var(--ciel)', borderRadius: '8px 8px 0 0' }} />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {semaine.map((j) => (
            <span key={j.jour} style={{ flex: 1, textAlign: 'center', fontSize: 14, fontWeight: 700, color: 'var(--encre-douce)' }}>
              {j.label}
            </span>
          ))}
        </div>
        <p style={{ margin: 0, fontSize: 14, color: 'var(--encre-douce)' }}>{limite > 0 ? `En minutes. Ligne orange : la limite de ${limite} minutes par jour.` : 'En minutes. Pas de limite quotidienne.'}</p>
      </Section>
      <Section titre="Essais de la semaine">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12, textAlign: 'center' }}>
          {(
            [
              ['reussi', 'Réussis', 'var(--feuille)'],
              ['en_cours', 'En cours', 'var(--soleil)'],
              ['a_retravailler', 'À retravailler', 'var(--gris-bord)'],
            ] as const
          ).map(([r, label, c]) => (
            <div key={r} style={{ borderRadius: 16, padding: 12, background: '#F5F7FB', borderTop: `6px solid ${c}` }}>
              <div className="titre" style={{ fontSize: 34 }}>
                {compte(r)}
              </div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>{label}</div>
            </div>
          ))}
        </div>
        <p style={{ margin: 0, fontSize: 14, color: 'var(--encre-douce)' }}>{essaisDuNiveau(donnees.essais, enfant).length} essais au total sur le niveau actuel.</p>
      </Section>
      <Section titre="Fiches à imprimer">
        <p style={{ margin: 0, fontSize: 17 }}>
          {FICHES[enfant.profil][enfant.niveau].length} fiche{FICHES[enfant.profil][enfant.niveau].length > 1 ? 's' : ''} pour le niveau {enfant.niveau}. Elles se font au crayon, à côté de la tablette.
        </p>
        <button className="btn btn-sombre" style={{ alignSelf: 'flex-start' }} onClick={() => telechargerFiches(enfant.surnom, enfant.profil, [enfant.niveau])}>
          <IconeTelecharger />
          Télécharger le PDF
        </button>
      </Section>
    </div>
  )
}

function Fiches({ enfant }: { enfant: Enfant }) {
  return (
    <Section titre={`Fiches à imprimer, ${NOMS_PROFILS[enfant.profil].long}`}>
      <p style={{ margin: 0, fontSize: 16, color: 'var(--encre-douce)' }}>Chaque fiche se fait au crayon ou au feutre. Le papier aide à bien tenir le crayon, ce qui servira à l’école.</p>
      {([1, 2, 3, 4] as Niveau[]).map((n) => (
        <div key={n} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', padding: '12px 0', borderTop: '1px solid var(--gris)' }}>
          <div>
            <strong style={{ fontSize: 17 }}>
              Niveau {n}, {NOMS_NIVEAUX[enfant.profil][n]}
            </strong>
            <div style={{ fontSize: 15, color: 'var(--encre-douce)' }}>{FICHES[enfant.profil][n].map((f) => f.titre).join(', ')}</div>
          </div>
          <button className="btn btn-contour" style={{ minHeight: 52 }} onClick={() => telechargerFiches(enfant.surnom, enfant.profil, [n])}>
            <IconeTelecharger />
            PDF
          </button>
        </div>
      ))}
      <button className="btn btn-sombre" style={{ alignSelf: 'flex-start' }} onClick={() => telechargerFiches(enfant.surnom, enfant.profil, [1, 2, 3, 4])}>
        <IconeTelecharger />
        Toutes les fiches du parcours
      </button>
    </Section>
  )
}

function OngletReglages({ enfant, maj, majDecor }: { enfant: Enfant; maj: (p: Partial<Reglages>) => void; majDecor: (d: Decor) => void }) {
  const r = reglagesDe(enfant)
  const jour = aujourdhui()
  const bonus = r.bonusJour === jour ? (r.bonusMinutes ?? 0) : 0
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
      <Section titre="Temps de jeu">
        <div className="champ">
          <label htmlFor="duree">Durée maximale par jour</label>
          <select id="duree" value={r.dureeMax} onChange={(ev) => maj({ dureeMax: Number(ev.target.value) })}>
            {[10, 15, 20, 30, 45, 60].map((m) => (
              <option key={m} value={m}>
                {m} minutes
              </option>
            ))}
            <option value={0}>Sans limite</option>
          </select>
        </div>
        {r.dureeMax > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <button className="btn btn-contour" onClick={() => maj({ bonusJour: jour, bonusMinutes: bonus + 10 })}>
              Ajouter 10 minutes aujourd’hui
            </button>
            {bonus > 0 && <span style={{ fontSize: 15 }}>{bonus} minutes ajoutées aujourd’hui</span>}
          </div>
        )}
      </Section>
      <Section titre="Confort">
        <Interrupteur id="ouverts" label="Tous les niveaux ouverts" aide="Version de test : l’enfant peut jouer à n’importe quel niveau du parcours." valeur={r.niveauxOuverts} surChange={(v) => maj({ niveauxOuverts: v })} />
        <Interrupteur id="gros" label="Grands boutons" aide="Pour les enfants qui ont du mal à viser." valeur={r.grandsBoutons} surChange={(v) => maj({ grandsBoutons: v })} />
        <Interrupteur id="anim" label="Couper toutes les animations" valeur={r.sansAnimation} surChange={(v) => maj({ sansAnimation: v })} />
        <Interrupteur id="sons" label="Petits sons de réponse" valeur={r.sons} surChange={(v) => maj({ sons: v })} />
        <Interrupteur id="doux" label="Sons très doux" aide="Pour les enfants gênés par les bruits." valeur={r.sansBruitFort} surChange={(v) => maj({ sansBruitFort: v })} />
      </Section>
      <Section titre="Décor des récompenses">
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {(
            [
              ['jardin', 'Jardin'],
              ['garage', 'Garage'],
              ['ferme', 'Ferme'],
            ] as const
          ).map(([d, l]) => (
            <button key={d} className={`btn ${enfant.decor === d ? 'btn-principal' : 'btn-contour'}`} aria-pressed={enfant.decor === d} onClick={() => majDecor(d)}>
              {l}
            </button>
          ))}
        </div>
      </Section>
      <Section titre="Voix">
        <p style={{ margin: 0, fontSize: 16, color: 'var(--encre-douce)' }}>Pour la version de test, le jeu utilise la voix intégrée à l’appareil. Sa qualité dépend de la tablette.</p>
        <button className="btn btn-contour" style={{ alignSelf: 'flex-start' }} onClick={() => void parler('Bonjour ! Je suis Piou. On joue ensemble ?')}>
          Écouter la voix
        </button>
      </Section>
    </div>
  )
}

function OngletEnfant({ enfant, maj, supprimer, refaire }: { enfant: Enfant; maj: (p: Partial<Enfant>) => void; supprimer: () => void; refaire: () => void }) {
  const [surnom, setSurnom] = useState(enfant.surnom)
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
      <Section titre="Profil">
        <form
          onSubmit={(ev) => {
            ev.preventDefault()
            if (surnom.trim()) maj({ surnom: surnom.trim() })
          }}
          style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}
        >
          <div className="champ" style={{ flex: 1, minWidth: 200 }}>
            <label htmlFor="surnom-edit">Prénom ou surnom</label>
            <input id="surnom-edit" value={surnom} maxLength={40} onChange={(ev) => setSurnom(ev.target.value)} />
          </div>
          <button className="btn btn-contour" type="submit">
            Enregistrer
          </button>
        </form>
        <button className="btn btn-principal" style={{ alignSelf: 'flex-start' }} onClick={refaire}>
          Refaire le questionnaire
        </button>
      </Section>
      <Section titre="Choisir le parcours à la main">
        <p style={{ margin: 0, fontSize: 15, color: 'var(--encre-douce)' }}>Nous recommandons le questionnaire, mais vous pouvez choisir vous-même.</p>
        <div className="champ">
          <label htmlFor="profil">Parcours</label>
          <select id="profil" value={enfant.profil} onChange={(ev) => maj({ profil: Number(ev.target.value) as Profil, niveau: 1, parcours_termine: false })}>
            {([1, 2, 3, 4] as Profil[]).map((p) => (
              <option key={p} value={p}>
                {NOMS_PROFILS[p].long}
              </option>
            ))}
          </select>
        </div>
        <div className="champ">
          <label htmlFor="niveau">Niveau</label>
          <select id="niveau" value={enfant.niveau} onChange={(ev) => maj({ niveau: Number(ev.target.value) as Niveau, parcours_termine: false })}>
            {([1, 2, 3, 4] as Niveau[]).map((n) => (
              <option key={n} value={n}>
                Niveau {n}, {NOMS_NIVEAUX[enfant.profil][n]}
              </option>
            ))}
          </select>
        </div>
      </Section>
      <Section titre="Supprimer">
        <p style={{ margin: 0, fontSize: 16 }}>Efface définitivement {enfant.surnom} et tous ses progrès.</p>
        <button className="btn btn-contour" style={{ alignSelf: 'flex-start', borderColor: '#E8463A' }} onClick={supprimer}>
          Supprimer {enfant.surnom}
        </button>
      </Section>
    </div>
  )
}
