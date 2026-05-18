import { useId, cloneElement, type ReactElement, type ReactNode } from 'react';
import { cn } from '@lib/cn';
import { Label } from '../label/label';

type ControlElement = ReactElement<{
  id?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
}>;

interface FormFieldProps {
  label?: ReactNode;
  required?: boolean;
  helper?: ReactNode;
  error?: ReactNode;
  htmlFor?: string;
  className?: string;
  children: ControlElement;
}

export function FormField({
  label,
  required,
  helper,
  error,
  htmlFor,
  className,
  children,
}: FormFieldProps): JSX.Element {
  const autoId = useId();
  const id = htmlFor ?? children.props.id ?? autoId;
  const helperId = `${id}-helper`;
  const errorId = `${id}-error`;

  const describedBy = error ? errorId : helper ? helperId : undefined;

  const child = cloneElement(children, {
    id,
    ...(describedBy !== undefined && { 'aria-describedby': describedBy }),
    ...(error !== undefined && error !== null && error !== false && { 'aria-invalid': true }),
  });

  return (
    <div className={cn('space-y-1.5', className)}>
      {label !== undefined && label !== null && label !== false && (
        <Label htmlFor={id} {...(required === true && { required: true })}>
          {label}
        </Label>
      )}
      {child}
      {error ? (
        <p id={errorId} className="text-xs text-destructive">
          {error}
        </p>
      ) : helper ? (
        <p id={helperId} className="text-xs text-muted-foreground">
          {helper}
        </p>
      ) : null}
    </div>
  );
}
