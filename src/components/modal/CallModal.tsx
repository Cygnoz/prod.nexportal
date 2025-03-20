import { useState } from "react";
import PhoneIcon from "../../assets/icons/PhoneIcon";
import NoImage from "../ui/NoImage";

interface CallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (phoneNumber: string) => void;
  customerName: string;
  ticketId: string;
  phoneNumber: string;
  alternateNumber?: string;
  userImage?: string;
}

export default function CallModal({
  isOpen,
  onClose,
  onConfirm,
  customerName,
  ticketId,
  phoneNumber,
  alternateNumber,
  userImage,
}: CallModalProps) {
  const [selectedNumber, setSelectedNumber] = useState(phoneNumber);

  if (!isOpen) return null;

  const isValidAlternateNumber = alternateNumber && alternateNumber !== "N/A";

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
      <div className="bg-white rounded-lg w-full max-w-lg shadow-lg">
        {/* Header */}
        <div className="flex justify-between items-center p-5">
          <h2 className="text-xl font-bold">Call Customer</h2>
          <button onClick={onClose} className="text-gray-500 text-2xl">
            &times;
          </button>
        </div>

        {/* Ticket ID and Customer */}
        <div className="px-5 py-2 flex items-center justify-between">
          <p className="text-base text-[#303F58] font-bold">
            Ticket ID : <span className="font-semibold">{ticketId}</span>
          </p>
          <div className="flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded-md">
          {userImage ? (
                <img
                  src={userImage}
                  alt={customerName}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <NoImage roundedSize={25} iconSize={14} />
              )}
            <span className="text-gray-700 text-sm">{customerName}</span>
          </div>
        </div>

        <div className="mx-5 my-3 border-t border-gray-200"></div>

        {/* Phone Selection */}
        <div className="px-5">
          <p className="text-base font-medium mb-3">Select number</p>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base text-gray-700">Phone Number:</p>
                <p className="text-base font-semibold">{phoneNumber}</p>
              </div>
              <div className="relative w-6 h-6">
                <input
                  type="radio"
                  name="phoneNumber"
                  value={phoneNumber}
                  checked={selectedNumber === phoneNumber}
                  onChange={() => setSelectedNumber(phoneNumber)}
                  className="appearance-none w-6 h-6 rounded-full border border-gray-300 checked:bg-white relative"
                />
                {selectedNumber === phoneNumber && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-4 h-4 bg-[#97998E] rounded-full"></div>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-gray-200"></div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-base text-gray-700">Alternate Number</p>
                <p className="text-base font-semibold">{alternateNumber || "N/A"}</p>
              </div>
              <div className="relative w-6 h-6">
                {isValidAlternateNumber ? (
                  <input
                    type="radio"
                    name="phoneNumber"
                    value={alternateNumber}
                    checked={selectedNumber === alternateNumber}
                    onChange={() => setSelectedNumber(alternateNumber)}
                    className="appearance-none w-6 h-6 rounded-full border border-gray-300 checked:bg-white relative"
                    disabled={!isValidAlternateNumber}
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full border border-gray-300"></div>
                )}
                {alternateNumber && selectedNumber === alternateNumber && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-4 h-4 bg-[#97998E]  rounded-full"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mx-5 my-3 border-t border-gray-200"></div>

        {/* Start Call Button */}
        <div className="p-5 flex justify-end">
          <button
            onClick={() => onConfirm(selectedNumber)}
            className="w-28 bg-green-500 text-white py-3 rounded-md flex items-center justify-center space-x-2"
          >
            <PhoneIcon size={18} color="#ffffff" />
            <span>Start Call</span>
          </button>
        </div>
      </div>
    </div>
  );
}