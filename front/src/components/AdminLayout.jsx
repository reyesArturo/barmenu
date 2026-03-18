import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ChefHat, Calculator, UtensilsCrossed, QrCode } from 'lucide-react';

const AdminLayout = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
    { name: 'Cocina', path: '/cocina', icon: <ChefHat size={20} /> },
    { name: 'La Caja', path: '/caja', icon: <Calculator size={20} /> },
    { name: 'Menú', path: '/admin/menu', icon: <UtensilsCrossed size={20} /> },
    { name: 'Códigos QR', path: '/admin/qrs', icon: <QrCode size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-[#0f0f13] text-white font-sans overflow-hidden">
      {/* Sidebar Lateral */}
      <aside className="w-64 bg-[#1a1a24] border-r border-white/5 flex flex-col print:hidden">
        <div className="p-6 border-b border-white/5 flex items-center gap-3">
          <h1 className="text-3xl font-black italic tracking-tighter text-[#E53935]">
            CH<span className="text-[#FF9800]"> V</span>
          </h1>
          <span className="text-[10px] bg-white/10 px-2 py-1 rounded uppercase font-bold tracking-widest text-gray-400">Admin</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto w-full">
          <p className="text-xs uppercase font-bold tracking-widest text-gray-500 mb-4 px-2">Navegación</p>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-bold uppercase tracking-wider text-xs ${
                  isActive 
                    ? 'bg-[#E53935] text-white shadow-[0_0_15px_rgba(229,57,53,0.4)]' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-6 border-t border-white/5">
          <Link to="/" target="_blank" className="flex items-center justify-center w-full py-3 bg-white/5 rounded-xl text-xs font-bold uppercase tracking-widest text-gray-300 hover:text-white hover:bg-white/10 transition-colors">
            Ver App Cliente
          </Link>
        </div>
      </aside>

      {/* Contenido Principal (Las otras pantallas cargan aquí adentro) */}
      <main className="flex-1 overflow-y-auto bg-black border-l border-white/5 relative">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
