import { useEffect, useState } from 'react';
import LoginPage from './LoginPage';
import DashboardPage from './DashboardPage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-500 to-purple-600">
        <div className="text-white text-2xl">Cargando...</div>
      </div>
    );
  }

  return isAuthenticated ? <DashboardPage /> : <LoginPage />;
}

export default App;