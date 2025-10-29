import { useEffect, useState, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../lib/api/queryClient';
import { authService } from '../lib/services/authServices';
import { connectSocket, cleanupSocket } from '../lib/socket';
import LoginPage from './LoginPage';
import DashboardPage from './DashboardPage';
import CreateTriviaPage from './CreateTriviaPage';
import WaitingRoomPage from './WaitingRoomPage';
import JoinRoomPage from './JoinRoomPage';
import GamePage from './GamePage';


// Componente para proteger rutas
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = authService.isAuthenticated();
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

//** 
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const socketInitialized = useRef(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  useEffect(() => {
    const token = authService.getToken();
    
    if (token&& !socketInitialized.current) {
      connectSocket(token);
      socketInitialized.current = true;
    }

    return () => {
      cleanupSocket();
      socketInitialized.current = false;
    };
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-500 to-purple-600">
        <div className="text-white text-2xl">Cargando...</div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
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
          <Route
            path="/game/:code"
            element={
              <PrivateRoute>
                <GamePage />
              </PrivateRoute>
            }
          />

          {/* Redirección por defecto */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;