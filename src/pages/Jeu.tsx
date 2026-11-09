import { useEffect, useMemo, useRef, useState } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { BarreHaut } from '../components/BarreHaut'
import { Dessin } from '../components/Dessins'
import { VueExercice } from '../components/Exercices'
import { Piou } from '../components/Piou'
import { useApp } from '../contexte'
import { CONTENU, type Exercice } from '../data/exercices'
import { exercicesParSeance } from '../data/questionnaire'
import { limiteSecondes, reglagesDe, type Evolution } from '../lib/progression'
import { son } from '../lib/sons'
import { aujourdhui } from '../lib/store'
import type { Niveau, Resultat } from '../lib/types'
import { parler, taire } from '../lib/voix'

type Phase = { t: 'exercice' } | { t: 'pause' } | { t: 'bilan' } | { t: 'fin'; evolution: Evolution }

function preparerSeance(liste: Exercice[], n: number) {
  const a = [...liste]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a.slice(0, Math.min(n, a.length))
}

// Petite image pour reconnaître l'exercice dans le bilan.
function imageExercice(ex: Exercice): string {
  switch (ex.type) {
    case 'imiter':
      return ex.dessin ?? 'etoile'
    case 'choisir':
      return ex.cible ?? ex.options.find((o) => o.bon)?.dessin ?? ex.options[0].dessin
    case 'ordre':
      return ex.etapes[0].dessin
    case 'geste':
      return ex.dessin ?? 'main'
    case 'pictos':
      return ex.pictos[0].dessin
    case 'histoire':
      return ex.phrases[0].dessin
    case 'devinette':
      return 'cadeau'
    case 'bulles':
      return ex.cible === 'bulle' ? 'bulle' : 'etoile'
    case 'tour':
      return 'ballon'
    case 'souffle':
      return 'fleur'
    case 'tracer':
      return 'soleil'
  }
}

const CHOIX: [Resultat, string, string][] = [
  ['reussi', 'Réussi', 'var(--feuille)'],
  ['en_cours', 'En cours', 'var(--soleil-clair)'],
  ['a_retravailler', 'À retravailler', '#EEF1F7'],
]

