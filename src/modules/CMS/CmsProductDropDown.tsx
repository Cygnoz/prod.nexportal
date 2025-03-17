import { useEffect, useRef } from 'react';
import { useResponse } from '../../context/ResponseContext';

type Props = {};

function CmsProductDropDown({}: Props) {
    const { setCmsMenu, cmsMenu } = useResponse();
    const dropdownRef = useRef<HTMLDivElement>(null);

    const optionsList = [
        { name: "BillBizz", color: "bg-red-600", text: "B" },
        { name: "Sewnex", color: "bg-green-600", text: "S" },
        { name: "Salonex", color: "bg-pink-600", text: "S" },
        { name: "6Nexd", color: "bg-blue-600", text: "6" },
    ];

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setCmsMenu((prev) => ({ ...prev, IsCMSMenuOpen: false }));
            }
        }

        if (cmsMenu.IsCMSMenuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [cmsMenu.IsCMSMenuOpen, setCmsMenu]);

    return (
        <div ref={dropdownRef} className="absolute left-full ml-2 top-0 mt-0 w-48 bg-gray-900 text-white rounded-lg shadow-lg z-50">
            {/* Dropdown Arrow */}
            <div className="absolute left-0 -ml-2 bottom-6 w-4 h-4 bg-gray-900 rotate-45 -z-10"></div>

            <ul className="z-50">
                {optionsList.map((option, index) => (
                    <li
                        key={index}
                        onClick={() => {
                            setCmsMenu({
                                IsCMSMenuOpen: false,
                                selectedData: option.name
                            });
                        }}
                        className={`${cmsMenu.selectedData === option.name && 'bg-gray-700'} flex items-center px-4 py-3 hover:bg-gray-700 cursor-pointer border-b ${index === 0 ? 'rounded-t-lg' : index === optionsList.length - 1 && 'rounded-b-lg'} border-gray-800`}
                    >
                        <span className={`w-8 h-8 flex items-center justify-center rounded-full ${option.color} text-white font-bold mr-3`}>
                            {option.text}
                        </span>
                        {option.name}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default CmsProductDropDown;
