import { useEffect, useState, type FormEvent } from 'react'
import { Piou } from '../components/Piou'
import { supabase } from '../lib/supabase'

type Mode = 'inscription' | 'connexion' | 'oubli'

export default function Bienvenue() {
  const [mode, setMode] = useState<Mode>('inscription')
  const [mail, setMail] = useState('')
  const [mdp, setMdp] = useState('')
  const [accord, setAccord] = useState(false)
  const [message, setMessage] = useState<{ type: 'erreur' | 'info'; texte: string } | null>(null)
  const [occupe, setOccupe] = useState(false)

  const retour = window.location.origin + window.location.pathname

  // Retour depuis le lien du mail : si la connexion automatique n'a pas pu se faire
  // (autre navigateur, autre appareil), l'adresse est quand même confirmée.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    const h = new URLSearchParams(window.location.hash.replace(/^#\/?/, ''))
    const erreur = p.get('error_description') ?? h.get('error_description')
    if (!p.get('code') && !erreur) return
    const t = setTimeout(() => {
      setMode('connexion')
      setMessage(
        erreur && /expired|invalid/i.test(erreur)
          ? { type: 'erreur', texte: 'Ce lien a expiré. Connectez-vous : si l’adresse n’est pas encore confirmée, un nouveau mail vous sera proposé.' }
          : { type: 'info', texte: 'Votre adresse mail est confirmée. Connectez-vous avec votre mot de passe.' },
      )
      window.history.replaceState(null, '', window.location.pathname)
    }, 1500)
    return () => clearTimeout(t)
  }, [])

  async function envoyer(e: FormEvent) {
    e.preventDefault()
    setMessage(null)
    if (!navigator.onLine) {
      setMessage({ type: 'erreur', texte: 'Une connexion Internet est nécessaire pour créer le compte ou se connecter la première fois.' })
      return
    }
    setOccupe(true)
    try {
      if (mode === 'inscription') {
        if (!accord) {
          setMessage({ type: 'erreur', texte: 'Merci de cocher la case d’accord pour continuer.' })
          return
        }
        const { data, error } = await supabase.auth.signUp({ email: mail, password: mdp, options: { emailRedirectTo: retour } })
        if (error) throw error
        if (!data.session) setMessage({ type: 'info', texte: 'Un mail de confirmation vient de partir. Cliquez sur le lien qu’il contient, puis revenez ici.' })
      } else if (mode === 'connexion') {
        const { error } = await supabase.auth.signInWithPassword({ email: mail, password: mdp })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(mail, { redirectTo: retour })
        if (error) throw error
        setMessage({ type: 'info', texte: 'Si ce compte existe, un mail pour changer le mot de passe vient de partir.' })
      }
    } catch (err) {
      const t = err instanceof Error ? err.message : ''
      setMessage({
        type: 'erreur',
        texte: /invalid login/i.test(t)
          ? 'Adresse mail ou mot de passe incorrect.'
          : /already registered/i.test(t)
            ? 'Un compte existe déjà avec cette adresse. Essayez de vous connecter.'
            : /password/i.test(t)
              ? 'Le mot de passe doit faire au moins 8 caractères.'
              : /confirm/i.test(t)
                ? 'Votre adresse mail n’est pas encore confirmée. Ouvrez le mail de confirmation.'
                : 'Une erreur est survenue. Vérifiez la connexion et réessayez.',
      })
    } finally {
      setOccupe(false)
    }
  }

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexWrap: 'wrap' }}>
      <div style={{ flex: '1 1 380px', background: 'var(--soleil)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 32, textAlign: 'center' }}>
        <Piou pose="felicite" taille={220} className="flotte" />
        <h1 className="titre" style={{ fontSize: 'clamp(44px, 6vw, 72px)' }}>
          Mon Éclosion
        </h1>
        <p style={{ margin: 0, fontSize: 20, fontWeight: 700, maxWidth: 420 }}>Un jeu d’apprentissage pensé pour les enfants différents, à partager en famille.</p>
      </div>
      <form onSubmit={envoyer} style={{ flex: '1 1 420px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 20, padding: 'clamp(24px, 5vw, 64px)', maxWidth: 640 }}>
        <h2 className="titre" style={{ fontSize: 36 }}>
          {mode === 'inscription' ? 'Créer mon compte parent' : mode === 'connexion' ? 'Me connecter' : 'Mot de passe oublié'}
        </h2>
        {mode === 'inscription' && <p style={{ margin: 0, fontSize: 17, color: 'var(--encre-douce)' }}>Le compte garde les progrès de vos enfants, même si vous changez de tablette.</p>}
        <div className="champ">
          <label htmlFor="mail">Adresse mail</label>
          <input id="mail" type="email" autoComplete="email" required value={mail} onChange={(e) => setMail(e.target.value)} placeholder="vous@exemple.fr" />
        </div>
        {mode !== 'oubli' && (
          <div className="champ">
            <label htmlFor="mdp">Mot de passe</label>
            <input
              id="mdp"
              type="password"
              autoComplete={mode === 'inscription' ? 'new-password' : 'current-password'}
              required
              minLength={8}
              value={mdp}
              onChange={(e) => setMdp(e.target.value)}
              placeholder="8 caractères minimum"
            />
          </div>
        )}
        {mode === 'inscription' && (
          <label style={{ display: 'flex', gap: 12, alignItems: 'flex-start', fontSize: 16, lineHeight: 1.4 }}>
            <input type="checkbox" checked={accord} onChange={(e) => setAccord(e.target.checked)} style={{ width: 26, height: 26, margin: 0, flexShrink: 0 }} />
            J’accepte que les progrès de mon enfant soient enregistrés pour le suivi du jeu. Aucune voix ni photo n’est enregistrée, et rien n’est partagé sans mon accord.
          </label>
        )}
        {message && <p className={`message ${message.type}`} role="status">{message.texte}</p>}
        <button className="btn btn-principal" type="submit" disabled={occupe}>
          {occupe ? 'Un instant…' : mode === 'inscription' ? 'Créer mon compte' : mode === 'connexion' ? 'Me connecter' : 'Recevoir le mail'}
        </button>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
          {mode !== 'connexion' && (
            <button type="button" className="btn btn-lien" onClick={() => setMode('connexion')}>
              J’ai déjà un compte
            </button>
          )}
          {mode !== 'inscription' && (
            <button type="button" className="btn btn-lien" onClick={() => setMode('inscription')}>
              Créer un compte
            </button>
          )}
          {mode === 'connexion' && (
            <button type="button" className="btn btn-lien" onClick={() => setMode('oubli')}>
              Mot de passe oublié
            </button>
          )}
        </div>
        <p style={{ margin: 0, fontSize: 14, color: 'var(--encre-douce)', textAlign: 'center' }}>Mon Éclosion est un jeu d’apprentissage. Il ne remplace pas l’accompagnement d’un professionnel.</p>
      </form>
    </div>
  )
}
