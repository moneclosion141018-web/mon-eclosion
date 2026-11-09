import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { son } from '../lib/sons'
import { taire } from '../lib/voix'
import { IconeCadenas, IconeMaison, IconeRetour, IconeVagues } from './Icones'

export function BarreHaut({ retour = '/carte', icone = 'maison', milieu, sansCalme }: { retour?: string; icone?: 'maison' | 'retour'; milieu?: ReactNode; sansCalme?: boolean }) {
  const nav = useNavigate()
  const aller = (chemin: string) => {
    son.clic()
    taire()
    nav(chemin)
  }
  return (
    <div className="barre-haut">
      <button className="rond" aria-label={icone === 'maison' ? 'Retour à la carte' : 'Retour'} onClick={() => aller(retour)}>
        {icone === 'maison' ? <IconeMaison /> : <IconeRetour />}
      </button>
      {milieu}
      <div className="groupe">
        {!sansCalme && (
          <button className="btn btn-calme" onClick={() => aller('/pause')}>
            <IconeVagues />
            Calme
          </button>
        )}
        <button className="btn btn-contour" style={{ borderWidth: 2 }} onClick={() => aller('/code')}>
          <IconeCadenas t={26} />
          Parent
        </button>
      </div>
    </div>
  )
}
