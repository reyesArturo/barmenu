import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';
import { ChefHat, CheckSquare, History, FlameKindling } from 'lucide-react';

function Kitchen() {
  const queryClient = useQueryClient();
  const statusLabels = {
    pending: 'Pendiente',
    preparing: 'Preparando',
    served: 'Servido',
    paid: 'Pagado',
  };

  // Fetch pedidos de cocina (Idealmente polling cada 5 segundos si no hay websockets)
  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['kitchen-orders'],
    queryFn: async () => {
      const res = await api.get('/admin/kitchen/orders');
      return res.data;
    },
    refetchInterval: 5000 // Polling cada 5 seg
  });

  const { data: history } = useQuery({
    queryKey: ['kitchen-history'],
    queryFn: async () => {
      const res = await api.get('/admin/kitchen/history');
      return res.data;
    },
    refetchInterval: 5000,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }) => {
      await api.put(`/admin/kitchen/orders/${orderId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kitchen-orders'] });
      queryClient.invalidateQueries({ queryKey: ['kitchen-history'] });
      queryClient.invalidateQueries({ queryKey: ['admin-metrics'] });
    }
  });

  const handleAdvanceStatus = (order) => {
    const nextStatus = order.status === 'pending' ? 'preparing' : 'served';
    updateStatusMutation.mutate({ orderId: order.id, status: nextStatus });
  };

  if (isLoading) return <div className="h-screen bg-bg-dark text-white flex items-center justify-center">Cargando comandas...</div>;
  if (error) return <div className="h-screen bg-bg-dark text-red-500 flex items-center justify-center">Error al cargar o no tienes permisos en cocina.</div>;

  return (
    <div className="min-h-screen bg-bg-dark text-white p-6 font-sans">
      <header className="mb-8 flex justify-between items-center border-b border-white/10 pb-4">
        <div>
          <h1 className="text-4xl font-black uppercase text-secondary flex items-center gap-3">
            <ChefHat size={36} /> Órdenes en Cocina
          </h1>
          <p className="text-gray-400 font-bold tracking-widest uppercase text-sm mt-2">Visión de Chef</p>
        </div>
        <div className="bg-primary/20 text-primary px-4 py-2 rounded-full font-bold">
          {orders?.length || 0} Activas
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
        {orders?.length === 0 ? (
          <div className="col-span-full h-64 flex flex-col items-center justify-center text-gray-500 gap-4">
             <ChefHat size={64} className="opacity-20" />
             <p className="text-xl uppercase font-bold tracking-widest">No hay pedidos pendientes. ¡A descansar!</p>
          </div>
        ) : (
          orders?.map(order => (
            <div key={order.id} className="bg-card-dark border border-white/10 rounded-2xl p-5 shadow-2xl relative overflow-hidden transition-all hover:scale-[1.01]">
              
              {/* Cinta lateral de color */}
              <div className="absolute top-0 bottom-0 left-0 w-2 bg-secondary" />

              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-black uppercase">{order.table?.number ?? `Mesa ${order.table_id}`}</h3>
                  <span className="text-xs text-gray-400 font-mono">#{order.id.toString().padStart(4, '0')}</span>
                </div>
                <span className="bg-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                  {statusLabels[order.status] ?? order.status}
                </span>
              </div>

              <div className="space-y-3 mb-6">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center border-b border-white/5 pb-2 last:border-0 p-2 bg-black/20 rounded-lg">
                    <div className="flex gap-3">
                      <span className="font-bold text-secondary w-6 text-right">{item.quantity}x</span>
                      <span className="font-semibold">{item.product?.name}</span>
                    </div>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => handleAdvanceStatus(order)}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white font-black uppercase tracking-widest py-3 rounded-xl transition-colors active:scale-95 shadow-[0_0_15px_rgba(22,163,74,0.3)]"
              >
                {order.status === 'pending' ? <FlameKindling size={20} /> : <CheckSquare size={20} />}
                {order.status === 'pending' ? 'Empezar Preparación' : 'Marcar Listo'}
              </button>
            </div>
          ))
        )}
      </div>

      <section className="mt-10">
        <div className="flex items-center gap-3 mb-4">
          <History size={22} className="text-gray-300" />
          <h2 className="text-2xl font-black uppercase">Historial Reciente</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {history?.length ? history.map((order) => (
            <div key={order.id} className="bg-card-dark border border-white/10 rounded-2xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-black uppercase">{order.table?.number ?? `Mesa ${order.table_id}`}</h3>
                  <p className="text-xs text-gray-400 font-mono mt-1">#{order.id.toString().padStart(4, '0')}</p>
                </div>
                <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${order.status === 'paid' ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'}`}>
                  {statusLabels[order.status] ?? order.status}
                </span>
              </div>

              <div className="mt-4 space-y-2">
                {order.items?.slice(0, 3).map((item, idx) => (
                  <div key={idx} className="text-sm text-gray-300 flex justify-between">
                    <span>{item.quantity}x {item.product?.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )) : (
            <div className="col-span-full text-gray-500 border border-white/5 rounded-2xl p-6 text-center">
              Aún no hay historial de preparaciones recientes.
            </div>
          )}
        </div>
      </section>

    </div>
  );
}

export default Kitchen;
