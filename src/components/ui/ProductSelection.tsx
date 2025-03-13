import { useState, useRef, useEffect } from 'react';
import bilbizz from '../../assets/image/bilbizzprdLogo.png'
import sewnex from '../../assets/image/SewnexLogo.png'
import salonex from '../../assets/image/Salonexlogo.png'
import sixnexd from '../../assets/image/sixNexdLogo.png'

type ProductSelectionProps = {
    onChange: (value: string) => void;
    label?: string;
    placeholder?: string;
};

function ProductSelection({
    onChange,
    label = "Select a product",
    placeholder = "Select a product"
}: ProductSelectionProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Hardcoded product options
    const options = [
        { value: 'Bilbizz', label: 'Bilbizz', image: bilbizz },
        { value: 'Sewnex', label: 'Sewnex', image: sewnex },
        { value: 'SaloNex', label: 'SaloNex', image: salonex },
        { value: '6Nexd', label: '6Nexd', image: sixnexd },
    ];

    const selectedOption = options.find(option => option.value === selectedValue);

    const handleSelect = (value: string) => {
        setSelectedValue(value);
        onChange(value);
        setIsOpen(false);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="mb-4 relative" ref={dropdownRef}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                </label>
            )}

            {/* Dropdown trigger */}
            <div
                className={`flex items-center justify-between w-full px-2.5 py-1.5 mt-2 bg-white border ${isOpen ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-300'
                    } rounded-md cursor-pointer`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center">
                    {selectedOption ? (
                        <>
                            <img
                                src={selectedOption.image}
                                alt={selectedOption.label}
                                className="h-6 w-6 mr-2.5 object-cover rounded"
                            />
                            <span className="text-gray-800">{selectedOption.label}</span>
                        </>
                    ) : (
                        <span className="text-gray-400">{placeholder}</span>
                    )}
                </div>

                <svg
                    className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
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
                <div className="absolute left-0 right-0 z-10 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {options.map((option) => (
                        <div
                            key={option.value}
                            className={`flex items-center px-3 py-2 cursor-pointer hover:bg-gray-100 ${option.value === selectedValue ? 'bg-blue-50' : ''
                                }`}
                            onClick={() => handleSelect(option.value)}
                        >
                            <img
                                src={option.image}
                                alt={option.label}
                                className="h-6 w-6 mr-2.5 object-cover rounded"
                            />
                            <span className={option.value === selectedValue ? 'font-medium' : ''}>
                                {option.label}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ProductSelection;