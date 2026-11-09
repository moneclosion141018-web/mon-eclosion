import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { IconeCadenas, IconeCoche, IconeEffacer } from '../components/Icones'
import { useApp } from '../contexte'
import { nouveauCalcul } from '../lib/code'
import { son } from '../lib/sons'

const touche: React.CSSProperties = {
  minHeight: 'calc(84px * var(--echelle))',
  borderRadius: 24,
  border: 'none',
  background: '#2C3A5C',
  color: '#fff',
  fontFamily: 'var(--titre)',
  fontSize: 38,
  fontWeight: 700,
  cursor: 'pointer',
}

export default function Code({ mode }: { mode: 'creer' | 'verifier' }) {
  const { definirCode, verifierCode, deverrouillerParent, donnees } = useApp()
  const nav = useNavigate()
  const [params] = useSearchParams()
  const suiteDemandee = params.get('suite')
  const suite = suiteDemandee ?? '/parent'
  const [saisie, setSaisie] = useState('')
  const [premier, setPremier] = useState<string | null>(null)
  const [erreur, setErreur] = useState('')
  const [secours, setSecours] = useState<ReturnType<typeof nouveauCalcul> | null>(null)
  const [reponse, setReponse] = useState('')

  const creation = mode === 'creer' || !donnees.codeHash

  useEffect(() => {
    if (saisie.length < 4) return
    const code = saisie
    const t = setTimeout(async () => {
      if (creation) {
        if (!premier) {
          setPremier(code)
          setSaisie('')
          return
        }
        if (premier !== code) {
          setErreur('Les deux codes ne sont pas pareils. Recommencez.')
          setPremier(null)
          setSaisie('')
          return
        }
        await definirCode(code)
        deverrouillerParent(true)
        nav(suiteDemandee ?? (mode === 'creer' ? '/' : '/parent'), { replace: true })
      } else if (await verifierCode(code)) {
        deverrouillerParent(true)
        nav(suite, { replace: true })
      } else {
        setErreur('Ce n’est pas le bon code.')
        setSaisie('')
      }
    }, 150)
    return () => clearTimeout(t)
  }, [saisie, creation, premier, definirCode, verifierCode, deverrouillerParent, nav, mode, suite, suiteDemandee])

  const taper = (c: string) => {
    son.clic()
    setErreur('')
    setSaisie((s) => (s.length < 4 ? s + c : s))
  }

  const titre = creation ? (premier ? 'Confirmez votre code' : 'Choisissez un code parent') : 'Espace parent'
  const texte = creation
    ? premier
      ? 'Tapez le même code une deuxième fois.'
      : 'Ce code à 4 chiffres protège l’espace parent. Votre enfant ne doit pas le connaître.'
    : 'Entrez votre code à 4 chiffres.'

  return (
    <div style={{ minHeight: '100%', background: 'var(--encre)', color: '#fff', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 40, padding: 'clamp(20px, 4vw, 48px)' }}>
      <div style={{ flex: '1 1 320px', maxWidth: 460, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {!creation && (
          <button className="btn" style={{ alignSelf: 'flex-start', border: '2px solid #4A5672', color: '#fff', background: 'none', minHeight: 52 }} onClick={() => nav(-1)}>
            Retour au jeu
          </button>
        )}
        <span style={{ color: 'var(--soleil)' }}>
          <IconeCadenas t={64} />
        </span>
        <h1 className="titre" style={{ fontSize: 44 }}>
          {titre}
        </h1>
        <p style={{ margin: 0, fontSize: 19, color: '#D5DBE8' }}>{texte}</p>
        <div style={{ display: 'flex', gap: 18 }} aria-label={`${saisie.length} chiffres saisis sur 4`}>
          {[0, 1, 2, 3].map((i) => (
            <span key={i} style={{ width: 26, height: 26, borderRadius: 13, background: i < saisie.length ? 'var(--soleil)' : 'transparent', border: i < saisie.length ? 'none' : '3px solid #8A94AB' }} />
          ))}
        </div>
        {erreur && (
          <p role="alert" style={{ margin: 0, color: '#FFB3A0', fontWeight: 700 }}>
            {erreur}
          </p>
        )}
        {!creation && !secours && (
          <button className="btn btn-lien" style={{ color: '#9CC3F2', alignSelf: 'flex-start', padding: 0 }} onClick={() => setSecours(nouveauCalcul())}>
            Code oublié ? Répondre à un calcul
          </button>
        )}
        {secours && (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (Number(reponse) === secours.reponse) {
                deverrouillerParent(true)
                nav('/code/changer?suite=/parent', { replace: true })
              } else {
                setErreur('Ce n’est pas la bonne réponse.')
                setSecours(nouveauCalcul())
                setReponse('')
              }
            }}
            style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}
          >
            <label htmlFor="calcul" style={{ fontSize: 22, fontWeight: 800 }}>
              Combien font {secours.question} ?
            </label>
            <input id="calcul" inputMode="numeric" value={reponse} onChange={(e) => setReponse(e.target.value)} style={{ width: 100, height: 52, borderRadius: 14, border: 'none', fontSize: 22, textAlign: 'center', color: 'var(--encre)' }} />
            <button className="btn btn-soleil" type="submit" style={{ minHeight: 52 }}>
              Valider
            </button>
          </form>
        )}
      </div>
      <div style={{ flex: '1 1 300px', maxWidth: 420, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 14 }}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((c) => (
          <button key={c} style={touche} onClick={() => taper(c)}>
            {c}
          </button>
        ))}
        <button style={{ ...touche, background: 'transparent' }} aria-label="Effacer" onClick={() => setSaisie((s) => s.slice(0, -1))}>
          <IconeEffacer />
        </button>
        <button style={touche} onClick={() => taper('0')}>
          0
        </button>
        <span style={{ ...touche, background: saisie.length === 4 ? 'var(--soleil)' : '#2C3A5C', color: 'var(--encre)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-hidden="true">
          <IconeCoche t={40} />
        </span>
      </div>
    </div>
  )
}
