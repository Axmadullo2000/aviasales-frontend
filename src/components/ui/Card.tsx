import React from "react";
import {cn} from "@/src/lib/utils/format";

interface CardProps {
    children: React.ReactNode;
    className?: string;
    padding?: 'none' | 'sm' | 'md' | 'lg';
    hover?: boolean;
}

export default function Card({ children, className, padding = 'md', hover = false }: CardProps) {
    const paddings = {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
    };

    return (
        <div
            className={cn(
                'bg-white rounded-lg border border-gray-200 shadow-sm',
                paddings[padding],
                hover && 'transition-shadow hover:shadow-md cursor-pointer',
                className
            )}
        >
            {children}
        </div>
    );
}
