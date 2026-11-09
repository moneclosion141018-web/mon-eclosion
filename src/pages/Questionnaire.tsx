import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { IconeCoche } from '../components/Icones'
import { useApp } from '../contexte'
import {
  INTERETS,
  PARTIES,
  QUESTIONS,
  QUESTIONS_CONFORT,
  REPONSES,
  calculerScores,
  decorDepuisInteret,
  profilDeDepart,
  reglagesDepuisConfort,
} from '../data/questionnaire'
import type { Profil } from '../lib/types'

const TOTAL = 1 + QUESTIONS.length + QUESTIONS_CONFORT.length

export default function Questionnaire() {
  const { id } = useParams()
  const { donnees, ajouterEnfant, majEnfant, choisirEnfant } = useApp()
  const nav = useNavigate()
  const existant = useMemo(() => donnees.enfants.find((e) => e.id === id) ?? null, [donnees.enfants, id])

  const [etape, setEtape] = useState(0)
  const [surnom, setSurnom] = useState(existant?.surnom ?? '')
  const [age, setAge] = useState(existant?.age ? String(existant.age) : '')
  const [interet, setInteret] = useState(existant?.interet ?? 'animaux')
  const [reponses, setReponses] = useState<Record<string, number>>({})
  const [confort, setConfort] = useState<Record<string, number>>({})

  const indexQuestion = etape - 1
  const question = indexQuestion >= 0 && indexQuestion < QUESTIONS.length ? QUESTIONS[indexQuestion] : null
  const indexConfort = etape - 1 - QUESTIONS.length
  const qConfort = indexConfort >= 0 ? QUESTIONS_CONFORT[indexConfort] : null

  async function terminer(dernier: Record<string, number>) {
    const scores = calculerScores(reponses)
    const c = { bruit: dernier.bruit ?? 0, ecran: dernier.ecran ?? 0, attention: dernier.attention ?? 2 }
    const profil: Profil = profilDeDepart(scores)
    const reglages = { ...(existant?.reglages ?? {}), ...reglagesDepuisConfort(c) }
    const base = {
      surnom: surnom.trim() || 'Mon enfant',
      age: age ? Number(age) : null,
      interet,
      scores: { ...(existant?.scores ?? {}), ...scores, confort: c },
      reglages,
      decor: existant?.decor ?? decorDepuisInteret(interet),
    }
    let cible = existant?.id
    if (existant) {
      const memeProfil = existant.profil === profil
      await majEnfant(existant.id, { ...base, profil, niveau: memeProfil ? existant.niveau : 1, parcours_termine: memeProfil ? existant.parcours_termine : false })
    } else {
      cible = await ajouterEnfant({ ...base, profil, niveau: 1, parcours_termine: false })
    }
    if (cible) {
      choisirEnfant(cible)
      nav(`/resultat/${cible}`, { replace: true })
    }
  }

  const repondre = (valeur: number) => {
    if (question) {
      setReponses((r) => ({ ...r, [question.id]: valeur }))
      setEtape((e) => e + 1)
    } else if (qConfort) {
      const suivant = { ...confort, [qConfort.id]: valeur }
      setConfort(suivant)
      if (indexConfort === QUESTIONS_CONFORT.length - 1) void terminer(suivant)
      else setEtape((e) => e + 1)
    }
  }

  const choixActuel = question ? reponses[question.id] : qConfort ? confort[qConfort.id] : undefined
  const options = question ? REPONSES : qConfort ? qConfort.options : []
  const nomPartie = question ? `Partie ${['parole', 'comprehension', 'communication'].indexOf(question.partie) + 1} · ${PARTIES[question.partie]}` : 'Partie 4 · Le confort pendant le jeu'

  return (
    <div className="ecran" style={{ maxWidth: 980, margin: '0 auto', width: '100%' }}>
      <div className="barre-haut">
        <button className="btn btn-lien" style={{ padding: 0 }} onClick={() => nav(-1)}>
          Quitter
        </button>
        <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--encre-douce)' }}>
          {surnom ? `Profil de ${surnom} · ` : ''}Étape {etape + 1} sur {TOTAL}
        </span>
      </div>
      <div style={{ height: 14, borderRadius: 7, background: 'var(--gris)', overflow: 'hidden' }}>
        <div style={{ width: `${((etape + 1) / TOTAL) * 100}%`, height: 14, borderRadius: 7, background: 'var(--feuille)', transition: 'width 0.3s' }} />
      </div>

      {etape === 0 && (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            setEtape(1)
          }}
          style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
        >
          <h1 className="titre" style={{ fontSize: 'clamp(30px, 4vw, 44px)' }}>
            {existant ? `On refait le point pour ${existant.surnom}` : 'Faisons connaissance'}
          </h1>
          <p style={{ margin: 0, fontSize: 18, lineHeight: 1.5, color: 'var(--encre-douce)' }}>
            Ce questionnaire n’est pas un diagnostic. Il aide simplement le jeu à proposer des activités adaptées dès le départ. Il n’y a pas de bonne ou de mauvaise réponse : choisissez celle qui ressemble le plus à ce que vous voyez au quotidien.
          </p>
          <div className="champ">
            <label htmlFor="surnom">Prénom ou surnom pour le jeu</label>
            <input id="surnom" required maxLength={40} value={surnom} onChange={(e) => setSurnom(e.target.value)} placeholder="Un surnom suffit" />
          </div>
          <div className="champ" style={{ maxWidth: 240 }}>
            <label htmlFor="age">Âge</label>
            <input id="age" type="number" min={1} max={18} inputMode="numeric" value={age} onChange={(e) => setAge(e.target.value)} />
          </div>
          <fieldset style={{ border: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <legend style={{ fontWeight: 800, fontSize: 17, marginBottom: 10 }}>Ce que votre enfant aime le plus en ce moment</legend>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {INTERETS.map((i) => (
                <button key={i.id} type="button" className={`btn ${interet === i.id ? 'btn-principal' : 'btn-contour'}`} aria-pressed={interet === i.id} onClick={() => setInteret(i.id)}>
                  {i.label}
                </button>
              ))}
            </div>
          </fieldset>
          <button className="btn btn-principal" type="submit" style={{ alignSelf: 'flex-start' }}>
            Commencer
          </button>
        </form>
      )}

      {etape > 0 && (question || qConfort) && (
        <>
          <span className="puce" style={{ alignSelf: 'flex-start', background: 'var(--calme)', fontSize: 16 }}>
            {nomPartie}
          </span>
          <h1 className="titre" style={{ fontSize: 'clamp(28px, 3.6vw, 42px)' }}>
            {question?.texte ?? qConfort?.texte}
          </h1>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {options.map((o) => (
              <button
                key={o.valeur}
                className="btn"
                onClick={() => repondre(o.valeur)}
                style={{
                  justifyContent: 'space-between',
                  borderRadius: 22,
                  minHeight: 80,
                  fontSize: 24,
                  background: choixActuel === o.valeur ? '#E8F1FD' : 'var(--blanc)',
                  border: `3px solid ${choixActuel === o.valeur ? 'var(--ciel)' : 'var(--gris-bord)'}`,
                }}
              >
                {o.label}
                {choixActuel === o.valeur && (
                  <span style={{ color: 'var(--ciel)' }}>
                    <IconeCoche />
                  </span>
                )}
              </button>
            ))}
          </div>
          <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <button className="btn btn-contour" onClick={() => setEtape((e) => Math.max(0, e - 1))}>
              Question précédente
            </button>
            <p style={{ margin: 0, fontSize: 15, color: 'var(--encre-douce)', maxWidth: 480 }}>Il n’y a pas de bonne ou de mauvaise réponse.</p>
          </div>
        </>
      )}
    </div>
  )
}
