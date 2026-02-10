import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, helperText, leftIcon, rightIcon, className, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {label}
                    </label>
                )}

                <div className="relative">
                    {leftIcon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                            {leftIcon}
                        </div>
                    )}

                    <input
                        ref={ref}
                        className={cn(
                            // 🔑 БАЗА (ОБЯЗАТЕЛЬНО)
                            'w-full px-4 py-2 rounded-lg border',
                            'bg-white text-gray-900 placeholder-gray-400',

                            // 🔑 ФОКУС
                            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',

                            // 🔑 СОСТОЯНИЯ
                            'transition-all duration-200',
                            'disabled:bg-gray-100 disabled:cursor-not-allowed',

                            // 🔑 ИКОНКИ
                            leftIcon && 'pl-10',
                            rightIcon && 'pr-10',

                            // 🔑 ОШИБКА
                            error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300',

                            className
                        )}
                        {...props}
                    />

                    {rightIcon && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                            {rightIcon}
                        </div>
                    )}
                </div>

                {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
                {helperText && !error && (
                    <p className="mt-1 text-sm text-gray-500">{helperText}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';
