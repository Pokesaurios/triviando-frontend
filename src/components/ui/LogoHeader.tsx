import { motion } from 'framer-motion';
import { scaleIn, logoWiggle } from '../../config/animations';
import { APP_NAME } from '../../config/constants';

interface LogoHeaderProps {
  variant?: 'login' | 'dashboard';
}

export const LogoHeader: React.FC<LogoHeaderProps> = ({ variant = 'login' }) => {
  const isLogin = variant === 'login';
  
  return (
    <div className={`text-center relative ${isLogin ? 'bg-gradient-to-b from-purple-500 to-purple-600' : ''}`}>

      <motion.div {...logoWiggle} className="inline-block">
        <img
          src="/logo512.png"
          alt={`${APP_NAME} Logo`}
          className="h-24 w-auto mx-auto drop-shadow-lg"
        />
      </motion.div>
      <motion.h1
        {...scaleIn}
        className="text-4xl font-bold text-white drop-shadow-md text-center"
        style={{ fontFamily: 'Poppins, cursive' }}
      >
        {APP_NAME}
      </motion.h1>
      
      <p className={`text-white/90 text-center mt-2 font-semibold ${isLogin ? '' : 'mb-8'} text-sm`}>
        {isLogin 
          ? 'Plataforma de Trivias Inteligentes en Tiempo Real'
          : '¡Aprende, compite y diviértete respondiendo!'
        }
      </p>
    </div>
  );
};