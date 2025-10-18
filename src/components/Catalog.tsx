import image_0c45253783cab781642bfb658e32c830b3a9b37f from 'figma:asset/0c45253783cab781642bfb658e32c830b3a9b37f.png';
import image_e7539ee72f215a454e67fef67ab0156d73bdc659 from 'figma:asset/e7539ee72f215a454e67fef67ab0156d73bdc659.png';
import image_040c204648cb4d42ff7316aeba12dbf0e6525bb8 from 'figma:asset/040c204648cb4d42ff7316aeba12dbf0e6525bb8.png';
import image_e979ffd21e9cbe33011b4e4f8f0084181b6b84da from 'figma:asset/e979ffd21e9cbe33011b4e4f8f0084181b6b84da.png';
import image_de6ef150b2d1c46fb48ae9cffb73024268699c26 from 'figma:asset/de6ef150b2d1c46fb48ae9cffb73024268699c26.png';
import image_1fb5a84624f51476c33e1b90912cb44c57d40d1d from 'figma:asset/1fb5a84624f51476c33e1b90912cb44c57d40d1d.png';
import image_10674549e1087c899d3be1c2a86eb79b2c46f6ae from 'figma:asset/10674549e1087c899d3be1c2a86eb79b2c46f6ae.png';
import image_9e507b2c5c9e8ada93fe4d3adfbaa432e2290684 from 'figma:asset/9e507b2c5c9e8ada93fe4d3adfbaa432e2290684.png';
import image_4688925daf76a3361de541d15592f70eaef0be38 from 'figma:asset/4688925daf76a3361de541d15592f70eaef0be38.png';
import image_8e967bc91dda951fa209694cca4300e3cb25ee9f from 'figma:asset/8e967bc91dda951fa209694cca4300e3cb25ee9f.png';
import { useState } from 'react';
import { OrderItem } from '../App';
import { Button } from './ui/button';
import { Check, Plus } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { ImageWithFallback } from './figma/ImageWithFallback';

type CatalogProps = {
  currentOrderItems: OrderItem[];
  addOrderItem: (item: OrderItem) => void;
  onSaveAndReturn: () => void;
  total: number;
};

const catalogProducts = [
  {
    id: '1',
    name: 'Café del día',
    price: 12.99,
    image: image_9e507b2c5c9e8ada93fe4d3adfbaa432e2290684,
    category: 'Cafetería'
  },
  {
    id: '2',
    name: 'Concha de Vainilla',
    price: 8.99,
    image: image_4688925daf76a3361de541d15592f70eaef0be38,
    category: 'Panadería'
  },
  {
    id: '3',
    name: 'Burrito',
    price: 3.99,
    image: image_10674549e1087c899d3be1c2a86eb79b2c46f6ae,
    category: 'Comida'
  },
  {
    id: '4',
    name: 'Donitas Glaseadas',
    price: 14.99,
    image: image_1fb5a84624f51476c33e1b90912cb44c57d40d1d,
    category: 'Postres'
  },
  {
    id: '5',
    name: 'Capuchino + Dona',
    price: 10.99,
    image: image_de6ef150b2d1c46fb48ae9cffb73024268699c26,
    category: 'Combos'
  },
  {
    id: '6',
    name: 'Combo Bien Puesto',
    price: 6.99,
    image: image_e979ffd21e9cbe33011b4e4f8f0084181b6b84da,
    category: 'Combos'
  },
  {
    id: '7',
    name: 'Hot Dog',
    price: 7.99,
    image: image_8e967bc91dda951fa209694cca4300e3cb25ee9f,
    category: 'Snacks'
  },
  {
    id: '8',
    name: 'Botana + Soda',
    price: 5.99,
    image: image_040c204648cb4d42ff7316aeba12dbf0e6525bb8,
    category: 'Combos'
  },
  {
    id: '9',
    name: 'Helado',
    price: 9.99,
    image: image_0c45253783cab781642bfb658e32c830b3a9b37f,
    category: 'Postres'
  },
  {
    id: '10',
    name: 'Soda',
    price: 2.99,
    image: image_e7539ee72f215a454e67fef67ab0156d73bdc659,
    category: 'Bebidas'
  }
];

export default function Catalog({
  currentOrderItems,
  addOrderItem,
  onSaveAndReturn,
  total
}: CatalogProps) {
  const [hasChanges, setHasChanges] = useState(false);

  const handleAddItem = (product: typeof catalogProducts[0]) => {
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
                  <ImageWithFallback
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
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
                    className="w-full bg-[#046741] hover:bg-[#035530] text-white py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm">Agregar</span>
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