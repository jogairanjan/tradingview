import { Helmet } from 'react-helmet-async';
import Hero from '../components/landing/Hero';
import TickerTape from '../components/landing/TickerTape';
import Features from '../components/landing/Features';
import PerformanceCards from '../components/landing/PerformanceCards';
import AiShowcase from '../components/landing/AiShowcase';
import Testimonials from '../components/landing/Testimonials';
import PricingSection from '../components/landing/PricingSection';
import FAQ from '../components/landing/FAQ';

export default function Home() {
  return (
    <>
      <Helmet>
        <title>TradeSignal AI — AI-Powered Trading Signals</title>
        <meta name="description" content="Real-time BUY/SELL trading signals with AI confidence scores, pro charts, and institutional-grade analytics." />
        <meta property="og:title" content="TradeSignal AI" />
        <meta property="og:description" content="Trade smarter with AI-powered signals." />
      </Helmet>
      <TickerTape />
      <Hero />
      <Features />
      <PerformanceCards />
      <AiShowcase />
      <Testimonials />
      <PricingSection showAllLink />
      <FAQ />
    </>
  );
}
