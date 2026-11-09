export type PosePiou = 'attend' | 'felicite' | 'montre' | 'parle' | 'dort'

// Piou le poussin. `coquille` va de 0 (dans sa coquille) à 4 (presque sorti).
export function Piou({ pose = 'attend', taille = 120, coquille = 0, className = '' }: { pose?: PosePiou; taille?: number; coquille?: number; className?: string }) {
  const hautCoquille = 66 + Math.min(4, Math.max(0, coquille)) * 4
  const yeux =
    pose === 'felicite' ? (
      <>
        <path d="M43 50 Q48 44 53 50" fill="none" stroke="#1F2A44" strokeWidth="4" strokeLinecap="round" />
        <path d="M67 50 Q72 44 77 50" fill="none" stroke="#1F2A44" strokeWidth="4" strokeLinecap="round" />
      </>
    ) : pose === 'dort' ? (
      <>
        <path d="M43 50 Q48 54 53 50" fill="none" stroke="#1F2A44" strokeWidth="4" strokeLinecap="round" />
        <path d="M67 50 Q72 54 77 50" fill="none" stroke="#1F2A44" strokeWidth="4" strokeLinecap="round" />
      </>
    ) : pose === 'montre' ? (
      <>
        <circle cx="52" cy="50" r="5" fill="#1F2A44" />
        <circle cx="76" cy="50" r="5" fill="#1F2A44" />
      </>
    ) : (
      <>
        <circle cx="48" cy="50" r="5" fill="#1F2A44" />
        <circle cx="72" cy="50" r="5" fill="#1F2A44" />
      </>
    )
  const bec =
    pose === 'parle' ? (
      <ellipse cx="60" cy="64" rx="7" ry="8" fill="#FF8A3D" stroke="#1F2A44" strokeWidth="3" />
    ) : pose === 'montre' ? (
      <path d="M58 60 L70 60 L64 69 Z" fill="#FF8A3D" stroke="#1F2A44" strokeWidth="3" strokeLinejoin="round" />
    ) : (
      <path d="M54 60 L66 60 L60 69 Z" fill="#FF8A3D" stroke="#1F2A44" strokeWidth="3" strokeLinejoin="round" />
    )
  const h = hautCoquille
  return (
    <svg className={`piou ${className}`} width={taille} height={taille} viewBox="0 0 120 120" aria-hidden="true">
      {pose === 'montre' && <path d="M92 44 L112 30" stroke="#1F2A44" strokeWidth="5" strokeLinecap="round" />}
      <circle cx="60" cy="56" r="36" fill="#FFC531" stroke="#1F2A44" strokeWidth="4" />
      <path d="M56 21 Q60 10 64 21" fill="none" stroke="#1F2A44" strokeWidth="4" strokeLinecap="round" />
      {yeux}
      {pose !== 'montre' && (
        <>
          <circle cx="40" cy="62" r="5" fill="#FF8A3D" opacity="0.5" />
          <circle cx="80" cy="62" r="5" fill="#FF8A3D" opacity="0.5" />
        </>
      )}
      {bec}
      <path
        d={`M18 ${h + 12} L30 ${h} L42 ${h + 12} L54 ${h} L66 ${h + 12} L78 ${h} L90 ${h + 12} L102 ${h} L102 84 A42 34 0 0 1 18 84 Z`}
        fill="#FFFFFF"
        stroke="#1F2A44"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      {pose === 'dort' && (
        <text x="92" y="24" fontFamily="Baloo 2, sans-serif" fontWeight="800" fontSize="18" fill="#1F2A44">
          z
        </text>
      )}
    </svg>
  )
}
