import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';
import { Calculator, Banknote } from 'lucide-react';

function Cashier() {
  const queryClient = useQueryClient();

  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['cashier-orders'],
    queryFn: async () => {
      const res = await api.get('/admin/cashier/orders');
      return res.data;
    },
    refetchInterval: 5000 // Polling cada 5 seg
  });

  const payMutation = useMutation({
    mutationFn: async ({ orderId }) => {
      await api.put(`/admin/kitchen/orders/${orderId}/status`, { status: 'paid' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['cashier-orders']);
      queryClient.invalidateQueries(['admin-metrics']);
    }
  });

  const handlePay = (orderId) => {
    if(window.confirm('¿Confirmas que el cliente ya pagó la cuenta?')) {
      payMutation.mutate({ orderId });
    }
  };

  if (isLoading) return <div className="h-screen bg-bg-dark text-white flex items-center justify-center">Abriendo la caja registradora...</div>;
  if (error) return <div className="h-screen bg-bg-dark text-red-500 flex items-center justify-center">Error al cargar o no tienes sesión activa.</div>;

  return (
    <div className="min-h-screen bg-bg-dark text-white p-6 font-sans">
      <header className="mb-8 flex justify-between items-center border-b border-white/10 pb-4">
        <div>
          <h1 className="text-4xl font-black uppercase text-green-500 flex items-center gap-3">
            <Calculator size={36} /> La Caja
          </h1>
          <p className="text-gray-400 font-bold tracking-widest uppercase text-sm mt-2">Cuentas por cobrar</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders?.length === 0 ? (
          <div className="col-span-full h-64 flex flex-col items-center justify-center text-gray-500 gap-4">
             <Banknote size={64} className="opacity-20" />
             <p className="text-xl uppercase font-bold tracking-widest">No hay cuentas pendientes.</p>
          </div>
        ) : (
          orders?.map(order => (
            <div key={order.id} className="bg-card-dark border border-white/10 rounded-2xl p-5 shadow-2xl relative transition-all">
              
              <div className="flex justify-between items-start mb-4 border-b border-white/5 pb-4">
                <div>
                  <h3 className="text-2xl font-black uppercase">Mesa {order.table_id}</h3>
                  <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${order.status === 'served' ? 'bg-orange-500/20 text-orange-400' : 'bg-gray-500/20 text-gray-400'}`}>
                    {order.status === 'served' ? 'LISTO PARA COBRAR' : 'COMIENDO'}
                  </span>
                </div>
                <div className="text-right">
                   <p className="text-sm text-gray-400">Total</p>
                   <p className="text-2xl font-black text-green-500">${order.total_amount}</p>
                </div>
              </div>

              <div className="space-y-2 mb-6">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm text-gray-300">
                    <div>
                      <span className="font-bold text-secondary mr-2">{item.quantity}x</span>
                      <span>{item.product?.name}</span>
                    </div>
                    <span className="font-mono">${item.subtotal}</span>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => handlePay(order.id)}
                disabled={order.status !== 'served'}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-black uppercase tracking-widest py-3 rounded-xl transition-colors active:scale-95 shadow-[0_0_15px_rgba(22,163,74,0.3)]"
              >
                <Banknote size={20} /> Cobrar Cuenta
              </button>
            </div>
          ))
        )}
      </div>

    </div>
  );
}

export default Cashier;
