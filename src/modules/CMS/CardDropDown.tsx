import { useState } from "react";

type Props = {
    setSelectData: (name: string) => void;
}

function CardDropDown({ setSelectData }: Props) {
    const [isOpen, setIsOpen] = useState(false);

    const options = [
        { name: "BillBizz", color: "bg-red-600", text: "B" },
        { name: "Sewnex", color: "bg-green-600", text: "S" },
        { name: "Salonex", color: "bg-pink-600", text: "S" },
        { name: "6Nexd", color: "bg-blue-600", text: "6" },
    ];

    return (
        <div className="relative flex items-start">
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 bg-gray-800 rounded-lg text-white">
                Open Menu
            </button>
            {isOpen && (
                <div className="absolute left-0 top-10 mt-2 w-48 bg-gray-900 text-white rounded-lg shadow-lg">
                    <div className="absolute -left-2 top-36 w-4 h-4 bg-gray-900 rotate-45"></div>
                    <ul className="py-2">
                        {options.map((option, index) => (
                            <li
                                onClick={() => {
                                    setSelectData(option.name);
                                    setIsOpen(false);
                                }}
                                key={index}
                                className="flex items-center px-4 py-3 hover:bg-gray-700 cursor-pointer border-b border-gray-800"
                            >
                                <span className={`w-8 h-8 flex items-center justify-center rounded-full ${option.color} text-white font-bold mr-3`}>
                                    {option.text}
                                </span>
                                {option.name}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default CardDropDown;


