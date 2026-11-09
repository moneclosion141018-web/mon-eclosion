import type { ReactElement } from 'react'

// Bibliothèque d'images simples et plates (viewBox 100 × 100), contour épais.
const E = '#1F2A44'
const s = { stroke: E, strokeWidth: 3, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const }

const chatTete = (c = '#FFB066') => (
  <>
    <path d="M22 40 L26 12 L44 30 Z" fill={c} {...s} />
    <path d="M78 40 L74 12 L56 30 Z" fill={c} {...s} />
    <circle cx="50" cy="55" r="33" fill={c} {...s} />
    <circle cx="39" cy="50" r="4" fill={E} />
    <circle cx="61" cy="50" r="4" fill={E} />
    <path d="M46 60 L54 60 L50 65 Z" fill="#FF6F8E" {...s} strokeWidth={2} />
    <path d="M12 58 L30 60 M14 68 L30 65 M88 58 L70 60 M86 68 L70 65" {...s} strokeWidth={2.5} />
  </>
)

const visage = (fond: string, bouche: ReactElement, extra?: ReactElement) => (
  <>
    <circle cx="50" cy="50" r="42" fill={fond} {...s} strokeWidth={4} />
    {extra}
    <circle cx="36" cy="42" r="5" fill={E} />
    <circle cx="64" cy="42" r="5" fill={E} />
    {bouche}
  </>
)

const ballon = (c = '#1A66CC', x = 50, y = 42, r = 26) => (
  <>
    <ellipse cx={x} cy={y} rx={r} ry={r * 1.08} fill={c} {...s} />
    <path d={`M${x} ${y + r * 1.08} Q${x - 4} ${y + r * 1.5} ${x + 3} ${y + r * 1.9}`} fill="none" {...s} strokeWidth={2} />
    <ellipse cx={x - r * 0.35} cy={y - r * 0.4} rx={r * 0.18} ry={r * 0.28} fill="#FFFFFF" opacity="0.6" />
  </>
)

const balle = (x: number, y: number, r = 12) => <circle cx={x} cy={y} r={r} fill="#FF8A3D" {...s} />

const boite = <path d="M24 50 L76 50 L76 88 L24 88 Z" fill="#C8A27A" {...s} />
const table = (
  <>
    <rect x="12" y="44" width="76" height="9" rx="3" fill="#C8A27A" {...s} />
    <path d="M20 53 V88 M80 53 V88" {...s} strokeWidth={5} />
  </>
)

