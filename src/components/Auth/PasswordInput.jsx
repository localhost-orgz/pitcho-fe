"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

export default function PasswordInput({
  id,
  name,
  value,
  onChange,
  onBlur,
  placeholder = "Password",
  error,
  autoComplete,
  required = false,
}) {
  const [show, setShow] = useState(false);
  const hasError = Boolean(error);

  return (
    <div>
      <div className="relative">
        {/* Icon */}
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
          <Lock
            size={18}
            className={hasError ? "text-red-400" : "text-slate-400"}
          />
        </div>

        {/* Input */}
        <input
          id={id}
          name={name}
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          className={`w-full rounded-xl border-2 px-3.5 py-2.5 pl-11 pr-12 text-sm font-medium text-foreground placeholder:text-slate-400 transition-all duration-200 outline-none
            ${
              hasError
                ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-2 focus:ring-red-200"
                : "border-slate-200 bg-white focus:border-main focus:ring-2 focus:ring-blue-100 hover:border-slate-300"
            }
          `}
        />

        {/* Toggle visibility */}
        <button
          type="button"
          onClick={() => setShow(!show)}
          tabIndex={-1}
          className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-1.5 text-xs font-medium text-red-500 animate-fade-in">
          {error}
        </p>
      )}
    </div>
  );
}
