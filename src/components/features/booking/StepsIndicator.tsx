'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface Step {
  id: number;
  label: string;
  status: 'completed' | 'current' | 'pending';
}

interface StepsIndicatorProps {
  steps: Step[];
}

export const StepsIndicator: React.FC<StepsIndicatorProps> = ({ steps }) => {
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between max-w-3xl mx-auto">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all',
                  step.status === 'completed' && 'bg-green-600 text-white',
                  step.status === 'current' && 'bg-blue-600 text-white ring-4 ring-blue-100',
                  step.status === 'pending' && 'bg-gray-200 text-gray-500'
                )}
              >
                {step.status === 'completed' ? (
                  <Check className="w-5 h-5" />
                ) : (
                  step.id
                )}
              </div>
              <span
                className={cn(
                  'mt-2 text-sm font-medium',
                  step.status === 'current' && 'text-blue-600',
                  step.status === 'pending' && 'text-gray-500'
                )}
              >
                {step.label}
              </span>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-1 mx-4 rounded',
                  step.status === 'completed' ? 'bg-green-600' : 'bg-gray-200'
                )}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};