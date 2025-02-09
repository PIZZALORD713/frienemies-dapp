import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    className?: string;
}

const Button: React.FC<ButtonProps> = ({ children, className = "", ...props }) => {
    return (
        <button
            className={`px-4 py-2 bg-black text-white rounded-md transition hover:bg-gray-800 ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