export const DESSINS: Record<string, ReactElement> = {
  chat: chatTete(),
  chien: (
    <>
      <ellipse cx="22" cy="46" rx="11" ry="22" fill="#8B5E3C" {...s} />
      <ellipse cx="78" cy="46" rx="11" ry="22" fill="#8B5E3C" {...s} />
      <circle cx="50" cy="52" r="31" fill="#E7C29A" {...s} />
      <circle cx="40" cy="46" r="4" fill={E} />
      <circle cx="60" cy="46" r="4" fill={E} />
      <ellipse cx="50" cy="60" rx="7" ry="5" fill={E} />
      <path d="M50 65 Q44 74 38 70 M50 65 Q56 74 62 70" fill="none" {...s} />
    </>
  ),
  vache: (
    <>
      <path d="M24 30 Q14 22 12 30 M76 30 Q86 22 88 30" fill="none" {...s} strokeWidth={4} />
      <ellipse cx="50" cy="44" rx="30" ry="28" fill="#FFFFFF" {...s} />
      <path d="M30 30 Q36 22 44 30 Q40 40 30 30" fill={E} />
      <circle cx="40" cy="42" r="4" fill={E} />
      <circle cx="62" cy="42" r="4" fill={E} />
      <ellipse cx="50" cy="68" rx="24" ry="16" fill="#FFB3C1" {...s} />
      <circle cx="42" cy="68" r="3.5" fill={E} />
      <circle cx="58" cy="68" r="3.5" fill={E} />
    </>
  ),
  canard: (
    <>
      <ellipse cx="54" cy="68" rx="34" ry="20" fill="#FFC531" {...s} />
      <circle cx="34" cy="38" r="18" fill="#FFC531" {...s} />
      <circle cx="30" cy="34" r="3.5" fill={E} />
      <path d="M14 40 L2 44 L14 48 Z" fill="#FF8A3D" {...s} />
      <path d="M50 64 Q64 56 76 66" fill="none" {...s} />
    </>
  ),
  mouton: (
    <>
      {[28, 44, 60, 72, 36, 54, 68].map((x, i) => (
        <circle key={i} cx={x} cy={i < 4 ? 50 : 66} r="14" fill="#FFFFFF" {...s} />
      ))}
      <ellipse cx="24" cy="44" rx="12" ry="15" fill="#4A5672" {...s} />
      <circle cx="20" cy="42" r="3" fill="#FFFFFF" />
      <path d="M34 78 V92 M66 78 V92" {...s} strokeWidth={5} />
    </>
  ),
  poisson: (
    <>
      <path d="M74 50 L94 34 L94 66 Z" fill="#FF8A3D" {...s} />
      <ellipse cx="46" cy="50" rx="34" ry="22" fill="#FF8A3D" {...s} />
      <circle cx="28" cy="46" r="4" fill={E} />
      <path d="M48 36 Q54 50 48 64" fill="none" {...s} strokeWidth={2} />
    </>
  ),
  oiseau: (
    <>
      <circle cx="50" cy="52" r="28" fill="#1A66CC" {...s} />
      <path d="M50 52 Q70 40 78 58 Q64 64 50 52" fill="#9CC3F2" {...s} />
      <circle cx="40" cy="44" r="4" fill={E} />
      <path d="M22 50 L10 54 L22 58 Z" fill="#FFC531" {...s} />
    </>
  ),
  ballon: ballon(),
  ballon_rouge: ballon('#FF6F8E'),
  pomme: (
    <>
      <path d="M50 30 Q30 16 18 36 Q8 64 30 84 Q40 92 50 86 Q60 92 70 84 Q92 64 82 36 Q70 16 50 30 Z" fill="#E8463A" {...s} />
      <path d="M50 30 Q50 18 56 10" fill="none" {...s} />
      <path d="M54 18 Q66 8 74 16 Q64 24 54 18" fill="#2BB673" {...s} />
    </>
  ),
  banane: (
    <path d="M14 30 Q20 80 70 86 Q88 86 90 76 Q60 78 40 56 Q26 40 24 22 Q16 20 14 30 Z" fill="#FFC531" {...s} />
  ),
  verre: (
    <>
      <path d="M28 18 L72 18 L66 88 L34 88 Z" fill="#DCEBFF" {...s} />
      <path d="M31 42 L69 42 L66 88 L34 88 Z" fill="#7FAFEB" />
      <path d="M28 18 L72 18 L66 88 L34 88 Z" fill="none" {...s} />
    </>
  ),
  soleil: (
    <>
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i * Math.PI) / 4
        return <path key={i} d={`M${50 + Math.cos(a) * 30} ${50 + Math.sin(a) * 30} L${50 + Math.cos(a) * 44} ${50 + Math.sin(a) * 44}`} {...s} strokeWidth={5} />
      })}
      <circle cx="50" cy="50" r="22" fill="#FFC531" {...s} />
    </>
  ),
  lune: <path d="M64 12 A38 38 0 1 0 88 66 A30 30 0 1 1 64 12 Z" fill="#FFE59A" {...s} />,
  maison: (
    <>
      <path d="M10 48 L50 12 L90 48" fill="#FF8A3D" {...s} />
      <rect x="20" y="44" width="60" height="44" fill="#FFE59A" {...s} />
      <rect x="42" y="62" width="16" height="26" fill="#1A66CC" {...s} />
    </>
  ),
  papillon: (
    <>
      <path d="M50 50 Q20 8 10 30 Q6 52 50 50 Q16 62 24 80 Q36 92 50 50 Q64 92 76 80 Q84 62 50 50 Q94 52 90 30 Q80 8 50 50 Z" fill="#2BB673" {...s} />
      <path d="M50 30 V72" {...s} strokeWidth={5} />
    </>
  ),
  voiture: (
    <>
      <path d="M10 64 L14 46 L30 44 L40 28 L66 28 L78 44 L90 48 L90 64 Z" fill="#E8463A" {...s} />
      <path d="M44 34 L62 34 L70 44 L38 44 Z" fill="#DCEBFF" {...s} />
      <circle cx="30" cy="66" r="10" fill={E} />
      <circle cx="72" cy="66" r="10" fill={E} />
    </>
  ),
  fleur: (
    <>
      <path d="M50 92 V54" stroke="#1E8A55" strokeWidth="5" strokeLinecap="round" />
      <path d="M50 76 Q34 70 30 58 Q44 60 50 72" fill="#2BB673" {...s} strokeWidth={2} />
      {[0, 72, 144, 216, 288].map((d) => (
        <circle key={d} cx={50 + Math.cos((d * Math.PI) / 180 - Math.PI / 2) * 14} cy={34 + Math.sin((d * Math.PI) / 180 - Math.PI / 2) * 14} r="11" fill="#FF8A3D" {...s} strokeWidth={2} />
      ))}
      <circle cx="50" cy="34" r="9" fill="#FFC531" {...s} strokeWidth={2} />
    </>
  ),
  etoile: <path d="M50 8 L61 38 L93 38 L67 57 L77 88 L50 69 L23 88 L33 57 L7 38 L39 38 Z" fill="#FFC531" {...s} />,
  gateau: (
    <>
      <rect x="16" y="48" width="68" height="38" rx="6" fill="#FFB3C1" {...s} />
      <path d="M16 60 Q33 70 50 60 Q67 70 84 60" fill="none" {...s} />
      <rect x="46" y="26" width="8" height="22" fill="#9CC3F2" {...s} />
      <path d="M50 12 Q56 20 50 24 Q44 20 50 12 Z" fill="#FF8A3D" {...s} strokeWidth={2} />
    </>
  ),
  lit: (
    <>
      <rect x="8" y="50" width="84" height="22" rx="4" fill="#9CC3F2" {...s} />
      <rect x="12" y="38" width="22" height="14" rx="6" fill="#FFFFFF" {...s} />
      <path d="M8 30 V86 M92 50 V86" {...s} strokeWidth={5} />
    </>
  ),
  livre: (
    <>
      <path d="M10 22 Q30 16 50 26 Q70 16 90 22 V82 Q70 76 50 86 Q30 76 10 82 Z" fill="#FFFFFF" {...s} />
      <path d="M50 26 V86" {...s} />
      <path d="M20 36 H40 M20 46 H40 M60 36 H80 M60 46 H80" {...s} strokeWidth={2} />
    </>
  ),
  chaussure: <path d="M10 70 L14 40 L34 40 L40 54 Q70 54 86 64 Q92 70 90 78 L10 78 Z" fill="#1A66CC" {...s} />,
  cuillere: (
    <>
      <ellipse cx="50" cy="28" rx="16" ry="20" fill="#D5DBE8" {...s} />
      <path d="M50 48 V92" {...s} strokeWidth={8} />
    </>
  ),
  assiette: (
    <>
      <ellipse cx="50" cy="56" rx="40" ry="26" fill="#FFFFFF" {...s} />
      <ellipse cx="50" cy="56" rx="24" ry="14" fill="#FFE59A" {...s} strokeWidth={2} />
    </>
  ),
  arbre: (
    <>
      <rect x="42" y="56" width="16" height="36" fill="#8B5E3C" {...s} />
      <circle cx="50" cy="38" r="30" fill="#2BB673" {...s} />
    </>
  ),
  tshirt: <path d="M30 14 L42 14 Q50 24 58 14 L70 14 L92 32 L80 46 L72 40 L72 88 L28 88 L28 40 L20 46 L8 32 Z" fill="#2BB673" {...s} />,
  goutte: (
    <>
      <rect x="20" y="14" width="40" height="12" rx="4" fill="#D5DBE8" {...s} />
      <path d="M56 20 H74 V34" fill="none" {...s} strokeWidth={6} />
      <path d="M74 44 Q66 58 74 64 Q82 58 74 44 Z" fill="#7FAFEB" {...s} strokeWidth={2} />
      <ellipse cx="50" cy="84" rx="34" ry="8" fill="#DCEBFF" {...s} />
    </>
  ),
  main: (
    <path d="M30 90 L26 54 Q24 44 32 46 L36 60 L36 22 Q36 14 43 14 Q49 14 49 22 L49 50 L49 16 Q49 8 56 8 Q62 8 62 16 L62 50 L62 22 Q62 14 69 14 Q75 14 75 22 L75 56 L80 44 Q86 38 90 44 L80 74 Q72 90 60 90 Z" fill="#E7C29A" {...s} />
  ),
  nez: visage('#FFE59A', <path d="M36 70 Q50 78 64 70" fill="none" {...s} strokeWidth={4} />, <circle cx="50" cy="56" r="9" fill="#FF8A3D" {...s} />),
  pain: <path d="M8 62 Q14 34 50 32 Q86 34 92 62 Q86 74 50 74 Q14 74 8 62 Z" fill="#E7B36A" {...s} />,
  cadeau: (
    <>
      <rect x="16" y="40" width="68" height="48" fill="#FF6F8E" {...s} />
      <rect x="12" y="30" width="76" height="14" fill="#FF6F8E" {...s} />
      <path d="M50 30 V88" stroke="#FFC531" strokeWidth="8" />
      <path d="M50 30 Q34 10 30 26 Q36 32 50 30 Q64 32 70 26 Q66 10 50 30" fill="#FFC531" {...s} strokeWidth={2} />
    </>
  ),
  porte: (
    <>
      <rect x="26" y="8" width="48" height="84" rx="4" fill="#C8A27A" {...s} />
      <circle cx="64" cy="52" r="4" fill={E} />
    </>
  ),
  bulle: <circle cx="50" cy="50" r="36" fill="#DCEBFF" stroke="#7FAFEB" strokeWidth="4" />,
  panier: (
    <>
      <path d="M26 44 Q50 6 74 44" fill="none" {...s} strokeWidth={5} />
      <path d="M12 44 L88 44 L78 88 L22 88 Z" fill="#C8A27A" {...s} />
      <path d="M30 56 H70 M28 70 H72" {...s} strokeWidth={2} />
    </>
  ),
  // Visages des émotions
  content: visage('#FFC531', <path d="M30 60 Q50 80 70 60" fill="none" {...s} strokeWidth={5} />),
  triste: visage('#9CC3F2', <path d="M32 72 Q50 56 68 72" fill="none" {...s} strokeWidth={5} />),
  fache: visage('#FF8A3D', <path d="M34 70 L66 70" {...s} strokeWidth={5} />, <path d="M26 30 L42 38 M74 30 L58 38" {...s} strokeWidth={5} />),
  surpris: visage('#B7E4C7', <ellipse cx="50" cy="68" rx="9" ry="11" fill={E} />),
  // Actions du chat
  chat_saute: (
    <>
      <g transform="translate(10 -8) scale(0.8)">{chatTete()}</g>
      <path d="M20 82 Q30 92 40 84 M54 84 Q64 92 74 82" fill="none" {...s} strokeDasharray="4 6" />
    </>
  ),
  chat_dort: (
    <>
      <g transform="translate(10 14) scale(0.8)">
        <path d="M22 40 L26 12 L44 30 Z" fill="#FFB066" {...s} />
        <path d="M78 40 L74 12 L56 30 Z" fill="#FFB066" {...s} />
        <circle cx="50" cy="55" r="33" fill="#FFB066" {...s} />
        <path d="M33 50 Q39 55 45 50 M55 50 Q61 55 67 50" fill="none" {...s} />
      </g>
      <text x="74" y="22" fontFamily="Baloo 2, sans-serif" fontWeight="800" fontSize="22" fill={E}>z z</text>
    </>
  ),
  chat_mange: (
    <>
      <g transform="translate(16 -4) scale(0.68)">{chatTete()}</g>
      <path d="M22 78 L78 78 L70 92 L30 92 Z" fill="#1A66CC" {...s} />
      <circle cx="40" cy="76" r="4" fill="#C8A27A" />
      <circle cx="52" cy="74" r="4" fill="#C8A27A" />
      <circle cx="62" cy="76" r="4" fill="#C8A27A" />
    </>
  ),
  // Positions
  balle_dans_boite: (
    <>
      {balle(50, 62)}
      {boite}
      <path d="M24 50 L76 50" {...s} />
    </>
  ),
  balle_sur_boite: (
    <>
      {boite}
      {balle(50, 37)}
    </>
  ),
  balle_sur_table: (
    <>
      {table}
      {balle(50, 30)}
    </>
  ),
  balle_sous_table: (
    <>
      {table}
      {balle(50, 76)}
    </>
  ),
  // Petits et grands ballons
  petit_ballon: ballon('#1A66CC', 50, 54, 12),
  grand_ballon: ballon('#1A66CC', 50, 40, 32),
  petite_maison: <g transform="translate(30 36) scale(0.45)">{<><path d="M10 48 L50 12 L90 48" fill="#FF8A3D" {...s} strokeWidth={6} /><rect x="20" y="44" width="60" height="44" fill="#FFE59A" {...s} strokeWidth={6} /></>}</g>,
  grande_maison: (
    <>
      <path d="M6 46 L50 6 L94 46" fill="#FF8A3D" {...s} />
      <rect x="16" y="42" width="68" height="52" fill="#FFE59A" {...s} />
      <rect x="40" y="64" width="20" height="30" fill="#1A66CC" {...s} />
    </>
  ),
}

export function Dessin({ nom, titre, taille }: { nom: string; titre?: string; taille?: number }) {
  const d = DESSINS[nom]
  return (
    <svg viewBox="0 0 100 100" width={taille} height={taille} role={titre ? 'img' : undefined} aria-label={titre} aria-hidden={titre ? undefined : true}>
      {d ?? <circle cx="50" cy="50" r="30" fill="#E3E7EF" />}
    </svg>
  )
}
