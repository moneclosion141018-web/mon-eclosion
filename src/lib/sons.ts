// Petits sons doux générés à la volée (pas de fichier à télécharger).
let ctx: AudioContext | null = null
let actif = true
let doux = false

export function reglerSons(sons: boolean, sansBruitFort: boolean) {
  actif = sons
  doux = sansBruitFort
}

function audio() {
  if (!ctx) {
    const C = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!C) return null
    ctx = new C()
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

function note(freq: number, debut: number, duree: number, volume: number) {
  const a = audio()
  if (!a) return
  const o = a.createOscillator()
  const g = a.createGain()
  o.type = 'sine'
  o.frequency.value = freq
  const v = doux ? volume * 0.4 : volume
  const t = a.currentTime + debut
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(v, t + 0.02)
  g.gain.exponentialRampToValueAtTime(0.0001, t + duree)
  o.connect(g).connect(a.destination)
  o.start(t)
  o.stop(t + duree + 0.05)
}

export const son = {
  clic() {
    if (actif) note(660, 0, 0.12, 0.12)
  },
  bravo() {
    if (!actif) return
    note(523, 0, 0.18, 0.15)
    note(659, 0.12, 0.18, 0.15)
    note(784, 0.24, 0.3, 0.15)
  },
  essaieEncore() {
    if (actif) note(440, 0, 0.2, 0.1)
  },
  pousse() {
    if (!actif) return
    note(392, 0, 0.25, 0.12)
    note(587, 0.18, 0.35, 0.12)
  },
}
