import React, { useState, useCallback, useEffect } from 'react';
import image_9e507b2c5c9e8ada93fe4d3adfbaa432e2290684 from 'figma:asset/9e507b2c5c9e8ada93fe4d3adfbaa432e2290684.png';
import image_4688925daf76a3361de541d15592f70eaef0be38 from 'figma:asset/4688925daf76a3361de541d15592f70eaef0be38.png';
import image_10674549e1087c899d3be1c2a86eb79b2c46f6ae from 'figma:asset/10674549e1087c899d3be1c2a86eb79b2c46f6ae.png';
import OrderConfirmation from './components/OrderConfirmation';
import Catalog from './components/Catalog';
import Payment from './components/Payment';
import OrderTracking from './components/OrderTracking';
import NavigationStepper from './components/NavigationStepper';
import AppHeader from './components/AppHeader';
import { Toaster } from './components/ui/sonner';
import { useOrderStore } from './store/ordersStore';

export type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

export type OrderStatus = 'CREADO' | 'EDITANDO' | 'PENDIENTE_PAGO' | 'PAGADO' | 'PREPARANDO' | 'EN_CAMINO' | 'ENTREGADO';

export type Screen = 'confirmation' | 'catalog' | 'payment' | 'tracking';

// Helper function to get initial screen from URL
function getInitialScreenFromURL(): Screen {
  const params = new URLSearchParams(window.location.search);
  const screen = params.get('screen');
  const phone = params.get('phone');
  console.log('phone', phone);
  
  if (screen === 'catalog' || screen === 'payment' || screen === 'tracking') {
    return screen;
  }
  
  return 'confirmation';
}

// Helper function to get order ID from URL
function getOrderIdFromURL(): number | null {
  const params = new URLSearchParams(window.location.search);
  const orderId = params.get('orderId');
  return orderId ? parseInt(orderId, 10) : null;
}

