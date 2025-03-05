type Props = {
    onClose: () => void;
    data: any[];
};

function UploadsViewModal({ onClose, data }: Props) {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-5 rounded-lg shadow-lg max-w-lg w-full overflow-y-auto max-h-[80vh]">
                {/* Header */}
                <div className="flex justify-between items-center  pb-3">
                    <h1 className="text-lg font-semibold">Uploaded Images</h1>
                    <button 
                        onClick={onClose} 
                        className="text-2xl font-bold text-gray-600 hover:text-gray-900"
                        aria-label="Close modal"
                    >
                        &times;
                    </button>
                </div>

                {/* Images Grid */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                    {data?.map((item: any, index: number) => (
                        typeof item === "string" ? (
                            <img 
                                key={index} 
                                src={item} 
                                alt={`Uploaded ${index + 1}`} 
                                className="w-full h-32 object-cover rounded-md border"
                            />
                        ) : null
                    ))}
                </div>
            </div>
        </div>
    );
}

export default UploadsViewModal;
