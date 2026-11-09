import { Navigate } from 'react-router-dom'
import { BarreHaut } from '../components/BarreHaut'
import { Dessin } from '../components/Dessins'
import { useApp } from '../contexte'

const DECORS = {
  jardin: { titre: 'Ton jardin', ciel: '#CDE6FF', sol: '#2BB673', objet: 'fleur', grand: 'arbre', pousse: 'pousse' },
  garage: { titre: 'Ton garage', ciel: '#E3E7EF', sol: '#8A94AB', objet: 'voiture', grand: 'maison', pousse: 'pousse' },
  ferme: { titre: 'Ta ferme', ciel: '#FFF1C9', sol: '#8BC34A', objet: 'mouton', grand: 'vache', pousse: 'pousse' },
} as const

function Pousse({ stade }: { stade: number }) {
  const h = 20 + stade * 14
  return (
    <svg width="110" height="150" viewBox="0 0 48 64" aria-hidden="true">
      <path d={`M24 64 V${64 - h * 0.6}`} stroke="#1E8A55" strokeWidth="5" strokeLinecap="round" />
      {stade >= 1 && <path d={`M24 ${64 - h * 0.35} Q10 ${58 - h * 0.35} 8 ${46 - h * 0.35} Q20 ${48 - h * 0.35} 24 ${60 - h * 0.35}`} fill="#2BB673" />}
      {stade >= 2 && <path d={`M24 ${60 - h * 0.45} Q38 ${54 - h * 0.45} 40 ${42 - h * 0.45} Q28 ${44 - h * 0.45} 24 ${56 - h * 0.45}`} fill="#2BB673" />}
      {stade >= 3 && <circle cx="24" cy={64 - h * 0.6} r="6" fill="#FFB3C1" stroke="#1F2A44" strokeWidth="2" />}
    </svg>
  )
}

export default function Jardin() {
  const { enfant, donnees } = useApp()
  if (!enfant) return <Navigate to="/enfants" replace />
  const d = DECORS[enfant.decor]
  const j = enfant.scores.jardin ?? { fleurs: 0, arbres: 0 }
  const essais = donnees.essais.filter((e) => e.enfant_id === enfant.id).length
  const stade = essais % 4
  const fleurs = Math.min(j.fleurs, 12)
  const arbres = Math.min(j.arbres, 3)
  const phrase =
    j.fleurs + j.arbres === 0
      ? 'Ta graine pousse à chaque essai. Continue !'
      : `${j.fleurs} ${enfant.decor === 'jardin' ? (j.fleurs > 1 ? 'fleurs' : 'fleur') : j.fleurs > 1 ? 'amis' : 'ami'} et une petite pousse. Bravo !`

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', background: d.ciel }}>
      <div className="ecran" style={{ flex: 'none', minHeight: 0 }}>
        <BarreHaut icone="retour" milieu={<h1 className="titre" style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}>{d.titre}</h1>} />
      </div>
      <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', alignContent: 'flex-end', justifyContent: 'center', gap: 24, padding: '0 24px' }}>
        {Array.from({ length: arbres }, (_, i) => (
          <span key={`a${i}`} className="eclot">
            <Dessin nom={d.grand} taille={220} />
          </span>
        ))}
        {Array.from({ length: fleurs }, (_, i) => (
          <span key={`f${i}`} className="eclot" style={{ animationDelay: `${i * 0.1}s` }}>
            <Dessin nom={d.objet} taille={140} />
          </span>
        ))}
        <Pousse stade={stade} />
      </div>
      <div style={{ height: 'clamp(100px, 18vh, 180px)', background: d.sol, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <p style={{ margin: 0, padding: '14px 28px', borderRadius: 32, background: 'var(--blanc)', fontSize: 22, fontWeight: 800, textAlign: 'center' }}>{phrase}</p>
      </div>
    </div>
  )
}
