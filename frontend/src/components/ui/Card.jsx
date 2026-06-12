import { cn } from '../../utils/cn';

export default function Card({ className, children, hover, padding = true, ...props }) {
  return (
    <div
      className={cn(
        'glass rounded-2xl',
        padding && 'p-5',
        hover && 'transition-all hover:border-brand-500/30 hover:shadow-lg hover:shadow-brand-500/5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children }) {
  return <div className={cn('mb-4', className)}>{children}</div>;
}

export function CardTitle({ className, children }) {
  return <h3 className={cn('text-lg font-semibold text-slate-100', className)}>{children}</h3>;
}

export function CardDescription({ className, children }) {
  return <p className={cn('text-sm text-slate-400 mt-1', className)}>{children}</p>;
}
