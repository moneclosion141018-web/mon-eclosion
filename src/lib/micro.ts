// Le micro sert seulement à savoir qu'un son a été émis. Rien n'est enregistré ni envoyé.
export interface Ecoute {
  arreter: () => void
}

export async function ecouterSon(
  surNiveau: (niveau: number) => void,
  surSon: () => void,
  seuil = 0.06,
): Promise<Ecoute | null> {
  if (!navigator.mediaDevices?.getUserMedia) return null
  let flux: MediaStream
  try {
    flux = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } })
  } catch {
    return null
  }
  const C = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
  const ctx = new C()
  const source = ctx.createMediaStreamSource(flux)
  const analyseur = ctx.createAnalyser()
  analyseur.fftSize = 1024
  source.connect(analyseur)
  const donnees = new Float32Array(analyseur.fftSize)
  let actif = true
  let fortDepuis = 0

  const boucle = () => {
    if (!actif) return
    analyseur.getFloatTimeDomainData(donnees)
    let somme = 0
    for (const x of donnees) somme += x * x
    const rms = Math.sqrt(somme / donnees.length)
    surNiveau(Math.min(1, rms / (seuil * 3)))
    if (rms > seuil) {
      fortDepuis += 1
      if (fortDepuis > 6) {
        fortDepuis = -1000
        surSon()
      }
    } else if (fortDepuis > 0) {
      fortDepuis = 0
    }
    requestAnimationFrame(boucle)
  }
  requestAnimationFrame(boucle)

  return {
    arreter() {
      if (!actif) return
      actif = false
      flux.getTracks().forEach((t) => t.stop())
      if (ctx.state !== 'closed') void ctx.close().catch(() => {})
    },
  }
}
