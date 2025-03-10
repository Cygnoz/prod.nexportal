import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
// import { useUser } from "./UserContext";

// Ensure environment variable is loaded
const CLIENT_SOCKET_URL = import.meta.env.VITE_REACT_APP_TICKETS;

if (!CLIENT_SOCKET_URL) {
  console.error("CLIENT_SOCKET_URL is not defined in the environment variables.");
}
export const socket: Socket = io(CLIENT_SOCKET_URL, {
  transports: ["websocket", "polling"],
  withCredentials: true,
});
// Create the socket instance
// export const socket: Socket = io(CLIENT_SOCKET_URL);

// Create Context
const SocketContext = createContext<{
  socket: Socket;
  notification: number;
  setNotification:React.Dispatch<React.SetStateAction<number>>;
}>({
  socket,
  notification: 0,
  setNotification: () => {},
});

// Socket Provider Component
export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [notification, setNotification] = useState<number>(0);


  useEffect(() => {
    socket.connect()
    return () => {
      socket.disconnect();
    };
  }, []); // Dependency added

  return (
    <SocketContext.Provider value={{ socket, notification, setNotification }}>
      {children}
    </SocketContext.Provider>
  );
};

// Custom Hook
export const useSocket = () => useContext(SocketContext);
