import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ShoppingBag, Plus, Minus, X, Trash2, UtensilsCrossed, QrCode, BellRing, Clock3, ChefHat, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/axios';
import { useCartStore } from '../store/cartStore';

function ClientMenu() {
  const { items, addToCart, removeFromCart, updateQuantity, getCartTotal, tableId, tableNumber, clearCart, setTable, setTableId, lastOrderId, lastOrderStatus, setLastOrder } = useCartStore();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);
  const { token: pathToken } = useParams();
  const [searchParams] = useSearchParams();
  const token = pathToken || searchParams.get('token');

  const statusMeta = {
    pending: {
      label: 'Pedido recibido',
      description: 'Tu orden ya fue registrada y está en fila para cocina.',
      icon: Clock3,
      accent: 'text-yellow-400',
      bg: 'bg-yellow-500/10 border-yellow-500/20',
    },
    preparing: {
      label: 'En preparación',
      description: 'Cocina ya está preparando tu pedido.',
      icon: ChefHat,
      accent: 'text-orange-400',
      bg: 'bg-orange-500/10 border-orange-500/20',
    },
    served: {
      label: 'Listo para entregar',
      description: 'Tu pedido ya está listo y va en camino a tu mesa.',
      icon: CheckCircle2,
      accent: 'text-green-400',
      bg: 'bg-green-500/10 border-green-500/20',
    },
    paid: {
      label: 'Cuenta cerrada',
      description: 'La orden ya fue cobrada. Gracias por tu visita.',
      icon: CheckCircle2,
      accent: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20',
    },
  };

  // Fetch Menú
  const { data: categories, isLoading, error } = useQuery({
    queryKey: ['menu'],
    queryFn: async () => {
      const res = await api.get('/client/menu');
      return res.data;
    },
    refetchInterval: 10000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  // Validar Mesa si hay Token QR
  const { data: tableData, isError: isTokenError, isLoading: isLoadingToken } = useQuery({
    queryKey: ['table-token', token],
    queryFn: async () => {
      const res = await api.get(`/client/table/${token}`);
      return res.data;
    },
    enabled: !!token,
    retry: false
  });

  const { data: trackedOrder } = useQuery({
    queryKey: ['client-order-status', lastOrderId],
    queryFn: async () => {
      const res = await api.get(`/client/orders/${lastOrderId}`);
      return res.data;
    },
    enabled: !!lastOrderId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === 'paid' ? 0 : 5000;
    },
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (tableData) {
      setTable(tableData);
    }
  }, [tableData, setTable]);

  useEffect(() => {
    if (!trackedOrder) return;

    if (trackedOrder.status !== lastOrderStatus) {
      const current = statusMeta[trackedOrder.status];
      if (current) {
        toast.success(current.label, {
          id: `order-status-${trackedOrder.id}`,
        });
      }
    }

    setLastOrder(trackedOrder);
  }, [trackedOrder, lastOrderStatus, setLastOrder]);

  const handleCheckout = async () => {
    try {
      if (items.length === 0) return;

      const { data } = await api.post('/client/orders', {
        table_id: tableId,
        items: items
      });

      setLastOrder(data);

      toast.success('Pedido enviado a cocina. Tu orden ya está en preparación.');
      clearCart();
      setIsCartOpen(false);

    } catch (err) {
      toast.error('No se pudo enviar el pedido. Por favor avisa a tu mesero.');
      console.error(err);
    }
  };

  const [bypass, setBypass] = useState(false);

  if (!bypass && (!token || isTokenError)) {
    return (
      <div className="min-h-screen bg-bg-dark text-white flex flex-col items-center justify-center p-6 text-center">
        <QrCode size={80} className="text-primary mb-6 animate-pulse" />
        <h1 className="text-3xl font-black uppercase mb-2 text-secondary">Escanea tu mesa</h1>
        <p className="text-gray-400">Para pedir código QR de tu mesa es necesario escanearlo con la cámara de tu celular.</p>
        {isTokenError && <p className="text-red-500 mt-4 font-bold border border-red-500/20 bg-red-500/10 p-4 rounded-xl">Código de mesa inválido o caducado.</p>}

        {/* Botón rápido para saltar el modo QR durante el desarrollo */}
        <button
          onClick={() => { setTableId(1); setBypass(true); }}
          className="mt-12 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-bold py-3 px-6 rounded-xl transition-colors text-sm uppercase tracking-widest"
        >
          Saltar y simular Mesa 1
        </button>
      </div>
    );
  }

  if (!bypass && (isLoading || isLoadingToken)) return <div className="h-screen flex items-center justify-center text-primary animate-pulse w-full bg-bg-dark font-black tracking-widest uppercase">Cargando el menú...</div>;
  if (error) return <div className="h-screen w-full bg-bg-dark flex items-center justify-center text-red-500">Error al cargar el menú</div>;

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const tableLabel = tableData?.number || tableNumber || (tableId ? `Mesa ${tableId}` : 'Mesa');
  const currentStatus = trackedOrder?.status || lastOrderStatus;
  const currentStatusMeta = currentStatus ? statusMeta[currentStatus] : null;
  const StatusIcon = currentStatusMeta?.icon || BellRing;

  return (
    <div className="min-h-screen pb-24 bg-bg-dark text-white font-sans">

      {/* Header Falso (Logo simulado) */}
      <header className="sticky top-0 z-10 bg-black/80 backdrop-blur-md border-b border-primary/20 pt-6 pb-4 px-4 flex flex-col items-center">
        <h1 className="text-4xl font-black italic tracking-tighter" style={{ color: 'var(--color-primary)' }}>
          CH<span style={{ color: 'var(--color-secondary)' }}> V</span>
        </h1>
        <p className="text-sm text-gray-400 mt-1 uppercase tracking-widest font-semibold flex items-center gap-2">
          <UtensilsCrossed size={14} className="text-secondary" />
          {tableLabel}
        </p>
      </header>

      {trackedOrder && currentStatusMeta && (
        <div className="px-4 pt-5">
          <div className={`border rounded-2xl p-4 ${currentStatusMeta.bg}`}>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className={`mt-1 ${currentStatusMeta.accent}`}>
                  <StatusIcon size={20} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-400 font-bold">Seguimiento de tu pedido</p>
                  <h2 className={`text-lg font-black uppercase mt-1 ${currentStatusMeta.accent}`}>{currentStatusMeta.label}</h2>
                  <p className="text-sm text-gray-300 mt-1">{currentStatusMeta.description}</p>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-xs uppercase tracking-widest text-gray-500">Orden</p>
                <p className="text-lg font-black text-white">#{trackedOrder.id}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Categorías (Pills) */}
      <div className="flex overflow-x-auto gap-3 py-6 px-4 no-scrollbar sticky top-20 z-10 bg-bg-dark/95 backdrop-blur-sm shadow-sm">
        {categories?.map((cat, index) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(index)}
            className={`whitespace-nowrap px-6 py-2.5 rounded-full font-bold text-sm transition-all duration-300 ${activeCategory === index
                ? 'bg-primary text-white shadow-[0_0_15px_rgba(211,30,30,0.4)]'
                : 'bg-card-dark text-gray-400 hover:text-white border border-white/5'
              }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Lista de Productos */}
      <main className="px-4 space-y-8">
        {categories?.[activeCategory]?.products.map(product => (
          <div key={product.id} className="bg-card-dark rounded-3xl overflow-hidden shadow-xl border border-white/5 flex flex-col sm:flex-row transition-transform hover:scale-[1.02]">

            {/* Imagen del producto */}
            {product.image_url && (
              <div className="h-48 sm:h-auto sm:w-48 relative">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent sm:hidden" />
              </div>
            )}

            {/* Info */}
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-bold uppercase tracking-tight">{product.name}</h3>
                <span className="text-xl font-bold text-secondary">${product.price}</span>
              </div>
              <p className="text-gray-400 text-sm mt-2 flex-1">{product.description}</p>

              <button
                onClick={() => addToCart(product)}
                className="mt-6 flex items-center justify-center gap-2 w-full bg-primary hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl transition-colors active:scale-95"
              >
                <Plus size={20} />
                Agregar a mi cuenta
              </button>
            </div>
          </div>
        ))}
      </main>

      {/* Botón flotante del carrito */}
      {totalItems > 0 && (
        <button
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-6 w-11/12 max-w-sm left-1/2 -translate-x-1/2 bg-secondary text-white rounded-2xl p-4 shadow-[0_0_30px_rgba(255,123,0,0.5)] flex items-center justify-between z-40 transition-transform hover:scale-105 active:scale-95"
        >
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl">
              <ShoppingBag size={24} />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold uppercase tracking-wider text-white/80">Ver pedido</p>
              <p className="font-bold">{totalItems} ítems</p>
            </div>
          </div>
          <span className="text-xl font-black">${getCartTotal().toFixed(2)}</span>
        </button>
      )}

      {/* Modal / Offcanvas del Carrito */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Fondo oscuro para cerrar */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsCartOpen(false)}
          />

          {/* Panel Lateral */}
          <div className="relative w-full sm:w-md max-h-[92vh] sm:max-h-full h-full bg-bg-dark border-l border-white/10 shadow-2xl flex flex-col mt-auto rounded-t-3xl sm:rounded-none transition-transform translate-y-0 sm:translate-x-0">
            {/* Header del modal */}
            <div className="p-5 border-b border-white/5 flex justify-between items-center bg-card-dark">
              <h2 className="text-2xl font-black uppercase text-secondary">Mi Pedido</h2>
              <button onClick={() => setIsCartOpen(false)} className="p-2 bg-white/5 rounded-full hover:bg-primary transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Lista agregada */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-4">
                  <ShoppingBag size={64} className="opacity-20" />
                  <p>Aún no has agregado nada para picar.</p>
                </div>
              ) : (
                items.map(item => (
                  <div key={item.product_id} className="bg-card-dark p-4 rounded-2xl flex items-center justify-between border border-white/5">
                    <div className="flex-1">
                      <h4 className="font-bold text-lg">{item.name}</h4>
                      <p className="text-secondary font-semibold font-mono">${(item.unit_price * item.quantity).toFixed(2)}</p>
                    </div>

                    <div className="flex items-center gap-3 bg-black/50 rounded-full p-1 border border-white/10">
                      <button
                        onClick={() => {
                          if (item.quantity === 1) removeFromCart(item.product_id);
                          else updateQuantity(item.product_id, item.quantity - 1);
                        }}
                        className="p-2 bg-card-dark rounded-full text-white hover:text-primary transition-colors"
                      >
                        {item.quantity === 1 ? <Trash2 size={16} /> : <Minus size={16} />}
                      </button>
                      <span className="font-bold w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                        className="p-2 bg-card-dark rounded-full text-white hover:text-secondary transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer pagar */}
            {items.length > 0 && (
              <div className="p-6 bg-card-dark border-t border-white/5">
                <div className="flex justify-between items-end mb-6 gap-3">
                  <span className="text-gray-400 font-bold uppercase tracking-widest text-sm">Total a pagar</span>
                  <span className="text-3xl sm:text-4xl font-black text-white">${getCartTotal().toFixed(2)}</span>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full bg-primary hover:bg-red-700 text-white font-black uppercase tracking-widest py-5 rounded-2xl shadow-[0_0_20px_rgba(211,30,30,0.4)] transition-all active:scale-95"
                >
                  Enviar a Cocina
                </button>
                <p className="text-center text-xs text-secondary mt-4 uppercase font-bold tracking-widest opacity-80">* El pago se realizará en caja al final *</p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

export default ClientMenu;
