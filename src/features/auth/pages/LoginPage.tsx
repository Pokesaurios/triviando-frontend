import { motion } from 'framer-motion';
import { useAuthForm } from '../../../hooks/useAuthForm';
import { BackgroundBubbles } from '../../../components/ui/BackgroundBubbles';
import { AuthHeader } from '../components/AuthHeader';
import { AuthModeToggle } from '../components/AuthModeToggle';
import { AuthForm } from '../components/AuthForm';
import { AuthFooter } from '../components/AuthFooter';
import { APP_CONFIG, ASSETS, ANIMATION_CONFIG } from '../../../config/constants';
export default function LoginPage() {
  const {
    mode,
    email,
    password,
    username,
    message,
    isLoading,
    isLogin,
    setEmail,
    setPassword,
    setUsername,
    toggleMode,
    handleSubmit,
  } = useAuthForm();

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 bg-gradient-to-b from-blue-400 to-purple-400">
      <BackgroundBubbles count={ANIMATION_CONFIG.bubbleCount} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <motion.div
          className="bg-white rounded-3xl shadow-2xl overflow-hidden"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <AuthHeader 
            logo={ASSETS.logo}
            title={APP_CONFIG.name}
            tagline={APP_CONFIG.tagline}
          />

          <div className="p-8">
            <AuthModeToggle isLogin={isLogin} onToggle={toggleMode} />

            <AuthForm
              isLogin={isLogin}
              email={email}
              password={password}
              username={username}
              onEmailChange={setEmail}
              onPasswordChange={setPassword}
              onUsernameChange={setUsername}
              onSubmit={handleSubmit}
              isLoading={isLoading}
              message={message}
            />

            <AuthFooter
              showForgotPassword={isLogin}
              teamName={APP_CONFIG.team}
              teamLogo={ASSETS.teamLogo}
            />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}