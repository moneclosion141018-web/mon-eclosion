import { Navigate, Route, Routes } from 'react-router-dom'
import { Piou } from './components/Piou'
import { useApp } from './contexte'
import Bienvenue from './pages/Bienvenue'
import Carte from './pages/Carte'
import Code from './pages/Code'
import Enfants from './pages/Enfants'
import Fin from './pages/Fin'
import Jardin from './pages/Jardin'
import Jeu from './pages/Jeu'
import Parent from './pages/Parent'
import Pause from './pages/Pause'
import Questionnaire from './pages/Questionnaire'
import Resultat from './pages/Resultat'

function Chargement() {
  return (
    <div className="ecran centre">
      <Piou pose="attend" taille={160} className="flotte" />
      <p className="titre" style={{ fontSize: 32 }}>
        Mon Éclosion
      </p>
    </div>
  )
}

// Décide du premier écran selon l'état du compte.
function Racine() {
  const { donnees, enfant } = useApp()
  if (!donnees.codeHash) return <Navigate to="/code/nouveau" replace />
  if (!donnees.enfants.length) return <Navigate to="/enfant/nouveau" replace />
  if (!enfant) return <Navigate to="/enfants" replace />
  return <Navigate to="/carte" replace />
}

export default function App() {
  const { session, pret } = useApp()
  if (!pret) return <Chargement />
  return (
    <>
      <div className="tourner" role="alert">
        <Piou pose="montre" taille={140} />
        Tourne le téléphone pour jouer
      </div>
      {!session ? (
        <Routes>
          <Route path="*" element={<Bienvenue />} />
        </Routes>
      ) : (
        <Routes>
          <Route path="/" element={<Racine />} />
          <Route path="/code/nouveau" element={<Code mode="creer" />} />
          <Route path="/code/changer" element={<Code mode="creer" />} />
          <Route path="/code" element={<Code mode="verifier" />} />
          <Route path="/enfants" element={<Enfants />} />
          <Route path="/enfant/nouveau" element={<Questionnaire />} />
          <Route path="/questionnaire/:id" element={<Questionnaire />} />
          <Route path="/resultat/:id" element={<Resultat />} />
          <Route path="/carte" element={<Carte />} />
          <Route path="/jeu" element={<Jeu />} />
          <Route path="/jardin" element={<Jardin />} />
          <Route path="/pause" element={<Pause />} />
          <Route path="/fin" element={<Fin />} />
          <Route path="/parent" element={<Parent />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
    </>
  )
}
