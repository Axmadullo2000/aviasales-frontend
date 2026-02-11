// Textarea.tsx
import { FC, ChangeEvent } from 'react';

interface TextareaProps {
    value: string;
    onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
    placeholder: string;
    rows: number;
}

export const Textarea: FC<TextareaProps> = ({ value, onChange, placeholder, rows }) => {
    return (
        <textarea
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            className="w-full p-2 border border-gray-300 rounded-md"
        />
    );
};
