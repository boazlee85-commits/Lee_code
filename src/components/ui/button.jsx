import * as React from "react";
import { cn } from '@/lib/utils';

const variantStyles = {
  default: 'bg-primary text-primary-foreground hover:bg-primary/90 border border-transparent',
  ghost: 'bg-transparent text-foreground hover:bg-accent/10 border border-border',
  outline: 'bg-background text-foreground border border-border hover:bg-accent/10',
};

const sizeStyles = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-2 text-sm',
  lg: 'px-4 py-2.5 text-base',
};

export function Button({ children, className, variant = 'default', size = 'sm', type = 'button', ...props }) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center rounded font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
