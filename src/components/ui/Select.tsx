import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: Array<{ value: string; label: string }>;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, error, options, className, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                )}
                <select
                    ref={ref}
                    className={cn(
                        'w-full px-4 py-2 border rounded-lg transition-all duration-200',
                        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                        'bg-white disabled:bg-gray-100 disabled:cursor-not-allowed',
                        error ? 'border-red-500' : 'border-gray-300',
                        className
                    )}
                    {...props}
                >
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
            </div>
        );
    }
);

Select.displayName = 'Select';