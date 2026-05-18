import { forwardRef, type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@lib/cn';

const badgeVariants = cva(
  'inline-flex items-center whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-muted text-muted-foreground ring-border',
        secondary: 'bg-muted text-foreground ring-border',
        success: 'bg-success-subtle text-success-subtle-foreground ring-success/20',
        warning: 'bg-warning-subtle text-warning-subtle-foreground ring-warning/20',
        destructive: 'bg-destructive-subtle text-destructive-subtle-foreground ring-destructive/20',
        info: 'bg-info-subtle text-info-subtle-foreground ring-info/20',
        outline: 'bg-transparent text-foreground ring-border',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>;

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => (
    <span ref={ref} className={cn(badgeVariants({ variant }), className)} {...props} />
  ),
);
Badge.displayName = 'Badge';
