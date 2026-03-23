import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';
import { Edit2, Plus, UtensilsCrossed, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmDialog from '../components/ConfirmDialog';

function MenuManager() {
  const queryClient = useQueryClient();
  const [productToDelete, setProductToDelete] = useState(null);
  
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
  const [formData, setFormData] = useState({ id: null, name: '', price: '', description: '', image_url: '', imageFile: null, category_id: '' });
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [categoryQuery, setCategoryQuery] = useState('');

  const categoryList = categories?.categories || [];
  const normalizedCategoryQuery = categoryQuery.trim().toLowerCase();
  const matchedCategory = categoryList.find(
    (cat) => cat.name.trim().toLowerCase() === normalizedCategoryQuery,
  );

  function getImageSrc(imageUrl) {
    if (!imageUrl) return null;
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl;
    return imageUrl;
  }

  const saveProductMutation = useMutation({
    mutationFn: async (data) => {
      const payload = new FormData();
      payload.append('category_id', String(data.category_id));
      payload.append('name', data.name);
      payload.append('price', String(data.price));
      payload.append('description', data.description || '');
      payload.append('is_available', '1');

      if (data.imageFile) {
        payload.append('image', data.imageFile);
      }

      if (data.id) {
        payload.append('_method', 'PUT');
        return await api.post(`/admin/products/${data.id}`, payload);
      }

      return await api.post(`/admin/products`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-admin'] });
      queryClient.invalidateQueries({ queryKey: ['menu'] });
      setIsFormOpen(false);
      setFormData({ id: null, name: '', price: '', description: '', image_url: '', imageFile: null, category_id: '' });
      setCategoryQuery('');
      toast.success('Platillo guardado. El menú se actualizó correctamente.');
    },
    onError: (error) => {
      toast.error(`No se pudo guardar el platillo. ${error?.response?.data?.message || 'Revisa los datos e inténtalo de nuevo.'}`);
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/admin/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-admin'] });
      queryClient.invalidateQueries({ queryKey: ['menu'] });
      toast.success('Platillo eliminado. Se quitó del menú correctamente.');
    },
    onError: (error) => {
      toast.error(`No se pudo eliminar el platillo. ${error?.response?.data?.message || 'Inténtalo nuevamente.'}`);
    }
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (name) => {
      const response = await api.post('/admin/categories', {
        name,
        is_active: true,
      });

      return response.data;
    },
    onSuccess: (newCategory) => {
      queryClient.setQueryData(['menu-admin'], (currentData) => {
        if (!currentData) return currentData;

        const exists = currentData.categories.some((cat) => cat.id === newCategory.id);
        if (exists) return currentData;

        return {
          ...currentData,
          categories: [...currentData.categories, newCategory],
        };
      });

      setFormData((prev) => ({ ...prev, category_id: newCategory.id }));
      setCategoryQuery(newCategory.name);
      toast.success(`Categoría creada: ${newCategory.name}`);
    },
    onError: (error) => {
      toast.error(`No se pudo crear la categoría. ${error?.response?.data?.message || 'Inténtalo nuevamente.'}`);
    },
  });

  const handleEdit = (product) => {
    setFormData({ ...product, category_id: product.category_id, imageFile: null });
    setCategoryQuery(product.category?.name || '');
    setIsFormOpen(true);
  };

  const handleDelete = (id) => {
    setProductToDelete(id);
  };

  const confirmDelete = () => {
    if (!productToDelete) return;
    deleteProductMutation.mutate(productToDelete, {
      onSettled: () => {
        setProductToDelete(null);
      },
    });
  };

  const handleSave = (e) => {
    e.preventDefault();

    if (!formData.category_id) {
      toast.error('Selecciona o crea una categoría válida.');
      return;
    }

    saveProductMutation.mutate(formData);
  };

  const handleCategoryInputChange = (value) => {
    setCategoryQuery(value);

    const exactMatch = categoryList.find(
      (cat) => cat.name.trim().toLowerCase() === value.trim().toLowerCase(),
    );

    setFormData((prev) => ({
      ...prev,
      category_id: exactMatch ? exactMatch.id : '',
    }));
  };

  const handleCreateCategory = () => {
    const name = categoryQuery.trim();
    if (!name) return;
    createCategoryMutation.mutate(name);
  };

  React.useEffect(() => {
    if (formData.imageFile) {
      const objectUrl = URL.createObjectURL(formData.imageFile);
      setImagePreviewUrl(objectUrl);

      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    }

    setImagePreviewUrl(getImageSrc(formData.image_url) || '');
  }, [formData.imageFile, formData.image_url]);

  if (isLoading) return <div className="h-screen bg-bg-dark text-white flex items-center justify-center px-4 text-center">Cargando menú...</div>;

  return (
    <div className="min-h-screen bg-bg-dark text-white p-4 sm:p-6 font-sans">
      <header className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase flex items-center gap-3 text-secondary">
            <UtensilsCrossed size={30} /> Editor del Menú
          </h1>
          <p className="text-gray-400 mt-2 font-bold tracking-wider text-xs sm:text-sm uppercase">Administra los platillos y precios de tu restaurante.</p>
        </div>
        <button 
          onClick={() => {
            const defaultCategory = categoryList[0];
            setFormData({ id: null, name: '', price: '', description: '', image_url: '', imageFile: null, category_id: defaultCategory?.id || '' });
            setCategoryQuery(defaultCategory?.name || '');
            setIsFormOpen(true);
          }}
          className="bg-primary hover:bg-red-700 text-white font-bold py-3 px-4 sm:px-6 rounded-xl flex items-center justify-center gap-2 transition-colors uppercase tracking-widest active:scale-95 w-full sm:w-auto"
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
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  list="category-options"
                  value={categoryQuery}
                  onChange={(e) => handleCategoryInputChange(e.target.value)}
                  className="w-full bg-bg-dark text-white border border-white/10 rounded-xl p-3 focus:outline-none focus:border-secondary"
                  placeholder="Busca una categoría o escribe una nueva"
                  required
                />
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  disabled={!categoryQuery.trim() || !!matchedCategory || createCategoryMutation.isPending}
                  className="btn-hover rounded-xl border border-white/10 px-4 py-3 font-bold text-white hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createCategoryMutation.isPending ? 'Creando...' : 'Agregar'}
                </button>
              </div>
              <datalist id="category-options">
                {categoryList.map((cat) => (
                  <option key={cat.id} value={cat.name} />
                ))}
              </datalist>
              <p className="text-xs text-gray-400 mt-2">
                {matchedCategory
                  ? `Seleccionada: ${matchedCategory.name}`
                  : 'Si no existe, escribe el nombre y presiona Agregar.'}
              </p>
            </div>
            <div>
              <label className="block text-gray-400 text-sm font-bold mb-2">Imagen del platillo</label>
              <input
                type="file"
                accept="image/*"
                onChange={e => setFormData({ ...formData, imageFile: e.target.files?.[0] || null })}
                className="w-full bg-bg-dark text-white border border-white/10 rounded-xl p-3 focus:outline-none focus:border-secondary"
              />
              {(formData.imageFile || formData.image_url) && (
                <p className="text-xs text-gray-400 mt-2">
                  {formData.imageFile ? `Archivo seleccionado: ${formData.imageFile.name}` : 'Se conservará la imagen actual si no eliges un archivo nuevo.'}
                </p>
              )}
              {imagePreviewUrl && (
                <div className="mt-3">
                  <p className="text-xs text-gray-400 mb-2">Vista previa</p>
                  <img
                    src={imagePreviewUrl}
                    alt="Vista previa de imagen"
                    className="w-28 h-28 object-cover rounded-xl border border-white/10"
                  />
                </div>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-gray-400 text-sm font-bold mb-2">Descripción</label>
              <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-bg-dark text-white border border-white/10 rounded-xl p-3 focus:outline-none focus:border-secondary" placeholder="Ingredientes del platillo..." />
            </div>
            
            <div className="md:col-span-2 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-4 border-t border-white/10 pt-4">
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

      {/* Vista móvil: cards */}
      <div className="md:hidden space-y-3">
        {categories?.products.map(product => (
          <article key={product.id} className="bg-card-dark border border-white/10 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              {getImageSrc(product.image_url) ? (
                <img src={getImageSrc(product.image_url)} className="w-14 h-14 rounded-lg object-cover border border-white/10" alt={product.name}/>
              ) : (
                <div className="w-14 h-14 rounded-lg bg-gray-800 border border-white/10 flex items-center justify-center">
                  <UtensilsCrossed size={20} className="text-gray-500"/>
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-base uppercase tracking-wide truncate">{product.name}</h4>
                <p className="text-xs text-gray-400 mt-1 line-clamp-2">{product.description}</p>
                <p className="text-xs text-gray-400 mt-2 uppercase tracking-wider">{product.category?.name || 'Snack'}</p>
              </div>
              <p className="text-secondary font-black text-lg">${product.price}</p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button onClick={() => handleEdit(product)} className="p-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-white shadow-md flex items-center justify-center gap-2">
                <Edit2 size={16} /> Editar
              </button>
              <button onClick={() => handleDelete(product.id)} className="p-2 bg-red-600 hover:bg-red-500 rounded-xl text-white shadow-md flex items-center justify-center gap-2">
                <Trash2 size={16} /> Eliminar
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* Listado de Platillos estilo tabla moderna */}
      <div className="hidden md:block bg-card-dark border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
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
                  {getImageSrc(product.image_url) ? (
                    <img src={getImageSrc(product.image_url)} className="w-12 h-12 rounded-lg object-cover border border-white/10" alt={product.name}/>
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

      <ConfirmDialog
        open={Boolean(productToDelete)}
        title="Eliminar platillo"
        message="Esta acción eliminará el platillo del menú. ¿Deseas continuar?"
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        onCancel={() => setProductToDelete(null)}
        onConfirm={confirmDelete}
        loading={deleteProductMutation.isPending}
      />

    </div>
  );
}

export default MenuManager;
