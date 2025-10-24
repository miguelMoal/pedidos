import React, { useState, useEffect } from 'react';
import { OrderItem } from '../App';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ArrowLeft, CreditCard, Building2, Lock, CheckCircle2, CheckCircle, Car, Building } from 'lucide-react';
import { toast } from 'sonner';
import { useOrderStore } from '../store/ordersStore';

// Lista de palabras para código de verificación
const VERIFICATION_WORDS = [
  'SOL', 'LUNA', 'MAR', 'CIELO', 'TIERRA', 'FUEGO', 'AGUA', 'AIRE', 'ARBOL', 'FLOR',
  'GATO', 'PERRO', 'AVE', 'PEZ', 'OSO', 'LEON', 'TIGRE', 'LOBO', 'ZEBRA', 'ELEFANTE',
  'CASA', 'PUERTA', 'VENTANA', 'MESA', 'SILLA', 'LIBRO', 'LAPIZ', 'PAPEL', 'BOLSA', 'MALETA',
  'AUTO', 'BICI', 'TREN', 'AVION', 'BARCO', 'MOTO', 'BUS', 'TAXI', 'CAMION', 'TRUCK',
  'ROJO', 'AZUL', 'VERDE', 'AMARILLO', 'NEGRO', 'BLANCO', 'GRIS', 'MORADO', 'ROSA', 'NARANJA'
];

// Función para generar código de verificación
const generateVerificationCode = (): string => {
  const randomIndex = Math.floor(Math.random() * VERIFICATION_WORDS.length);
  return VERIFICATION_WORDS[randomIndex];
};

import { validateCoupon as validateCouponSupabase, getAllCoupons, getCouponById } from '../supabase/actions/coupons';
import { insertItemBooth, insertItemGubernamental, updateOrder, getItemBoothByOrderId, getItemGubernamentalByOrderId } from '../supabase/actions/orders';

type PaymentProps = {
  orderItems: OrderItem[];
  total: number;
  onPaymentComplete: (method: 'card' | 'transfer') => void;
  onBack: () => void;
  onNavigateToTracking?: () => void;
};

