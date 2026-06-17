import io from "socket.io-client";


const SOCKET_URL = "https://connectnow-backend-zjl4.onrender.com";

export const createSocketConnection = () => {
  return io(SOCKET_URL, {
    withCredentials: true,
    transports: ["websocket", "polling"],
  });
};
