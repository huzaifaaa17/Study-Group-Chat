import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/authcontext';
import PrivateRoute from './components/privateroute';
import Signup from './components/auth/sign';
import Login from './components/auth/login';
import Dashboard from './components/dashboard/dashboard';
import Room from './components/room/room';
import { setupMessageListener } from './utils/notifications';
import './app.css';

function App() {
  useEffect(() => {
    setupMessageListener();
  }, []);

  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/room/:roomId"
            element={
              <PrivateRoute>
                <Room />
              </PrivateRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;