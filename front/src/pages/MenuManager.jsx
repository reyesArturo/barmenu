import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';
import { Edit2, Plus, UtensilsCrossed, Trash2 } from 'lucide-react';

function MenuManager() {
  const queryClient = useQueryClient();
  const [activeCategory, setActiveCategory] = useState(0);
  
  const { data: categories, isLoading } = useQuery({
    queryKey: ['menu-admin'],
    queryFn: async () => {
      // Pedimos todo a admin/products o menu normal, usando el normal para no reescribir tanto, 
      // pero ideally admin tiene otra ruta con productos desactivados. 
      // Usamos client/menu MVP
      const res = await api.get('/admin/categories'); 
      // Need categories and products in raw form. Let's fetch products instead directly
      const prodRes = await api.get('/admin/products');
      return { categories: res.data, products: prodRes.data };
    }
  });

  // State del formulario sencillo (Oculto o Visible)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({ id: null, name: '', price: '', description: '', image_url: '', category_id: '' });

  const saveProductMutation = useMutation({
    mutationFn: async (data) => {
      if(data.id) {
        return await api.put(`/admin/products/${data.id}`, data);
      } else {
        return await api.post(`/admin/products`, data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['menu-admin']);
      setIsFormOpen(false);
      setFormData({ id: null, name: '', price: '', description: '', image_url: '', category_id: '' });
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/admin/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['menu-admin']);
    }
  });

  const handleEdit = (product) => {
    setFormData({ ...product, category_id: product.category_id });
    setIsFormOpen(true);
  };

  const handleDelete = (id) => {
    if(window.confirm('¿Eliminar este platillo del menú?')) {
      deleteProductMutation.mutate(id);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    saveProductMutation.mutate({
      ...formData,
      is_available: true
    });
  };

  if (isLoading) return <div className="h-screen bg-bg-dark text-white flex items-center justify-center">Cargando menú...</div>;

  return (
    <div className="min-h-screen bg-bg-dark text-white p-6 font-sans">
      <header className="mb-8 flex justify-between items-center border-b border-white/10 pb-4">
        <div>
          <h1 className="text-3xl font-black uppercase flex items-center gap-3 text-secondary">
            <UtensilsCrossed size={30} /> Editor del Menú
          </h1>
          <p className="text-gray-400 mt-2 font-bold tracking-wider text-sm uppercase">Administra los platillos y precios de tu restaurante.</p>
        </div>
        <button 
          onClick={() => {
            setFormData({ id: null, name: '', price: '', description: '', image_url: '', category_id: categories?.categories[0]?.id || '' });
            setIsFormOpen(true);
          }}
          className="bg-primary hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-colors uppercase tracking-widest active:scale-95"
        >
          <Plus size={20} /> Nuevo Platillo
        </button>
      </header>

      {isFormOpen && (
        <div className="bg-card-dark border border-white/5 rounded-2xl p-6 mb-8 shadow-2xl">
          <h2 className="text-2xl font-bold uppercase mb-4 text-primary">
            {formData.id ? 'Editar Platillo' : 'Crear Platillo'}
          </h2>
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-sm font-bold mb-2">Nombre del Platillo</label>
              <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-bg-dark text-white border border-white/10 rounded-xl p-3 focus:outline-none focus:border-secondary" placeholder="Taco al pastor" />
            </div>
            <div>
              <label className="block text-gray-400 text-sm font-bold mb-2">Precio ($)</label>
              <input required type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-bg-dark text-white border border-white/10 rounded-xl p-3 focus:outline-none focus:border-secondary" placeholder="25.00" />
            </div>
            <div>
              <label className="block text-gray-400 text-sm font-bold mb-2">Categoría</label>
              <select required value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})} className="w-full bg-bg-dark text-white border border-white/10 rounded-xl p-3 focus:outline-none focus:border-secondary">
                <option value="">Selecciona...</option>
                {categories?.categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-400 text-sm font-bold mb-2">URL Fotografía</label>
              <input value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} className="w-full bg-bg-dark text-white border border-white/10 rounded-xl p-3 focus:outline-none focus:border-secondary" placeholder="https://ejemplo.com/taco.jpg" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-gray-400 text-sm font-bold mb-2">Descripción</label>
              <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-bg-dark text-white border border-white/10 rounded-xl p-3 focus:outline-none focus:border-secondary" placeholder="Ingredientes del platillo..." />
            </div>
            
            <div className="md:col-span-2 flex justify-end gap-3 mt-4 border-t border-white/10 pt-4">
               <button type="button" onClick={() => setIsFormOpen(false)} className="px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 font-bold uppercase text-white transition-colors">
                 Cancelar
               </button>
               <button type="submit" className="px-6 py-3 rounded-xl bg-green-600 hover:bg-green-500 font-bold uppercase tracking-widest text-white transition-colors shadow-[0_0_15px_rgba(22,163,74,0.3)]">
                 Guardar Platillo
               </button>
            </div>
          </form>
        </div>
      )}

      {/* Listado de Platillos estilo tabla moderna */}
      <div className="bg-card-dark border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead className="bg-black/50 text-gray-400">
            <tr>
              <th className="p-5 font-bold uppercase tracking-widest text-sm">Platillo</th>
              <th className="p-5 font-bold uppercase tracking-widest text-sm">Categoría</th>
              <th className="p-5 font-bold uppercase tracking-widest text-sm">Precio</th>
              <th className="p-5 font-bold uppercase tracking-widest text-sm w-32">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categories?.products.map(product => (
              <tr key={product.id} className="border-t border-white/5 hover:bg-white/5 transition-colors group">
                <td className="p-5 flex items-center gap-4">
                  {product.image_url ? (
                    <img src={product.image_url} className="w-12 h-12 rounded-lg object-cover border border-white/10" alt={product.name}/>
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gray-800 border border-white/10 flex items-center justify-center">
                      <UtensilsCrossed size={20} className="text-gray-500"/>
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-lg uppercase tracking-wider">{product.name}</h4>
                    <p className="text-xs text-gray-400 line-clamp-1">{product.description}</p>
                  </div>
                </td>
                <td className="p-5 text-gray-300 font-bold uppercase tracking-widest text-sm">
                  {product.category?.name || 'Snack'}
                </td>
                <td className="p-5 text-secondary font-black text-xl">
                  ${product.price}
                </td>
                <td className="p-5">
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(product)} className="p-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-white shadow-md">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(product.id)} className="p-2 bg-red-600 hover:bg-red-500 rounded-xl text-white shadow-md">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}

export default MenuManager;
