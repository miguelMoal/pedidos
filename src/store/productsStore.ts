import { create } from 'zustand';
import { Product } from '../supabase/actions/products';
import { getAllProducts, getProductsByBusiness } from '../supabase/actions/products';

// Tipo para los productos del catálogo (compatible con el componente)
export type CatalogProduct = {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
};

interface ProductsState {
  // Estado
  products: Product[];
  loading: boolean;
  error: string | null;
  
  // Acciones
  setProducts: (products: Product[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Acciones asíncronas
  loadAllProducts: () => Promise<void>;
  loadProductsByBusiness: (business: Product['business']) => Promise<void>;
  
  // Utilidades
  getCatalogProducts: () => CatalogProduct[];
  clearProducts: () => void;
  clearError: () => void;
}

export const useProductsStore = create<ProductsState>((set, get) => ({
  // Estado inicial
  products: [],
  loading: false,
  error: null,

  // Acciones síncronas
  setProducts: (products) => set({ products }),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),

  // Acciones asíncronas
  loadAllProducts: async () => {
    set({ loading: true, error: null });
    try {
      const products = await getAllProducts();
      set({ products, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar productos';
      set({ error: errorMessage, loading: false });
    }
  },

  loadProductsByBusiness: async (business: Product['business']) => {
    set({ loading: true, error: null });
    try {
      const products = await getProductsByBusiness(business);
      set({ products, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar productos por negocio';
      set({ error: errorMessage, loading: false });
    }
  },

  // Utilidades
  getCatalogProducts: () => {
    const { products } = get();
    return products.map(product => ({
      id: product.id.toString(),
      name: product.name,
      price: product.price,
      image: product.image_url,
      category: product.business === 'PUESTO' ? 'Puesto' : 'Jaguares'
    }));
  },

  clearProducts: () => set({ products: [] }),
  
  clearError: () => set({ error: null }),
}));
