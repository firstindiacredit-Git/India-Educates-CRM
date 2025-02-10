import { io } from "socket.io-client";

let socketInstance = null;

export const getSocket = () => {
  if (!socketInstance) {
    try {
      socketInstance = io(import.meta.env.VITE_SOCKET_URL, {
        transports: ["polling", "websocket"],
        secure: true,
        rejectUnauthorized: false,
        path: "/socket.io",
        withCredentials: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socketInstance.on("connect", () => {
        console.log("Socket connected:", socketInstance.id);
      });

      socketInstance.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
      });
    } catch (error) {
      console.error("Socket initialization error:", error);
    }
  }
  return socketInstance;
};

export default getSocket();
