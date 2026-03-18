import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';
import { Calculator, Banknote, History } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmDialog from '../components/ConfirmDialog';

function Cashier() {
  const queryClient = useQueryClient();
  const [orderToConfirm, setOrderToConfirm] = useState(null);
  const statusLabels = {
    pending: 'Pendiente',
    preparing: 'Preparando',
    served: 'Listo para cobrar',
    paid: 'Pagado',
  };
  const dateTimeFormatter = useMemo(
    () => new Intl.DateTimeFormat('es-MX', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }),
    []
  );

  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['cashier-orders'],
    queryFn: async () => {
      const res = await api.get('/admin/cashier/orders');
      return res.data;
    },
    refetchInterval: 5000 // Polling cada 5 seg
  });

  const { data: history } = useQuery({
    queryKey: ['cashier-history'],
    queryFn: async () => {
      const res = await api.get('/admin/cashier/history');
      return res.data;
    },
    refetchInterval: 5000,
  });

  const payMutation = useMutation({
    mutationFn: async ({ orderId }) => {
      const response = await api.put(`/admin/cashier/orders/${orderId}/pay`);
      return response.data;
    },
    onMutate: async ({ orderId }) => {
      await queryClient.cancelQueries({ queryKey: ['cashier-orders'] });

      const previousOrders = queryClient.getQueryData(['cashier-orders']);

      queryClient.setQueryData(['cashier-orders'], (currentOrders) => {
        if (!Array.isArray(currentOrders)) return currentOrders;

        return currentOrders.filter((order) => order.id !== orderId);
      });

      return { previousOrders };
    },
    onSuccess: (_data, variables) => {
      queryClient.setQueryData(['cashier-orders'], (currentOrders) => {
        if (!Array.isArray(currentOrders)) return currentOrders;

        return currentOrders.filter((order) => order.id !== variables.orderId);
      });

      queryClient.invalidateQueries({ queryKey: ['cashier-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['cashier-history'] });
      setOrderToConfirm(null);
      toast.success('Cuenta cobrada. La orden se marcó como pagada.');
    },
    onError: (error, _variables, context) => {
      if (context?.previousOrders) {
        queryClient.setQueryData(['cashier-orders'], context.previousOrders);
      }

      const message = error?.response?.data?.message || 'No se pudo cobrar la cuenta.';
      setOrderToConfirm(null);
      toast.error(`No se pudo cobrar la cuenta. ${message}`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cashier-orders'] });
      queryClient.invalidateQueries({ queryKey: ['cashier-history'] });
    }
  });

  const formatDateTime = (value) => {
    if (!value) return 'Sin registro';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return 'Sin registro';

    return dateTimeFormatter.format(date);
  };

  const handlePayClick = (order) => {
    setOrderToConfirm(order);
  };

  const handleConfirmPay = () => {
    if (!orderToConfirm) return;

    payMutation.mutate({ orderId: orderToConfirm.id });
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
                  <h3 className="text-2xl font-black uppercase">{order.table?.number ?? `Mesa ${order.table_id}`}</h3>
                  <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${order.status === 'served' ? 'bg-orange-500/20 text-orange-400' : 'bg-gray-500/20 text-gray-400'}`}>
                    {order.status === 'served' ? 'LISTO PARA COBRAR' : (statusLabels[order.status] ?? 'EN PROCESO')}
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
                onClick={() => handlePayClick(order)}
                disabled={order.status !== 'served' || payMutation.isPending}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-black uppercase tracking-widest py-3 rounded-xl transition-colors active:scale-95 shadow-[0_0_15px_rgba(22,163,74,0.3)]"
              >
                <Banknote size={20} /> Cobrar Cuenta
              </button>
            </div>
          ))
        )}
      </div>

      <section className="mt-10">
        <div className="flex items-center gap-3 mb-4">
          <History size={22} className="text-gray-300" />
          <h2 className="text-2xl font-black uppercase">Historial de Cobros</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {history?.length ? history.map((order) => (
            <div key={order.id} className="bg-card-dark border border-white/10 rounded-2xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-black uppercase">{order.table?.number ?? `Mesa ${order.table_id}`}</h3>
                  <p className="text-xs text-gray-400 font-mono mt-1">#{order.id.toString().padStart(4, '0')}</p>
                  <p className="text-xs text-gray-500 mt-2">Cobrada: {formatDateTime(order.updated_at)}</p>
                </div>
                <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-green-500/20 text-green-400">
                  {statusLabels[order.status] ?? order.status}
                </span>
              </div>

              <div className="mt-4 space-y-2">
                {order.items?.slice(0, 3).map((item, idx) => (
                  <div key={idx} className="text-sm text-gray-300 flex justify-between">
                    <span>{item.quantity}x {item.product?.name}</span>
                    <span className="font-mono">${item.subtotal}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center">
                <span className="text-xs uppercase tracking-widest text-gray-500">Total</span>
                <span className="text-lg font-black text-green-500">${order.total_amount}</span>
              </div>
            </div>
          )) : (
            <div className="col-span-full text-gray-500 border border-white/5 rounded-2xl p-6 text-center">
              Aún no hay cobros recientes para mostrar.
            </div>
          )}
        </div>
      </section>

      <ConfirmDialog
        open={Boolean(orderToConfirm)}
        title="Confirmar cobro"
        message={orderToConfirm ? `Vas a cobrar la cuenta de ${orderToConfirm.table?.number ?? `Mesa ${orderToConfirm.table_id}`} por $${orderToConfirm.total_amount}. Esta acción registrará el cobro con la fecha y hora actual.` : ''}
        confirmText="Sí, cobrar"
        cancelText="Cancelar"
        onConfirm={handleConfirmPay}
        onCancel={() => setOrderToConfirm(null)}
        loading={payMutation.isPending}
      />

    </div>
  );
}

export default Cashier;
