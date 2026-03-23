
import { useQuery } from '@tanstack/react-query';
import api from '../lib/axios';
import { TrendingUp, DollarSign, Receipt, Package, Clock3, Trophy, Star } from 'lucide-react';

function Admin() {
  const { data: metrics, isLoading, error } = useQuery({
    queryKey: ['admin-metrics'],
    queryFn: async () => {
      const res = await api.get('/admin/metrics');
      return res.data;
    },
    refetchInterval: 10000,
    refetchOnWindowFocus: true,
  });
  const monthlyLabels = metrics?.monthly_labels || [];
  const monthlyProductSales = metrics?.monthly_product_sales || [];
  const currentMonthIndex = new Date().getMonth();

  const monthlyTopProducts = monthlyProductSales
    .map((product) => ({
      ...product,
      month_units: product.data?.[currentMonthIndex] || 0,
    }))
    .filter((product) => product.month_units > 0)
    .sort((a, b) => b.month_units - a.month_units)
    .slice(0, 5);

  const annualTopProducts = monthlyProductSales
    .map((product) => ({
      ...product,
      total_units: product.data.reduce((sum, value) => sum + value, 0),
    }))
    .sort((a, b) => b.total_units - a.total_units)
    .slice(0, 5);

  const totalUnitsAllProducts = annualTopProducts.reduce(
    (sum, product) => sum + product.data.reduce((subtotal, value) => subtotal + value, 0),
    0,
  );
  const monthLabel = new Intl.DateTimeFormat('es-MX', { month: 'long' }).format(new Date());
  const monthLabelCapitalized = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);
  const bestProduct = monthlyTopProducts.length
    ? monthlyTopProducts[0]
    : null;

  if (isLoading) return <div className="h-screen bg-bg-dark text-white flex items-center justify-center px-4 text-center">Cargando métricas...</div>;
  if (error) return <div className="h-screen bg-bg-dark text-red-500 flex items-center justify-center px-4 text-center">Error al cargar o no tienes permisos.</div>;

  return (
    <div className="min-h-screen bg-bg-dark text-white p-4 sm:p-6 font-sans">
      <header className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black uppercase">Dashboard Dueño</h1>
        <p className="text-gray-400 text-sm sm:text-base">Resumen de ventas y métricas clave.</p>
      </header>

      {/* Cards de Métricas */}
      {/* <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-8"> */}
        {/* <div className="bg-card-dark p-6 rounded-2xl border border-white/5 flex items-center gap-4">
          <div className="bg-primary/20 p-4 rounded-xl text-primary"><DollarSign size={24} /></div>
          <div>
            <p className="text-sm text-gray-400">Ventas del Día</p>
            <p className="text-2xl font-bold">${metrics?.total_sales?.toFixed(2) || 0}</p>
          </div>
        </div> */}

        {/* <div className="bg-card-dark p-6 rounded-2xl border border-white/5 flex items-center gap-4">
          <div className="bg-secondary/20 p-4 rounded-xl text-secondary"><Receipt size={24} /></div>
          <div>
            <p className="text-sm text-gray-400">Total Pedidos</p>
            <p className="text-2xl font-bold">{metrics?.total_orders || 0}</p>
          </div>
        </div> */}

        {/* <div className="bg-card-dark p-6 rounded-2xl border border-white/5 flex items-center gap-4">
          <div className="bg-green-500/20 p-4 rounded-xl text-green-500"><TrendingUp size={24} /></div>
          <div>
            <p className="text-sm text-gray-400">Ticket Promedio</p>
            <p className="text-2xl font-bold">${metrics?.average_ticket?.toFixed(2) || 0}</p>
          </div>
        </div> */}

        {/* <div className="bg-card-dark p-6 rounded-2xl border border-white/5 flex items-center gap-4">
          <div className="bg-blue-500/20 p-4 rounded-xl text-blue-400"><Clock3 size={24} /></div>
          <div>
            <p className="text-sm text-gray-400">Órdenes Activas</p>
            <p className="text-2xl font-bold">{(metrics?.status_counts?.pending || 0) + (metrics?.status_counts?.preparing || 0) + (metrics?.status_counts?.served || 0)}</p>
          </div>
        </div> */}
      {/* </div> */}
{/* 
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <div className="bg-card-dark border border-white/5 rounded-2xl p-4">
          <p className="text-xs uppercase tracking-widest text-gray-400 font-bold">Pendientes</p>
          <p className="mt-2 text-2xl font-black text-white">{metrics?.status_counts?.pending || 0}</p>
        </div>
        <div className="bg-card-dark border border-white/5 rounded-2xl p-4">
          <p className="text-xs uppercase tracking-widest text-gray-400 font-bold">Preparando</p>
          <p className="mt-2 text-2xl font-black text-secondary">{metrics?.status_counts?.preparing || 0}</p>
        </div>
        <div className="bg-card-dark border border-white/5 rounded-2xl p-4">
          <p className="text-xs uppercase tracking-widest text-gray-400 font-bold">Servidas</p>
          <p className="mt-2 text-2xl font-black text-orange-400">{metrics?.status_counts?.served || 0}</p>
        </div>
        <div className="bg-card-dark border border-white/5 rounded-2xl p-4">
          <p className="text-xs uppercase tracking-widest text-gray-400 font-bold">Pagadas</p>
          <p className="mt-2 text-2xl font-black text-green-500">{metrics?.status_counts?.paid || 0}</p>
        </div>
      </div> */}

      <div className="grid grid-cols-1 xl:grid-cols-[1.25fr_1fr] gap-6 mb-8">
        <section className="bg-card-dark rounded-2xl border border-white/5 p-6">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold uppercase">Productos Más Vendidos</h2>
              <p className="text-sm text-gray-400">Vista clara del rendimiento en {monthLabelCapitalized}</p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-widest text-gray-500 font-bold">Mes Actual</p>
              <p className="text-lg font-black text-white uppercase">{monthLabelCapitalized}</p>
            </div>
          </div>

          {bestProduct ? (
            <div className="rounded-2xl border border-yellow-400/25 bg-yellow-400/10 p-5 mb-5">
              <p className="text-xs uppercase tracking-[0.25em] text-yellow-300 font-bold">Producto Estrella</p>
              <div className="mt-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="text-2xl font-black text-white truncate flex items-center gap-2">
                    <Star size={20} className="text-yellow-300" /> {bestProduct.name}
                  </h3>
                  <p className="text-sm text-gray-300 mt-1">El más vendido del mes actual.</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-yellow-200 uppercase tracking-wider">Unidades</p>
                  <p className="text-3xl font-black text-yellow-300">{bestProduct.month_units}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 mb-5 text-center text-gray-400">
              Aún no hay ventas en {monthLabelCapitalized} para mostrar un producto estrella.
            </div>
          )}

          <div className="space-y-3">
            {monthlyTopProducts.length ? monthlyTopProducts.map((product, index) => {
              const maxMonthUnits = monthlyTopProducts[0]?.month_units || 1;
              const percent = Math.round((product.month_units / maxMonthUnits) * 100);

              return (
                <div key={product.product_id} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <p className="font-bold text-white truncate">#{index + 1} {product.name}</p>
                    <p className="text-secondary font-black">{product.month_units} uds</p>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden border border-white/5">
                    <div className="h-full bg-secondary" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            }) : (
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5 text-center text-gray-500">
                No hay ventas registradas en este mes.
              </div>
            )}
          </div>
        </section>

        <section className="bg-card-dark rounded-2xl border border-white/5 p-6">
          <div className="mb-6">
            <h2 className="text-xl font-black uppercase tracking-wide">Top Anual</h2>
            <p className="text-sm text-gray-400 mt-1">Participación de cada producto líder en el total acumulado del año (solo órdenes pagadas).</p>
          </div>

          {annualTopProducts.length ? (
            <div className="space-y-3">
              {annualTopProducts.map((product, index) => {
                const percent = totalUnitsAllProducts ? Math.round((product.total_units / totalUnitsAllProducts) * 100) : 0;
                const rankStyles = index === 0
                  ? {
                      badge: 'bg-yellow-400/20 text-yellow-300 border-yellow-300/40',
                      glow: 'shadow-[0_0_30px_rgba(250,204,21,0.08)]',
                      bar: 'bg-yellow-300',
                    }
                  : index === 1
                    ? {
                        badge: 'bg-slate-300/20 text-slate-200 border-slate-200/30',
                        glow: 'shadow-[0_0_20px_rgba(148,163,184,0.08)]',
                        bar: 'bg-slate-300',
                      }
                    : {
                        badge: 'bg-amber-700/20 text-amber-300 border-amber-300/30',
                        glow: 'shadow-[0_0_20px_rgba(245,158,11,0.08)]',
                        bar: 'bg-amber-400',
                      };

                return (
                  <article
                    key={product.product_id}
                    className={`rounded-2xl border border-white/10 bg-gradient-to-r from-white/[0.05] to-white/[0.01] px-4 py-4 ${rankStyles.glow}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-black uppercase tracking-widest px-2 py-1 rounded-full border ${rankStyles.badge}`}>
                            #{index + 1}
                          </span>
                          <Trophy size={15} className={index === 0 ? 'text-yellow-300' : 'text-gray-500'} />
                        </div>
                        <h3 className="text-base font-black text-white truncate">{product.name}</h3>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-lg font-black text-primary leading-none">{product.total_units} <span className="text-xs text-gray-400 font-bold">uds</span></p>
                        <p className="text-xs text-gray-500 mt-1">{percent}% del total</p>
                      </div>
                    </div>

                    <div className="mt-3 h-2.5 rounded-full bg-white/5 border border-white/5 overflow-hidden">
                      <div className={`h-full ${rankStyles.bar} transition-all duration-500`} style={{ width: `${Math.max(percent, 4)}%` }} />
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 text-center text-gray-500">
              Aún no hay ventas pagadas para calcular el top anual.
            </div>
          )}
        </section>
      </div>

      {/* Top Productos */}
      <div className="bg-card-dark rounded-2xl border border-white/5 p-6">
        <h2 className="text-xl font-bold mb-1 flex items-center gap-2"><Package size={20} className="text-primary" /> Productos más vendidos hoy</h2>
        <p className="text-sm text-gray-400 mb-4">Conteo del día actual (solo órdenes pagadas).</p>
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
