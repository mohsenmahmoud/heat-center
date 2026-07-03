import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import clsx from 'clsx'

type Variant = 'primary' | 'secondary' | 'ghost'

const variants: Record<Variant, string> = {
  primary:
    'bg-gradient-to-l from-ember-500 to-ember-600 text-white shadow-ember hover:from-ember-400 hover:to-ember-500 focus-visible:outline-ember-400',
  secondary:
    'bg-ink-800/80 text-ink-50 ring-1 ring-inset ring-ink-600 hover:bg-ink-700 focus-visible:outline-ink-300',
  ghost: 'text-ink-100 hover:text-ember-400',
}

interface BaseProps {
  children: ReactNode
  variant?: Variant
  className?: string
  icon?: ReactNode
}

export function Button({
  children,
  variant = 'primary',
  className,
  icon,
  ...rest
}: BaseProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-bold transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-[0.97]',
        variants[variant],
        className,
      )}
      {...rest}
    >
      {children}
      {icon}
    </button>
  )
}

export function LinkButton({
  children,
  variant = 'primary',
  className,
  icon,
  to,
  external,
}: BaseProps & { to: string; external?: boolean }) {
  const classes = clsx(
    'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-bold transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-[0.97]',
    variants[variant],
    className,
  )

  if (external) {
    return (
      <a href={to} target="_blank" rel="noreferrer" className={classes}>
        {children}
        {icon}
      </a>
    )
  }

  return (
    <Link to={to} className={classes}>
      {children}
      {icon}
    </Link>
  )
}
