import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './LoginPage';
import DashboardPage from './DashboardPage';
import CreateTriviaPage from './CreateTriviaPage';
import WaitingRoomPage from './WaitingRoomPage';
import JoinRoomPage from './JoinRoomPage';


// Componente para proteger rutas
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  return token ? <>{children}</> : <Navigate to="/" replace />;
}

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
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/create-trivia"
          element={
            <PrivateRoute>
              <CreateTriviaPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/room/:code"
          element={
            <PrivateRoute>
              <WaitingRoomPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/join-room"
          element={
            <PrivateRoute>
              <JoinRoomPage />
            </PrivateRoute>
          }
        />

        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;