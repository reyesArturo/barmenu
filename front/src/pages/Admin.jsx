
import { useQuery } from '@tanstack/react-query';
import api from '../lib/axios';
import { TrendingUp, DollarSign, Receipt, Package } from 'lucide-react';

function Admin() {
  const { data: metrics, isLoading, error } = useQuery({
    queryKey: ['admin-metrics'],
    queryFn: async () => {
      // Usaremos un token hardcodeado por ahora o sin auth si lo desprotegiste,
      // Pero asumiendo que api devuelve las métricas.
      const res = await api.get('/admin/metrics');
      return res.data;
    },
    // Si tienes auth, asegúrate de pasar los headers con el Bearer token
    // Pero asumiendo que la ruta está libre o ya manejas el login temporalmente
  });

  if (isLoading) return <div className="h-screen bg-bg-dark text-white flex items-center justify-center">Cargando métricas...</div>;
  if (error) return <div className="h-screen bg-bg-dark text-red-500 flex items-center justify-center">Error al cargar o no tienes permisos.</div>;

  return (
    <div className="min-h-screen bg-bg-dark text-white p-6 font-sans">
      <header className="mb-8">
        <h1 className="text-3xl font-black uppercase">Dashboard Dueño</h1>
        <p className="text-gray-400">Resumen de ventas y métricas clave.</p>
      </header>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-card-dark p-6 rounded-2xl border border-white/5 flex items-center gap-4">
          <div className="bg-primary/20 p-4 rounded-xl text-primary"><DollarSign size={24} /></div>
          <div>
            <p className="text-sm text-gray-400">Ventas Totales</p>
            <p className="text-2xl font-bold">${metrics?.total_sales?.toFixed(2) || 0}</p>
          </div>
        </div>

        <div className="bg-card-dark p-6 rounded-2xl border border-white/5 flex items-center gap-4">
          <div className="bg-secondary/20 p-4 rounded-xl text-secondary"><Receipt size={24} /></div>
          <div>
            <p className="text-sm text-gray-400">Total Pedidos</p>
            <p className="text-2xl font-bold">{metrics?.total_orders || 0}</p>
          </div>
        </div>

        <div className="bg-card-dark p-6 rounded-2xl border border-white/5 flex items-center gap-4">
          <div className="bg-green-500/20 p-4 rounded-xl text-green-500"><TrendingUp size={24} /></div>
          <div>
            <p className="text-sm text-gray-400">Ticket Promedio</p>
            <p className="text-2xl font-bold">${metrics?.average_ticket?.toFixed(2) || 0}</p>
          </div>
        </div>
      </div>

      {/* Top Productos */}
      <div className="bg-card-dark rounded-2xl border border-white/5 p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Package size={20} className="text-primary" /> Productos más vendidos</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 text-gray-400">
                <th className="pb-3 font-semibold">Producto</th>
                <th className="pb-3 font-semibold">Cantidad Vendida</th>
              </tr>
            </thead>
            <tbody>
              {metrics?.top_products?.map((prod, idx) => (
                <tr key={idx} className="border-b border-white/5 last:border-0">
                  <td className="py-4 flex items-center gap-3 font-medium">{prod.name}</td>
                  <td className="py-4 text-secondary font-bold">{prod.total_sold}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!metrics?.top_products || metrics.top_products.length === 0) && (
            <p className="text-center text-gray-500 py-4">Aún no hay ventas para mostrar.</p>
          )}
        </div>
      </div>

    </div>
  );
}

export default Admin;
