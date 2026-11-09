// Le code parent n'est jamais stocké en clair : on garde son empreinte.
export async function empreinteCode(code: string, userId: string) {
  const data = new TextEncoder().encode(`mon-eclosion|${userId}|${code}`)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

// Petit calcul de secours, assez simple pour un adulte, trop long pour un jeune enfant.
export function nouveauCalcul() {
  const a = 6 + Math.floor(Math.random() * 7)
  const b = 3 + Math.floor(Math.random() * 7)
  return { question: `${a} × ${b}`, reponse: a * b }
}
