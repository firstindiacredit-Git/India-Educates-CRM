import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  withCredentials: true,
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 20000,
});

// Socket event listeners for connection status
socket.on("connect", () => {
  console.log("🟢 Socket connected");
});

socket.on("disconnect", () => {
  console.log("🔴 Socket disconnected");
});

socket.on("connect_error", (error) => {
  console.error("🚫 Socket connection error:", error);
  // Try to reconnect with polling if websocket fails
  if (socket.io.opts.transports.includes("websocket")) {
    console.log("⚡ Falling back to polling transport");
    socket.io.opts.transports = ["polling"];
  }
});

socket.on("reconnect", (attemptNumber) => {
  console.log("🔄 Socket reconnected after", attemptNumber, "attempts");
});

export const initializeSocket = (userId, userType) => {
  if (!socket.connected) {
    socket.connect();
  }
  if (socket.connected) {
    socket.emit("user_connected", { userId, userType });
  }
};

export default socket;
