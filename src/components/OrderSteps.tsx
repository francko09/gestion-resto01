import React from 'react';
import { ShoppingCart, CreditCard, ChefHat, Bell } from 'lucide-react';

interface OrderStepsProps {
  currentStep: number;
}

export function OrderSteps({ currentStep }: OrderStepsProps) {
  const steps = [
    { icon: ShoppingCart, label: 'Panier' },
    { icon: CreditCard, label: 'Commande' },
    { icon: ChefHat, label: 'Préparation' },
    { icon: Bell, label: 'Prêt' }
  ];

  return (
    <div className="w-full py-4">
      <div className="flex justify-between items-center">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index <= currentStep;
          const isLast = index === steps.length - 1;

          return (
            <React.Fragment key={step.label}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2
                           ${isActive 
                             ? 'bg-blue-600 text-white' 
                             : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span className={`text-sm ${
                  isActive 
                    ? 'text-gray-900 dark:text-white font-medium' 
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {step.label}
                </span>
              </div>
              {!isLast && (
                <div className={`flex-1 h-0.5 mx-2 ${
                  index < currentStep 
                    ? 'bg-blue-600' 
                    : 'bg-gray-200 dark:bg-gray-700'
                }`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}