// Helper function to get initial status based on screen
function getInitialStatus(screen: Screen): OrderStatus {
  if (screen === 'catalog') return 'EDITANDO';
  if (screen === 'payment') return 'PENDIENTE_PAGO';
  if (screen === 'tracking') return 'PAGADO';
  return 'CREADO';
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>(getInitialScreenFromURL());
  const [orderStatus, setOrderStatus] = useState<OrderStatus>(getInitialStatus(getInitialScreenFromURL()));
  
  // Store de órdenes
  const { order, loading, error, loadOrder, updateOrderStatus } = useOrderStore();
  
  // Mock order from WhatsApp
  const [orderItems, setOrderItems] = useState<OrderItem[]>([
    {
      id: '1',
      name: 'Café del día',
      price: 12.99,
      quantity: 2,
      image: image_9e507b2c5c9e8ada93fe4d3adfbaa432e2290684
    },
    {
      id: '2',
      name: 'Concha de Vainilla',
      price: 8.99,
      quantity: 1,
      image: image_4688925daf76a3361de541d15592f70eaef0be38
    },
    {
      id: '3',
      name: 'Burrito',
      price: 3.99,
      quantity: 2,
      image: image_10674549e1087c899d3be1c2a86eb79b2c46f6ae
    }
  ]);

  const [shippingCost] = useState(2.50);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'transfer' | null>(null);

  // Cargar orden desde Supabase al montar el componente
  useEffect(() => {
    const orderId = getOrderIdFromURL();
    if (orderId) {
      loadOrder(orderId);
    }
  }, [loadOrder]);

  // Listen for URL changes on initial load and browser navigation
  useEffect(() => {
    const handleURLChange = () => {
      const screen = getInitialScreenFromURL();
      const status = getInitialStatus(screen);
      setCurrentScreen(screen);
      setOrderStatus(status);
    };

    // Handle browser back/forward buttons
    window.addEventListener('popstate', handleURLChange);
    
    return () => {
      window.removeEventListener('popstate', handleURLChange);
    };
  }, []);

  // Update URL when screen changes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set('screen', currentScreen);
    const newURL = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, '', newURL);
  }, [currentScreen]);

  const calculateSubtotal = () => {
    return orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + shippingCost;
  };

  const updateOrderItem = (id: string, quantity: number) => {
    if (quantity === 0) {
      setOrderItems(orderItems.filter(item => item.id !== id));
    } else {
      setOrderItems(orderItems.map(item => 
        item.id === id ? { ...item, quantity } : item
      ));
    }
  };

  const addOrderItem = (item: OrderItem) => {
    const existingItem = orderItems.find(i => i.id === item.id);
    if (existingItem) {
      updateOrderItem(item.id, existingItem.quantity + item.quantity);
    } else {
      setOrderItems([...orderItems, item]);
    }
  };

  const handlePaymentComplete = (method: 'card' | 'transfer') => {
    setPaymentMethod(method);
    setOrderStatus('PAGADO');
    setCurrentScreen('tracking');
  };

  const handleNavigate = (screen: Screen) => {
    setCurrentScreen(screen);
    
    // Actualizar el estado según la pantalla
    if (screen === 'confirmation') {
      setOrderStatus('CREADO');
    } else if (screen === 'catalog') {
      setOrderStatus('EDITANDO');
    } else if (screen === 'payment') {
      setOrderStatus('PENDIENTE_PAGO');
    } else if (screen === 'tracking') {
      setOrderStatus(orderStatus === 'CREADO' || orderStatus === 'EDITANDO' || orderStatus === 'PENDIENTE_PAGO' ? 'PAGADO' : orderStatus);
    }
  };

  const handleStatusUpdate = useCallback(async (status: OrderStatus) => {
    setOrderStatus(status);
    
    // Mapear el estado local al estado de Supabase
    let supabaseStatus: 'INIT' | 'IN_PROGRESS' | 'READY' | 'DELIVERED';
    switch (status) {
      case 'CREADO':
      case 'EDITANDO':
      case 'PENDIENTE_PAGO':
        supabaseStatus = 'INIT';
        break;
      case 'PAGADO':
      case 'PREPARANDO':
        supabaseStatus = 'IN_PROGRESS';
        break;
      case 'EN_CAMINO':
        supabaseStatus = 'READY';
        break;
      case 'ENTREGADO':
        supabaseStatus = 'DELIVERED';
        break;
      default:
        supabaseStatus = 'INIT';
    }
    
    // Actualizar en Supabase
    if (order) {
      await updateOrderStatus({ status: supabaseStatus });
    }
  }, [order, updateOrderStatus]);

  // Mostrar loading mientras se carga la orden
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando orden...</p>
        </div>
      </div>
    );
  }

  // Mostrar error si hay algún problema
  if (error) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[#F8F9FA]">
        {/* Sticky Stepper */}
        <div className="sticky top-0 z-50">
          <NavigationStepper 
            currentScreen={currentScreen} 
            onNavigate={handleNavigate}
          />
        </div>
        
        {/* Header que hace scroll */}
        <AppHeader />
        
        {currentScreen === 'confirmation' && (
          <OrderConfirmation
            orderItems={orderItems}
            updateOrderItem={updateOrderItem}
            subtotal={calculateSubtotal()}
            shippingCost={shippingCost}
            total={calculateTotal()}
            onEditOrder={() => {
              setOrderStatus('EDITANDO');
              setCurrentScreen('catalog');
            }}
            onProceedToPayment={() => {
              setOrderStatus('PENDIENTE_PAGO');
              setCurrentScreen('payment');
            }}
          />
        )}

        {currentScreen === 'catalog' && (
          <Catalog
            currentOrderItems={orderItems}
            addOrderItem={addOrderItem}
            onSaveAndReturn={() => {
              setOrderStatus('CREADO');
              setCurrentScreen('confirmation');
            }}
            total={calculateTotal()}
          />
        )}

        {currentScreen === 'payment' && (
          <Payment
            orderItems={orderItems}
            total={calculateTotal()}
            onPaymentComplete={handlePaymentComplete}
            onBack={() => setCurrentScreen('confirmation')}
          />
        )}

        {currentScreen === 'tracking' && (
          <OrderTracking
            orderStatus={orderStatus}
            paymentMethod={paymentMethod}
            onViewMap={() => {
              setOrderStatus('EN_CAMINO');
            }}
            onStatusUpdate={handleStatusUpdate}
          />
        )}
      </div>
      <Toaster />
    </>
  );
}