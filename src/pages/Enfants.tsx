import { useNavigate } from 'react-router-dom'
import { IconeCadenas, IconePlus } from '../components/Icones'
import { Piou } from '../components/Piou'
import { useApp } from '../contexte'
import { son } from '../lib/sons'

export const COULEURS_ENFANTS = ['#1A66CC', '#2BB673', '#FF8A3D', '#FF6F8E', '#7E57C2', '#FFC531']
export const TEXTE_SUR = (c: string) => (c === '#1A66CC' || c === '#7E57C2' ? '#FFFFFF' : '#1F2A44')

export default function Enfants() {
  const { donnees, choisirEnfant, parentDeverrouille } = useApp()
  const nav = useNavigate()

  return (
    <div className="ecran">
      <div className="barre-haut">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Piou pose="parle" taille={80} />
          <h1 className="titre" style={{ fontSize: 'clamp(32px, 5vw, 52px)' }}>
            Qui joue aujourd’hui ?
          </h1>
        </div>
        <button className="btn btn-contour" style={{ borderWidth: 2 }} onClick={() => nav('/code')}>
          <IconeCadenas t={26} />
          Espace parent
        </button>
      </div>
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24, alignContent: 'center' }}>
        {donnees.enfants.map((e, i) => {
          const c = COULEURS_ENFANTS[i % COULEURS_ENFANTS.length]
          return (
            <button
              key={e.id}
              className="choix"
              style={{ borderColor: c, minHeight: 280 }}
              onClick={() => {
                son.clic()
                choisirEnfant(e.id)
                nav('/carte')
              }}
            >
              <span style={{ width: 150, height: 150, borderRadius: 75, background: c, color: TEXTE_SUR(c), display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--titre)', fontSize: 84, fontWeight: 800 }}>
                {e.surnom.slice(0, 1).toUpperCase()}
              </span>
              <span className="titre" style={{ fontSize: 38 }}>
                {e.surnom}
              </span>
            </button>
          )
        })}
        <button className="choix" style={{ borderStyle: 'dashed', borderColor: '#8A94AB', background: 'transparent', minHeight: 280, color: 'var(--encre-douce)' }} onClick={() => nav(parentDeverrouille || !donnees.enfants.length ? '/enfant/nouveau' : '/code?suite=/enfant/nouveau')}>
          <span style={{ width: 150, height: 150, borderRadius: 75, background: '#EEF1F7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconePlus />
          </span>
          Ajouter un enfant
        </button>
      </div>
    </div>
  )
}
