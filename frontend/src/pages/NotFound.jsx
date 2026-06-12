import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';

export default function NotFound() {
  return (
    <>
      <Helmet><title>404 — TradeSignal AI</title></Helmet>
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <motion.p
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-8xl font-bold gradient-text"
        >
          404
        </motion.p>
        <h1 className="mt-4 text-2xl font-semibold text-slate-100">Page not found</h1>
        <p className="mt-2 text-slate-400 max-w-md">The page you are looking for does not exist or has been moved.</p>
        <div className="mt-8 flex gap-4">
          <Link to="/"><Button icon={Home}>Go Home</Button></Link>
          <Button variant="secondary" icon={ArrowLeft} onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </div>
    </>
  );
}
