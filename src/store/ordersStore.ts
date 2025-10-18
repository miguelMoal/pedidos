import { create } from 'zustand';
import { Order, OrderUpdate } from '../supabase/actions/orders';
import { getOrderById, updateOrder } from '../supabase/actions/orders';

interface OrderState {
  // Estado
  order: Order | null;
  loading: boolean;
  error: string | null;
  
  // Acciones
  setOrder: (order: Order | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Acciones asíncronas
  loadOrder: (orderId: number) => Promise<void>;
  updateOrderStatus: (orderData: OrderUpdate) => Promise<void>;
  
  // Utilidades
  clearOrder: () => void;
  clearError: () => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  // Estado inicial
  order: null,
  loading: false,
  error: null,

  // Acciones síncronas
  setOrder: (order) => set({ order }),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),

  // Acciones asíncronas
  loadOrder: async (orderId: number) => {
    set({ loading: true, error: null });
    try {
      const order = await getOrderById(orderId);
      set({ order, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar orden';
      set({ error: errorMessage, loading: false });
    }
  },

  updateOrderStatus: async (orderData: OrderUpdate) => {
    const { order } = get();
    if (!order) {
      set({ error: 'No hay orden para actualizar' });
      return;
    }

    set({ loading: true, error: null });
    try {
      const updatedOrder = await updateOrder(order.id, orderData);
      set({ order: updatedOrder, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar orden';
      set({ error: errorMessage, loading: false });
    }
  },

  // Utilidades
  clearOrder: () => set({ order: null }),
  
  clearError: () => set({ error: null }),
}));
