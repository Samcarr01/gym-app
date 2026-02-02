'use client';

import * as React from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormFieldProps {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormField({
  label,
  htmlFor,
  required = false,
  error,
  description,
  children,
  className
}: FormFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <label
        htmlFor={htmlFor}
        className={cn(
          'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
          error && 'text-destructive'
        )}
      >
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>

      <div className={cn(
        'relative',
        error && '[&_select]:border-destructive [&_select]:ring-destructive/20 [&_input]:border-destructive [&_input]:ring-destructive/20 [&_textarea]:border-destructive [&_textarea]:ring-destructive/20'
      )}>
        {children}
      </div>

      {error && (
        <div className="flex items-center gap-1.5 text-sm text-destructive animate-in fade-in-0 slide-in-from-top-1 duration-200">
          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {description && !error && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
