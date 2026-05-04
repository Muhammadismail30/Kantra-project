import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // Cek apakah ada token yang tersimpan di Local Storage
  const token = localStorage.getItem('token');

  // Jika token tidak ada, arahkan paksa ke halaman login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Jika ada, persilakan render komponen tujuan (contoh: Dashboard)
  return children;
};

export default ProtectedRoute;  