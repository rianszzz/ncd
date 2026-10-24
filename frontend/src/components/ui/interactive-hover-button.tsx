import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface InteractiveHoverButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string
  to?: string
  variant?: 'white' | 'dark'
}

export const InteractiveHoverButton = React.forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  InteractiveHoverButtonProps
>(({ text = 'Button', to, variant = 'white', className, children, ...props }, ref) => {
  const isWhite = variant === 'white'

  const content = (
    <>
      <span className="inline-block transition-all duration-300 group-hover:translate-x-8 group-hover:opacity-0">
        {children ?? text}
      </span>
      <div
        className={cn(
          'absolute inset-0 z-10 flex h-full w-full translate-x-8 items-center justify-center gap-1.5 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100',
          isWhite ? 'text-[#111215]' : 'text-[#F4F1EB]'
        )}
      >
        <span>{children ?? text}</span>
        <ArrowRight
          className={cn(
            'w-3.5 h-3.5',
            isWhite ? 'text-[#111215]' : 'text-[#F4F1EB]'
          )}
        />
      </div>
      <div
        className={cn(
          'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-2 w-2 scale-0 rounded-full opacity-0 transition-all duration-300 ease-out group-hover:h-full group-hover:w-full group-hover:scale-[1.8] group-hover:opacity-100 group-hover:rounded-xl',
          isWhite ? 'bg-white' : 'bg-[#111215]'
        )}
      />
    </>
  )

  const commonClasses = cn(
    'group relative cursor-pointer overflow-hidden rounded-xl border border-[#111215] bg-transparent p-2.5 sm:p-3 text-center font-medium text-xs sm:text-sm text-[#111215] transition-colors duration-300 flex items-center justify-center min-h-[44px] shadow-2xs select-none active:scale-[0.98]',
    className
  )

  if (to) {
    return (
      <Link
        to={to}
        ref={ref as React.Ref<HTMLAnchorElement>}
        className={commonClasses}
      >
        {content}
      </Link>
    )
  }

  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      className={commonClasses}
      {...props}
    >
      {content}
    </button>
  )
})

InteractiveHoverButton.displayName = 'InteractiveHoverButton'

export default InteractiveHoverButton
