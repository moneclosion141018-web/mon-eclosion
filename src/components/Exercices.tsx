import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Exercice, Option } from '../data/exercices'
import { ecouterSon, type Ecoute } from '../lib/micro'
import { son } from '../lib/sons'
import { parler, taire } from '../lib/voix'
import type { Resultat } from '../lib/types'
import { Dessin } from './Dessins'
import { IconeHautParleur, IconeMicro } from './Icones'
import { Piou } from './Piou'

export type FinExercice = (suggestion: Resultat) => void

function melanger<T>(t: T[]): T[] {
  const a = [...t]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function suggestionDepuisErreurs(n: number): Resultat {
  return n === 0 ? 'reussi' : n === 1 ? 'en_cours' : 'a_retravailler'
}

/* ---------- Consigne commune ---------- */
function Consigne({ texte, pose = 'parle', apresDire }: { texte: string; pose?: 'parle' | 'montre' | 'attend'; apresDire?: string }) {
  const dire = useCallback(async () => {
    await parler(texte)
    if (apresDire) await parler(apresDire, { lent: true })
  }, [texte, apresDire])
  useEffect(() => {
    const t = setTimeout(() => void dire(), 350)
    return () => {
      clearTimeout(t)
      taire()
    }
  }, [dire])
  return (
    <div className="consigne">
      <Piou pose={pose} taille={96} />
      <span>{texte}</span>
      <button className="rond" style={{ borderColor: 'var(--ciel)', color: 'var(--ciel)' }} aria-label="Réécouter la consigne" onClick={() => void dire()}>
        <IconeHautParleur />
      </button>
    </div>
  )
}

/* ---------- Bouton « À toi ! » avec écoute du micro ---------- */
function BoutonATOI({ surFini, texte = 'À toi !' }: { surFini: () => void; texte?: string }) {
  const [ecoute, setEcoute] = useState(false)
  const [niveau, setNiveau] = useState(0)
  const ref = useRef<Ecoute | null>(null)
  const fini = useRef(false)

  const finir = useCallback(() => {
    if (fini.current) return
    fini.current = true
    ref.current?.arreter()
    setEcoute(false)
    son.bravo()
    surFini()
  }, [surFini])

  useEffect(() => () => ref.current?.arreter(), [])

  const lancer = async () => {
    if (ecoute) return finir()
    taire()
    son.clic()
    setEcoute(true)
    const e = await ecouterSon(setNiveau, finir)
    if (!e) {
      // Pas de micro (refusé ou absent) : le parent valide simplement.
      setTimeout(finir, 600)
      return
    }
    ref.current = e
    // Au bout de 8 secondes, on passe quand même : chaque essai compte.
    setTimeout(finir, 8000)
  }

  return (
    <button
      className="btn btn-vert"
      onClick={() => void lancer()}
      style={{ boxShadow: ecoute ? `0 0 0 ${8 + niveau * 26}px rgba(43,182,115,0.25)` : 'none', transition: 'box-shadow 0.1s' }}
      aria-label={ecoute ? 'J’ai fini' : texte}
    >
      <IconeMicro />
      {ecoute ? 'Je t’écoute…' : texte}
    </button>
  )
}

/* ---------- Imiter un son ou un mot ---------- */
function Imiter({ ex, surFin }: { ex: Extract<Exercice, { type: 'imiter' }>; surFin: FinExercice }) {
  const reecouter = () => void parler(ex.modele, { lent: true })
  return (
    <>
      <Consigne texte={ex.consigne} apresDire={ex.modele} />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'clamp(16px, 4vw, 56px)', flexWrap: 'wrap' }}>
        {ex.grandTexte && (
          <button onClick={reecouter} aria-label={`Écouter ${ex.modele}`} style={{ minWidth: 'min(300px, 60vw)', minHeight: 'min(300px, 60vw)', padding: '0 32px', borderRadius: 999, background: 'var(--soleil)', border: '8px solid var(--encre)', fontFamily: 'var(--titre)', fontSize: ex.grandTexte.length > 2 ? 'clamp(64px, 10vw, 120px)' : 'clamp(120px, 20vw, 220px)', fontWeight: 800, lineHeight: 1, cursor: 'pointer', paddingTop: 20 }}>
            {ex.grandTexte}
          </button>
        )}
        {ex.dessin && (
          <button onClick={reecouter} aria-label={`Écouter ${ex.modele}`} style={{ width: 'min(380px, 70vw)', aspectRatio: '1', borderRadius: 48, background: 'var(--blanc)', border: '4px solid var(--soleil)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Dessin nom={ex.dessin} taille={260} />
          </button>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 20 }}>
          {ex.famille ? (
            <p className="titre" style={{ margin: 0, padding: '18px 36px', borderRadius: 40, background: 'var(--soleil)', fontSize: 'clamp(48px, 7vw, 80px)' }}>
              {ex.famille[0]} → {ex.famille[1]}
            </p>
          ) : (
            !ex.grandTexte && (
              <p className="titre" style={{ margin: 0, padding: '18px 36px', borderRadius: 40, background: 'var(--soleil)', fontSize: 'clamp(44px, 6vw, 72px)' }}>
                {ex.modele} !
              </p>
            )
          )}
          <button className="btn btn-contour" style={{ borderColor: 'var(--ciel)', color: 'var(--ciel)' }} onClick={reecouter}>
            <IconeHautParleur />
            Réécouter
          </button>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <BoutonATOI surFini={() => surFin('reussi')} />
      </div>
    </>
  )
}

/* ---------- Souffler pour ouvrir la fleur ---------- */
function Souffle({ ex, surFin }: { ex: Extract<Exercice, { type: 'souffle' }>; surFin: FinExercice }) {
  const [ouverture, setOuverture] = useState(0)
  const [ecoute, setEcoute] = useState(false)
  const ref = useRef<Ecoute | null>(null)
  const fini = useRef(false)
  const finir = useCallback(() => {
    if (fini.current) return
    fini.current = true
    ref.current?.arreter()
    setOuverture(1)
    son.bravo()
    setTimeout(() => surFin('reussi'), 1200)
  }, [surFin])
  useEffect(() => () => ref.current?.arreter(), [])

  const lancer = async () => {
    if (ecoute) return
    setEcoute(true)
    const e = await ecouterSon(
      (n) => setOuverture((o) => Math.max(o, Math.min(1, o + n * 0.03))),
      () => {},
      0.04,
    )
    if (!e) return
    ref.current = e
  }
  useEffect(() => {
    if (ouverture >= 0.98) finir()
  }, [ouverture, finir])

  const r = 10 + ouverture * 22
  return (
    <>
      <Consigne texte={ex.consigne} />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg viewBox="0 0 100 120" style={{ width: 'min(360px, 60vw)', height: 'auto' }} aria-hidden="true">
          <path d="M50 118 V60" stroke="#1E8A55" strokeWidth="5" strokeLinecap="round" />
          <path d="M50 96 Q30 88 26 74 Q44 76 50 90" fill="#2BB673" />
          {[0, 72, 144, 216, 288].map((d) => {
            const a = (d * Math.PI) / 180 - Math.PI / 2
            return <circle key={d} cx={50 + Math.cos(a) * r * 0.9} cy={40 + Math.sin(a) * r * 0.9} r={4 + ouverture * 12} fill="#FF8A3D" stroke="#1F2A44" strokeWidth="2" style={{ transition: 'all 0.2s' }} />
          })}
          <circle cx="50" cy="40" r={6 + ouverture * 6} fill="#FFC531" stroke="#1F2A44" strokeWidth="2" />
        </svg>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
        {!ecoute ? (
          <button className="btn btn-vert" onClick={() => void lancer()}>
            <IconeMicro />
            Je souffle !
          </button>
        ) : (
          <button className="btn btn-contour" onClick={finir}>
            La fleur est ouverte
          </button>
        )}
      </div>
    </>
  )
}

/* ---------- Choisir la bonne image ---------- */
function Choisir({ ex, surFin }: { ex: Extract<Exercice, { type: 'choisir' }>; surFin: FinExercice }) {
  const options = useMemo(() => melanger(ex.options), [ex])
  const [faux, setFaux] = useState<number[]>([])
  const [trouve, setTrouve] = useState<number | null>(null)
  const [direEtape, setDireEtape] = useState(false)

  const toucher = (i: number, o: Option) => {
    if (trouve !== null) return
    if (o.bon || ex.tousBons) {
      setTrouve(i)
      son.bravo()
      if (ex.tousBons && o.label) void parler(`${o.label}. Merci de me le dire !`)
      else if (ex.dire) {
        void parler(`Bravo ! Maintenant, dis : ${ex.dire}`).then(() => setDireEtape(true))
        return
      } else void parler('Bravo !')
      setTimeout(() => surFin(suggestionDepuisErreurs(faux.length)), 1400)
    } else {
      son.essaieEncore()
      void parler('Essaie encore.')
      setFaux((f) => (f.includes(i) ? f : [...f, i]))
    }
  }

  const colonnes = options.length === 4 ? 4 : options.length
  return (
    <>
      <Consigne texte={ex.consigne} pose={options.some((o) => o.pointe) ? 'montre' : 'parle'} />
      {ex.cible && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ padding: 12, borderRadius: 32, background: 'var(--soleil-clair)', border: '4px dashed var(--soleil)' }}>
            <Dessin nom={ex.cible} taille={140} titre="Image à trouver" />
          </div>
        </div>
      )}
      <div className="grille-choix" style={{ gridTemplateColumns: `repeat(${colonnes}, minmax(0, 1fr))` }}>
        {options.map((o, i) => (
          <button
            key={i}
            className={`choix ${trouve === i ? 'bon' : ''} ${faux.includes(i) ? 'doux' : ''}`}
            onClick={() => toucher(i, o)}
            aria-label={o.label ?? `Image ${i + 1}`}
            style={{ position: 'relative' }}
          >
            {o.pointe && (
              <span style={{ position: 'absolute', top: 8, right: 8 }} aria-hidden="true">
                <Piou pose="montre" taille={64} />
              </span>
            )}
            <span style={{ filter: ex.coloriage && trouve !== i ? 'grayscale(1) opacity(0.6)' : 'none', transition: 'filter 0.4s', display: 'flex', width: '100%', justifyContent: 'center' }}>
              <Dessin nom={o.dessin} />
            </span>
            {o.label && <span>{o.label}</span>}
          </button>
        ))}
      </div>
      {direEtape && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
          <BoutonATOI texte={`Dis « ${ex.dire} »`} surFini={() => surFin(suggestionDepuisErreurs(faux.length))} />
          <button className="btn btn-contour" onClick={() => surFin(suggestionDepuisErreurs(faux.length + 1))}>
            Il l’a montré
          </button>
        </div>
      )}
    </>
  )
}

