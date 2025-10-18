import { OrderItem } from '../App';
import { Button } from './ui/button';
import { ShoppingBag, Edit, Minus, Plus, Trash2 } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

type OrderConfirmationProps = {
  orderItems: OrderItem[];
  updateOrderItem: (id: string, quantity: number) => void;
  subtotal: number;
  shippingCost: number;
  total: number;
  onEditOrder: () => void;
  onProceedToPayment: () => void;
};

export default function OrderConfirmation({
  orderItems,
  updateOrderItem,
  subtotal,
  shippingCost,
  total,
  onEditOrder,
  onProceedToPayment
}: OrderConfirmationProps) {
  return (
    <div className="min-h-screen flex flex-col pb-[320px]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-gray-900">Revisa tu pedido</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={onEditOrder}
            className="flex items-center gap-1.5"
          >
            <Edit className="w-4 h-4" />
            Editar
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 space-y-4">
        {orderItems.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex gap-4">
              <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                <ImageWithFallback
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-gray-900 mb-1 truncate">{item.name}</h3>
                <p className="text-gray-600">${item.price.toFixed(2)}</p>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => updateOrderItem(item.id, item.quantity - 1)}
                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                  >
                    {item.quantity === 1 ? (
                      <Trash2 className="w-4 h-4 text-red-500" />
                    ) : (
                      <Minus className="w-4 h-4 text-gray-700" />
                    )}
                  </button>
                  <span className="w-8 text-center text-gray-900">{item.quantity}</span>
                  <button
                    onClick={() => updateOrderItem(item.id, item.quantity + 1)}
                    className="w-8 h-8 rounded-full bg-[#046741] flex items-center justify-center hover:bg-[#035530] transition-colors"
                  >
                    <Plus className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-inset-bottom">
        <div className="max-w-2xl mx-auto px-4 py-4">
          {/* Summary */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Envío</span>
              <span>${shippingCost.toFixed(2)}</span>
            </div>
            <div className="h-px bg-gray-200 my-2" />
            <div className="flex justify-between text-gray-900">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Microcopy */}
          <p className="text-sm text-gray-500 mb-4">
            Puedes modificar o agregar más productos antes de pagar.
          </p>

          {/* Actions */}
          <div className="space-y-2">
            <Button
              onClick={onProceedToPayment}
              className="w-full bg-[#046741] hover:bg-[#035530] text-white h-12 rounded-xl"
            >
              Ir a pagar →
            </Button>
            <Button
              onClick={onEditOrder}
              variant="outline"
              className="w-full h-12 rounded-xl flex items-center justify-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Editar pedido
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}