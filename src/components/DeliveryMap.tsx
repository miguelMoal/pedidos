import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Navigation, Store } from 'lucide-react';
import { OrderStatus } from '../App';

interface DeliveryMapProps {
  orderStatus: OrderStatus;
  driverPosition?: { x: number; y: number };
  eta?: number;
  onDriverPositionChange?: (position: { x: number; y: number }) => void;
  onEtaChange?: (eta: number) => void;
  className?: string;
  showDriver?: boolean;
  showRoute?: boolean;
  restaurantPosition?: { x: number; y: number };
  destinationPosition?: { x: number; y: number };
}

function DeliveryMap({
  orderStatus,
  driverPosition = { x: 20, y: 70 },
  eta = 18,
  onDriverPositionChange,
  onEtaChange,
  className = '',
  showDriver = true,
  showRoute = true,
  restaurantPosition = { x: 20, y: 70 },
  destinationPosition = { x: 80, y: 20 }
}: DeliveryMapProps) {
  const [deliveryProgress, setDeliveryProgress] = useState(0);
  const [currentDriverPosition, setCurrentDriverPosition] = useState(driverPosition);
  const [currentEta, setCurrentEta] = useState(eta);

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

        setCurrentDriverPosition((prev) => {
          const newPosition = {
            x: Math.min(prev.x + 0.6, destinationPosition.x),
            y: Math.max(prev.y - 0.5, destinationPosition.y)
          };
          
          // Notificar al componente padre del cambio de posición
          if (onDriverPositionChange) {
            onDriverPositionChange(newPosition);
          }
          
          return newPosition;
        });

        setCurrentEta((prev) => {
          const newEta = Math.max(prev - 0.18, 0);
          
          // Notificar al componente padre del cambio de ETA
          if (onEtaChange) {
            onEtaChange(newEta);
          }
          
          return newEta;
        });
      }, 100);

      return () => clearInterval(interval);
    } else {
      // Reset position when not ON_THE_WAY
      setDeliveryProgress(0);
      setCurrentDriverPosition(restaurantPosition);
      setCurrentEta(eta);
    }
  }, [orderStatus, destinationPosition, restaurantPosition, eta, onDriverPositionChange, onEtaChange]);

  // Actualizar posición del conductor cuando cambie la prop
  useEffect(() => {
    setCurrentDriverPosition(driverPosition);
  }, [driverPosition]);

  // Actualizar ETA cuando cambie la prop
  useEffect(() => {
    setCurrentEta(eta);
  }, [eta]);

  return (
    <div className={`absolute inset-0 ${className}`}>
      {/* Map Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-red-500">
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
          style={{ left: `${restaurantPosition.x}%`, top: `${restaurantPosition.y}%` }}
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
          style={{ left: `${destinationPosition.x}%`, top: `${destinationPosition.y}%` }}
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
        {showDriver && (orderStatus === 'ON_THE_WAY' || orderStatus === 'DELIVERED') && (
          <>
            <motion.div
              animate={{
                left: orderStatus === 'DELIVERED' ? `${destinationPosition.x}%` : `${currentDriverPosition.x}%`,
                top: orderStatus === 'DELIVERED' ? `${destinationPosition.y}%` : `${currentDriverPosition.y}%`
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
            {showRoute && orderStatus === 'ON_THE_WAY' && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <motion.path
                  d={`M ${currentDriverPosition.x}% ${currentDriverPosition.y}% Q ${(currentDriverPosition.x + destinationPosition.x) / 2}% ${(currentDriverPosition.y + destinationPosition.y) / 2 - 10}% ${destinationPosition.x}% ${destinationPosition.y}%`}
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
    </div>
  );
}

export default DeliveryMap;