/* ---------- Remettre dans l'ordre ---------- */
function Ordre({ ex, surFin }: { ex: Extract<Exercice, { type: 'ordre' }>; surFin: FinExercice }) {
  const cartes = useMemo(() => melanger(ex.etapes.map((e, i) => ({ ...e, rang: i }))), [ex])
  const [places, setPlaces] = useState<number[]>([])
  const [erreurs, setErreurs] = useState(0)
  const toucher = (rang: number) => {
    if (places.includes(rang)) return
    if (rang === places.length) {
      son.clic()
      void parler(ex.etapes[rang].label)
      const p = [...places, rang]
      setPlaces(p)
      if (p.length === ex.etapes.length) {
        son.bravo()
        setTimeout(() => surFin(suggestionDepuisErreurs(erreurs)), 1400)
      }
    } else {
      son.essaieEncore()
      void parler('Essaie encore. Qu’est-ce qui vient avant ?')
      setErreurs((e) => e + 1)
    }
  }
  return (
    <>
      <Consigne texte={ex.consigne} />
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${ex.etapes.length}, minmax(0, 1fr))`, gap: 16 }}>
        {ex.etapes.map((_, i) => (
          <div key={i} style={{ minHeight: 120, borderRadius: 28, border: '4px dashed var(--gris-bord)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: places[i] !== undefined ? '#eafaf1' : 'transparent', gap: 8 }}>
            <span className="titre" style={{ fontSize: 32, color: 'var(--encre-douce)' }}>
              {i + 1}
            </span>
            {places[i] !== undefined && <Dessin nom={ex.etapes[places[i]].dessin} taille={90} />}
          </div>
        ))}
      </div>
      <div className="grille-choix" style={{ gridTemplateColumns: `repeat(${cartes.length}, minmax(0, 1fr))` }}>
        {cartes.map((c) => (
          <button key={c.rang} className={`choix ${places.includes(c.rang) ? 'doux' : ''}`} onClick={() => toucher(c.rang)} disabled={places.includes(c.rang)}>
            <Dessin nom={c.dessin} />
            <span>{c.label}</span>
          </button>
        ))}
      </div>
    </>
  )
}

/* ---------- Tracer au doigt ou au stylet ---------- */
function guide(forme: string, w: number, h: number, lettre?: string): { x: number; y: number }[] {
  const pts: { x: number; y: number }[] = []
  const m = Math.min(w, h)
  if (forme === 'ligne') for (let i = 0; i <= 40; i++) pts.push({ x: w * 0.12 + (w * 0.76 * i) / 40, y: h / 2 })
  if (forme === 'vague') for (let i = 0; i <= 80; i++) pts.push({ x: w * 0.08 + (w * 0.84 * i) / 80, y: h / 2 + Math.sin((i / 80) * Math.PI * 6) * m * 0.16 })
  if (forme === 'rond') for (let i = 0; i <= 72; i++) pts.push({ x: w / 2 + Math.cos((i / 72) * Math.PI * 2) * m * 0.33, y: h / 2 + Math.sin((i / 72) * Math.PI * 2) * m * 0.33 })
  if (forme === 'lettre') {
    const H = m * 0.7
    const cx = w / 2
    const haut = h / 2 - H / 2
    const bas = h / 2 + H / 2
    const seg = (a: { x: number; y: number }, b: { x: number; y: number }, n = 30) => {
      for (let i = 0; i <= n; i++) pts.push({ x: a.x + ((b.x - a.x) * i) / n, y: a.y + ((b.y - a.y) * i) / n })
    }
    if (lettre === 'O') for (let i = 0; i <= 72; i++) pts.push({ x: cx + Math.cos((i / 72) * Math.PI * 2) * H * 0.36, y: h / 2 + Math.sin((i / 72) * Math.PI * 2) * H * 0.5 })
    else if (lettre === 'I') seg({ x: cx, y: haut }, { x: cx, y: bas })
    else {
      seg({ x: cx - H * 0.4, y: bas }, { x: cx, y: haut })
      seg({ x: cx, y: haut }, { x: cx + H * 0.4, y: bas })
      seg({ x: cx - H * 0.2, y: h / 2 + H * 0.1 }, { x: cx + H * 0.2, y: h / 2 + H * 0.1 }, 14)
    }
  }
  return pts
}

function Tracer({ ex, surFin }: { ex: Extract<Exercice, { type: 'tracer' }>; surFin: FinExercice }) {
  const zone = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const [pts, setPts] = useState<{ x: number; y: number }[]>([])
  const couverts = useRef<Set<number>>(new Set())
  const [progres, setProgres] = useState(0)
  const dessine = useRef(false)
  const fini = useRef(false)

  useEffect(() => {
    const el = zone.current
    const c = canvas.current
    if (!el || !c) return
    const r = el.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    c.width = r.width * dpr
    c.height = r.height * dpr
    const g = c.getContext('2d')!
    g.scale(dpr, dpr)
    const p = guide(ex.forme, r.width, r.height, ex.lettre)
    setPts(p)
    g.setLineDash([2, 18])
    g.lineCap = 'round'
    g.lineWidth = 14
    g.strokeStyle = '#C9D1E2'
    g.beginPath()
    p.forEach((q, i) => (i ? g.lineTo(q.x, q.y) : g.moveTo(q.x, q.y)))
    g.stroke()
    g.setLineDash([])
    // Point de départ en vert
    if (p.length) {
      g.fillStyle = '#2BB673'
      g.beginPath()
      g.arc(p[0].x, p[0].y, 14, 0, Math.PI * 2)
      g.fill()
    }
  }, [ex])

  const position = (e: React.PointerEvent) => {
    const r = canvas.current!.getBoundingClientRect()
    return { x: e.clientX - r.left, y: e.clientY - r.top }
  }
  const marquer = (q: { x: number; y: number }) => {
    pts.forEach((p, i) => {
      if (Math.hypot(p.x - q.x, p.y - q.y) < 34) couverts.current.add(i)
    })
    const v = pts.length ? couverts.current.size / pts.length : 0
    setProgres(v)
    if (v > 0.75 && !fini.current) {
      fini.current = true
      son.bravo()
      void parler(ex.dire ? `Bravo ! Dis : ${ex.dire}` : 'Bravo !')
      setTimeout(() => surFin('reussi'), 1600)
    }
  }
  const debut = (e: React.PointerEvent) => {
    dessine.current = true
    ;(e.target as Element).setPointerCapture(e.pointerId)
    const g = canvas.current!.getContext('2d')!
    const q = position(e)
    g.strokeStyle = '#1A66CC'
    g.lineWidth = 12
    g.lineCap = 'round'
    g.lineJoin = 'round'
    g.beginPath()
    g.moveTo(q.x, q.y)
    marquer(q)
  }
  const bouger = (e: React.PointerEvent) => {
    if (!dessine.current) return
    const g = canvas.current!.getContext('2d')!
    const q = position(e)
    g.lineTo(q.x, q.y)
    g.stroke()
    marquer(q)
  }

  return (
    <>
      <Consigne texte={ex.consigne} />
      <div ref={zone} style={{ flex: 1, minHeight: 260, background: 'var(--blanc)', borderRadius: 36, border: '4px solid var(--gris)', position: 'relative', touchAction: 'none' }}>
        <canvas ref={canvas} style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, borderRadius: 32 }} onPointerDown={debut} onPointerMove={bouger} onPointerUp={() => (dessine.current = false)} onPointerCancel={() => (dessine.current = false)} aria-label="Zone de dessin" />
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ width: 220, height: 14, borderRadius: 7, background: 'var(--gris)' }} aria-hidden="true">
          <div style={{ width: `${Math.min(100, (progres / 0.75) * 100)}%`, height: 14, borderRadius: 7, background: 'var(--feuille)' }} />
        </div>
        <button className="btn btn-contour" onClick={() => surFin(progres > 0.4 ? 'en_cours' : 'a_retravailler')}>
          J’ai fini
        </button>
      </div>
    </>
  )
}

/* ---------- Geste à faire, validé par le parent ---------- */
function Geste({ ex, surFin }: { ex: Extract<Exercice, { type: 'geste' }>; surFin: FinExercice }) {
  return (
    <>
      <Consigne texte={ex.consigne} apresDire={ex.texte} />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {ex.dessin ? (
          <div style={{ width: 'min(380px, 70vw)', aspectRatio: '1', borderRadius: 48, background: 'var(--blanc)', border: '4px solid var(--soleil)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Dessin nom={ex.dessin} taille={260} />
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            <Piou pose="montre" taille={180} />
            <Piou pose="attend" taille={180} />
          </div>
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button
          className="btn btn-vert"
          onClick={() => {
            son.bravo()
            surFin('reussi')
          }}
        >
          C’est fait !
        </button>
      </div>
    </>
  )
}

/* ---------- Bulles et étoile ---------- */
function Bulles({ ex, surFin, sansAnimation }: { ex: Extract<Exercice, { type: 'bulles' }>; surFin: FinExercice; sansAnimation: boolean }) {
  const total = ex.cible === 'bulle' ? 6 : 5
  const [restantes, setRestantes] = useState(() => Array.from({ length: total }, (_, i) => ({ id: i, x: 8 + Math.random() * 74, y: 10 + Math.random() * 60, d: 7 + Math.random() * 5 })))
  const [etoile, setEtoile] = useState({ x: 40, y: 40 })
  const [touches, setTouches] = useState(0)

  const fin = (n: number) => {
    if (n >= total) {
      son.bravo()
      void parler('Bravo !')
      setTimeout(() => surFin('reussi'), 1200)
    }
  }
  return (
    <>
      <Consigne texte={ex.consigne} />
      <div style={{ flex: 1, position: 'relative', minHeight: 300, borderRadius: 36, background: 'var(--calme)', overflow: 'hidden' }}>
        {ex.cible === 'bulle'
          ? restantes.map((b) => (
              <button
                key={b.id}
                aria-label="Bulle"
                onClick={() => {
                  son.clic()
                  const r = restantes.filter((x) => x.id !== b.id)
                  setRestantes(r)
                  fin(total - r.length)
                }}
                style={{
                  position: 'absolute',
                  left: `${b.x}%`,
                  top: `${b.y}%`,
                  width: 'calc(110px * var(--echelle))',
                  height: 'calc(110px * var(--echelle))',
                  border: 'none',
                  background: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  animation: sansAnimation ? 'none' : `flotter ${b.d / 2}s ease-in-out infinite`,
                }}
              >
                <Dessin nom="bulle" />
              </button>
            ))
          : touches < total && (
              <button
                aria-label="Étoile"
                onClick={() => {
                  son.clic()
                  const n = touches + 1
                  setTouches(n)
                  setEtoile({ x: 8 + Math.random() * 74, y: 8 + Math.random() * 64 })
                  fin(n)
                }}
                style={{ position: 'absolute', left: `${etoile.x}%`, top: `${etoile.y}%`, width: 'calc(120px * var(--echelle))', height: 'calc(120px * var(--echelle))', border: 'none', background: 'none', padding: 0, cursor: 'pointer', transition: sansAnimation ? 'none' : 'left 0.8s ease, top 0.8s ease' }}
              >
                <Dessin nom="etoile" />
              </button>
            )}
      </div>
    </>
  )
}

/* ---------- Jeu à deux : chacun son tour ---------- */
function Tour({ ex, surFin }: { ex: Extract<Exercice, { type: 'tour' }>; surFin: FinExercice }) {
  const [passes, setPasses] = useState(0)
  const cote = passes % 2 === 0 ? 'enfant' : 'parent'
  const total = 6
  const passer = () => {
    son.clic()
    const n = passes + 1
    setPasses(n)
    if (n >= total) {
      son.bravo()
      void parler('Bravo, vous avez bien joué chacun votre tour !')
      setTimeout(() => surFin('reussi'), 1600)
    } else void parler(n % 2 === 0 ? 'À toi !' : 'À moi !')
  }
  return (
    <>
      <Consigne texte={ex.consigne} />
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 24 }}>
        {(['enfant', 'parent'] as const).map((c) => (
          <div key={c} style={{ borderRadius: 36, background: c === 'enfant' ? 'var(--soleil-clair)' : 'var(--calme)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 16 }}>
            <span className="titre" style={{ fontSize: 32 }}>
              {c === 'enfant' ? 'À toi !' : 'À moi !'}
            </span>
            {cote === c && passes < total ? (
              <button aria-label="Lancer la balle" onClick={passer} style={{ width: 'calc(180px * var(--echelle))', height: 'calc(180px * var(--echelle))', border: 'none', background: 'none', cursor: 'pointer' }}>
                <Dessin nom="ballon" />
              </button>
            ) : (
              <div style={{ width: 180, height: 180 }} />
            )}
          </div>
        ))}
      </div>
      <p style={{ margin: 0, textAlign: 'center', fontSize: 18, fontWeight: 700 }}>
        {Math.min(passes, total)} passes sur {total}
      </p>
    </>
  )
}

/* ---------- Pictogrammes à découvrir ---------- */
function Pictos({ ex, surFin }: { ex: Extract<Exercice, { type: 'pictos' }>; surFin: FinExercice }) {
  const [vus, setVus] = useState<number[]>([])
  return (
    <>
      <Consigne texte={ex.consigne} />
      <div className="grille-choix" style={{ gridTemplateColumns: `repeat(${Math.min(4, ex.pictos.length)}, minmax(0, 1fr))` }}>
        {ex.pictos.map((p, i) => (
          <button
            key={p.mot}
            className={`choix ${vus.includes(i) ? 'bon' : ''}`}
            onClick={() => {
              son.clic()
              void parler(p.mot, { lent: true })
              const v = vus.includes(i) ? vus : [...vus, i]
              setVus(v)
              if (v.length === ex.pictos.length) setTimeout(() => surFin('reussi'), 1500)
            }}
          >
            <Dessin nom={p.dessin} />
            <span>{p.mot}</span>
          </button>
        ))}
      </div>
    </>
  )
}

/* ---------- Petite histoire ---------- */
function Histoire({ ex, surFin }: { ex: Extract<Exercice, { type: 'histoire' }>; surFin: FinExercice }) {
  const [page, setPage] = useState(0)
  const question = page >= ex.phrases.length
  useEffect(() => {
    if (!question) void parler(ex.phrases[page].texte)
  }, [page, question, ex])
  if (question) return <Choisir ex={{ type: 'choisir', id: ex.id, consigne: ex.question, options: ex.options }} surFin={surFin} />
  const p = ex.phrases[page]
  return (
    <>
      <div className="consigne">
        <Piou pose="parle" taille={96} />
        <span>{p.texte}</span>
        <button className="rond" style={{ borderColor: 'var(--ciel)', color: 'var(--ciel)' }} aria-label="Réécouter" onClick={() => void parler(p.texte)}>
          <IconeHautParleur />
        </button>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 'min(380px, 70vw)', aspectRatio: '1', borderRadius: 48, background: 'var(--blanc)', border: '4px solid var(--soleil)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Dessin nom={p.dessin} taille={260} />
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, alignItems: 'center' }}>
        {ex.phrases.map((_, i) => (
          <span key={i} style={{ width: 18, height: 18, borderRadius: 9, background: i <= page ? 'var(--feuille)' : 'var(--gris)' }} />
        ))}
        <button
          className="btn btn-principal"
          style={{ marginLeft: 16 }}
          onClick={() => {
            son.clic()
            setPage(page + 1)
          }}
        >
          Suite
        </button>
      </div>
    </>
  )
}

/* ---------- Devinette : poser des questions à Piou ---------- */
function Devinette({ ex, surFin }: { ex: Extract<Exercice, { type: 'devinette' }>; surFin: FinExercice }) {
  const [posees, setPosees] = useState<number[]>([])
  const [ouvert, setOuvert] = useState(false)
  return (
    <>
      <Consigne texte={ex.consigne} />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32, flexWrap: 'wrap' }}>
        <div style={{ width: 'min(300px, 60vw)', aspectRatio: '1', borderRadius: 48, background: 'var(--blanc)', border: '4px solid var(--soleil)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Dessin nom={ouvert ? ex.objet : 'cadeau'} taille={200} titre={ouvert ? ex.nomObjet : 'Objet caché'} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 260 }}>
          {ex.questions.map((q, i) => (
            <button
              key={q.texte}
              className={`btn ${posees.includes(i) ? 'btn-soleil' : 'btn-contour'}`}
              style={{ justifyContent: 'flex-start', borderRadius: 24 }}
              onClick={() => {
                son.clic()
                void parler(q.reponse)
                setPosees((p) => (p.includes(i) ? p : [...p, i]))
              }}
            >
              {posees.includes(i) ? `${q.texte} ${q.reponse}` : q.texte}
            </button>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        {!ouvert ? (
          <button
            className="btn btn-vert"
            disabled={posees.length < 2}
            onClick={() => {
              setOuvert(true)
              son.bravo()
              void parler(`C’était ${ex.nomObjet} ! Tu avais trouvé ?`)
              setTimeout(() => surFin('reussi'), 2600)
            }}
          >
            Ouvrir la boîte
          </button>
        ) : (
          <p className="titre" style={{ margin: 0, fontSize: 40 }}>
            C’était {ex.nomObjet} !
          </p>
        )}
      </div>
    </>
  )
}

export function VueExercice({ ex, surFin, sansAnimation }: { ex: Exercice; surFin: FinExercice; sansAnimation: boolean }) {
  switch (ex.type) {
    case 'imiter':
      return <Imiter ex={ex} surFin={surFin} />
    case 'souffle':
      return <Souffle ex={ex} surFin={surFin} />
    case 'choisir':
      return <Choisir ex={ex} surFin={surFin} />
    case 'ordre':
      return <Ordre ex={ex} surFin={surFin} />
    case 'tracer':
      return <Tracer ex={ex} surFin={surFin} />
    case 'geste':
      return <Geste ex={ex} surFin={surFin} />
    case 'bulles':
      return <Bulles ex={ex} surFin={surFin} sansAnimation={sansAnimation} />
    case 'tour':
      return <Tour ex={ex} surFin={surFin} />
    case 'pictos':
      return <Pictos ex={ex} surFin={surFin} />
    case 'histoire':
      return <Histoire ex={ex} surFin={surFin} />
    case 'devinette':
      return <Devinette ex={ex} surFin={surFin} />
  }
}
