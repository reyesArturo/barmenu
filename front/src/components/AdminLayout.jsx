import React, { useEffect, useMemo, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ChefHat, Calculator, UtensilsCrossed, QrCode, Moon, Sun, Menu, X } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const THEME_STORAGE_KEY = 'rb_theme';

const AdminLayout = () => {
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const roles = useAuthStore((state) => state.roles);
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_STORAGE_KEY) || 'dark');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAdmin = roles.includes('admin') || user?.role === 'admin';
  const isDark = theme !== 'light';

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const navItems = [
    { name: 'Dashboard', path: '/admin', permission: 'metrics.view', icon: <LayoutDashboard size={20} /> },
    { name: 'Cocina', path: '/admin/cocina', permission: 'orders.kitchen.view', icon: <ChefHat size={20} /> },
    { name: 'La Caja', path: '/admin/caja', permission: 'orders.cashier.view', icon: <Calculator size={20} /> },
    { name: 'Menú', path: '/admin/menu', permission: 'menu.manage', icon: <UtensilsCrossed size={20} /> },
    { name: 'Códigos QR', path: '/admin/qrs', permission: 'tables.manage', icon: <QrCode size={20} /> },
  ];

  const visibleNavItems = useMemo(
    () => navItems.filter((item) => isAdmin || hasPermission(item.permission)),
    [isAdmin, hasPermission],
  );

  const roleLabel = isAdmin ? 'Admin' : (roles[0] || user?.role || 'Staff');

  return (
    <div className={`admin-shell ${isDark ? 'theme-dark' : 'theme-light'} flex h-screen text-white font-sans overflow-hidden`}>
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Cerrar menu"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Sidebar Lateral */}
      <aside className={`w-72 max-w-[86vw] md:w-64 admin-sidebar border-r border-white/5 flex flex-col print:hidden fixed md:static inset-y-0 left-0 z-40 transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 border-b border-white/5 flex items-center gap-3">
          <h1 className="text-3xl font-black italic tracking-tighter text-[#E53935]">
            CH<span className="text-[#FF9800]"> V</span>
          </h1>
          <span className="text-[10px] bg-white/10 px-2 py-1 rounded uppercase font-bold tracking-widest text-gray-400">{roleLabel}</span>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="ml-auto md:hidden p-2 rounded-lg bg-white/5 hover:bg-white/10"
            aria-label="Cerrar"
          >
            <X size={16} />
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto w-full">
          <p className="text-xs uppercase font-bold tracking-widest text-gray-500 mb-4 px-2">Navegación</p>
          {visibleNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`btn-hover flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-bold uppercase tracking-wider text-xs ${
                  isActive 
                    ? 'bg-[#E53935] on-accent shadow-[0_0_15px_rgba(229,57,53,0.4)]' 
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
          <button
            onClick={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
            className="btn-hover flex items-center justify-center gap-2 w-full py-3 bg-white/5 rounded-xl text-xs font-bold uppercase tracking-widest text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />} {isDark ? 'Modo Claro' : 'Modo Oscuro'}
          </button>
          <Link to="/cliente" target="_blank" className="btn-hover flex items-center justify-center w-full mt-3 py-3 bg-white/5 rounded-xl text-xs font-bold uppercase tracking-widest text-gray-300 hover:text-white hover:bg-white/10 transition-colors">
            Ver App Cliente
          </Link>
          <button
            onClick={logout}
            className="btn-hover on-accent flex items-center justify-center w-full mt-3 py-3 bg-[#E53935] rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#d32f2f] transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Contenido Principal (Las otras pantallas cargan aquí adentro) */}
      <main className="admin-main flex-1 overflow-y-auto border-l border-white/5 relative">
        <div className="md:hidden sticky top-0 z-20 backdrop-blur-md bg-black/60 border-b border-white/10 px-4 py-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="btn-hover p-2 rounded-lg bg-white/5 hover:bg-white/10"
            aria-label="Abrir menu"
          >
            <Menu size={18} />
          </button>
          <p className="text-xs uppercase tracking-[0.2em] font-bold text-gray-300">{roleLabel}</p>
          <button
            type="button"
            onClick={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
            className="btn-hover p-2 rounded-lg bg-white/5 hover:bg-white/10"
            aria-label="Cambiar tema"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
