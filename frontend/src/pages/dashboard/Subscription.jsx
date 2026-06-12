import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { CreditCard, Check } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { pricingPlans } from '../../utils/mockData';
import Card, { CardTitle } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { cn } from '../../utils/cn';

export default function Subscription() {
  const { user } = useAuth();
  const currentPlan = pricingPlans.find((p) => p.name.toLowerCase() === (user?.plan || 'starter').toLowerCase()) || pricingPlans[0];

  return (
    <>
      <Helmet><title>Subscription — TradeSignal AI</title></Helmet>
      <div className="max-w-3xl space-y-6">
        <h1 className="text-2xl font-bold text-slate-100">Subscription</h1>

        <Card className="border-brand-500/30">
          <div className="flex items-start justify-between">
            <div>
              <Badge variant="brand">Current Plan</Badge>
              <h2 className="text-2xl font-bold text-slate-100 mt-2">{currentPlan.name}</h2>
              <p className="text-slate-400 text-sm mt-1">
                ${currentPlan.price}{currentPlan.period}
              </p>
            </div>
            <CreditCard className="w-10 h-10 text-brand-400 opacity-50" />
          </div>
          <ul className="mt-4 space-y-2">
            {currentPlan.features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                <Check className="w-4 h-4 text-accent-emerald" />{f}
              </li>
            ))}
          </ul>
        </Card>

        <div>
          <h3 className="text-lg font-semibold text-slate-200 mb-4">Upgrade your plan</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            {pricingPlans.map((plan) => (
              <Card key={plan.id} className={cn(plan.popular && 'border-brand-500/40')}>
                <CardTitle>{plan.name}</CardTitle>
                <p className="text-2xl font-bold font-mono mt-2">${plan.price}<span className="text-sm text-slate-500 font-normal">{plan.period}</span></p>
                <Link to="/pricing" className="block mt-4">
                  <Button variant={plan.id === currentPlan.id ? 'ghost' : 'primary'} size="sm" className="w-full" disabled={plan.id === currentPlan.id}>
                    {plan.id === currentPlan.id ? 'Current' : 'Upgrade'}
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
