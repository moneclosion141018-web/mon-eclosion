// Voix de synthèse intégrée à l'appareil : fonctionne sans Internet sur la plupart des tablettes.
let voixChoisie: SpeechSynthesisVoice | null = null

const NOMS_MASCULINS = /thomas|paul|henri|nicolas|mathieu|daniel|antoine|fabrice|guillaume|jacques|male|homme|man/i

function choisirVoix() {
  if (!('speechSynthesis' in window)) return null
  const toutes = window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith('fr'))
  if (!toutes.length) return null
  const france = toutes.filter((v) => v.lang.toLowerCase() === 'fr-fr')
  const groupe = france.length ? france : toutes
  return groupe.find((v) => NOMS_MASCULINS.test(v.name) && v.localService) ?? groupe.find((v) => NOMS_MASCULINS.test(v.name)) ?? groupe.find((v) => v.localService) ?? groupe[0]
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  voixChoisie = choisirVoix()
  window.speechSynthesis.onvoiceschanged = () => {
    voixChoisie = choisirVoix()
  }
}

export function voixDisponible() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

export function parler(texte: string, options: { lent?: boolean } = {}): Promise<void> {
  return new Promise((resolve) => {
    if (!voixDisponible()) return resolve()
    const synth = window.speechSynthesis
    synth.cancel()
    const u = new SpeechSynthesisUtterance(texte)
    u.lang = 'fr-FR'
    if (voixChoisie) u.voice = voixChoisie
    u.rate = options.lent ? 0.7 : 0.85
    u.pitch = 0.95
    const fin = () => resolve()
    u.onend = fin
    u.onerror = fin
    synth.speak(u)
    // Sécurité : certaines tablettes n'envoient jamais l'événement de fin.
    setTimeout(fin, Math.max(2500, texte.length * 120))
  })
}

export function taire() {
  if (voixDisponible()) window.speechSynthesis.cancel()
}
