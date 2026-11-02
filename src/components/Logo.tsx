import { Link } from 'react-router-dom'

export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="#12284c" />
      <path d="M6 16h5l3-6 4 12 3-6h5" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function Logo({ to = '/', light = false }: { to?: string; light?: boolean }) {
  return (
    <Link to={to} className="flex items-center gap-2.5" aria-label="MedVision AI home">
      <LogoMark />
      <span className={`text-[15px] font-semibold tracking-tight ${light ? 'text-white' : 'text-navy-900'}`}>
        MedVision <span className="font-normal opacity-70">AI</span>
      </span>
    </Link>
  )
}
