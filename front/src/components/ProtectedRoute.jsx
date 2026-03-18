import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const dashboardByPermission = [
  { permission: 'metrics.view', path: '/admin' },
  { permission: 'orders.kitchen.view', path: '/admin/cocina' },
  { permission: 'orders.cashier.view', path: '/admin/caja' },
  { permission: 'menu.manage', path: '/admin/menu' },
  { permission: 'tables.manage', path: '/admin/qrs' },
  { permission: 'tables.view', path: '/admin/qrs' },
];

function ProtectedRoute({ requiredPermission, children }) {
  const location = useLocation();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const roles = useAuthStore((state) => state.roles);
  const permissions = useAuthStore((state) => state.permissions);
  const hasPermission = useAuthStore((state) => state.hasPermission);

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  const isAdmin = roles.includes('admin') || user?.role === 'admin';

  if (requiredPermission && !isAdmin && !hasPermission(requiredPermission)) {
    const fallback = dashboardByPermission.find((item) => permissions.includes(item.permission));
    return <Navigate to={fallback?.path ?? '/login'} replace />;
  }

  if (children) {
    return children;
  }

  return <Outlet />;
}

export default ProtectedRoute;
