import { Helmet } from 'react-helmet-async';
import PricingSection from '../components/landing/PricingSection';
import FAQ from '../components/landing/FAQ';

export default function Pricing() {
  return (
    <>
      <Helmet>
        <title>Pricing — TradeSignal AI</title>
        <meta name="description" content="Choose the right TradeSignal plan for your trading style." />
      </Helmet>
      <div className="pt-8">
        <PricingSection />
        <FAQ />
      </div>
    </>
  );
}
