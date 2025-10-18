import React, { useState, useEffect } from 'react';
import { OrderItem } from '../App';
import { Button } from './ui/button';
import { Check, Plus } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useProductsStore, CatalogProduct } from '../store/productsStore';
import { useOrderStore } from '../store/ordersStore';

type CatalogProps = {
  currentOrderItems: OrderItem[];
  addOrderItem: (item: OrderItem) => void;
  onSaveAndReturn: () => void;
  total: number;
};

// Productos mock como fallback
const mockCatalogProducts: CatalogProduct[] = [
  {
    id: '1',
    name: 'Café del día',
    price: 12.99,
    image: 'https://via.placeholder.com/200x200?text=Café',
    category: 'Cafetería'
  },
  {
    id: '2',
    name: 'Concha de Vainilla',
    price: 8.99,
    image: 'https://via.placeholder.com/200x200?text=Concha',
    category: 'Panadería'
  },
  {
    id: '3',
    name: 'Burrito',
    price: 3.99,
    image: 'https://via.placeholder.com/200x200?text=Burrito',
    category: 'Comida'
  }
];

export default function Catalog({
  currentOrderItems,
  addOrderItem,
  onSaveAndReturn,
  total
}: CatalogProps) {
  const [hasChanges, setHasChanges] = useState(false);
  
  // Stores
  const { getCatalogProducts, loadAllProducts, loading: productsLoading } = useProductsStore();
  const { addProductToOrder, order } = useOrderStore();
  
  // Verificar si la orden ya está pagada
  const isPaid = order?.status === 'IN_PROGRESS' || order?.status === 'READY' || order?.status === 'DELIVERED';
  
  // Cargar productos al montar el componente
  useEffect(() => {
    loadAllProducts();
  }, [loadAllProducts]);
  
  // Obtener productos (Supabase o mock)
  const catalogProducts = getCatalogProducts().length > 0 ? getCatalogProducts() : mockCatalogProducts;

  const handleAddItem = async (product: CatalogProduct) => {
    // No permitir agregar productos si la orden ya está pagada
    if (isPaid) {
      toast.error('No se puede modificar', {
        description: 'Este pedido ya ha sido pagado',
        duration: 2000
      });
      return;
    }

    // Si hay una orden activa de Supabase, usar la función del store
    if (order) {
      try {
        await addProductToOrder(product.id, 1);
        setHasChanges(true);
        toast.success(`${product.name} agregado`, {
          description: '✔ Producto añadido al pedido',
          duration: 2000
        });
      } catch (error) {
        toast.error('Error al agregar producto', {
          description: 'Intenta de nuevo',
          duration: 2000
        });
      }
    } else {
      // Para datos mock
      addOrderItem({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.image
      });
      setHasChanges(true);
      toast.success(`${product.name} agregado`, {
        description: '✔ Producto añadido al pedido',
        duration: 2000
      });
    }
  };

  const getItemQuantity = (productId: string) => {
    const item = currentOrderItems.find(i => i.id === productId);
    return item ? item.quantity : 0;
  };

  const handleSaveAndReturn = () => {
    if (hasChanges) {
      toast.success('✔ Cambios guardados', {
        description: 'Tu pedido ha sido actualizado',
        duration: 2000
      });
    }
    onSaveAndReturn();
  };

  // Mostrar loading mientras se cargan los productos
  if (productsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando catálogo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col pb-[200px]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-gray-900 mb-1">Catálogo</h1>
          <p className="text-sm text-gray-600">
            Actualiza lo que necesites y regresa a confirmar tu pedido.
          </p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        <div className="grid grid-cols-2 gap-4">
          {catalogProducts.map((product) => {
            const quantity = getItemQuantity(product.id);
            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="aspect-square bg-gray-100 relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg==';
                    }}
                  />
                  {quantity > 0 && (
                    <div className="absolute top-2 right-2 bg-[#E31525] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">
                      {quantity}
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-xs text-gray-500 mb-1">{product.category}</p>
                  <h3 className="text-sm text-gray-900 mb-1 line-clamp-2">{product.name}</h3>
                  <p className="text-gray-900 mb-3">${product.price.toFixed(2)}</p>
                  <button
                    onClick={() => handleAddItem(product)}
                    disabled={isPaid}
                    className={`w-full py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                      isPaid 
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                        : 'bg-[#046741] hover:bg-[#035530] text-white'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm">{isPaid ? 'Pagado' : 'Agregar'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-inset-bottom">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-600">Total actual</span>
            <span className="text-gray-900">${total.toFixed(2)}</span>
          </div>
          <Button
            onClick={handleSaveAndReturn}
            className="w-full bg-[#046741] hover:bg-[#035530] text-white h-12 rounded-xl"
          >
            Guardar y regresar al resumen →
          </Button>
        </div>
      </div>
    </div>
  );
}