import { forwardRef, type ButtonHTMLAttributes, type HTMLAttributes } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@lib/cn';
import { Button } from '../button/button';

export function Pagination({ className, ...props }: HTMLAttributes<HTMLElement>): JSX.Element {
  return (
    <nav
      role="navigation"
      aria-label="paginación"
      className={cn('flex items-center gap-3', className)}
      {...props}
    />
  );
}

export function PaginationContent({
  className,
  ...props
}: HTMLAttributes<HTMLUListElement>): JSX.Element {
  return <ul className={cn('flex items-center gap-2', className)} {...props} />;
}

export function PaginationItem({
  className,
  ...props
}: HTMLAttributes<HTMLLIElement>): JSX.Element {
  return <li className={cn('inline-flex', className)} {...props} />;
}

interface NavBtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
}

export const PaginationPrevious = forwardRef<HTMLButtonElement, NavBtnProps>(
  ({ label = 'Anterior', className, ...props }, ref) => (
    <Button ref={ref} variant="outline" size="sm" className={className} {...props}>
      <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" /> {label}
    </Button>
  ),
);
PaginationPrevious.displayName = 'PaginationPrevious';

export const PaginationNext = forwardRef<HTMLButtonElement, NavBtnProps>(
  ({ label = 'Siguiente', className, ...props }, ref) => (
    <Button ref={ref} variant="outline" size="sm" className={className} {...props}>
      {label} <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
    </Button>
  ),
);
PaginationNext.displayName = 'PaginationNext';

export function PaginationStatus({
  page,
  totalPages,
  className,
}: {
  page: number;
  totalPages: number;
  className?: string;
}): JSX.Element {
  return (
    <span className={cn('text-sm text-muted-foreground tabular-nums', className)}>
      Página <span className="font-medium text-foreground">{page}</span> de{' '}
      <span className="font-medium text-foreground">{totalPages}</span>
    </span>
  );
}
