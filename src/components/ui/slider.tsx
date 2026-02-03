'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  showValue?: boolean;
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, showValue = true, ...props }, ref) => {
    return (
      <div className="relative flex items-center gap-4">
        <input
          type="range"
          className={cn(
            'w-full h-2 rounded-full appearance-none cursor-pointer bg-gradient-to-r from-primary/30 via-primary/10 to-muted/60 accent-primary',
            className
          )}
          ref={ref}
          {...props}
        />
        {showValue && (
          <span className="text-sm font-medium w-12 text-right text-foreground/80">
            {props.value}
          </span>
        )}
      </div>
    );
  }
);
Slider.displayName = 'Slider';

export { Slider };
