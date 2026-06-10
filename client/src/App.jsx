import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Welcome from './pages/Welcome';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/protectedRoute';
import Board from './pages/Board';
import { SidebarProvider } from './context/SidebarContext';
import Profile from './pages/Profile';
import List from './pages/List';
import Team from './pages/Team';


function App() {
  return (
    <SidebarProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Welcome />} />
          
          <Route path="/Login" element={<Login />} />
          <Route path="/Register" element={<Register />} />
          <Route path="/Profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />

          <Route 
            path="/Dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/board/:id"
            element={
              <ProtectedRoute>
                <Board />
              </ProtectedRoute>
            }
          />
          <Route path="/list" element={<List />} />
          <Route path="/team" element={
            <ProtectedRoute>
              <Team />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </SidebarProvider>
  );
}

export default App;
