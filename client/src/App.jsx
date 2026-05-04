import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Welcome from './pages/Welcome';


function App() {
  return (
    <Router>
      <Routes>
        {/* Arahkan halaman utama langsung ke Welcome */}
        <Route path="/" element={<Welcome />} />
        
        {/* Rute ke halaman Auth yang baru kita buat */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}

export default App;