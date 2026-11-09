import { useEffect, useMemo, useRef, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { BarreHaut } from '../components/BarreHaut'
import { Dessin } from '../components/Dessins'
import { VueExercice } from '../components/Exercices'
import { IconeCoche, IconeRecommencer } from '../components/Icones'
import { Piou } from '../components/Piou'
import { useApp } from '../contexte'
import { CONTENU, type Exercice } from '../data/exercices'
import { exercicesParSeance } from '../data/questionnaire'
import { limiteSecondes, reglagesDe, type Evolution } from '../lib/progression'
import { aujourdhui } from '../lib/store'
import { son } from '../lib/sons'
import { parler, taire } from '../lib/voix'
import type { Resultat } from '../lib/types'

type Phase = { t: 'exercice' } | { t: 'evaluation'; suggestion: Resultat } | { t: 'pause' } | { t: 'fin'; evolution: Evolution }

function preparerSeance(liste: Exercice[], n: number) {
  const a = [...liste]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a.slice(0, Math.min(n, a.length))
}

export default function Jeu() {
  const { enfant, ajouterEssai, ajouterTemps, secondesAujourdhui } = useApp()
  const nav = useNavigate()
  const reglages = reglagesDe(enfant)
  const seance = useMemo(
    () => (enfant ? preparerSeance(CONTENU[enfant.profil][enfant.niveau], exercicesParSeance(enfant.scores.confort)) : []),
    // Une séance garde ses exercices même si le niveau change en cours de route.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [enfant?.id],
  )
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>({ t: 'exercice' })
  const [cle, setCle] = useState(0)
  const echecsDeSuite = useRef(0)

  // Temps de jeu : compté par tranches de 15 secondes.
  useEffect(() => {
    const t = setInterval(() => ajouterTemps(15), 15000)
    return () => clearInterval(t)
  }, [ajouterTemps])

  const limite = limiteSecondes(enfant, aujourdhui())
  const limiteAtteinte = limite > 0 && secondesAujourdhui >= limite
  useEffect(() => {
    if (limiteAtteinte && phase.t === 'exercice') {
      taire()
      nav('/fin', { replace: true })
    }
  }, [limiteAtteinte, phase.t, nav])

  useEffect(() => {
    if (phase.t === 'evaluation') void parler('Bel effort !')
  }, [phase.t])

  if (!enfant) return <Navigate to="/enfants" replace />
  const ex = seance[index]

  const evaluer = async (r: Resultat) => {
    son.pousse()
    const evolution = await ajouterEssai(ex.id, r)
    echecsDeSuite.current = r === 'a_retravailler' ? echecsDeSuite.current + 1 : 0
    if (evolution === 'niveau_suivant' || evolution === 'parcours_termine' || index + 1 >= seance.length) {
      setPhase({ t: 'fin', evolution })
      return
    }
    setIndex(index + 1)
    setCle((c) => c + 1)
    setPhase(echecsDeSuite.current >= 3 ? { t: 'pause' } : { t: 'exercice' })
    if (echecsDeSuite.current >= 3) echecsDeSuite.current = 0
  }

  if (phase.t === 'fin') return <FinSeance evolution={phase.evolution} surnom={enfant.surnom} />

  if (phase.t === 'pause')
    return (
      <div className="ecran centre" style={{ background: 'var(--calme)' }}>
        <Piou pose="attend" taille={180} />
        <h1 className="titre" style={{ fontSize: 44 }}>
          On fait une petite pause ?
        </h1>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button className="btn btn-principal" onClick={() => nav('/pause')}>
            Oui, une pause
          </button>
          <button className="btn btn-contour" onClick={() => setPhase({ t: 'exercice' })}>
            On continue
          </button>
        </div>
      </div>
    )

  if (phase.t === 'evaluation')
    return (
      <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', background: 'var(--soleil)' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32, flexWrap: 'wrap', padding: 24 }}>
          <Piou pose="felicite" taille={220} className="eclot" coquille={enfant.niveau} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h1 className="titre" style={{ fontSize: 'clamp(56px, 9vw, 96px)' }}>
              Bel effort !
            </h1>
            <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 10, fontSize: 24, fontWeight: 800 }}>
              <svg width="44" height="44" viewBox="0 0 48 48" aria-hidden="true">
                <path d="M24 46V26" stroke="#1E8A55" strokeWidth="4" strokeLinecap="round" />
                <path d="M24 34 Q12 30 10 20 Q22 22 24 32" fill="#2BB673" />
                <path d="M24 30 Q36 26 38 16 Q26 18 24 28" fill="#2BB673" />
              </svg>
              Ta graine a poussé
            </p>
          </div>
        </div>
        <div style={{ background: 'var(--blanc)', borderRadius: '36px 36px 0 0', padding: 'clamp(20px, 3vw, 32px) clamp(20px, 4vw, 48px)', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: 22, fontWeight: 800 }}>Pour le parent : comment s’est passé cet essai ?</h2>
            <button className="btn btn-contour" style={{ minHeight: 48, fontSize: 17 }} onClick={() => void evaluer('inconnu')}>
              Je ne sais pas
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
            {(
              [
                ['reussi', 'Réussi', 'var(--feuille)', <IconeCoche key="c" />],
                ['en_cours', 'En cours', 'var(--soleil-clair)', <span key="l" style={{ width: 26, height: 4, background: 'var(--encre)', borderRadius: 2 }} />],
                ['a_retravailler', 'À retravailler', '#EEF1F7', <IconeRecommencer key="r" />],
              ] as const
            ).map(([r, label, fond, icone]) => (
              <button key={r} className="btn" onClick={() => void evaluer(r)} style={{ background: fond, borderRadius: 24, minHeight: 88, outline: phase.suggestion === r ? '4px solid var(--ciel)' : 'none', outlineOffset: 3 }}>
                {icone}
                {label}
              </button>
            ))}
          </div>
          <p style={{ margin: 0, fontSize: 15, color: 'var(--encre-douce)' }}>
            Votre enfant ne voit que « Bel effort ». Votre réponse règle seulement la suite du parcours.
            {phase.suggestion !== 'reussi' && ' Le jeu a encadré la réponse qui lui semble la plus proche, mais c’est vous qui décidez.'}
          </p>
        </div>
      </div>
    )

  return (
    <div className="ecran" key={cle}>
      <BarreHaut
        milieu={
          <div style={{ display: 'flex', gap: 10 }} aria-label={`Exercice ${index + 1} sur ${seance.length}`}>
            {seance.map((_, i) => (
              <span key={i} style={{ width: 18, height: 18, borderRadius: 9, background: i < index ? 'var(--feuille)' : i === index ? 'var(--soleil)' : 'var(--gris)', border: i === index ? '3px solid var(--encre)' : 'none' }} />
            ))}
          </div>
        }
      />
      {ex ? <VueExercice ex={ex} sansAnimation={reglages.sansAnimation} surFin={(s) => setPhase({ t: 'evaluation', suggestion: s })} /> : <p>Aucun exercice pour ce niveau.</p>}
    </div>
  )
}

function FinSeance({ evolution, surnom }: { evolution: Evolution; surnom: string }) {
  const nav = useNavigate()
  const titre = evolution === 'niveau_suivant' ? 'Une fleur a éclos !' : evolution === 'parcours_termine' ? 'Un arbre a poussé !' : `Bravo ${surnom} !`
  const texte =
    evolution === 'niveau_suivant'
      ? 'Tu passes au niveau suivant.'
      : evolution === 'parcours_termine'
        ? 'Tu as fini tout le parcours. Papa ou maman va choisir la suite avec toi.'
        : 'C’est fini pour cette fois. Ton jardin a grandi.'
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
