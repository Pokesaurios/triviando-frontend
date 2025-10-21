import { motion } from 'framer-motion';
import { LogoHeader } from '../../components/ui/LogoHeader';
import { AuthTabs } from '../../components/ui/AuthTabs';
import { AuthForm } from './AuthForm';
import { useAuthMode } from '../../hooks/useAuthMode';
import { useAuthForm } from '../../hooks/useAuthForm';
import { hoverScale } from '../../config/animations';

export const AuthContainer: React.FC = () => {
  const { isLogin, toggleMode, switchToLogin, switchToRegister } = useAuthMode();
  const { formState, updateField, handleSubmit, resetForm } = useAuthForm(isLogin);

  const handleModeChange = (newMode: 'login' | 'register') => {
    if (newMode === 'login' && !isLogin) {
      switchToLogin();
      resetForm();
    } else if (newMode === 'register' && isLogin) {
      switchToRegister();
      resetForm();
    }
  };

  return (
    <motion.div {...hoverScale} className="bg-white rounded-3xl shadow-2xl overflow-hidden">
      <LogoHeader />
      
      <div className="p-8">
        <AuthTabs
          isLogin={isLogin}
          onLoginClick={() => handleModeChange('login')}
          onRegisterClick={() => handleModeChange('register')}
        />
        
        <AuthForm
          isLogin={isLogin}
          formState={formState}
          onSubmit={handleSubmit}
          onFieldChange={updateField}
        />
        
        {isLogin && (
          <div className="text-center mt-4">
            <a href="#" className="text-sm text-blue-500 hover:text-blue-700 font-semibold">
              ¿Olvidaste tu contraseña?
            </a>
          </div>
        )}
      </div>
    </motion.div>
  );
};