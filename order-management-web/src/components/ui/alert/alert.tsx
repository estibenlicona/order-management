import { forwardRef, type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Info, CheckCircle2, AlertTriangle, XCircle, type LucideIcon } from 'lucide-react';
import { cn } from '@lib/cn';

const alertVariants = cva(
  'relative w-full rounded-lg border px-4 py-3 text-sm flex items-start gap-3',
  {
    variants: {
      variant: {
        info: 'border-primary/15 bg-info-subtle text-info-subtle-foreground',
        success: 'border-success/15 bg-success-subtle text-success-subtle-foreground',
        warning: 'border-warning/15 bg-warning-subtle text-warning-subtle-foreground',
        destructive: 'border-destructive/15 bg-destructive-subtle text-destructive-subtle-foreground',
      },
    },
    defaultVariants: { variant: 'info' },
  },
);

const VARIANT_ICONS: Record<NonNullable<VariantProps<typeof alertVariants>['variant']>, LucideIcon> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  destructive: XCircle,
};

export interface AlertProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  hideIcon?: boolean;
}

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, hideIcon, children, ...props }, ref) => {
    const Icon = VARIANT_ICONS[variant ?? 'info'];
    return (
      <div
        ref={ref}
        role={variant === 'destructive' ? 'alert' : 'status'}
        className={cn(alertVariants({ variant }), className)}
        {...props}
      >
        {hideIcon !== true && (
          <Icon aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
        )}
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    );
  },
);
Alert.displayName = 'Alert';

export const AlertTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h5 ref={ref} className={cn('mb-0.5 font-semibold leading-none', className)} {...props} />
  ),
);
AlertTitle.displayName = 'AlertTitle';

export const AlertDescription = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('text-sm leading-relaxed [&_p]:leading-relaxed', className)}
      {...props}
    />
  ),
);
AlertDescription.displayName = 'AlertDescription';
