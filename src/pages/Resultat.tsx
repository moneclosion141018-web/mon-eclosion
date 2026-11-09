import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Piou } from '../components/Piou'
import { useApp } from '../contexte'
import { LIBELLES_NIVEAU, niveauPartie } from '../data/questionnaire'
import { DESCRIPTIONS_PROFILS, NOMS_PROFILS } from '../lib/progression'
import type { Profil } from '../lib/types'

function Pastilles({ score }: { score: number }) {
  const n = niveauPartie(score)
  const pleines = n === 'a_decouvrir' ? 1 : n === 'en_progres' ? 2 : 3
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 17, fontWeight: 700 }}>
      <span style={{ display: 'flex', gap: 6 }} aria-hidden="true">
        {[1, 2, 3].map((i) => (
          <span key={i} style={{ width: 22, height: 22, borderRadius: 11, background: i <= pleines ? 'var(--soleil)' : 'var(--gris)' }} />
        ))}
      </span>
      {LIBELLES_NIVEAU[n]}
    </span>
  )
}

export default function Resultat() {
  const { id } = useParams()
  const { donnees, majEnfant, choisirEnfant } = useApp()
  const nav = useNavigate()
  const [choisir, setChoisir] = useState(false)
  const enfant = donnees.enfants.find((e) => e.id === id)
  if (!enfant) return null
  const s = enfant.scores

  const changerProfil = async (p: Profil) => {
    if (p !== enfant.profil) await majEnfant(enfant.id, { profil: p, niveau: 1, parcours_termine: false })
    setChoisir(false)
  }

  return (
    <div className="ecran" style={{ maxWidth: 1200, margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 40 }}>
        <div style={{ flex: '1 1 360px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <h1 className="titre" style={{ fontSize: 'clamp(32px, 4vw, 48px)' }}>
            Le parcours de {enfant.surnom} est prêt
          </h1>
          <p style={{ margin: 0, fontSize: 18, lineHeight: 1.5, color: 'var(--encre-douce)' }}>Voici ce que vos réponses montrent aujourd’hui. Le jeu ajustera tout seul au fil des parties.</p>
          {(
            [
              ['La parole', s.parole ?? 0],
              ['La compréhension', s.comprehension ?? 0],
              ['La communication', s.communication ?? 0],
            ] as const
          ).map(([nom, v]) => (
            <div key={nom} className="carte" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 21, fontWeight: 800 }}>{nom}</span>
              <Pastilles score={v} />
            </div>
          ))}
          <p style={{ margin: 0, fontSize: 15, color: 'var(--encre-douce)' }}>Ce résultat n’est pas un diagnostic. Vous pouvez repasser le questionnaire à tout moment depuis l’espace parent.</p>
        </div>
        <div style={{ flex: '1 1 360px', background: 'var(--soleil)', borderRadius: 40, padding: 36, display: 'flex', flexDirection: 'column', gap: 18 }}>
          {!choisir ? (
            <>
              <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Parcours de départ</span>
              <h2 className="titre" style={{ fontSize: 36 }}>
                {NOMS_PROFILS[enfant.profil].long}
              </h2>
              <p style={{ margin: 0, fontSize: 18, lineHeight: 1.5 }}>{DESCRIPTIONS_PROFILS[enfant.profil]} Quatre niveaux, à son rythme.</p>
              <div style={{ alignSelf: 'center' }}>
                <Piou pose="felicite" taille={140} />
              </div>
              <button
                className="btn btn-sombre"
                onClick={() => {
                  choisirEnfant(enfant.id)
                  nav('/carte', { replace: true })
                }}
              >
                Commencer à jouer
              </button>
              <button className="btn btn-lien" style={{ color: 'var(--encre)' }} onClick={() => setChoisir(true)}>
                Choisir un autre parcours
              </button>
            </>
          ) : (
            <>
              <h2 className="titre" style={{ fontSize: 30 }}>
                Choisir le parcours
              </h2>
              <p style={{ margin: 0, fontSize: 16 }}>Nous recommandons le parcours proposé par le questionnaire, mais vous connaissez votre enfant.</p>
              {([1, 2, 3, 4] as Profil[]).map((p) => (
                <button key={p} className="btn" onClick={() => changerProfil(p)} style={{ justifyContent: 'flex-start', textAlign: 'left', borderRadius: 20, minHeight: 72, padding: '10px 20px', background: p === enfant.profil ? 'var(--encre)' : 'var(--blanc)', color: p === enfant.profil ? '#fff' : 'var(--encre)', flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
                  <span>{NOMS_PROFILS[p].long}</span>
                  <span style={{ fontSize: 15, fontWeight: 600 }}>{DESCRIPTIONS_PROFILS[p]}</span>
                </button>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
