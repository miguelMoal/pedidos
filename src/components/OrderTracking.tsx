import React, { useEffect, useState } from 'react';
import { OrderStatus } from '../App';
import { Database } from '../supabase/database.types';

type DatabaseOrderStatus = Database['public']['Enums']['STATUS_ORDER'];
import { Button } from './ui/button';
import { MapPin, Clock, CheckCircle2, Package, Truck, Phone, MessageCircle, Navigation, User, Store } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useOrderStore } from '../store/ordersStore';

type OrderTrackingProps = {
  orderStatus: OrderStatus;
  paymentMethod: 'card' | 'transfer' | null;
  onViewMap: () => void;
  onStatusUpdate: (status: OrderStatus) => void;
};

export default function OrderTracking({
  orderStatus,
  paymentMethod,
  onViewMap,
  onStatusUpdate
}: OrderTrackingProps) {
  const [progressStep, setProgressStep] = useState(0);
  const [deliveryProgress, setDeliveryProgress] = useState(0);
  const [driverPosition, setDriverPosition] = useState({ x: 20, y: 70 });
  const [eta, setEta] = useState(18);
  
  // Store de órdenes para obtener el código de verificación
  const { order, updateOrderStatus } = useOrderStore();

  // Función para mapear estados de UI a estados de base de datos
  const mapToDatabaseStatus = (uiStatus: OrderStatus): DatabaseOrderStatus => {
    switch (uiStatus) {
      case 'PAYED':
        return 'PAYED';
      case 'IN_PROGRESS':
        return 'IN_PROGRESS';
      case 'READY':
        return 'READY';
      case 'ON_THE_WAY':
        return 'ON_THE_WAY';
      case 'DELIVERED':
        return 'DELIVERED';
      default:
        return 'INIT';
    }
  };

  // Función para actualizar estado en Supabase
  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    try {
      if (order) {
        const dbStatus = mapToDatabaseStatus(newStatus);
        await updateOrderStatus({ status: dbStatus });
        onStatusUpdate(newStatus);
      }
    } catch (error) {
      console.error('Error al actualizar estado:', error);
    }
  };

  // Animate delivery when ON_THE_WAY
  useEffect(() => {
    if (orderStatus === 'ON_THE_WAY') {
      const interval = setInterval(() => {
        setDeliveryProgress((prev) => {
          if (prev >= 100) {
            return 100;
          }
          return prev + 1;
        });

        setDriverPosition((prev) => ({
          x: Math.min(prev.x + 0.6, 80),
          y: Math.max(prev.y - 0.5, 20)
        }));

        setEta((prev) => Math.max(prev - 0.18, 0));
      }, 100);

      return () => clearInterval(interval);
    } else {
      // Reset position when not ON_THE_WAY
      setDeliveryProgress(0);
      setDriverPosition({ x: 20, y: 70 });
      setEta(18);
    }
  }, [orderStatus]);

  const steps = [
    { id: 'PAYED', label: 'Pedido confirmado', icon: CheckCircle2, status: 'PAYED' as OrderStatus },
    { id: 'IN_PROGRESS', label: 'Preparando', icon: Package, status: 'IN_PROGRESS' as OrderStatus },
    { id: 'READY', label: 'Listo para entregar', icon: Package, status: 'READY' as OrderStatus },
    { id: 'ON_THE_WAY', label: 'En camino', icon: Truck, status: 'ON_THE_WAY' as OrderStatus },
    { id: 'DELIVERED', label: 'Entregado', icon: CheckCircle2, status: 'DELIVERED' as OrderStatus }
  ];

  const getCurrentStepIndex = () => {
    if (orderStatus === 'PAYED') return 0;
    if (orderStatus === 'IN_PROGRESS') return 1;
    if (orderStatus === 'READY') return 2;
    if (orderStatus === 'ON_THE_WAY') return 3;
    if (orderStatus === 'DELIVERED') return 4;
    return 0;
  };

  const currentStepIndex = getCurrentStepIndex();

  const getStatusColor = () => {
    if (orderStatus === 'DELIVERED') return '#4CAF50';
    if (orderStatus === 'ON_THE_WAY') return '#046741';
    if (orderStatus === 'READY') return '#FFA500';
    if (orderStatus === 'IN_PROGRESS') return '#FFD54F';
    return '#046741';
  };

  const getStatusText = () => {
    if (orderStatus === 'DELIVERED') return 'Entregado ✓';
    if (orderStatus === 'ON_THE_WAY') return 'En camino';
    if (orderStatus === 'READY') return 'Listo para entregar';
    if (orderStatus === 'IN_PROGRESS') return 'Preparando';
    return 'Pedido confirmado';
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA]">
       {/* Header */}
       <div className="bg-white border-b border-gray-200">
         <div className="max-w-2xl mx-auto px-4 py-4">
           <h1 className="text-gray-900 mb-3">Estado del pedido</h1>
           {/* Información del pedido */}
           <div className="space-y-2">
             {order && (
               <div className="flex justify-between items-center text-sm">
                 <span className="text-gray-600">ID de orden</span>
                 <span className="text-gray-900 font-mono">#{order.id}</span>
               </div>
             )}
             {order?.confirmation_code && (
               <div className="flex justify-between items-center text-sm">
                 <span className="text-gray-600">Código de verificación</span>
                 <span className="text-gray-900 font-mono font-bold">#{order.confirmation_code}</span>
               </div>
             )}
           </div>
         </div>
       </div>

      {/* Status Steps - Clickeable */}
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <p className="text-xs text-gray-400 text-center mb-3">Haz clic en los pasos para cambiar el estado</p>
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                transition={{ duration: 0.5 }}
                className="h-full bg-[#006641]"
              />
            </div>

            {/* Steps */}
            <div className="relative flex justify-between">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index <= currentStepIndex;

                return (
                  <button
                    key={step.id}
                    onClick={() => handleStatusUpdate(step.status)}
                    className="flex flex-col items-center hover:scale-105 transition-transform cursor-pointer"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                        isActive
                          ? 'bg-[#E31525]'
                          : 'bg-gray-200'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                    </motion.div>
                    <p className={`text-xs text-center max-w-[60px] ${
                      isActive ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {step.label}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative overflow-hidden">
        {/* Map Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200">
          {/* Grid */}
          <div className="absolute inset-0 opacity-20">
            <div className="grid grid-cols-6 grid-rows-6 h-full">
              {Array.from({ length: 36 }).map((_, i) => (
                <div key={i} className="border border-gray-400" />
              ))}
            </div>
          </div>

          {/* Streets */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-0 right-0 h-2 bg-gray-300" />
            <div className="absolute top-2/4 left-0 right-0 h-2 bg-gray-300" />
            <div className="absolute top-3/4 left-0 right-0 h-2 bg-gray-300" />
            <div className="absolute left-1/4 top-0 bottom-0 w-2 bg-gray-300" />
            <div className="absolute left-2/4 top-0 bottom-0 w-2 bg-gray-300" />
            <div className="absolute left-3/4 top-0 bottom-0 w-2 bg-gray-300" />
          </div>

          {/* Restaurant/Store Location */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute"
            style={{ left: '20%', top: '70%' }}
          >
            <div className="relative">
              <motion.div
                animate={{ 
                  scale: orderStatus === 'IN_PROGRESS' ? [1, 1.1, 1] : 1 
                }}
                transition={{ repeat: orderStatus === 'IN_PROGRESS' ? Infinity : 0, duration: 2 }}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl ${
                  orderStatus === 'IN_PROGRESS' 
                    ? 'bg-[#FFD54F]' 
                    : 'bg-[#046741]'
                }`}
              >
                <Store className="w-7 h-7 text-white" />
              </motion.div>
              {orderStatus === 'IN_PROGRESS' && (
                <motion.div
                  animate={{ scale: [1, 1.5, 1], opacity: [0.8, 0, 0.8] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute inset-0 w-14 h-14 rounded-full bg-[#FFD54F]/30"
                />
              )}
              <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white px-2 py-1 rounded shadow-sm text-xs">
                {orderStatus === 'IN_PROGRESS' ? '🍳 Preparando...' : '🏪 Restaurante'}
              </div>
            </div>
          </motion.div>

          {/* Your Location (Destination) */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute"
            style={{ left: '80%', top: '20%' }}
          >
            <div className="relative">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ 
                  repeat: orderStatus === 'DELIVERED' ? 0 : Infinity, 
                  duration: 2 
                }}
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  orderStatus === 'DELIVERED' 
                    ? 'bg-green-500/20' 
                    : 'bg-[#046741]/20'
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  orderStatus === 'DELIVERED' 
                    ? 'bg-green-500' 
                    : 'bg-[#046741]'
                }`}>
                  {orderStatus === 'DELIVERED' ? (
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  ) : (
                    <Navigation className="w-4 h-4 text-white" />
                  )}
                </div>
              </motion.div>
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white px-2 py-1 rounded shadow-sm text-xs">
                {orderStatus === 'DELIVERED' ? '✓ Entregado' : 'Tu ubicación'}
              </div>
            </div>
          </motion.div>

          {/* Driver Position - Only show when ON_THE_WAY or DELIVERED */}
          {(orderStatus === 'ON_THE_WAY' || orderStatus === 'DELIVERED') && (
            <>
              <motion.div
                animate={{
                  left: orderStatus === 'DELIVERED' ? '80%' : `${driverPosition.x}%`,
                  top: orderStatus === 'DELIVERED' ? '20%' : `${driverPosition.y}%`
                }}
                transition={{ type: 'spring', damping: 20 }}
                className="absolute"
              >
                <motion.div
                  animate={{ rotate: -45 }}
                  className="relative"
                >
                  <div className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center border-2 border-[#046741]" style={{ transform: 'rotate(45deg)' }}>
                    <span className="text-xl">🧑</span>
                  </div>
                </motion.div>
              </motion.div>

              {/* Route Line */}
              {orderStatus === 'ON_THE_WAY' && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <motion.path
                    d={`M ${driverPosition.x}% ${driverPosition.y}% Q ${(driverPosition.x + 80) / 2}% ${(driverPosition.y + 20) / 2 - 10}% 80% 20%`}
                    stroke="#046741"
                    strokeWidth="3"
                    strokeDasharray="10,5"
                    fill="none"
                    opacity="0.5"
                  />
                </svg>
              )}
            </>
          )}
        </div>

        {/* Bottom Info Card */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="bg-white rounded-t-3xl shadow-2xl max-w-2xl mx-auto"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1 bg-gray-300 rounded-full" />
            </div>

            <div className="px-5 pb-6">
              {/* Status Badge */}
              <div className="flex items-center justify-between mb-4">
                <div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
                  style={{ backgroundColor: `${getStatusColor()}20`, color: getStatusColor() }}
                >
                  <div
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ backgroundColor: getStatusColor() }}
                  />
                  <span>{getStatusText()}</span>
                </div>
                {orderStatus === 'ON_THE_WAY' && (
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Tiempo estimado</p>
                    <p className="text-gray-900">{Math.ceil(eta)} min</p>
                  </div>
                )}
              </div>

              <AnimatePresence mode="wait">
                {/* PAYED State */}
                {paymentMethod === 'transfer' && orderStatus === 'PAYED' ? (
                  <motion.div
                    key="validating"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-6"
                  >
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Clock className="w-8 h-8 text-orange-600" />
                    </div>
                    <h2 className="text-gray-900 mb-2">Validando tu pago</h2>
                    <p className="text-gray-600 text-sm">
                      Estamos verificando tu transferencia. Te notificaremos cuando esté confirmado.
                    </p>
                  </motion.div>
                ) : orderStatus === 'PAYED' ? (
                  <motion.div
                    key="confirmed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-6"
                  >
                    <div className="w-16 h-16 bg-[#FE7F1E] rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle2 className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-gray-900 mb-2">¡Pedido confirmado!</h2>
                    <p className="text-gray-600 text-sm mb-4">
                      Empezaremos a preparar tu orden pronto
                    </p>
                    {order?.confirmation_code && (
                      <div className="bg-gray-50 rounded-xl p-4 mx-4">
                        <p className="text-sm text-gray-600 mb-1">Código de verificación</p>
                        <p className="text-2xl font-mono font-bold text-gray-900">#{order.confirmation_code}</p>
                        <p className="text-xs text-gray-500 mt-1">Guarda este código para tu referencia</p>
                      </div>
                    )}
                  </motion.div>
                ) : orderStatus === 'IN_PROGRESS' ? (
                  /* PREPARANDO State */
                  <motion.div
                    key="preparing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-6"
                  >
                    <div className="w-16 h-16 bg-[#FFD54F] rounded-full flex items-center justify-center mx-auto mb-3">
                      <Package className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-gray-900 mb-2">Preparando tu pedido 🍕</h2>
                    <p className="text-gray-600 text-sm mb-4">
                      Nuestro equipo está trabajando en tu orden
                    </p>
                    <div className="bg-[#046741]/10 rounded-xl p-3 flex items-center gap-3 max-w-xs mx-auto">
                      <Clock className="w-5 h-5 text-[#046741]" />
                      <div className="text-left">
                        <p className="text-xs text-gray-600">Tiempo estimado</p>
                        <p className="text-sm text-gray-900">25 - 35 minutos</p>
                      </div>
                    </div>
                  </motion.div>
                ) : orderStatus === 'READY' ? (
                  /* READY State */
                  <motion.div
                    key="ready"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-6"
                  >
                    <div className="w-16 h-16 bg-[#FFA500] rounded-full flex items-center justify-center mx-auto mb-3">
                      <Package className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-gray-900 mb-2">¡Pedido listo! 📦</h2>
                    <p className="text-gray-600 text-sm mb-4">
                      Tu pedido está listo para ser entregado
                    </p>
                    <div className="bg-[#FFA500]/10 rounded-xl p-3 flex items-center gap-3 max-w-xs mx-auto">
                      <Clock className="w-5 h-5 text-[#FFA500]" />
                      <div className="text-left">
                        <p className="text-xs text-gray-600">Estado</p>
                        <p className="text-sm text-gray-900">Listo para entregar</p>
                      </div>
                    </div>
                  </motion.div>
                ) : orderStatus === 'ON_THE_WAY' ? (
                  /* ON_THE_WAY State */
                  <motion.div
                    key="on_the_way"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {/* Driver Info */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-full bg-[#046741] flex items-center justify-center overflow-hidden">
                        <img 
                          src="https://images.unsplash.com/photo-1543499459-d1460946bdc6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZWxpdmVyeSUyMHBlcnNvbiUyMHBvcnRyYWl0fGVufDF8fHx8MTc1OTk1MDE4NXww&ixlib=rb-4.1.0&q=80&w=1080"
                          alt="Carlos Martínez"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-gray-900">Carlos Martínez</h3>
                        <p className="text-sm text-gray-600">Repartidor</p>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-yellow-500">★</span>
                          <span className="text-sm text-gray-700">4.9</span>
                          <span className="text-sm text-gray-500">(234 entregas)</span>
                        </div>
                      </div>
                      <a
                        href="tel:+1234567890"
                        className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                      >
                        <Phone className="w-5 h-5 text-gray-700" />
                      </a>
                    </div>

                    {/* Contact Button */}
                    <a
                      href="https://wa.me/1234567890"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full block"
                    >
                      <Button className="w-full bg-[#25D366] hover:bg-[#20BD5A] text-white h-12 rounded-xl flex items-center justify-center gap-2">
                        <MessageCircle className="w-5 h-5" />
                        Contactar por WhatsApp
                      </Button>
                    </a>
                  </motion.div>
                ) : orderStatus === 'DELIVERED' ? (
                  /* ENTREGADO State */
                  <motion.div
                    key="delivered"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-8"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring' }}
                      className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                    >
                      <span className="text-4xl">✓</span>
                    </motion.div>
                    <h2 className="text-gray-900 mb-2">¡Pedido entregado!</h2>
                    <p className="text-gray-600">Disfruta tu pedido</p>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}