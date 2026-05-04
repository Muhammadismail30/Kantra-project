import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Welcome from './pages/Welcome';
import Dashboard from './pages/dashboard';
import ProtectedRoute from './components/protectedRoute';


function App() {
  return (
    <Router>
      <Routes>
        {/* Arahkan halaman utama langsung ke Welcome */}
        <Route path="/" element={<Welcome />} />
        
        {/* Rute ke halaman Auth yang baru kita buat */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rute ke Dashboard yang dilindungi oleh ProtectedRoute */}
        <Route 
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;