export default function Jeu() {
  const { enfant, ajouterBilan, ajouterTemps, secondesAujourdhui } = useApp()
  const nav = useNavigate()
  const [params] = useSearchParams()
  const reglages = reglagesDe(enfant)
  const demande = Number(params.get('niveau'))
  const niveau = (demande >= 1 && demande <= 4 ? demande : enfant?.niveau ?? 1) as Niveau
  const seance = useMemo(
    () => (enfant ? preparerSeance(CONTENU[enfant.profil][niveau], exercicesParSeance(enfant.scores.confort)) : []),
    // Une séance garde ses exercices jusqu'au bout.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [enfant?.id, enfant?.profil, niveau],
  )
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>({ t: 'exercice' })
  const [resultats, setResultats] = useState<Resultat[]>([])
  const [envoi, setEnvoi] = useState(false)
  const echecsDeSuite = useRef(0)

  // Temps de jeu : compté par tranches de 15 secondes.
  useEffect(() => {
    const t = setInterval(() => ajouterTemps(15), 15000)
    return () => clearInterval(t)
  }, [ajouterTemps])

  const limite = limiteSecondes(enfant, aujourdhui())
  const limiteAtteinte = limite > 0 && secondesAujourdhui >= limite
  useEffect(() => {
    if (!limiteAtteinte || phase.t !== 'exercice') return
    taire()
    // Le temps est écoulé : on passe directement au bilan des exercices déjà faits.
    if (resultats.length) setPhase({ t: 'bilan' })
    else nav('/fin', { replace: true })
  }, [limiteAtteinte, phase.t, nav, resultats.length])

  useEffect(() => {
    if (phase.t === 'bilan' && enfant) void parler(`Bravo ${enfant.surnom} ! C’est fini pour cette séance.`)
  }, [phase.t, enfant])

  if (!enfant) return <Navigate to="/enfants" replace />
  const ex = seance[index]

  // L'enfant enchaîne les exercices sans interruption ; le parent fait le bilan à la fin.
  const exerciceFini = (suggestion: Resultat) => {
    const r = [...resultats, suggestion]
    setResultats(r)
    echecsDeSuite.current = suggestion === 'a_retravailler' ? echecsDeSuite.current + 1 : 0
    if (index + 1 >= seance.length) {
      setPhase({ t: 'bilan' })
      return
    }
    setIndex(index + 1)
    if (echecsDeSuite.current >= 3) {
      echecsDeSuite.current = 0
      setPhase({ t: 'pause' })
    }
  }

  const validerBilan = async (lignes: Resultat[]) => {
    if (envoi) return
    setEnvoi(true)
    son.pousse()
    const evolution = await ajouterBilan(
      niveau,
      lignes.map((r, i) => ({ exercice: seance[i].id, resultat: r })),
    )
    if (limiteAtteinte) nav('/fin', { replace: true })
    else setPhase({ t: 'fin', evolution })
  }

  if (phase.t === 'fin') return <FinSeance evolution={phase.evolution} />

  if (phase.t === 'bilan')
    return (
      <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', background: 'var(--soleil)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, flexWrap: 'wrap', padding: '24px 24px 16px' }}>
          <Piou pose="felicite" taille={150} className="eclot" coquille={niveau} />
          <div>
            <h1 className="titre" style={{ fontSize: 'clamp(44px, 7vw, 76px)' }}>
              Bravo {enfant.surnom} !
            </h1>
            <p style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>C’est fini pour cette séance.</p>
          </div>
        </div>
        <div style={{ flex: 1, background: 'var(--blanc)', borderRadius: '36px 36px 0 0', padding: 'clamp(20px, 3vw, 32px) clamp(16px, 4vw, 48px)', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800 }}>Pour le parent : le bilan de la séance</h2>
            <p style={{ margin: '4px 0 0', fontSize: 15, color: 'var(--encre-douce)' }}>Le jeu a prérempli chaque ligne d’après ce qu’il a vu. Corrigez si besoin, puis validez. Votre enfant ne voit que « Bravo ».</p>
          </div>
          {resultats.map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', padding: '8px 0', borderTop: '1px solid var(--gris)' }}>
              <span style={{ width: 56, height: 56, flexShrink: 0, borderRadius: 16, background: '#F5F7FB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Dessin nom={imageExercice(seance[i])} taille={44} />
              </span>
              <span style={{ flex: '1 1 220px', fontSize: 17, fontWeight: 700 }}>{seance[i].consigne}</span>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }} role="radiogroup" aria-label={`Résultat de l’exercice ${i + 1}`}>
                {CHOIX.map(([valeur, label, fond]) => (
                  <button
                    key={valeur}
                    role="radio"
                    aria-checked={r === valeur}
                    onClick={() => setResultats(resultats.map((x, j) => (j === i ? valeur : x)))}
                    style={{ minHeight: 48, padding: '0 16px', borderRadius: 24, border: r === valeur ? '3px solid var(--encre)' : '3px solid transparent', background: r === valeur ? fond : '#F5F7FB', fontSize: 16, fontWeight: 800, cursor: 'pointer' }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 'auto', paddingTop: 8 }}>
            <button className="btn btn-sombre" disabled={envoi} onClick={() => void validerBilan(resultats)}>
              Valider le bilan
            </button>
            <button className="btn btn-contour" disabled={envoi} onClick={() => void validerBilan(resultats.map(() => 'inconnu'))}>
              Je ne sais pas
            </button>
          </div>
        </div>
      </div>
    )

  if (phase.t === 'pause')
    return (
      <div className="ecran centre" style={{ background: 'var(--calme)' }}>
        <Piou pose="attend" taille={180} />
        <h1 className="titre" style={{ fontSize: 44 }}>
          On fait une petite pause ?
        </h1>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button className="btn btn-principal" onClick={() => setPhase({ t: 'bilan' })}>
            Oui, on s’arrête là
          </button>
          <button className="btn btn-contour" onClick={() => setPhase({ t: 'exercice' })}>
            On continue
          </button>
        </div>
      </div>
    )

  return (
    <div className="ecran">
      <BarreHaut
        milieu={
          <div style={{ display: 'flex', gap: 10 }} aria-label={`Exercice ${index + 1} sur ${seance.length}`}>
            {seance.map((_, i) => (
              <span key={i} style={{ width: 18, height: 18, borderRadius: 9, background: i < index ? 'var(--feuille)' : i === index ? 'var(--soleil)' : 'var(--gris)', border: i === index ? '3px solid var(--encre)' : 'none' }} />
            ))}
          </div>
        }
      />
      {ex ? <VueExercice key={index} ex={ex} sansAnimation={reglages.sansAnimation} surFin={exerciceFini} /> : <p>Aucun exercice pour ce niveau.</p>}
    </div>
  )
}

function FinSeance({ evolution }: { evolution: Evolution }) {
  const nav = useNavigate()
  const titre = evolution === 'niveau_suivant' ? 'Une fleur a éclos !' : evolution === 'parcours_termine' ? 'Un arbre a poussé !' : 'Ton jardin a grandi !'
  const texte =
    evolution === 'niveau_suivant'
      ? 'Tu passes au niveau suivant.'
      : evolution === 'parcours_termine'
        ? 'Tu as fini tout le parcours. Papa ou maman va choisir la suite avec toi.'
        : 'À bientôt pour une nouvelle partie.'
  useEffect(() => {
    son.bravo()
    void parler(`${titre} ${texte}`)
  }, [titre, texte])
  return (
    <div className="ecran centre" style={{ background: 'var(--fond-vert)' }}>
      <div className="eclot">{evolution === 'parcours_termine' ? <Dessin nom="arbre" taille={240} /> : evolution === 'niveau_suivant' ? <Dessin nom="fleur" taille={240} /> : <Piou pose="felicite" taille={220} />}</div>
      <h1 className="titre" style={{ fontSize: 'clamp(44px, 7vw, 72px)' }}>
        {titre}
      </h1>
      <p style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>{texte}</p>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button className="btn btn-principal" onClick={() => nav('/jardin', { replace: true })}>
          Voir mon jardin
        </button>
        <button className="btn btn-contour" onClick={() => nav('/carte', { replace: true })}>
          Retour à la carte
        </button>
      </div>
    </div>
  )
}
