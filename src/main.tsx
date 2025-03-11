import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ApiProvider } from "./context/ApiContext.tsx";
import { UserProvider } from "./context/UserContext.tsx";
import { ResponseProvider } from "./context/ResponseContext.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SocketProvider } from "./context/SocketContext.tsx";
import 'quill/dist/quill.snow.css';
const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <ApiProvider>
          <ResponseProvider>
          <SocketProvider>
            <App />
            </SocketProvider>
          </ResponseProvider>
        </ApiProvider>
      </UserProvider>
    </QueryClientProvider>
  </StrictMode>
);
