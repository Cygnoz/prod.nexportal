import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ApiProvider } from "./context/ApiContext.tsx";
import { UserProvider } from "./context/UserContext.tsx";
import { ResponseProvider } from "./context/ResponseContext.tsx";
import { SocketProvider } from "./context/SocketContext.tsx";
import 'quill/dist/quill.snow.css';

createRoot(document.getElementById("root")!).render(
  <StrictMode>
      <UserProvider>
        <ApiProvider>
          <ResponseProvider>
          <SocketProvider>
            <App />
            </SocketProvider>
          </ResponseProvider>
        </ApiProvider>
      </UserProvider>
  </StrictMode>
);
