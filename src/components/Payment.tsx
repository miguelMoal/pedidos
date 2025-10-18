import React, { useState } from 'react';
import { OrderItem } from '../App';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ArrowLeft, CreditCard, Building2, Lock, CheckCircle2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useOrderStore } from '../store/ordersStore';

type PaymentProps = {
  orderItems: OrderItem[];
  total: number;
  onPaymentComplete: (method: 'card' | 'transfer') => void;
  onBack: () => void;
};

export default function Payment({
  orderItems,
  total,
  onPaymentComplete,
  onBack
}: PaymentProps) {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'transfer'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Store de órdenes
  const { order, updateOrderStatus } = useOrderStore();
  
  // Card fields
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  
  // Verificar si la orden ya está pagada
  const isPaid = order?.status === 'IN_PROGRESS' || order?.status === 'READY' || order?.status === 'DELIVERED';

  const handleCardPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsProcessing(true);
    
    try {
      // Actualizar estado de la orden a PAGADO en Supabase
      if (order) {
        await updateOrderStatus({ status: 'IN_PROGRESS' });
      }
      
      // Simulate payment processing
      setTimeout(() => {
        setIsProcessing(false);
        toast.success('¡Pago exitoso!', {
          description: 'Tu pedido está siendo preparado',
          duration: 3000
        });
        onPaymentComplete('card');
      }, 2000);
    } catch (error) {
      setIsProcessing(false);
      toast.error('Error al procesar el pago', {
        description: 'Intenta de nuevo',
        duration: 3000
      });
    }
  };

  const handleTransferPayment = async () => {
    setIsProcessing(true);
    
    try {
      // Actualizar estado de la orden a PAGADO en Supabase
      if (order) {
        await updateOrderStatus({ status: 'IN_PROGRESS' });
      }
      
      setTimeout(() => {
        setIsProcessing(false);
        toast.success('Comprobante recibido', {
          description: 'Validaremos tu pago en breve',
          duration: 3000
        });
        onPaymentComplete('transfer');
      }, 1500);
    } catch (error) {
      setIsProcessing(false);
      toast.error('Error al procesar el pago', {
        description: 'Intenta de nuevo',
        duration: 3000
      });
    }
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g);
    return chunks ? chunks.join(' ') : cleaned;
  };

  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  // Vista para cuando la orden ya está pagada
  if (isPaid) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8F9FA]">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
            <button
              onClick={onBack}
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <h1 className="text-gray-900">Pago</h1>
          </div>
        </div>

        {/* Payment Confirmed View */}
        <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            
            <h2 className="text-xl text-gray-900 mb-2">¡Pago Confirmado!</h2>
            <p className="text-gray-600 mb-6">
              Tu pedido ha sido pagado exitosamente y está siendo preparado.
            </p>
            
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Total pagado</span>
                <span className="text-lg font-semibold text-gray-900">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Estado</span>
                <span className="text-green-600 font-medium">Pagado</span>
              </div>
            </div>
            
            <Button
              onClick={onBack}
              className="w-full bg-[#046741] hover:bg-[#035530] text-white h-12 rounded-xl"
            >
              Continuar al seguimiento
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-gray-900">Pago</h1>
        </div>
      </div>

      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 space-y-6">
        {/* Order Summary */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h2 className="text-gray-900 mb-3">Resumen del pedido</h2>
          <div className="space-y-2">
            {orderItems.slice(0, 3).map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {item.quantity}x {item.name}
                </span>
                <span className="text-gray-900">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
            {orderItems.length > 3 && (
              <p className="text-sm text-gray-500">
                +{orderItems.length - 3} productos más
              </p>
            )}
            <div className="h-px bg-gray-200 my-2" />
            <div className="flex justify-between">
              <span className="text-gray-900">Total</span>
              <span className="text-gray-900">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="space-y-3">
          <h2 className="text-gray-900">Método de pago</h2>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setPaymentMethod('card')}
              className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center ${
                paymentMethod === 'card'
                  ? 'border-[#046741] bg-[#046741]/5'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <CreditCard className={`w-6 h-6 mb-2 ${
                paymentMethod === 'card' ? 'text-[#046741]' : 'text-gray-400'
              }`} />
              <p className="text-sm text-gray-900">Tarjeta</p>
            </button>

            <button
              onClick={() => setPaymentMethod('transfer')}
              className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center ${
                paymentMethod === 'transfer'
                  ? 'border-[#046741] bg-[#046741]/5'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <Building2 className={`w-6 h-6 mb-2 ${
                paymentMethod === 'transfer' ? 'text-[#046741]' : 'text-gray-400'
              }`} />
              <p className="text-sm text-gray-900">Transferencia</p>
            </button>
          </div>
        </div>

        {/* Card Payment Form */}
        {paymentMethod === 'card' && (
          <form onSubmit={handleCardPayment} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
            <div>
              <Label htmlFor="cardName">Nombre del titular</Label>
              <Input
                id="cardName"
                placeholder="Juan Pérez"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="cardNumber">Número de tarjeta</Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={(e) => {
                  const formatted = formatCardNumber(e.target.value);
                  if (formatted.replace(/\s/g, '').length <= 16) {
                    setCardNumber(formatted);
                  }
                }}
                className="mt-1.5"
                maxLength={19}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="cardExpiry">Fecha exp.</Label>
                <Input
                  id="cardExpiry"
                  placeholder="MM/AA"
                  value={cardExpiry}
                  onChange={(e) => {
                    const formatted = formatExpiry(e.target.value);
                    if (formatted.replace(/\D/g, '').length <= 4) {
                      setCardExpiry(formatted);
                    }
                  }}
                  className="mt-1.5"
                  maxLength={5}
                />
              </div>

              <div>
                <Label htmlFor="cardCvv">CVV</Label>
                <Input
                  id="cardCvv"
                  placeholder="123"
                  type="password"
                  value={cardCvv}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 4) {
                      setCardCvv(value);
                    }
                  }}
                  className="mt-1.5"
                  maxLength={4}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Lock className="w-4 h-4 text-gray-500" />
              <p className="text-xs text-gray-600">
                Tus datos están protegidos con encriptación SSL
              </p>
            </div>

            <Button
              type="submit"
              disabled={isProcessing}
              className="w-full bg-[#046741] hover:bg-[#035530] text-white h-12 rounded-xl"
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Procesando...
                </span>
              ) : (
                'Pagar ahora'
              )}
            </Button>
            
            <p className="text-xs text-gray-500 text-center mt-2">
              Puedes pagar sin completar los datos del formulario
            </p>
          </form>
        )}

        {/* Transfer Payment */}
        {paymentMethod === 'transfer' && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
            <div className="bg-[#046741]/10 rounded-xl p-4">
              <p className="text-sm text-gray-600 mb-2">CLABE interbancaria</p>
              <p className="text-lg text-gray-900 tracking-wide">012 345 678 901 234 567</p>
              <p className="text-sm text-gray-600 mt-2">Banco Nacional</p>
            </div>

            <div className="bg-blue-50 rounded-xl p-4 flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600">ℹ️</span>
              </div>
              <div>
                <p className="text-sm text-gray-900 mb-1">Instrucciones</p>
                <p className="text-sm text-gray-600">
                  Realiza tu transferencia por ${total.toFixed(2)} y presiona el botón cuando hayas completado el pago.
                </p>
              </div>
            </div>

            <Button
              onClick={handleTransferPayment}
              disabled={isProcessing}
              className="w-full bg-[#046741] hover:bg-[#035530] text-white h-12 rounded-xl"
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Enviando...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  He completado el pago
                </span>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}