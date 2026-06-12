import { cn } from '../../utils/cn';

const variants = {
  default: 'bg-slate-700/80 text-slate-300',
  buy: 'bg-accent-emerald/20 text-accent-emerald border border-accent-emerald/30',
  sell: 'bg-accent-rose/20 text-accent-rose border border-accent-rose/30',
  brand: 'bg-brand-500/20 text-brand-400 border border-brand-500/30',
  warning: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
};

export default function Badge({ className, variant = 'default', children, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
