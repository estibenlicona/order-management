import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@lib/cn';

const textareaVariants = cva(
  [
    'flex min-h-[88px] w-full rounded-lg border bg-background px-3 py-2 text-sm',
    'placeholder:text-muted-foreground',
    'transition-all duration-150',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:border-primary',
    'disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-muted',
    'resize-y',
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

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(textareaVariants({ variant }), className)}
      {...props}
    />
  ),
);
Textarea.displayName = 'Textarea';
