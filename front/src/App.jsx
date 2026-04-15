import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Componente Layout
import AdminLayout from './components/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Páginas
import ClientMenu from './pages/ClientMenu';
import Admin from './pages/Admin';
import Kitchen from './pages/Kitchen';
import Cashier from './pages/Cashier';
import MenuManager from './pages/MenuManager';
import QRManager from './pages/QRManager';
import Login from './pages/Login';
// Comentario de prueba para git 2
function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta del Cliente Móvil (no lleva barra lateral administrativa) */}
        <Route path="/" element={<Navigate to="/cliente" replace />} />
        <Route path="/cliente" element={<ClientMenu />} />
        <Route path="/cliente/:token" element={<ClientMenu />} />
        <Route path="/login" element={<Login />} />

        {/* Bloque administrativo con la barra lateral  */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredPermission="metrics.view">
                  <Admin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/cocina"
              element={
                <ProtectedRoute requiredPermission="orders.kitchen.view">
                  <Kitchen />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/caja"
              element={
                <ProtectedRoute requiredPermission="orders.cashier.view">
                  <Cashier />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/menu"
              element={
                <ProtectedRoute requiredPermission="menu.manage">
                  <MenuManager />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/qrs"
              element={
                <ProtectedRoute requiredPermission="tables.manage">
                  <QRManager />
                </ProtectedRoute>
              }
            />
          </Route>
        </Route>

        {/* Cualquier ruta que no exista la mandamos al root (Menú) */}
        <Route path="*" element={<Navigate to="/cliente" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
