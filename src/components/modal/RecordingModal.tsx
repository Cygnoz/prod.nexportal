import React from 'react';

interface RecordingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    recordings: {
        recordingUrl: string;
        callId: string;
        duration?: number;
    }[];
    currentPlaying: string | null;
    handlePlay: (url: string) => void;
}

const RecordingsModal: React.FC<RecordingsModalProps> = ({
    isOpen,
    onClose,
    recordings,
    currentPlaying,
    handlePlay,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-[400px] max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">All Recordings</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">x</button>
                </div>
                <div className="space-y-4">
                    {recordings.map((rec) => (
                        <>
                            <div className="flex justify-between items-center w-full">
                                <p>Recording {recordings.indexOf(rec) + 1}</p>
                                <div className="flex items-center space-x-2">
                                    <p>Status:</p>
                                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                        Played
                                    </span>
                                </div>
                            </div>
                            <div key={rec.callId} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                                <button
                                    onClick={() => handlePlay(rec.recordingUrl)}
                                    className="p-1 h-7 w-7 rounded-full bg-[#71736B]"
                                >
                                    {currentPlaying === rec.recordingUrl ? (
                                        <span className="h-4 w-4 text-white">⏸</span>
                                    ) : (
                                        <span className="h-4 w-4 text-white">▶</span>
                                    )}
                                </button>
                                <div className="flex items-center gap-1 w-32">
                                    {[...Array(30)].map((_, i) => (
                                        <div
                                            key={i}
                                            className={`w-1 rounded-full ${currentPlaying === rec.recordingUrl
                                                ? 'bg-[#71736B] animate-bounce'
                                                : 'bg-gray-300'
                                                }`}
                                            style={{
                                                height: currentPlaying === rec.recordingUrl
                                                    ? `${Math.max(4, Math.random() * 6)}px`
                                                    : '4px'
                                            }}
                                        />
                                    ))}
                                </div>
                                <span className="text-sm text-gray-500">
                                    {rec.duration ? new Date(rec.duration * 1000).toISOString().substr(14, 5) : 'N/A'}
                                </span>
                            </div>
                        </>

                    ))}
                </div>
            </div>
        </div>
    );
};

export default RecordingsModal;