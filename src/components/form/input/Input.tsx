import React, { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    type?: "text" | "number" | "email" | "password" | "date" | "time" | string;
    name?: string;
    placeholder?: string;
    className?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    type = "text", 
    placeholder = "Digite", 
    className,
    ...props }, ref) => {
    
    let inputClasses = `h-11 min-h-[2.75rem] w-full appearance-none bg-white border border-(--color-brand-200) focus:border-(--color-brand-200) focus:outline-hidden rounded-lg px-3 py-2 text-base leading-tight ${className}`;

    return (
      <div className="w-full flex items-center">
        <input
          {...props}
          ref={ref} 
          type={type}
          placeholder={placeholder}
          className={inputClasses}
        />
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;