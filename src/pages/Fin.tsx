import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Piou } from '../components/Piou'
import { parler } from '../lib/voix'

export default function Fin() {
  const nav = useNavigate()
  useEffect(() => {
    void parler('C’est fini pour aujourd’hui. Piou va faire dodo. À demain !')
  }, [])
  return (
    <div className="ecran centre" style={{ background: '#2C3A5C', color: '#fff' }}>
      <Piou pose="dort" taille={220} />
      <h1 className="titre" style={{ fontSize: 'clamp(40px, 6vw, 64px)' }}>
        C’est fini pour aujourd’hui
      </h1>
      <p style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Piou fait dodo. À demain !</p>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button className="btn btn-soleil" onClick={() => nav('/jardin')}>
          Voir mon jardin
        </button>
        <button className="btn" style={{ border: '2px solid #8A94AB', color: '#fff', background: 'none' }} onClick={() => nav('/code?suite=/parent')}>
          Parent : prolonger
        </button>
      </div>
    </div>
  )
}
