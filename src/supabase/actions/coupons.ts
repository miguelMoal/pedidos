import { supabase } from '../initSupabase';

// Validar un cupón
export const validateCoupon = async (code: string) => {
  try {
    console.log('Validando cupón:', code);
    
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single();

    console.log('Resultado de la consulta:', { data, error });

    if (error) {
      console.error('Error al validar cupón:', error);
      // Si es un error de "no encontrado", dar mensaje específico
      if (error.code === 'PGRST116') {
        return { valid: false, discount: 0, error: 'Cupón no encontrado' };
      }
      return { valid: false, discount: 0, error: 'Error al validar cupón' };
    }

    if (!data) {
      return { valid: false, discount: 0, error: 'Cupón no válido' };
    }

    console.log('Cupón encontrado:', data);

    // Verificar si el cupón ha expirado
    if (data.expires_at) {
      const now = new Date();
      const expiryDate = new Date(data.expires_at);
      
      if (now > expiryDate) {
        return { valid: false, discount: 0, error: 'Cupón expirado' };
      }
    }

    // Verificar si el cupón tiene usos disponibles
    if (data.usage_limit && data.usage_count >= data.usage_limit) {
      return { valid: false, discount: 0, error: 'Cupón agotado' };
    }

    console.log('Cupón válido, descuento:', data.discount_amount);
    console.log('Campos del cupón:', Object.keys(data));

    return {
      valid: true,
      discount: data.discount_amount || 0,
      coupon: data
    };
  } catch (error) {
    console.error('Error en validateCoupon:', error);
    return { valid: false, discount: 0, error: 'Error al validar cupón' };
  }
};

// Listar todos los cupones (para debug)
export const getAllCoupons = async () => {
  try {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error al obtener cupones:', error);
      throw error;
    }

    console.log('Todos los cupones:', data);
    return data;
  } catch (error) {
    console.error('Error en getAllCoupons:', error);
    throw error;
  }
};

// Incrementar el contador de uso de un cupón
export const incrementCouponUsage = async (code: string) => {
  try {
    const { error } = await supabase
      .from('coupons')
      .update({ usage_count: supabase.raw('usage_count + 1') })
      .eq('code', code.toUpperCase());

    if (error) {
      console.error('Error al incrementar uso del cupón:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error en incrementCouponUsage:', error);
    throw error;
  }
};
