import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'elevated'
  glow?: 'blue' | 'purple' | 'green' | 'none'
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', glow = 'none', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl p-6 transition-all duration-300',
          
          // Variants
          variant === 'default' && [
            'bg-slate-900/80 border border-slate-800'
          ],
          variant === 'glass' && [
            'bg-slate-900/50 backdrop-blur-xl border border-slate-700/50'
          ],
          variant === 'elevated' && [
            'bg-slate-800/90 border border-slate-700 shadow-xl'
          ],
          
          // Glow effects
          glow === 'blue' && 'shadow-lg shadow-blue-500/10 border-blue-500/20',
          glow === 'purple' && 'shadow-lg shadow-purple-500/10 border-purple-500/20',
          glow === 'green' && 'shadow-lg shadow-green-500/10 border-green-500/20',
          
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center gap-3 mb-4', className)}
      {...props}
    />
  )
)

CardHeader.displayName = 'CardHeader'

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-lg font-semibold text-white', className)}
      {...props}
    />
  )
)

CardTitle.displayName = 'CardTitle'

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('text-slate-300', className)} {...props} />
  )
)

CardContent.displayName = 'CardContent'
