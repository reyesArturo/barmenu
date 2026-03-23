import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, Printer } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmDialog from '../components/ConfirmDialog';

function QRManager() {
  const queryClient = useQueryClient();
  const [count, setCount] = useState(1);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  const { data: tables, isLoading } = useQuery({
    queryKey: ['tables'],
    queryFn: async () => {
      const res = await api.get('/admin/tables');
      return res.data;
    }
  });

  const generateTablesMutation = useMutation({
    mutationFn: async (qty) => {
      const res = await api.post('/admin/tables/generate', { count: qty });
      return res.data;
    },
    onSuccess: async (_data, qty) => {
      await queryClient.invalidateQueries({ queryKey: ['tables'] });
      await queryClient.refetchQueries({ queryKey: ['tables'], type: 'active' });
      toast.success(`QRs creados. Se generaron ${qty} mesa(s) nuevas.`);
    }
  });

  const resetTablesMutation = useMutation({
    mutationFn: async (qty) => {
      const res = await api.post('/admin/tables/reset', { count: qty });
      return res.data;
    },
    onSuccess: async (_data, qty) => {
      await queryClient.invalidateQueries({ queryKey: ['tables'] });
      await queryClient.refetchQueries({ queryKey: ['tables'], type: 'active' });
      toast.success(`Mesas reiniciadas. Se recrearon ${qty} mesa(s) desde Mesa 1.`);
    }
  });

  const printQRs = () => {
    window.print();
  };

  const handleGenerate = async () => {
    const qty = Number(count);
    if (!Number.isInteger(qty) || qty < 1) {
      toast.error('Cantidad inválida. Ingresa una cantidad válida mayor a 0.');
      return;
    }

    try {
      await generateTablesMutation.mutateAsync(qty);
    } catch (error) {
      const message = error?.response?.data?.message || 'No se pudieron crear los QRs';
      toast.error(`No se pudieron crear los QRs. ${message}`);
    }
  };

  const handleResetAndGenerate = async () => {
    const qty = Number(count);
    if (!Number.isInteger(qty) || qty < 1) {
      toast.error('Cantidad inválida. Ingresa una cantidad válida mayor a 0.');
      return;
    }

    setIsResetDialogOpen(true);
  };

  const confirmResetAndGenerate = async () => {
    const qty = Number(count);
    if (!Number.isInteger(qty) || qty < 1) {
      toast.error('Cantidad inválida. Ingresa una cantidad válida mayor a 0.');
      setIsResetDialogOpen(false);
      return;
    }

    try {
      await resetTablesMutation.mutateAsync(qty);
      setCount(1);
      setIsResetDialogOpen(false);
    } catch (error) {
      const message = error?.response?.data?.message || 'No se pudieron reiniciar las mesas';
      toast.error(`No se pudieron reiniciar las mesas. ${message}`);
    }
  };

  if (isLoading) return <div className="h-screen bg-bg-dark text-white flex items-center justify-center px-4 text-center">Cargando las mesas...</div>;

  const normalizeBaseUrl = (rawUrl) => {
    if (!rawUrl) return null;

    try {
      const parsed = new URL(rawUrl);
      const normalizedPath = parsed.pathname
        .replace(/\/cliente\/?$/i, '')
        .replace(/\/$/, '');

      return `${parsed.origin}${normalizedPath}`;
    } catch {
      return null;
    }
  };

  // URL base para QR:
  // - En desarrollo, prioriza VITE_APP_URL para poder escanear desde celular.
  // - Si no existe, usa el origen actual (util para pruebas en misma maquina).
  const baseUrl = (() => {
    const envBaseUrl = normalizeBaseUrl(import.meta.env.VITE_APP_URL?.trim());

    if (import.meta.env.DEV) {
      if (envBaseUrl) {
        return envBaseUrl;
      }

      return window.location.origin;
    }

    return envBaseUrl || window.location.origin;
  })();

  return (
    <div className="min-h-screen bg-bg-dark text-white p-4 sm:p-6 font-sans">
      <header className="mb-8 flex flex-col xl:flex-row xl:justify-between xl:items-center gap-4 border-b border-white/10 pb-4 print:hidden">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase flex items-center gap-3">
            <QrCode size={30} /> Generador de Menús QR
          </h1>
          <p className="text-gray-400 mt-2 text-sm sm:text-base">Imprímelos y colócalos en las mesas. Al escanearlos, el cliente tendrá la mesa asignada.</p>
          <p className="text-xs text-gray-500 mt-1">Mesas actuales: {tables?.length ?? 0}</p>
          <p className="text-xs text-gray-500 mt-1 break-all">Base de QR: {baseUrl}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:flex xl:flex-wrap items-stretch xl:items-center w-full xl:w-auto gap-3">
          <div className="flex items-center justify-between gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 sm:col-span-2 xl:col-span-1">
            <label htmlFor="qr-count" className="text-xs uppercase tracking-widest text-gray-300 font-bold">
              Cantidad de mesas
            </label>
            <input
              id="qr-count"
              type="number"
              min="1"
              value={count}
              onChange={(e) => setCount(e.target.value)}
              className="w-24 bg-black/30 border border-white/15 rounded-lg px-2 py-1 text-white"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={generateTablesMutation.isPending}
            className="btn-hover on-warm bg-orange-500 hover:bg-orange-400 disabled:bg-gray-600 font-bold py-3 px-5 rounded-xl transition-colors w-full"
          >
            {generateTablesMutation.isPending ? 'Creando...' : 'Crear QRs'}
          </button>

          <button
            onClick={handleResetAndGenerate}
            disabled={resetTablesMutation.isPending || generateTablesMutation.isPending}
            className="btn-hover on-accent bg-red-700 hover:bg-red-600 disabled:bg-gray-600 font-bold py-3 px-6 rounded-xl transition-colors w-full"
          >
            {resetTablesMutation.isPending ? 'Reiniciando...' : 'Reiniciar desde Mesa 1'}
          </button>

          <button
            onClick={printQRs}
            className="btn-hover bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors w-full sm:col-span-2 xl:col-span-1"
          >
            <Printer size={20} /> Imprimir existentes
          </button>
        </div>
      </header>

      {/* Grid para imprimir */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {tables?.map(table => {
          const tableUrl = `${baseUrl}/cliente/${table.qr_token}`;
          
          return (
            <div key={table.id} className="bg-white text-black p-8 rounded-3xl flex flex-col items-center shadow-md border-4 border-primary/20 break-inside-avoid">
               <h2 className="text-4xl font-black italic tracking-tighter mb-6 text-primary">
                  CH<span className="text-orange-500"> V</span>
               </h2>
               
               <div className="p-4 border-2 border-dashed border-gray-300 rounded-xl bg-white mb-6">
                 <QRCodeSVG value={tableUrl} size={180} />
               </div>
               
               <h3 className="text-3xl font-black uppercase tracking-widest text-gray-800">{table.number}</h3>
               <p className="text-sm font-bold text-gray-500 uppercase mt-2 text-center">Escanea para pedir tu deliciosa comida</p>

               {/* Clickable link para que el usuario no dependa del celular en pruebas locales */}
               <a href={tableUrl} target="_blank" rel="noreferrer" className="mt-4 text-xs font-bold text-primary underline break-all text-center">
                  URL Directa (Click para probar)
               </a>
            </div>
          );
        })}
      </div>

      <ConfirmDialog
        open={isResetDialogOpen}
        title="Reiniciar mesas"
        message={`Se eliminarán las mesas actuales y se crearán ${Number(count) || 1} desde Mesa 1. ¿Deseas continuar?`}
        confirmText="Sí, reiniciar"
        cancelText="Cancelar"
        onCancel={() => setIsResetDialogOpen(false)}
        onConfirm={confirmResetAndGenerate}
        loading={resetTablesMutation.isPending}
      />

    </div>
  );
}

export default QRManager;
