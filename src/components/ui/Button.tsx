import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  glow?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', glow = false, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          
          // Variants
          variant === 'primary' && [
            'bg-gradient-to-r from-blue-500 to-blue-600 text-white',
            'hover:from-blue-600 hover:to-blue-700',
            'active:scale-[0.98]',
            glow && 'shadow-lg shadow-blue-500/25'
          ],
          variant === 'secondary' && [
            'bg-slate-800 text-white border border-slate-700',
            'hover:bg-slate-700 hover:border-slate-600',
            'active:scale-[0.98]'
          ],
          variant === 'ghost' && [
            'text-slate-300 hover:text-white',
            'hover:bg-slate-800/50',
            'active:scale-[0.98]'
          ],
          variant === 'danger' && [
            'bg-gradient-to-r from-red-500 to-red-600 text-white',
            'hover:from-red-600 hover:to-red-700',
            'active:scale-[0.98]',
            glow && 'shadow-lg shadow-red-500/25'
          ],
          
          // Sizes
          size === 'sm' && 'h-8 px-3 text-sm gap-1.5',
          size === 'md' && 'h-10 px-4 text-sm gap-2',
          size === 'lg' && 'h-12 px-6 text-base gap-2',
          size === 'icon' && 'h-10 w-10',
          
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
