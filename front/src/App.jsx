import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Componente Layout
import AdminLayout from './components/AdminLayout';

// Páginas
import ClientMenu from './pages/ClientMenu';
import Admin from './pages/Admin';
import Kitchen from './pages/Kitchen';
import Cashier from './pages/Cashier';
import MenuManager from './pages/MenuManager';
import QRManager from './pages/QRManager';

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta del Cliente Móvil (no lleva barra lateral administrativa) */}
        <Route path="/" element={<ClientMenu />} />
        
        {/* Bloque administrativo con la barra lateral  */}
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<Admin />} />
          <Route path="/cocina" element={<Kitchen />} />
          <Route path="/caja" element={<Cashier />} />
          <Route path="/admin/menu" element={<MenuManager />} />
          <Route path="/admin/qrs" element={<QRManager />} />
        </Route>

        {/* Cualquier ruta que no exista la mandamos al root (Menú) */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
