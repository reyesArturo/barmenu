import { create } from 'zustand';

export const useCartStore = create((set) => ({
    items: [],
    tableId: null, // Ahora iniciará nulo hasta escanear el QR
    notes: '',

    setTableId: (id) => set({ tableId: id }),

    addToCart: (product) => set((state) => {
        const existingItem = state.items.find(item => item.product_id === product.id);
        
        if (existingItem) {
            return {
                items: state.items.map(item => 
                    item.product_id === product.id 
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
                )
            };
        }

        return {
            items: [...state.items, { 
                product_id: product.id, 
                name: product.name, 
                unit_price: product.price, 
                quantity: 1,
                notes: ''
            }]
        };
    }),

    removeFromCart: (productId) => set((state) => ({
        items: state.items.filter(item => item.product_id !== productId)
    })),

    updateQuantity: (productId, quantity) => set((state) => ({
        items: state.items.map(item => 
            item.product_id === productId ? { ...item, quantity } : item
        )
    })),

    clearCart: () => set({ items: [], notes: '' }),

    getCartTotal: () => {
        return useCartStore.getState().items.reduce((total, item) => {
            return total + (item.unit_price * item.quantity);
        }, 0);
    }
}));
