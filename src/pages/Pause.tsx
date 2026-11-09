import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dessin } from '../components/Dessins'
import { useApp } from '../contexte'
import { reglagesDe } from '../lib/progression'
import { parler, taire } from '../lib/voix'

export default function Pause() {
  const nav = useNavigate()
  const { enfant } = useApp()
  const sansAnim = reglagesDe(enfant).sansAnimation
  const [mode, setMode] = useState<'ballon' | 'aquarium'>('ballon')
  const [phase, setPhase] = useState<'Inspire' | 'Souffle'>('Inspire')

  useEffect(() => {
    if (mode !== 'ballon') return
    void parler('Respire avec le ballon.')
    const t = setInterval(() => setPhase((p) => (p === 'Inspire' ? 'Souffle' : 'Inspire')), 4000)
    return () => {
      clearInterval(t)
      taire()
    }
  }, [mode])

  return (
    <div className="ecran centre" style={{ background: mode === 'ballon' ? 'var(--calme)' : '#CFE3F7', justifyContent: 'space-between' }}>
      <h1 className="titre" style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 700 }}>
        {mode === 'ballon' ? 'Respire avec le ballon' : 'Regarde les poissons'}
      </h1>
      {mode === 'ballon' ? (
        <div style={{ width: 'min(440px, 70vw)', aspectRatio: '1', borderRadius: '50%', background: '#C3DBFB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div
            style={{
              width: '78%',
              aspectRatio: '1',
              borderRadius: '50%',
              background: '#7FAFEB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--titre)',
              fontSize: 40,
              fontWeight: 700,
              transform: sansAnim ? 'none' : phase === 'Inspire' ? 'scale(1)' : 'scale(0.7)',
              transition: 'transform 4s ease-in-out',
            }}
          >
            {phase}
          </div>
        </div>
      ) : (
        <div style={{ position: 'relative', width: '100%', flex: 1, maxHeight: 460 }} aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} style={{ position: 'absolute', top: `${10 + i * 22}%`, left: `${10 + ((i * 23) % 60)}%`, animation: sansAnim ? 'none' : `flotter ${5 + i}s ease-in-out infinite` }}>
              <Dessin nom="poisson" taille={110 + (i % 2) * 30} />
            </div>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button className="btn btn-contour" style={{ borderColor: '#7FAFEB' }} onClick={() => setMode(mode === 'ballon' ? 'aquarium' : 'ballon')}>
          {mode === 'ballon' ? 'Aquarium' : 'Ballon'}
        </button>
        <button className="btn btn-principal" onClick={() => nav('/carte', { replace: true })}>
          Reprendre le jeu
        </button>
      </div>
    </div>
  )
}
