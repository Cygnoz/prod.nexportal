import React, { useState, useEffect, useRef } from 'react';

import { endPoints } from '../../services/apiEndpoints';
import toast from 'react-hot-toast';
import { formatDate } from '../../util/formatDate';
import useApi from '../../Hooks/useApi';
import RecordingsModal from '../../components/modal/RecordingModal';

interface Ticket {
  _id: string;
  ticketId: string;
  subject: string;
  status: 'Open' | 'Closed' | 'Pending';
  priority: 'High' | 'Medium' | 'Low';
  customer: string;
  customerPhone: string;
  supportAgent: string;
  openingDate: string;
  recordings: {
    recordingUrl: string;
    callId: string;
    call_duration?:number;
  }[];
}
// interface RecordingsResponse {
//   success: boolean;
//   message: string;
//   tickets: Ticket[];
//   total: number;
// }

const Recordings: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const { request: fetchRecordings } = useApi("get", 3004);
  // const [currentPlayingIndex, setCurrentPlayingIndex] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);


  useEffect(() => {
    const getRecordings = async () => {
      try {
        setLoading(true);
        const { response, error } = await fetchRecordings(endPoints.GET_ALL_RECORDINGS);

        if (response?.data?.tickets) {
          setTickets(response.data.tickets);
        } else {
          setTickets([]);
          toast.error(
            error?.message || "No recordings found"
          );
        }
      } catch (err) {
        console.error("Error fetching recordings:", err);
        setTickets([]);
        toast.error("Failed to fetch recordings");
      } finally {
        setLoading(false);
      }
    };

    getRecordings();
  }, []);

  const [currentPlaying, setCurrentPlaying] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlay = (url: string) => {
    if (currentPlaying === url) {
      audioRef.current?.pause();
      setCurrentPlaying(null);
    } else {
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play();
        setCurrentPlaying(url);
      }
    }
  };

  
  return (
    <div className="bg-gray-50 min-h-screen px-4 py-6">
      <h1 className="text-xl font-semibold mb-6">Recordings</h1>

      <div className="flex flex-col space-y-4 mb-6">
        <div className="flex justify-between items-center">
          <div className="relative w-full max-w-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search Recording by Subject, Ticket"
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Filter by Date</span>
            <div className="relative inline-block">
              <div className="flex items-center border border-gray-300 rounded-md px-4 py-2 bg-white">
                <svg className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm">12 March 25</span>
                <svg className="h-5 w-5 text-gray-500 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            <div className="relative inline-block">
              <button className="flex items-center border border-gray-300 rounded-md px-4 py-2 bg-white">
                <span className="text-sm">By Supervisor</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="text-center py-10">Loading...</div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-10">No recordings found</div>
        ) : (
          <table className="min-w-full">
            <thead className="bg-[#F9F9F9]">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ticket ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Played by
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Open Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recordings
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-[#F9F9F9]'>
              {tickets.map((ticket) => (
                <tr key={ticket._id} className="bg-gray-100 rounded-2xl my-2">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {ticket.ticketId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {ticket.subject}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${ticket.status === 'Open' ? 'bg-[#FBE7E9] text-[#4B5c79]' :
                      ticket.status === 'Closed' ? 'bg-red-100 text-[#4B5c79]' :
                        'bg-yellow-100 text-[#4B5c79]'
                      }`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="ml-3">
                        <div className="text-sm font-semibold text-gray-900">
                          {ticket.supportAgent}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-bold">
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-semibold text-sm text-gray-500">
                    {formatDate(ticket.openingDate)}
                  </td>
                  {/* <td className="px-6 py-4 whitespace-nowrap">

                    {ticket.recordings.map((rec) => (
                      <div key={rec.callId} className="flex items-center space-x-2 mb-2">
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
                                  ? `${Math.max(4, Math.random() *6)}px`
                                  : '4px'
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </td> */}

                  <td className="px-6 py-4 whitespace-nowrap">
                    {ticket.recordings[0] && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handlePlay(ticket.recordings[0].recordingUrl)}
                          className="p-1 h-7 w-7 rounded-full bg-[#71736B]"
                        >
                          {currentPlaying === ticket.recordings[0].recordingUrl ? (
                            <span className="h-4 w-4 text-white">⏸</span>
                          ) : (
                            <span className="h-4 w-4 text-white">▶</span>
                          )}
                        </button>
                        <div className="flex items-center gap-1 w-32">
                          {[...Array(30)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-1 rounded-full ${currentPlaying === ticket.recordings[0].recordingUrl
                                ? 'bg-[#71736B] animate-bounce'
                                : 'bg-gray-300'
                                }`}
                              style={{
                                height: currentPlaying === ticket.recordings[0].recordingUrl
                                  ? `${Math.max(4, Math.random() * 6)}px`
                                  : '4px'
                              }}
                            />
                  
                          ))}
                        </div>
                        <span>{(ticket.recordings[0].call_duration)}</span>
                      </div>
                    )}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex items-center space-x-2">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800`}>
                      Played
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {ticket.recordings.length > 1 && (
                        <button
                          onClick={() => {
                          setSelectedTicket(ticket);
                          setIsModalOpen(true);
                          }}
                          className="inline-flex items-center justify-center px-2 py-1 text-sm font-medium border border-gray-500 rounded-full"
                        >
                          +{ticket.recordings.length - 1}
                          
                        </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <audio
          ref={audioRef}
          onEnded={() => setCurrentPlaying(null)}
          className="hidden"
        />

        <RecordingsModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedTicket(null);
          }}
          recordings={selectedTicket?.recordings.slice(1) || []}
          currentPlaying={currentPlaying}
          handlePlay={handlePlay}
        />
      </div>
    </div>
  );
};

export default Recordings;