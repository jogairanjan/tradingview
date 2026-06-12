import { forwardRef } from 'react';
import { cn } from '../../utils/cn';

const Input = forwardRef(function Input(
  { className, label, error, hint, icon: Icon, type = 'text', ...props },
  ref
) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
        )}
        <input
          ref={ref}
          type={type}
          className={cn(
            'w-full rounded-xl bg-surface-700/80 border border-white/10 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500',
            'focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-colors',
            'light:bg-white light:border-slate-200 light:text-slate-900',
            Icon && 'pl-10',
            error && 'border-accent-rose/50 focus:ring-accent-rose/30',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-accent-rose">{error}</p>}
      {hint && !error && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
});

export default Input;
