import * as React from 'react'
import { cn } from '@/lib/utils'

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'flex w-full rounded-xl border border-white/[0.04] bg-white/[0.03] px-4 py-3.5 text-sm text-white outline-none transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-white/40 hover:bg-white/[0.05] focus:border-primaryC/50 focus:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = 'Input'

export { Input }