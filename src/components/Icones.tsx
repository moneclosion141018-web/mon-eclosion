const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2.4,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

export const IconeMaison = ({ t = 32 }: { t?: number }) => (
  <svg width={t} height={t} viewBox="0 0 24 24" {...base}>
    <path d="M3 11l9-8 9 8" />
    <path d="M5 10v10h14V10" />
  </svg>
)
export const IconeCadenas = ({ t = 32 }: { t?: number }) => (
  <svg width={t} height={t} viewBox="0 0 24 24" {...base}>
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
)
export const IconeVagues = ({ t = 30 }: { t?: number }) => (
  <svg width={t} height={t} viewBox="0 0 24 24" {...base}>
    <path d="M3 10c3-3 6 3 9 0s6-3 9 0" />
    <path d="M3 15c3-3 6 3 9 0s6-3 9 0" />
  </svg>
)
export const IconeHautParleur = ({ t = 34 }: { t?: number }) => (
  <svg width={t} height={t} viewBox="0 0 24 24" {...base}>
    <path d="M4 9h4l5-4v14l-5-4H4z" />
    <path d="M17 9a4 4 0 0 1 0 6" />
  </svg>
)
export const IconeMicro = ({ t = 44 }: { t?: number }) => (
  <svg width={t} height={t} viewBox="0 0 24 24" {...base}>
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M5 11a7 7 0 0 0 14 0" />
    <path d="M12 18v3" />
  </svg>
)
export const IconeRetour = ({ t = 32 }: { t?: number }) => (
  <svg width={t} height={t} viewBox="0 0 24 24" {...base}>
    <path d="M15 5l-7 7 7 7" />
  </svg>
)
export const IconeCoche = ({ t = 32 }: { t?: number }) => (
  <svg width={t} height={t} viewBox="0 0 24 24" {...base} strokeWidth={3}>
    <path d="M5 12l5 5 9-10" />
  </svg>
)
export const IconeRecommencer = ({ t = 32 }: { t?: number }) => (
  <svg width={t} height={t} viewBox="0 0 24 24" {...base}>
    <path d="M4 12a8 8 0 1 0 3-6.2" />
    <path d="M4 4v5h5" />
  </svg>
)
export const IconeEffacer = ({ t = 40 }: { t?: number }) => (
  <svg width={t} height={t} viewBox="0 0 24 24" {...base}>
    <path d="M21 5H9l-6 7 6 7h12z" />
    <path d="M12 9l6 6M18 9l-6 6" />
  </svg>
)
export const IconePlus = ({ t = 64 }: { t?: number }) => (
  <svg width={t} height={t} viewBox="0 0 24 24" {...base}>
    <path d="M12 5v14M5 12h14" />
  </svg>
)
export const IconeTelecharger = ({ t = 24 }: { t?: number }) => (
  <svg width={t} height={t} viewBox="0 0 24 24" {...base}>
    <path d="M12 4v11" />
    <path d="M7 10l5 5 5-5" />
    <path d="M5 20h14" />
  </svg>
)
