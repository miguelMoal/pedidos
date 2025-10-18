import { ShoppingBag, Store, CreditCard, Truck, LucideIcon } from 'lucide-react';
import type { Screen } from '../App';

type Step = {
  id: Screen;
  label: string;
  icon: LucideIcon;
};

const steps: Step[] = [
  { id: 'catalog', label: 'Catálogo', icon: Store },
  { id: 'confirmation', label: 'Revisar', icon: ShoppingBag },
  { id: 'payment', label: 'Pagar', icon: CreditCard },
  { id: 'tracking', label: 'Estado', icon: Truck }
];

type NavigationStepperProps = {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
};

export default function NavigationStepper({ currentScreen, onNavigate }: NavigationStepperProps) {
  const currentIndex = steps.findIndex(step => step.id === currentScreen);

  return (
    <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-2xl mx-auto px-4 py-2">
        {/* Demo Controls Label */}
        <div className="text-xs text-gray-400 mb-1.5">Controles del prototipo</div>
        
        <div className="flex items-center justify-between gap-2">
          {steps.map((step, index) => {
            const isActive = step.id === currentScreen;
            const StepIcon = step.icon;

            return (
              <div key={step.id} className="flex items-center flex-1">
                {/* Step Button */}
                <button
                  onClick={() => onNavigate(step.id)}
                  className="flex flex-col items-center gap-0.5 transition-all duration-200 w-full hover:opacity-80"
                >
                  {/* Circle */}
                  <div
                    className={`
                      w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200
                      ${isActive ? 'bg-[#046741] shadow-sm' : 'bg-gray-200'}
                    `}
                  >
                    <StepIcon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                  </div>

                  {/* Label */}
                  <span
                    className={`
                      transition-all duration-200 text-[10px]
                      ${isActive ? 'text-gray-800' : 'text-gray-400'}
                    `}
                  >
                    {step.label}
                  </span>
                </button>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="flex-1 h-px mx-1 mb-4">
                    <div className="h-full bg-gray-200" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}