import React, { useState, useEffect, useRef } from 'react';

import { endPoints } from '../../services/apiEndpoints';
// import toast from 'react-hot-toast';
import { formatDate } from '../../util/formatDate';
import useApi from '../../Hooks/useApi';
import RecordingsModal from '../../components/modal/RecordingModal';
import NoRecords from '../../components/ui/NoRecords';

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
    duration?: number;
    playStatus?: 'not-played' | 'partially-played' | 'played';
    playedBy: string;
    playedDuration?: number;
  }[];
}

const Recordings: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const { request: fetchRecordings } = useApi("get", 3004);
  const { request: updatePlayStatus } = useApi("put", 3004);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [dateFilter, setDateFilter] = useState<string>('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [currentPlaying, setCurrentPlaying] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Track play duration and status
  const [playTracking, setPlayTracking] = useState<{
    [recordingUrl: string]: {
      startTime: number;
      playedDuration: number;
      status: 'not-played' | 'partially-played' | 'played';
    }
  }>({});

  const shouldUpdateStatus = (currentStatus: string | undefined, newStatus: string): boolean => {
    if (typeof newStatus !== 'string') {
      throw new Error('newStatus must be a string');
    }
    // If it's already fully played, don't update
    if (currentStatus === 'played') return false;
    // If it's not played or partially played, allow update
    return true;
  };


  useEffect(() => {
    const getRecordings = async () => {
      try {
        setLoading(true);
        const { response, error } = await fetchRecordings(endPoints.GET_ALL_RECORDINGS);
        console.log("data=", response?.data);


        if (response?.data?.tickets) {
          // Initialize play status for all recordings
          const ticketsWithPlayStatus = response.data.tickets.map((ticket: Ticket) => ({
            ...ticket,
            recordings: ticket.recordings.map(recording => ({
              ...recording,
              playStatus: recording.playStatus || 'not-played',
              playedBy: recording.playedBy || '',
              playedDuration: 0
            }))
          }));
          setTickets(ticketsWithPlayStatus);
        } else {
          setTickets([]);
          console.error(
            error?.message || "No recordings found"
          );
        }
      } catch (err) {
        console.error("Error fetching recordings:", err);
        setTickets([]);
      } finally {
        setLoading(false);
      }
    };

    getRecordings();
  }, []);

  useEffect(() => {
    let filtered = tickets;

    // Filter by search term if it exists
    if (searchTerm.trim()) {
      const searchTermLower = searchTerm.toLowerCase();
      filtered = filtered.filter(ticket =>
        ticket.ticketId.toLowerCase().includes(searchTermLower) ||
        ticket.subject.toLowerCase().includes(searchTermLower) ||
        ticket.status.toLowerCase().includes(searchTermLower) ||

        ticket.priority.toLowerCase().includes(searchTermLower) ||
        ticket.supportAgent.toLowerCase().includes(searchTermLower)
      );
    }

    // Filter by date if it exists
    if (dateFilter) {
      const filterDate = new Date(dateFilter).setHours(0, 0, 0, 0);
      filtered = filtered.filter(ticket => {
        const ticketDate = new Date(ticket.openingDate).setHours(0, 0, 0, 0);
        return ticketDate === filterDate;
      });
    }

    setFilteredTickets(filtered);
  }, [searchTerm, dateFilter, tickets]);

  const handlePlay = (url: string, ticketId: string, callId: string) => {
    if (currentPlaying === url) {
      // Pause the current playing audio
      audioRef.current?.pause();

      // Update play tracking when paused
      if (audioRef.current) {
        const currentTime = audioRef.current.currentTime;
        const duration = audioRef.current.duration;

        setPlayTracking(prev => {
          const trackingData = prev[url] || { startTime: Date.now(), playedDuration: 0, status: 'not-played' };
          const newPlayedDuration = trackingData.playedDuration +
            (currentPlaying === url ? (Date.now() - trackingData.startTime) / 1000 : 0);

          let status: 'not-played' | 'partially-played' | 'played' = 'not-played';
          if (newPlayedDuration > 0) {
            status = currentTime >= duration * 0.95 ? 'played' : 'partially-played';
          }

          return {
            ...prev,
            [url]: {
              ...trackingData,
              playedDuration: newPlayedDuration,
              status
            }
          };
        });

        updateTicketPlayStatus(ticketId, callId, url);
      }

      setCurrentPlaying(null);
    } else {
      if (audioRef.current) {
        // If another recording was playing, update its tracking first
        if (currentPlaying) {
          const currentTime = audioRef.current.currentTime;
          const duration = audioRef.current.duration;

          setPlayTracking(prev => {
            const trackingData = prev[currentPlaying] || { startTime: Date.now(), playedDuration: 0, status: 'not-played' };
            const newPlayedDuration = trackingData.playedDuration +
              (Date.now() - trackingData.startTime) / 1000;

            // Determine play status
            let status: 'not-played' | 'partially-played' | 'played' = 'not-played';
            if (newPlayedDuration > 0) {
              status = currentTime >= duration * 0.95 ? 'played' : 'partially-played';
            }

            return {
              ...prev,
              [currentPlaying]: {
                ...trackingData,
                playedDuration: newPlayedDuration,
                status
              }
            };
          });

          // Find the ticket and recording for the current playing
          const currentTicket = tickets.find(ticket =>
            ticket.recordings.some(rec => rec.recordingUrl === currentPlaying)
          );

          if (currentTicket) {
            const currentRecording = currentTicket.recordings.find(rec =>
              rec.recordingUrl === currentPlaying
            );

            if (currentRecording) {
              updateTicketPlayStatus(currentTicket.ticketId, currentRecording.callId, currentPlaying);
            }
          }
        }

        // Start playing the new recording
        audioRef.current.src = url;
        audioRef.current.play();

        // Initialize tracking for the new recording
        setPlayTracking(prev => ({
          ...prev,
          [url]: {
            startTime: Date.now(),
            playedDuration: prev[url]?.playedDuration || 0,
            status: prev[url]?.status || 'not-played'
          }
        }));

        setCurrentPlaying(url);
      }
    }
  };


  const updateTicketPlayStatus = async (ticketId: string, callId: string, url: string) => {
    const trackingData = playTracking[url];
    if (!trackingData) return;

    try {
      // Find current status before updating
      const currentTicket = tickets.find(ticket => ticket._id === ticketId);
      const currentRecording = currentTicket?.recordings.find(rec => rec.callId === callId);

      // Only proceed if status should be updated
      if (!shouldUpdateStatus(currentRecording?.playStatus, trackingData.status)) {
        return;
      }
      setTickets(prevTickets =>
        prevTickets.map(ticket => {
          if (ticket._id === ticketId) {
            return {
              ...ticket,
              recordings: ticket.recordings.map(recording => {
                if (recording.callId === callId) {
                  // Only update if not already fully played
                  if (recording.playStatus !== 'played') {
                    return {
                      ...recording,
                      playStatus: trackingData.status,
                      playedDuration: trackingData.playedDuration
                    };
                  }
                  return recording;
                }
                return recording;
              })
            };
          }
          return ticket;
        })
      );

      const { error } = await updatePlayStatus(endPoints.UPDATE_STATUS, {
        ticketId: ticketId,
        callId,
        playStatus: trackingData.status
      });

      if (error) {
        console.error("Failed to update play status:", error);
      }

      console.log('Recording play data:', {
        ticketId,
        callId,
        playStatus: trackingData.status,
      });

    } catch (error) {
      console.error("Error updating play status:", error);
      // toast.error("Failed to update play status");
    }
  };

  const handleAudioEnded = async () => {
    if (currentPlaying) {
      setPlayTracking(prev => ({
        ...prev,
        [currentPlaying]: {
          ...prev[currentPlaying],
          status: 'played'
        }
      }));

      const currentTicket = tickets.find(ticket =>
        ticket.recordings.some(rec => rec.recordingUrl === currentPlaying)
      );

      if (currentTicket) {
        const currentRecording = currentTicket.recordings.find(rec =>
          rec.recordingUrl === currentPlaying
        );

        if (currentRecording) {
          try {
            const { error } = await updatePlayStatus(endPoints.UPDATE_STATUS, {
              ticketId: currentTicket._id,
              callId: currentRecording.callId,
              playStatus: 'played'
            });

            if (error) {
              console.error("Failed to update play status:", error);
              // toast.error("Failed to save play status");
            }

            setTickets(prevTickets =>
              prevTickets.map(ticket => {
                if (ticket._id === currentTicket._id) { // Changed from ticketId to _id
                  return {
                    ...ticket,
                    recordings: ticket.recordings.map(recording => {
                      if (recording.callId === currentRecording.callId) {
                        return {
                          ...recording,
                          playStatus: 'played',
                          playedDuration: recording.duration || 0
                        };
                      }
                      return recording;
                    })
                  };
                }
                return ticket;
              })
            );
          } catch (error) {
            console.error("Error updating play status:", error);
            // toast.error("Failed to update play status");
          }
        }
      }

      setCurrentPlaying(null);
    }
  };

  // Log all play data when component unmounts
  useEffect(() => {
    return () => {
      console.log('All recordings play data:',
        tickets.map(ticket => ({
          ticketId: ticket.ticketId,
          recordings: ticket.recordings.map(rec => ({
            callId: rec.callId,
            url: rec.recordingUrl,
            playStatus: rec.playStatus,
            playedDuration: rec.playedDuration,
            totalDuration: rec.duration
          }))
        }))
      );
    };
  }, [tickets]);

  return (
    <div className="bg-gray-50 min-h-screen px-4 py-6">
      <h1 className="text-xl font-semibold mb-6">Recordings</h1>

      <div className="flex flex-col space-y-4 mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="relative w-full md:max-w-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Recording by Subject, Ticket"
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <span className="text-sm text-gray-600">Filter by Date</span>
              <div className="relative inline-block">
                <div
                  className="flex items-center border border-gray-300 rounded-md px-4 py-2 bg-white cursor-pointer"
                  onClick={() => setShowDatePicker(!showDatePicker)}
                >
                  <svg className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm">{dateFilter ? formatDate(dateFilter) : 'Select Date'}</span>
                  <svg className="h-5 w-5 text-gray-500 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                {showDatePicker && (
                  <div className="absolute z-10 mt-1 bg-white border border-gray-300 rounded-md shadow-lg right-0 w-full sm:w-auto">
                    <input
                      type="date"
                      className="p-2 border-none"
                      onChange={(e) => {
                        setDateFilter(e.target.value);
                        setShowDatePicker(false);
                      }}
                    />
                    {dateFilter && (
                      <div className="p-2 border-t flex justify-between">
                        <button
                          className="text-sm text-blue-500"
                          onClick={() => setDateFilter('')}
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="relative inline-block w-full sm:w-auto">
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
            <NoRecords parentHeight='400px' text='No Recordings found' />
          ) : (
            // <div className="overflow-x-auto relative"> {/* Add this wrapper */}
            <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
              <table className="w-full text-sm text-left">
                <thead className="bg-[#F9F9F9] ">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500  tracking-wider">
                      Ticket ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500  tracking-wider">
                      Subject
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                      Played by
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                      Priority
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                      Open Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                      Recordings
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-[#F9F9F9]'>
                  {filteredTickets.map((ticket) => (
                    <tr key={ticket._id} className="bg-gray-100 bg-opacity-70">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold">
                        {ticket.ticketId}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold truncate max-w-xs">
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
                              {ticket.recordings[0].playedBy}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-semibold">
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-semibold text-sm text-gray-900">
                        {formatDate(ticket.openingDate)}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        {ticket.recordings[0] && (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handlePlay(
                                ticket.recordings[0].recordingUrl,
                                ticket._id,
                                ticket.recordings[0].callId
                              )}
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
                            <span className='font-light'>{(ticket.recordings[0].duration)}</span>
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex items-center space-x-2">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${ticket.recordings[0]?.playStatus === 'played' ? 'bg-[#54B86D] bg-opacity-40 text-gray-800' :
                            ticket.recordings[0]?.playStatus === 'partially-played' ? 'bg-[#D29B6B] bg-opacity-40 text-gray-800' :
                              'bg-[#E3452A] bg-opacity-40 text-gray-800'}`}>
                          {ticket.recordings[0]?.playStatus === 'played' ? 'Played' :
                            ticket.recordings[0]?.playStatus === 'partially-played' ? 'Partially Played' :
                              'Not Played'}
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

            </div>
          )}

          <audio
            ref={audioRef}
            onEnded={handleAudioEnded}
            onTimeUpdate={() => {
              if (currentPlaying && audioRef.current) {
                const currentTime = audioRef.current.currentTime;
                const duration = audioRef.current.duration;

                // Find current ticket and recording
                const currentTicket = tickets.find(ticket =>
                  ticket.recordings.some(rec => rec.recordingUrl === currentPlaying)
                );
                const currentRecording = currentTicket?.recordings.find(
                  rec => rec.recordingUrl === currentPlaying
                );

                // Get existing status
                const existingStatus = currentRecording?.playStatus || 'not-played';

                // Only update if not already fully played
                if (existingStatus !== 'played') {
                  let newStatus: 'not-played' | 'partially-played' | 'played';

                  if (currentTime >= duration * 0.95) {
                    newStatus = 'played';
                  } else if (currentTime > 0) {
                    // If already partially played, maintain that status
                    newStatus = existingStatus === 'partially-played' ?
                      'partially-played' :
                      currentTime > 0 ? 'partially-played' : 'not-played';
                  } else {
                    // Maintain existing status if no progress
                    newStatus = existingStatus;
                  }

                  // Only update if status would improve
                  const statusHierarchy = {
                    'not-played': 0,
                    'partially-played': 1,
                    'played': 2
                  };

                  if (statusHierarchy[newStatus] >= statusHierarchy[existingStatus]) {
                    setPlayTracking(prev => ({
                      ...prev,
                      [currentPlaying]: {
                        ...prev[currentPlaying],
                        status: newStatus
                      }
                    }));

                    // Update ticket status if needed
                    if (currentTicket && currentRecording && newStatus !== existingStatus) {
                      updateTicketPlayStatus(currentTicket._id, currentRecording.callId, currentPlaying);
                    }
                  }
                }
              }
            }}
            className="hidden"
          />

          <RecordingsModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedTicket(null);
            }}
            recordings={selectedTicket?.recordings.slice(1).map(rec => ({
              ...rec,
              playStatus: rec.playStatus || 'not-played',
              playedBy: rec.playedBy
            })) || []}
            currentPlaying={currentPlaying}
            handlePlay={(url) => {
              if (selectedTicket) {
                const recording = selectedTicket.recordings.find(rec => rec.recordingUrl === url);
                if (recording) {
                  handlePlay(url, selectedTicket._id, recording.callId);
                }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Recordings;