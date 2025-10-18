import { create } from 'zustand';
import { Order, OrderUpdate } from '../supabase/actions/orders';
import { getOrderById, getOrderWithItems, updateOrder } from '../supabase/actions/orders';

// Tipo para los productos de la orden
export type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

interface OrderState {
  // Estado
  order: Order | null;
  orderItems: OrderItem[];
  loading: boolean;
  error: string | null;
  
  // Acciones
  setOrder: (order: Order | null) => void;
  setOrderItems: (items: OrderItem[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Acciones asíncronas
  loadOrder: (orderId: number) => Promise<void>;
  loadOrderWithItems: (orderId: number) => Promise<void>;
  updateOrderStatus: (orderData: OrderUpdate) => Promise<void>;
  
  // Utilidades
  clearOrder: () => void;
  clearError: () => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  // Estado inicial
  order: null,
  orderItems: [],
  loading: false,
  error: null,

  // Acciones síncronas
  setOrder: (order) => set({ order }),
  
  setOrderItems: (orderItems) => set({ orderItems }),
  
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

  loadOrderWithItems: async (orderId: number) => {
    set({ loading: true, error: null });
    try {
      const orderData = await getOrderWithItems(orderId);
      
      // Transformar los datos de Supabase al formato esperado por el componente
      const orderItems: OrderItem[] = orderData.item_order?.map((item: any) => ({
        id: item.product_id.toString(),
        name: item.products.name,
        price: item.products.price,
        quantity: 1, // Por defecto cantidad 1, se puede ajustar según necesidades
        image: item.products.image_url
      })) || [];

      set({ 
        order: {
          id: orderData.id,
          status: orderData.status,
          user_phone: orderData.user_phone,
          created_at: orderData.created_at
        },
        orderItems,
        loading: false 
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar orden con productos';
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
  clearOrder: () => set({ order: null, orderItems: [] }),
  
  clearError: () => set({ error: null }),
}));
