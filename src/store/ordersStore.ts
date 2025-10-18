import { create } from 'zustand';
import { Order, OrderUpdate } from '../supabase/actions/orders';
import { getOrderById, getOrderWithItems, updateOrder, updateItemQuantity, removeItemFromOrder } from '../supabase/actions/orders';

// Tipo para los productos de la orden
export type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  itemOrderId?: number; // ID del item_order para actualizaciones
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
  updateItemQuantityInOrder: (itemId: string, quantity: number) => Promise<void>;
  removeItemFromOrder: (itemId: string) => Promise<void>;
  
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
        quantity: item.quantity || 1, // Usar la cantidad de la base de datos
        image: item.products.image_url,
        itemOrderId: item.id // ID del item_order para actualizaciones
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

  updateItemQuantityInOrder: async (itemId: string, quantity: number) => {
    const { orderItems } = get();
    const item = orderItems.find(item => item.id === itemId);
    
    if (!item || !item.itemOrderId) {
      set({ error: 'Item no encontrado o sin ID de orden' });
      return;
    }

    set({ loading: true, error: null });
    try {
      await updateItemQuantity(item.itemOrderId, quantity);
      
      // Actualizar el estado local
      const updatedItems = orderItems.map(orderItem => 
        orderItem.id === itemId ? { ...orderItem, quantity } : orderItem
      );
      
      set({ orderItems: updatedItems, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar cantidad';
      set({ error: errorMessage, loading: false });
    }
  },

  removeItemFromOrder: async (itemId: string) => {
    const { orderItems } = get();
    const item = orderItems.find(item => item.id === itemId);
    
    if (!item || !item.itemOrderId) {
      set({ error: 'Item no encontrado o sin ID de orden' });
      return;
    }

    set({ loading: true, error: null });
    try {
      await removeItemFromOrder(item.itemOrderId);
      
      // Remover del estado local
      const updatedItems = orderItems.filter(orderItem => orderItem.id !== itemId);
      
      set({ orderItems: updatedItems, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al eliminar item';
      set({ error: errorMessage, loading: false });
    }
  },

  // Utilidades
  clearOrder: () => set({ order: null, orderItems: [] }),
  
  clearError: () => set({ error: null }),
}));
