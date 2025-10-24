import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './LoginPage';
import DashboardPage from './DashboardPage';
import CreateTriviaPage from './CreateTriviaPage';

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

  return (
    <Router>
      <Routes>
        {/* Ruta pública */}
        <Route
          path="/"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
        />

        {/* Rutas protegidas */}
        <Route
          path="/dashboard"
          element={isAuthenticated ? <DashboardPage /> : <Navigate to="/" replace />}
        />
        <Route
          path="/create-trivia"
          element={isAuthenticated ? <CreateTriviaPage /> : <Navigate to="/" replace />}
        />

        {/* Ruta catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
