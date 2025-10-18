import { supabase } from '../initSupabase';
import { Tables, TablesInsert, TablesUpdate } from '../database.types';

// Tipos para los productos
export type Product = Tables<'products'>;
export type ProductInsert = TablesInsert<'products'>;
export type ProductUpdate = TablesUpdate<'products'>;

// Obtener todos los productos
export const getAllProducts = async (): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error al obtener productos:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error en getAllProducts:', error);
    throw error;
  }
};

// Obtener productos por tipo de negocio
export const getProductsByBusiness = async (business: Product['business']): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('business', business)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error al obtener productos por negocio:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error en getProductsByBusiness:', error);
    throw error;
  }
};

// Obtener un producto por ID
export const getProductById = async (productId: number): Promise<Product | null> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (error) {
      console.error('Error al obtener producto por ID:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error en getProductById:', error);
    throw error;
  }
};
