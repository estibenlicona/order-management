import { forwardRef, type SVGAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@lib/cn';

const spinnerVariants = cva('animate-spin text-current', {
  variants: {
    size: {
      sm: 'h-3.5 w-3.5',
      md: 'h-4 w-4',
      lg: 'h-5 w-5',
    },
  },
  defaultVariants: { size: 'md' },
});

export interface SpinnerProps
  extends SVGAttributes<SVGSVGElement>,
    VariantProps<typeof spinnerVariants> {}

export const Spinner = forwardRef<SVGSVGElement, SpinnerProps>(
  ({ className, size, ...props }, ref) => (
    <svg
      ref={ref}
      viewBox="0 0 24 24"
      fill="none"
      role="status"
      aria-label="Cargando"
      className={cn(spinnerVariants({ size }), className)}
      {...props}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  ),
);
Spinner.displayName = 'Spinner';