export default function Payment({
  orderItems,
  total,
  onPaymentComplete,
  onBack,
  onNavigateToTracking
}: PaymentProps) {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'transfer'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Store de órdenes
  const { order, updateOrderStatus, loadOrderWithItems, updateCouponAppliedStatus } = useOrderStore();
  
  // Card fields
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  
  // Coupon fields
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  
  // Phone fields
  const [userPhone, setUserPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [hasExistingPhone, setHasExistingPhone] = useState(false);
  
  // Delivery type fields
  const [deliveryType, setDeliveryType] = useState<'CASETA' | 'GUBERNAMENTAL' | null>(null);
  
  // Caseta fields
  const [carModel, setCarModel] = useState('');
  const [plates, setPlates] = useState('');
  
  // Gubernamental fields
  const [building, setBuilding] = useState('');
  const [floor, setFloor] = useState('');
  const [address, setAddress] = useState('');
  
  // Verificar si la orden ya está pagada (cualquier estado diferente de INIT)
  const isPaid = order?.status && order.status !== 'INIT';
  
  // Obtener el precio de envío desde Supabase
  const shippingCostFromDB = order?.send_price?.price || 0;
  const finalShippingCost = shippingCostFromDB > 0 ? shippingCostFromDB : 0;
  
  // Calcular el subtotal real desde los items
  const calculateSubtotal = () => {
    return orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };
  
  const subtotal = calculateSubtotal();

  // Verificar si la orden ya tiene un cupón aplicado
  useEffect(() => {
    const loadExistingCoupon = async () => {
      if (order?.coupon_applied && typeof order.coupon_applied === 'number') {
        console.log('La orden ya tiene un cupón aplicado con ID:', order.coupon_applied);
        setCouponApplied(true);
        
        // Obtener los datos del cupón por su ID
        try {
          const coupon = await getCouponById(order.coupon_applied);
          if (coupon) {
            setCouponDiscount(coupon.discount);
            setCouponCode(coupon.code);
            console.log('Cupón obtenido:', coupon);
          } else {
            // Si no se puede obtener el cupón, usar valores por defecto
            const defaultDiscount = 5; // $5 por defecto
            setCouponDiscount(defaultDiscount);
            setCouponCode('CUPÓN APLICADO');
            console.log('No se pudo obtener el cupón, usando valores por defecto');
          }
        } catch (error) {
          console.error('Error al obtener cupón por ID:', error);
          // Usar valores por defecto en caso de error
          const defaultDiscount = 5; // $5 por defecto
          setCouponDiscount(defaultDiscount);
          setCouponCode('CUPÓN APLICADO');
        }
      }
    };

    loadExistingCoupon();
  }, [order?.coupon_applied]);

  // Verificar si la orden ya tiene teléfono
  useEffect(() => {
    if (order?.user_phone) {
      setUserPhone(order.user_phone);
      setHasExistingPhone(true);
    } else {
      setHasExistingPhone(false);
    }
  }, [order?.user_phone]);

  // Cargar datos de entrega existentes
  useEffect(() => {
    const loadExistingDeliveryData = async () => {
      if (order?.order_type && order.id) {
        console.log('La orden ya tiene un tipo de entrega:', order.order_type);
        setDeliveryType(order.order_type as 'CASETA' | 'GUBERNAMENTAL');
        
        try {
          if (order.order_type === 'CASETA') {
            console.log('Cargando datos de CASETA para orden:', order.id);
            const boothData = await getItemBoothByOrderId(order.id);
            console.log('Respuesta de getItemBoothByOrderId:', boothData);
            if (boothData) {
              console.log('Estableciendo datos de caseta:', {
                car_model: boothData.car_model,
                plates: boothData.plates
              });
              setCarModel(boothData.car_model || '');
              setPlates(boothData.plates || '');
              console.log('Datos de caseta cargados:', boothData);
            } else {
              console.log('No se encontraron datos de caseta para la orden');
            }
          } else if (order.order_type === 'GUBERNAMENTAL') {
            console.log('Cargando datos de GUBERNAMENTAL para orden:', order.id);
            const gubernamentalData = await getItemGubernamentalByOrderId(order.id);
            console.log('Respuesta de getItemGubernamentalByOrderId:', gubernamentalData);
            if (gubernamentalData) {
              console.log('Estableciendo datos gubernamentales:', {
                building: gubernamentalData.building,
                floor: gubernamentalData.floor,
                address: gubernamentalData.address
              });
              setBuilding(gubernamentalData.building || '');
              setFloor(gubernamentalData.floor || '');
              setAddress((gubernamentalData as any).address || '');
              console.log('Datos gubernamentales cargados:', gubernamentalData);
            } else {
              console.log('No se encontraron datos gubernamentales para la orden');
            }
          }
        } catch (error) {
          console.error('Error al cargar datos de entrega existentes:', error);
        }
      }
    };

    loadExistingDeliveryData();
  }, [order?.order_type, order?.id]);

  // Cargar datos cuando cambie el tipo de entrega
  useEffect(() => {
    const loadDataForDeliveryType = async () => {
      if (deliveryType && order?.id) {
        console.log('Cargando datos para tipo de entrega:', deliveryType);
        
        try {
          if (deliveryType === 'CASETA') {
            console.log('Cargando datos de CASETA para orden:', order.id);
            const boothData = await getItemBoothByOrderId(order.id);
            console.log('Respuesta de getItemBoothByOrderId:', boothData);
            if (boothData) {
              console.log('Estableciendo datos de caseta:', {
                car_model: boothData.car_model,
                plates: boothData.plates
              });
              setCarModel(boothData.car_model || '');
              setPlates(boothData.plates || '');
              console.log('Datos de caseta cargados:', boothData);
            } else {
              console.log('No se encontraron datos de caseta para la orden');
              // Limpiar campos si no hay datos
              setCarModel('');
              setPlates('');
            }
          } else if (deliveryType === 'GUBERNAMENTAL') {
            console.log('Cargando datos de GUBERNAMENTAL para orden:', order.id);
            const gubernamentalData = await getItemGubernamentalByOrderId(order.id);
            console.log('Respuesta de getItemGubernamentalByOrderId:', gubernamentalData);
            if (gubernamentalData) {
              console.log('Estableciendo datos gubernamentales:', {
                building: gubernamentalData.building,
                floor: gubernamentalData.floor,
                address: gubernamentalData.address
              });
              setBuilding(gubernamentalData.building || '');
              setFloor(gubernamentalData.floor || '');
              setAddress((gubernamentalData as any).address || '');
              console.log('Datos gubernamentales cargados:', gubernamentalData);
            } else {
              console.log('No se encontraron datos gubernamentales para la orden');
              // Limpiar campos si no hay datos
              setBuilding('');
              setFloor('');
              setAddress('');
            }
          }
        } catch (error) {
          console.error('Error al cargar datos para tipo de entrega:', error);
        }
      }
    };

    loadDataForDeliveryType();
  }, [deliveryType, order?.id]);

  // Debug: Verificar valores de estados
  useEffect(() => {
    console.log('Estados de entrega actuales:', {
      deliveryType,
      carModel,
      plates,
      building,
      floor,
      address
    });
  }, [deliveryType, carModel, plates, building, floor, address]);

  // Función para aplicar cupón
  const handleApplyCoupon = async () => {
    // Verificar si ya hay un cupón aplicado
    if (couponApplied || (order?.coupon_applied && typeof order.coupon_applied === 'number')) {
      setCouponError('Ya tienes un cupón aplicado');
      toast.error('Cupón no aplicable', {
        description: 'Ya tienes un cupón aplicado en esta orden',
        duration: 3000
      });
      return;
    }

    if (!couponCode.trim()) {
      setCouponError('Ingresa un código de cupón');
      return;
    }

    setCouponError('');
    
    // Debug: listar todos los cupones disponibles
    console.log('Listando todos los cupones disponibles:');
    await getAllCoupons();
    
    const result = await validateCouponSupabase(couponCode.trim());
    console.log('Resultado de validación:', result);
    
    if (result.valid && result.discount !== undefined && result.coupon) {
      setCouponApplied(true);
      setCouponDiscount(result.discount);
      
      // Actualizar el campo cupon_applied con el ID del cupón en la base de datos
      try {
        await updateCouponAppliedStatus(result.coupon.id);
        console.log('Campo cupon_applied actualizado con ID del cupón:', result.coupon.id);
      } catch (error) {
        console.error('Error al actualizar cupon_applied:', error);
        // No mostrar error al usuario ya que el cupón se aplicó correctamente
      }
      
      toast.success('¡Cupón aplicado!', {
        description: `Descuento de $${result.discount.toFixed(2)} aplicado`,
        duration: 3000
      });
    } else {
      const errorMessage = result.error || 'Cupón no válido';
      setCouponError(errorMessage);
      toast.error('Cupón no válido', {
        description: errorMessage,
        duration: 3000
      });
    }
  };

  // Función para remover cupón
  const handleRemoveCoupon = async () => {
    // Si la orden ya tiene cupon_applied como ID desde la base de datos, no permitir remover
    if (order?.coupon_applied && typeof order.coupon_applied === 'number') {
      toast.error('No se puede remover', {
        description: 'Este cupón ya está aplicado en la orden y no se puede remover',
        duration: 3000
      });
      return;
    }

    setCouponApplied(false);
    setCouponDiscount(0);
    setCouponCode('');
    setCouponError('');
    
    // Actualizar el campo cupon_applied a null en la base de datos
    try {
      await updateCouponAppliedStatus(null);
      console.log('Campo cupon_applied actualizado a null en la base de datos');
    } catch (error) {
      console.error('Error al actualizar cupon_applied:', error);
      // No mostrar error al usuario ya que el cupón se removió correctamente
    }
  };

  // Calcular total con descuento
  const calculateTotalWithDiscount = () => {
    const result = Math.max(0, subtotal + finalShippingCost - couponDiscount);
    console.log('Calculando total con descuento:', {
      subtotal,
      finalShippingCost,
      couponDiscount,
      result
    });
    return result;
  };

  // Validar teléfono (solo 10 dígitos)
  const validatePhone = (phoneNumber: string): boolean => {
    const phoneRegex = /^[0-9]{10}$/;
    const cleanPhone = phoneNumber.replace(/\s/g, '');
    return phoneRegex.test(cleanPhone);
  };

  // Manejar cambio de teléfono
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Solo permitir números y limitar a 10 dígitos
    const cleanValue = value.replace(/[^\d]/g, '').slice(0, 10);
    setUserPhone(cleanValue);
    if (phoneError) setPhoneError('');
  };

  // Formatear teléfono con prefijo 521 para Supabase
  const formatPhoneForSupabase = (phone: string): string => {
    const cleanPhone = phone.replace(/\s/g, '');
    return `521${cleanPhone}`;
  };

  // Validar si se puede proceder con el pago
  const canProceedWithPayment = () => {
    // Validar teléfono
    if (!hasExistingPhone && (!userPhone.trim() || !validatePhone(userPhone))) {
      return { canProceed: false, message: 'Por favor ingresa un número de teléfono válido (10 dígitos)' };
    }

    // Validar tipo de entrega
    if (!deliveryType) {
      return { canProceed: false, message: 'Por favor selecciona un tipo de entrega' };
    }

    // Validar campos según el tipo de entrega
    if (deliveryType === 'CASETA') {
      if (!carModel.trim() || !plates.trim()) {
        return { canProceed: false, message: 'Por favor completa todos los datos de caseta (modelo y placas)' };
      }
    } else if (deliveryType === 'GUBERNAMENTAL') {
      if (!building.trim() || !floor.trim() || !address.trim()) {
        return { canProceed: false, message: 'Por favor completa todos los datos gubernamentales (edificio, piso y dirección)' };
      }
    }

    return { canProceed: true, message: '' };
  };

  const handleCardPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar si se puede proceder con el pago
    const validation = canProceedWithPayment();
    if (!validation.canProceed) {
      toast.error('Datos incompletos', {
        description: validation.message,
        duration: 4000
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Generar código de verificación
      const verificationCode = generateVerificationCode();
      // Actualizar estado de la orden a PAGADO en Supabase con código de verificación
      if (order) {
        console.log('Payment - Datos del cupón:', {
          couponApplied,
          couponCode,
          couponDiscount
        });
        
        console.log('Payment - Llamando a updateOrderStatus...');
        const updateData = { 
          status: 'PAYED' as const,
          confirmation_code: verificationCode,
          coupon_applied: couponApplied ? (order.coupon_applied || null) : null,
          order_type: deliveryType,
          ...(hasExistingPhone ? {} : { user_phone: formatPhoneForSupabase(userPhone) })
        };
        console.log('Payment - Datos a enviar a updateOrderStatus:', updateData);
        
        try {
          await updateOrderStatus(updateData);
          console.log('Payment - updateOrderStatus completado exitosamente');
        } catch (error) {
          console.error('Payment - Error en updateOrderStatus:', error);
        }
        
        // Guardar datos de entrega según el tipo seleccionado
        if (deliveryType === 'CASETA' && (carModel || plates)) {
          try {
            await insertItemBooth({
              order_id: order.id,
              car_model: carModel || null,
              plates: plates || null
            });
            console.log('Payment - Datos de caseta guardados exitosamente');
          } catch (error) {
            console.error('Payment - Error al guardar datos de caseta:', error);
          }
        } else if (deliveryType === 'GUBERNAMENTAL' && (building || floor || address)) {
          try {
            await insertItemGubernamental({
              order_id: order.id,
              building: building || null,
              floor: floor || null,
              address: address || null
            } as any);
            console.log('Payment - Datos gubernamentales guardados exitosamente');
          } catch (error) {
            console.error('Payment - Error al guardar datos gubernamentales:', error);
          }
        }
        
        // Recargar la orden para obtener el código actualizado
        console.log('Payment - Recargando orden...');
        await loadOrderWithItems(order.id);
        console.log('Payment - Orden recargada');
      } else {
        console.log('Payment - No hay orden para actualizar');
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
    // Validar si se puede proceder con el pago
    const validation = canProceedWithPayment();
    if (!validation.canProceed) {
      toast.error('Datos incompletos', {
        description: validation.message,
        duration: 4000
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Generar código de verificación
      const verificationCode = generateVerificationCode();
      
      // Actualizar estado de la orden a PAGADO en Supabase con código de verificación
      if (order) {
        console.log('Payment - Datos del cupón (transfer):', {
          couponApplied,
          couponCode,
          couponDiscount
        });
        
        console.log('Payment - Llamando a updateOrderStatus (transfer)...');
        const updateData = { 
          status: 'PAYED' as const,
          confirmation_code: verificationCode,
          coupon_applied: couponApplied ? (order.coupon_applied || null) : null,
          order_type: deliveryType,
          ...(hasExistingPhone ? {} : { user_phone: formatPhoneForSupabase(userPhone) })
        };
        console.log('Payment - Datos a enviar a updateOrderStatus (transfer):', updateData);
        
        try {
          await updateOrderStatus(updateData);
          console.log('Payment - updateOrderStatus completado exitosamente (transfer)');
        } catch (error) {
          console.error('Payment - Error en updateOrderStatus (transfer):', error);
        }
        
        // Guardar datos de entrega según el tipo seleccionado
        if (deliveryType === 'CASETA' && (carModel || plates)) {
          try {
            await insertItemBooth({
              order_id: order.id,
              car_model: carModel || null,
              plates: plates || null
            });
            console.log('Payment - Datos de caseta guardados exitosamente (transfer)');
          } catch (error) {
            console.error('Payment - Error al guardar datos de caseta (transfer):', error);
          }
        } else if (deliveryType === 'GUBERNAMENTAL' && (building || floor || address)) {
          try {
            await insertItemGubernamental({
              order_id: order.id,
              building: building || null,
              floor: floor || null,
              address: address || null
            } as any);
            console.log('Payment - Datos gubernamentales guardados exitosamente (transfer)');
          } catch (error) {
            console.error('Payment - Error al guardar datos gubernamentales (transfer):', error);
          }
        }
        
        // Recargar la orden para obtener el código actualizado
        console.log('Payment - Recargando orden (transfer)...');
        await loadOrderWithItems(order.id);
        console.log('Payment - Orden recargada (transfer)');
      } else {
        console.log('Payment - No hay orden para actualizar (transfer)');
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
          <div className="bg-white rounded-2xl py-6 px-4 shadow-sm border border-gray-100 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            
            <h2 className="text-xl text-gray-900 mb-2">¡Pago Confirmado!</h2>
            <p className="text-gray-600 mb-6">
              Tu pedido ha sido pagado exitosamente y está siendo preparado.
            </p>
            
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              {order && (
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">ID de orden</span>
                  <span className="text-gray-900 font-mono">#{order.id}</span>
                </div>
              )}
              {order?.confirmation_code && (
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Código de verificación</span>
                  <span className="text-gray-900 font-mono font-bold text-lg">#{order.confirmation_code}</span>
                </div>
              )}
              {couponDiscount > 0 && (
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Descuento ({couponCode})</span>
                  <span className="text-green-600 font-medium">-${couponDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Total pagado</span>
                <span className="text-lg font-semibold text-gray-900">${calculateTotalWithDiscount().toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Estado</span>
                <span className="text-green-600 font-medium">Pagado</span>
              </div>
            </div>
            
            <Button
              onClick={onNavigateToTracking || onBack}
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
            {order && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">ID de orden</span>
                <span className="text-gray-900 font-mono">#{order.id}</span>
              </div>
            )}
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
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Envío</span>
                <span className="text-gray-900">${finalShippingCost.toFixed(2)}</span>
              </div>
              {couponApplied && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Descuento</span>
                  <span>-${couponDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-900 font-semibold border-t border-gray-200 pt-1">
                <span>Total</span>
                <span>${calculateTotalWithDiscount().toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Coupon Section */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h3 className="text-gray-900 mb-3">Código de cupón</h3>
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder={(order?.coupon_applied && typeof order.coupon_applied === 'number') ? "Cupón ya aplicado" : "Ingresa tu código de cupón"}
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                disabled={couponApplied || (order?.coupon_applied && typeof order.coupon_applied === 'number')}
                className="flex-1"
              />
              {!couponApplied && !(order?.coupon_applied && typeof order.coupon_applied === 'number') ? (
                <Button
                  type="button"
                  onClick={handleApplyCoupon}
                  variant="outline"
                  className="px-4"
                >
                  Aplicar
                </Button>
              ) : (
                // Solo mostrar botón "Quitar" si el cupón se aplicó en la sesión actual
                // No mostrar botón si el cupón ya estaba aplicado desde la base de datos
                !(order?.coupon_applied && typeof order.coupon_applied === 'number') && (
                  <Button
                    type="button"
                    onClick={handleRemoveCoupon}
                    variant="outline"
                    className="px-4 text-red-600 hover:text-red-700"
                  >
                    Quitar
                  </Button>
                )
              )}
            </div>
            {couponError && (
              <p className="text-red-500 text-sm">{couponError}</p>
            )}
            {(couponApplied || (order?.coupon_applied && typeof order.coupon_applied === 'number')) && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-green-800 text-sm font-medium">
                  ✓ Cupón aplicado: {(order?.coupon_applied && typeof order.coupon_applied === 'number') ? "Cupón previamente aplicado" : couponCode}
                </p>
                <p className="text-green-700 text-sm">
                  Descuento: -${couponDiscount.toFixed(2)}
                </p>
                {(order?.coupon_applied && typeof order.coupon_applied === 'number') && (
                  <p className="text-green-600 text-xs mt-1">
                    Este cupón ya estaba aplicado en la orden
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Delivery Type Section */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h3 className="text-gray-900 mb-3">Tipo de entrega</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setDeliveryType('CASETA')}
                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center ${
                  deliveryType === 'CASETA'
                    ? 'border-[#046741] bg-[#046741]/5'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <Car className={`w-6 h-6 mb-2 ${
                  deliveryType === 'CASETA' ? 'text-[#046741]' : 'text-gray-400'
                }`} />
                <p className="text-sm text-gray-900">Caseta</p>
                <p className="text-xs text-gray-500 mt-1">Entrega desde el auto</p>
              </button>

              <button
                onClick={() => setDeliveryType('GUBERNAMENTAL')}
                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center ${
                  deliveryType === 'GUBERNAMENTAL'
                    ? 'border-[#046741] bg-[#046741]/5'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <Building className={`w-6 h-6 mb-2 ${
                  deliveryType === 'GUBERNAMENTAL' ? 'text-[#046741]' : 'text-gray-400'
                }`} />
                <p className="text-sm text-gray-900">Gubernamental</p>
                <p className="text-xs text-gray-500 mt-1">Entrega a oficina</p>
              </button>
            </div>

            {/* Caseta Form */}
            {deliveryType === 'CASETA' && (
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-gray-900 font-medium">Datos del vehículo</h4>
                  {order?.order_type === 'CASETA' && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      ✓ Datos guardados
                    </span>
                  )}
                </div>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="carModel">Modelo del auto</Label>
                    <Input
                      id="carModel"
                      placeholder="Ej: Toyota Corolla 2020"
                      value={carModel}
                      onChange={(e) => setCarModel(e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="plates">Placas</Label>
                    <Input
                      id="plates"
                      placeholder="Ej: ABC-123"
                      value={plates}
                      onChange={(e) => setPlates(e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Gubernamental Form */}
            {deliveryType === 'GUBERNAMENTAL' && (
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-gray-900 font-medium">Datos de la oficina</h4>
                  {order?.order_type === 'GUBERNAMENTAL' && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      ✓ Datos guardados
                    </span>
                  )}
                </div>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="building">Edificio</Label>
                    <Input
                      id="building"
                      placeholder="Ej: Edificio Principal"
                      value={building}
                      onChange={(e) => setBuilding(e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="floor">Piso</Label>
                    <Input
                      id="floor"
                      placeholder="Ej: 3er piso, Oficina 301"
                      value={floor}
                      onChange={(e) => setFloor(e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Dirección</Label>
                    <Input
                      id="address"
                      placeholder="Ej: Av. Principal 123, Col. Centro"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Phone Section - Solo mostrar si no hay teléfono existente */}
        {!hasExistingPhone && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h3 className="text-gray-900 mb-3">Número de teléfono</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                  Teléfono de contacto
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={userPhone}
                  onChange={handlePhoneChange}
                  placeholder="5512345678"
                  className={`mt-1 ${phoneError ? 'border-red-500' : ''}`}
                />
                {phoneError && (
                  <p className="text-red-500 text-sm mt-1">{phoneError}</p>
                )}
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-blue-800 text-sm">
                  📱 Usaremos este número para contactarte sobre tu pedido
                </p>
                <p className="text-blue-700 text-xs mt-1">
                  Ingresa solo los 10 dígitos (ej: 5512345678)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Mostrar teléfono existente si ya hay uno */}
        {hasExistingPhone && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h3 className="text-gray-900 mb-3">Teléfono de contacto</h3>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-green-800 text-sm font-medium">
                ✓ Teléfono registrado: {userPhone}
              </p>
              <p className="text-green-700 text-sm">
                Usaremos este número para contactarte sobre tu pedido
              </p>
            </div>
          </div>
        )}

        {/* Validation Message */}
        {!canProceedWithPayment().canProceed && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">!</span>
              </div>
              <p className="text-yellow-800 text-sm font-medium">
                {canProceedWithPayment().message}
              </p>
            </div>
          </div>
        )}

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
              disabled={isProcessing || !canProceedWithPayment().canProceed}
              className="w-full bg-[#046741] hover:bg-[#035530] text-white h-12 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
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
              disabled={isProcessing || !canProceedWithPayment().canProceed}
              className="w-full bg-[#046741] hover:bg-[#035530] text-white h-12 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
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