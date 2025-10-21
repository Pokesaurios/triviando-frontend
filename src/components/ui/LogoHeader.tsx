import { motion } from 'framer-motion';
import { scaleIn, logoWiggle } from '../../config/animations';
import { APP_NAME } from '../../config/constants';

export const LogoHeader: React.FC = () => {
  return (
    <div className="bg-gradient-to-b from-blue-500 to-purple-500 p-8 text-center relative">
      <motion.div {...logoWiggle} className="inline-block">
        <img
          src="/logo512.png"
          alt={`${APP_NAME} Logo`}
          className="h-24 w-auto mx-auto drop-shadow-lg"
        />
      </motion.div>
      <motion.h1
        {...scaleIn}
        className="text-4xl font-bold text-white mt-4 drop-shadow-md"
        style={{ fontFamily: 'Poppins, cursive' }}
      >
        {APP_NAME}
      </motion.h1>
      <p className="text-white/90 mt-2 font-semibold">
        ¡Aprende, compite y diviértete respondiendo!
      </p>
    </div>
  );
};