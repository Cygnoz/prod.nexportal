import React, { useEffect, useRef, useState, useMemo } from "react";
import ProductLogo from "../ui/ProductLogo";

interface ProductSelectionProps {
  onChange: (value: string) => void;
  label: string;
  error?: string;
  required?: boolean;
  placeholder?: string;
  options: { value: string; label: string; logo: string }[];
  value: string; // <-- Add value prop
}

function ProductSelection({
  onChange,
  label,
  error,
  required,
  options,
  placeholder,
  value,
}: ProductSelectionProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Memoize adjustedOptions
  const adjustedOptions = useMemo(() => {
    return placeholder
      ? [{ value: "", label: placeholder, logo: "" }, ...options.slice(0)]
      : options;
  }, [options, placeholder]);

  // Memoize selectedOption
  const selectedOption = useMemo(() => {
    return adjustedOptions.find((option) => option.value === value) || adjustedOptions[0];
  }, [value, adjustedOptions]);

  const handleSelect = (selectedValue: string) => {
    if (selectedValue !== value) {
      onChange(selectedValue);
    }
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Dropdown trigger */}
      <div
        className={`flex items-center justify-between w-full px-2.5 py-1.5 mt-2 bg-white border ${
          isOpen ? "border-blue-500 ring-1 ring-blue-500" : error ? "border-red-500" : "border-gray-300"
        } rounded-md cursor-pointer`}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          {selectedOption.value !== "" && <ProductLogo projectName={selectedOption.logo} size={6} />}
          <span className="text-gray-800 text-sm">{selectedOption.label}</span>
        </div>

        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Dropdown options */}
      {isOpen && (
        <div className="absolute left-0 right-0 z-10 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-72 overflow-y-auto">
          {adjustedOptions.map((option) => (
            <div
              key={option.value}
              className={`flex items-center gap-1 px-2 py-1 cursor-pointer`}
              onClick={() => handleSelect(option.value)}
            >
              <div
                className={`${
                  option.value === value ? "bg-blue-50" : "bg-[#F5F5F5]"
                } w-full h-[42px] flex hover:bg-[#F5F5F5] items-center gap-2 ps-2 border border-[#D0D0D0] rounded-lg`}
              >
                {option.value !== "" && <ProductLogo projectName={option.logo} size={6} />}
                <span className={option.value === value ? "font-medium" : ""}>{option.label}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}

// Wrap the component in React.memo
export default React.memo(ProductSelection);