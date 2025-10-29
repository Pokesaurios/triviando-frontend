import { motion } from 'framer-motion';
import { AnimatedBackground } from '../components/ui/AnimatedBackground';
import { AuthContainer } from '../features/auth/AuthContainer';
import { Footer } from '../components/ui/Footer';
import { fadeInUp } from '../config/animations';

export default function LoginPage() {
  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 bg-gradient-to-b from-blue-400 to-purple-400">
      <AnimatedBackground />
      
      <motion.div
        {...fadeInUp}
        className="relative z-10 w-full max-w-md"
      >
        <AuthContainer />
        <Footer />
      </motion.div>
    </div>
  );
}