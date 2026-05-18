import { forwardRef, type InputHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@lib/cn';

const inputVariants = cva(
  [
    'flex h-9 w-full rounded-lg border bg-background px-3 py-2 text-sm',
    'placeholder:text-muted-foreground',
    'transition-all duration-150',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:border-primary',
    'disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-muted',
    'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
  ],
  {
    variants: {
      variant: {
        default: 'border-input shadow-xs',
        error: 'border-destructive shadow-xs focus-visible:ring-destructive/30 focus-visible:border-destructive',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export interface InputProps
  extends InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, type = 'text', ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(inputVariants({ variant }), className)}
      {...props}
    />
  ),
);
Input.displayName = 'Input';
