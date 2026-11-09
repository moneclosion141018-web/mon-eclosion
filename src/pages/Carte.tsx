import { Navigate, useNavigate } from 'react-router-dom'
import { BarreHaut } from '../components/BarreHaut'
import { Dessin } from '../components/Dessins'
import { Piou } from '../components/Piou'
import { useApp } from '../contexte'
import { limiteSecondes, NOMS_NIVEAUX } from '../lib/progression'
import { aujourdhui } from '../lib/store'
import { son } from '../lib/sons'
import type { Niveau } from '../lib/types'

export default function Carte() {
  const { enfant, secondesAujourdhui } = useApp()
  const nav = useNavigate()
  if (!enfant) return <Navigate to="/enfants" replace />
  const limite = limiteSecondes(enfant, aujourdhui())
  const fini = limite > 0 && secondesAujourdhui >= limite

  return (
    <div className="ecran" style={{ background: 'var(--fond-vert)' }}>
      <BarreHaut retour="/enfants" />
      <h1 className="titre" style={{ textAlign: 'center', fontSize: 'clamp(36px, 5vw, 56px)' }}>
        Bonjour {enfant.surnom} !
      </h1>
      <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 'clamp(20px, 4vw, 56px)', paddingTop: 80 }}>
        {([1, 2, 3, 4] as Niveau[]).map((n) => {
          const termine = n < enfant.niveau || (enfant.parcours_termine && n === 4)
          const actuel = n === enfant.niveau && !enfant.parcours_termine
          return (
            <div key={n} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, position: 'relative', width: 170 }}>
              {actuel && (
                <div style={{ position: 'absolute', top: -100 }} className="flotte">
                  <Piou pose="felicite" taille={100} coquille={n - 1} />
                </div>
              )}
              {actuel ? (
                <button
                  onClick={() => {
                    son.clic()
                    nav(fini ? '/fin' : '/jeu')
                  }}
                  style={{ width: 'calc(170px * var(--echelle))', height: 'calc(170px * var(--echelle))', borderRadius: '50%', background: 'var(--soleil)', border: '8px solid var(--encre)', fontFamily: 'var(--titre)', fontSize: 40, fontWeight: 800, cursor: 'pointer' }}
                >
                  Jouer
                </button>
              ) : (
                <span style={{ width: 130, height: 130, borderRadius: '50%', background: termine ? 'var(--feuille)' : 'var(--blanc)', border: termine ? 'none' : '4px solid #A9B3C8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {termine ? <Dessin nom="fleur" taille={96} /> : <svg width="56" height="56" viewBox="0 0 48 48" aria-hidden="true"><ellipse cx="24" cy="30" rx="10" ry="12" fill="#C8A27A" /><path d="M24 18 Q24 8 32 6" fill="none" stroke="#2BB673" strokeWidth="4" strokeLinecap="round" /></svg>}
                </span>
              )}
              <span style={{ fontSize: 22, fontWeight: 800, color: termine || actuel ? 'var(--encre)' : 'var(--encre-douce)' }}>Niveau {n}</span>
              <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--encre-douce)', textAlign: 'center' }}>{NOMS_NIVEAUX[enfant.profil][n]}</span>
            </div>
          )
        })}
        {enfant.parcours_termine && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <button className="btn btn-soleil" onClick={() => nav(fini ? '/fin' : '/jeu')} style={{ minHeight: 120, fontSize: 28 }}>
              Rejouer
            </button>
          </div>
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button className="btn btn-contour" style={{ borderColor: 'var(--feuille)', borderWidth: 4 }} onClick={() => nav('/jardin')}>
          <Dessin nom={enfant.decor === 'garage' ? 'voiture' : enfant.decor === 'ferme' ? 'vache' : 'fleur'} taille={40} />
          {enfant.decor === 'garage' ? 'Mon garage' : enfant.decor === 'ferme' ? 'Ma ferme' : 'Mon jardin'}
        </button>
      </div>
    </div>
  )
}
