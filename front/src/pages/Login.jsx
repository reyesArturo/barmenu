import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import { useAuthStore } from '../store/authStore';

const dashboardByPermission = [
  { permission: 'metrics.view', path: '/admin' },
  { permission: 'orders.kitchen.view', path: '/admin/cocina' },
  { permission: 'orders.cashier.view', path: '/admin/caja' },
];

function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const token = useAuthStore((state) => state.token);

  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isDisabled = useMemo(
    () => loading || !form.email.trim() || !form.password,
    [loading, form.email, form.password],
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resolveRedirect = (permissions) => {
    const found = dashboardByPermission.find((item) => permissions.includes(item.permission));
    return found?.path ?? '/admin';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await api.post('/login', form);
      const permissions = data.permissions ?? [];
      const roles = data.roles ?? [];

      setAuth({
        token: data.access_token,
        user: data.user,
        roles,
        permissions,
      });

      navigate(resolveRedirect(permissions), { replace: true });
    } catch (err) {
      const message = err?.response?.data?.message
        || (err?.code === 'ECONNABORTED' ? 'El servidor tardó demasiado en responder.' : '')
        || (!err?.response ? 'No hubo respuesta del servidor. Revisa la red local y el puerto 8000.' : '')
        || 'No se pudo iniciar sesión';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      navigate('/admin', { replace: true });
    }
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-[#0b0c10] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-[#131620] border border-white/10 rounded-2xl shadow-2xl p-8">
        <div className="flex flex-col items-center">
          <img src="/ch.jpg" alt="CH V" className="h-12 w-auto object-contain" />
          <h1 className="mt-4 text-2xl font-black text-center uppercase tracking-wide text-[#ff6f00]">Iniciar sesión</h1>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2" htmlFor="email">
              Correo
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              className="w-full bg-black/30 border border-white/15 rounded-xl px-4 py-3 outline-none focus:border-[#ff6f00]"
              placeholder="admin@admin.com"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
              className="w-full bg-black/30 border border-white/15 rounded-xl px-4 py-3 outline-none focus:border-[#ff6f00]"
              placeholder="********"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isDisabled}
            className="w-full mt-2 bg-[#ff6f00] hover:bg-[#ff7f21] disabled:bg-gray-700 disabled:text-gray-400 text-black font-black uppercase tracking-wider py-3 rounded-xl transition-colors"
          >
            {loading ? 'Entrando...' : 'Iniciar sesión'}
          </button>
        </form>

       
      </div>
    </div>
  );
}

export default Login;
