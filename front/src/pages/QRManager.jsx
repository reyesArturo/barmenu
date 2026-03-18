import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/axios';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, Printer } from 'lucide-react';

function QRManager() {
  const { data: tables, isLoading } = useQuery({
    queryKey: ['tables'],
    queryFn: async () => {
      const res = await api.get('/admin/tables');
      return res.data;
    }
  });

  const printQRs = () => {
    window.print();
  };

  if (isLoading) return <div className="h-screen bg-bg-dark text-white flex items-center justify-center">Cargando las mesas...</div>;

  // URL base dinámica dependiendo de dónde corra el frontend.
  const baseUrl = window.location.origin;

  return (
    <div className="min-h-screen bg-bg-dark text-white p-6 font-sans">
      <header className="mb-8 flex justify-between items-center border-b border-white/10 pb-4 print:hidden">
        <div>
          <h1 className="text-3xl font-black uppercase flex items-center gap-3">
            <QrCode size={30} /> Generador de Menús QR
          </h1>
          <p className="text-gray-400 mt-2">Imprímelos y colócalos en las mesas. Al escanearlos, el cliente tendrá la mesa asignada.</p>
        </div>
        <button 
          onClick={printQRs}
          className="bg-primary hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-colors"
        >
          <Printer size={20} /> Imprimir QRs
        </button>
      </header>

      {/* Grid para imprimir */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {tables?.map(table => {
          const tableUrl = `${baseUrl}/?token=${table.qr_token}`;
          
          return (
            <div key={table.id} className="bg-white text-black p-8 rounded-3xl flex flex-col items-center shadow-md border-4 border-primary/20 break-inside-avoid">
               <h2 className="text-4xl font-black italic tracking-tighter mb-6 text-primary">
                  CH<span className="text-orange-500"> V</span>
               </h2>
               
               <div className="p-4 border-2 border-dashed border-gray-300 rounded-xl bg-white mb-6">
                 <QRCodeSVG value={tableUrl} size={180} />
               </div>
               
               <h3 className="text-3xl font-black uppercase tracking-widest text-gray-800">Mesa {table.id}</h3>
               <p className="text-sm font-bold text-gray-500 uppercase mt-2 text-center">Escanea para pedir tu deliciosa comida</p>

               {/* Clickable link para que el usuario no dependa del celular en pruebas locales */}
               <a href={tableUrl} target="_blank" rel="noreferrer" className="mt-4 text-xs font-bold text-primary underline break-all text-center">
                  URL Directa (Click para probar)
               </a>
            </div>
          );
        })}
      </div>

    </div>
  );
}

export default QRManager;
