import React from "react";
import {cn} from "../../lib/utils/format";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export default function Input({
                          label,
                          error,
                          helperText,
                          leftIcon,
                          rightIcon,
                          className,
                          ...props
                      }: InputProps) {
    // @ts-ignore
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                </label>
            )}

            <div className="relative">
                {leftIcon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        {leftIcon}
                    </div>
                )}

                <input
                    className={cn(
                        'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors',
                        error ? 'border-red-500' : 'border-gray-300',
                        leftIcon ? 'pl-10' : '-left-0',
                        rightIcon ? 'pr-10' : '-right-0',
                        className
                    )}
                    {...props}
                />

                {rightIcon && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        {rightIcon}
                    </div>
                )}
            </div>

            {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}

            {helperText && !error && (
                <p className="mt-1 text-sm text-gray-500">{helperText}</p>
            )}
        </div>
    );
}
