import { useState, useEffect } from "react";
import SearchBar from "../ui/SearchBar";

interface Supervisor {
    userName: string;
    userImage?: string;
}
  
interface SupervisorModalProps {
    isOpen: boolean;
    onClose: () => void;
    supervisors: Supervisor[];
    selectedSupervisors: string[];
    onSelect: (supervisors: string[]) => void;
}
  
const SupervisorModal: React.FC<SupervisorModalProps> = ({
    isOpen,
    onClose,
    supervisors,
    selectedSupervisors,
    onSelect,
}) => {
    const [searchValue, setSearchValue] = useState('');
    const [localSelectedSupervisors, setLocalSelectedSupervisors] = useState<string[]>(selectedSupervisors);

    useEffect(() => {
        setLocalSelectedSupervisors(selectedSupervisors);
    }, [selectedSupervisors]);

    const filteredSupervisors = supervisors.filter(supervisor =>
        supervisor.userName.toLowerCase().includes(searchValue.toLowerCase())
    );

    const toggleSupervisorSelection = (supervisorName: string, event?: React.MouseEvent) => {
        // Prevent event propagation to avoid conflicts
        if (event) {
            event.stopPropagation();
        }

        setLocalSelectedSupervisors(prev => 
            prev.includes(supervisorName) 
                ? prev.filter(name => name !== supervisorName)
                : [...prev, supervisorName]
        );
    };

    const handleDone = () => {
        onSelect(localSelectedSupervisors);
        onClose();
    };

    const isAllSelected = localSelectedSupervisors.length === 0;

    if (!isOpen) return null;
  
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-[400px]">
                <div className="flex justify-between items-center mb-4">
                    <SearchBar
                        searchValue={searchValue}
                        onSearchChange={setSearchValue}
                        placeholder="Search Supervisor"
                    />
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        &times;
                    </button>
                </div>
                <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                    {/* All Supervisors Option */}
                    <div 
                        className="flex items-center justify-between px-4 py-2 hover:bg-gray-100 rounded-md cursor-pointer"
                        onClick={() => setLocalSelectedSupervisors([])}
                    >
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                <span className="text-sm text-gray-600">All</span>
                            </div>
                            <span className="text-sm">All</span>
                        </div>
                        <input
                            type="checkbox"
                            checked={isAllSelected}
                            onChange={() => setLocalSelectedSupervisors([])}
                            onClick={(e) => e.stopPropagation()}
                            className="h-6 w-6 rounded border-gray-300 text-[#71736B] focus:ring-[#71736B]"
                        />
                    </div>
                    
                    {/* Supervisor List */}
                    {filteredSupervisors.map((supervisor) => (
                        <div
                            key={supervisor.userName}
                            className="flex items-center justify-between px-4 py-2 hover:bg-gray-100 rounded-md cursor-pointer"
                            onClick={() => toggleSupervisorSelection(supervisor.userName)}
                        >
                            <div className="flex items-center space-x-3">
                                {supervisor.userImage ? (
                                    <img 
                                        src={supervisor.userImage} 
                                        alt={supervisor.userName}
                                        className="w-8 h-8 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                        <span className="text-sm text-gray-600">
                                            {supervisor.userName.charAt(0)}
                                        </span>
                                    </div>
                                )}
                                <span className="text-sm">{supervisor.userName}</span>
                            </div>
                            <input
                                type="checkbox"
                                checked={localSelectedSupervisors.includes(supervisor.userName)}
                                onChange={() => toggleSupervisorSelection(supervisor.userName)}
                                onClick={(e) => e.stopPropagation()}
                                className="h-6 w-6 rounded border-gray-300 text-[#71736B] focus:ring-[#71736B]"
                            />
                        </div>
                    ))}
                    
                    {/* Done Button */}
                    <div className="flex justify-end mt-4">
                        <button 
                            onClick={handleDone}
                            className="px-4 py-2 rounded-xl border text-[#565148] border-[#565148] hover:bg-gray-100"
                        >
                            Done
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
  
export default SupervisorModal;