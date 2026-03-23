import { create } from 'zustand';

const STORAGE_KEY = 'rb_client_state';

function getStoredClientState() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            return {
                tableId: null,
                tableNumber: null,
                lastOrderId: null,
                lastOrderStatus: null,
                lastOrderUpdatedAt: null,
                lastOrderTableId: null,
            };
        }

        const parsed = JSON.parse(raw);
        return {
            tableId: parsed.tableId ?? null,
            tableNumber: parsed.tableNumber ?? null,
            lastOrderId: parsed.lastOrderId ?? null,
            lastOrderStatus: parsed.lastOrderStatus ?? null,
            lastOrderUpdatedAt: parsed.lastOrderUpdatedAt ?? null,
            lastOrderTableId: parsed.lastOrderTableId ?? null,
        };
    } catch {
        return {
            tableId: null,
            tableNumber: null,
            lastOrderId: null,
            lastOrderStatus: null,
            lastOrderUpdatedAt: null,
            lastOrderTableId: null,
        };
    }
}

function saveClientState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
        tableId: state.tableId,
        tableNumber: state.tableNumber,
        lastOrderId: state.lastOrderId,
        lastOrderStatus: state.lastOrderStatus,
        lastOrderUpdatedAt: state.lastOrderUpdatedAt,
        lastOrderTableId: state.lastOrderTableId,
    }));
}

export const useCartStore = create((set, get) => ({
    items: [],
    ...getStoredClientState(),
    notes: '',
    lastOrderId: getStoredClientState().lastOrderId,
    lastOrderStatus: getStoredClientState().lastOrderStatus,
    lastOrderUpdatedAt: getStoredClientState().lastOrderUpdatedAt,
    lastOrderTableId: getStoredClientState().lastOrderTableId,

    setTableId: (id) => set((state) => {
        const nextState = { ...state, tableId: id };
        saveClientState(nextState);
        return { tableId: id };
    }),
    setTable: (table) => set((state) => {
        const nextState = {
            ...state,
            tableId: table?.id ?? null,
            tableNumber: table?.number ?? null,
        };
        saveClientState(nextState);
        return {
            tableId: table?.id ?? null,
            tableNumber: table?.number ?? null,
        };
    }),
    setLastOrder: (order) => set((state) => {
        const nextState = {
            ...state,
            lastOrderId: order?.id ?? null,
            lastOrderStatus: order?.status ?? null,
            lastOrderUpdatedAt: order?.updated_at ?? null,
            lastOrderTableId: order?.table_id ?? null,
        };
        saveClientState(nextState);
        return {
            lastOrderId: order?.id ?? null,
            lastOrderStatus: order?.status ?? null,
            lastOrderUpdatedAt: order?.updated_at ?? null,
            lastOrderTableId: order?.table_id ?? null,
        };
    }),
    clearLastOrder: () => set((state) => {
        const nextState = {
            ...state,
            lastOrderId: null,
            lastOrderStatus: null,
            lastOrderUpdatedAt: null,
            lastOrderTableId: null,
        };
        saveClientState(nextState);
        return {
            lastOrderId: null,
            lastOrderStatus: null,
            lastOrderUpdatedAt: null,
            lastOrderTableId: null,
        };
    }),

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
