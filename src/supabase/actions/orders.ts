import { supabase } from '../initSupabase';
import { Tables, TablesInsert, TablesUpdate } from '../database.types';

// Tipos para las órdenes
export type Order = Tables<'orders'>;
export type OrderInsert = TablesInsert<'orders'>;
export type OrderUpdate = TablesUpdate<'orders'>;

// Obtener órdenes por teléfono de usuario
export const getOrdersByUserPhone = async (userPhone: string): Promise<Order[]> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_phone', userPhone)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error al obtener órdenes:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error en getOrdersByUserPhone:', error);
    throw error;
  }
};

// Obtener una orden por ID
export const getOrderById = async (orderId: number): Promise<Order | null> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error) {
      console.error('Error al obtener orden por ID:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error en getOrderById:', error);
    throw error;
  }
};

// Obtener una orden con sus productos relacionados
export const getOrderWithItems = async (orderId: number) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        item_order (
          id,
          product_id,
          quantity,
          products (
            id,
            name,
            price,
            image_url,
            business
          )
        )
      `)
      .eq('id', orderId)
      .single();

    if (error) {
      console.error('Error al obtener orden con productos:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error en getOrderWithItems:', error);
    throw error;
  }
};

// Actualizar una orden
export const updateOrder = async (orderId: number, orderData: OrderUpdate): Promise<Order> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update(orderData)
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      console.error('Error al actualizar orden:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error en updateOrder:', error);
    throw error;
  }
};

// Eliminar una orden
export const deleteOrder = async (orderId: number): Promise<void> => {
  try {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId);

    if (error) {
      console.error('Error al eliminar orden:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error en deleteOrder:', error);
    throw error;
  }
};

// Obtener órdenes por estado
export const getOrdersByStatus = async (status: Order['status']): Promise<Order[]> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error al obtener órdenes por estado:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error en getOrdersByStatus:', error);
    throw error;
  }
};

// Actualizar cantidad de un item en la orden
export const updateItemQuantity = async (itemId: number, quantity: number) => {
  try {
    const { data, error } = await supabase
      .from('item_order')
      .update({ quantity })
      .eq('id', itemId)
      .select()
      .single();

    if (error) {
      console.error('Error al actualizar cantidad del item:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error en updateItemQuantity:', error);
    throw error;
  }
};

// Eliminar un item de la orden
export const removeItemFromOrder = async (itemId: number) => {
  try {
    const { error } = await supabase
      .from('item_order')
      .delete()
      .eq('id', itemId);

    if (error) {
      console.error('Error al eliminar item de la orden:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error en removeItemFromOrder:', error);
    throw error;
  }
};
