
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthProvider";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [alerts, setAlerts] = useState([]); // ✅ ADD THIS BACK
  const [newAlert, setNewAlert] = useState(null); // ✅ ADD THIS BACK
  const socketRef = useRef(null);
  const { auth } = useAuth();

  // ✅ ADD THIS BACK - Clear new alert function
  const clearNewAlert = () => {
    setNewAlert(null);
  };

  // Determine backend URL and path based on environment
  const getSocketConfig = () => {
    if (import.meta.env.VITE_ENVIRONMENT === "production") {
      return {
        url: "http://18.221.174.173",
        path: "/rpm-be/socket.io",
      };
    } else {
      return {
        url: "http://localhost:4000",
        path: "/socket.io",
      };
    }
  };

  useEffect(() => {
    const config = getSocketConfig();
    console.log("=== SOCKET INITIALIZATION ===");
    console.log("🌐 Environment:", import.meta.env.VITE_ENVIRONMENT);
    console.log("🔗 Backend URL:", config.url);
    console.log("🛣️ Socket Path:", config.path);
    console.log("👤 User ID:", auth?.user?.id);
    console.log("🔐 Authenticated:", auth?.isAuthenticated);

    if (!auth?.isAuthenticated || !auth?.user?.id) {
      console.log("⏸️ Skipping socket - no user");
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
        setAlerts([]); // ✅ CLEAR ALERTS ON LOGOUT
        setNewAlert(null);
      }
      return;
    }

    if (socketRef.current?.connected) {
      console.log("🔗 Socket already connected");
      return;
    }

    console.log(`🔌 Creating new socket connection to ${config.url}...`);

    try {
      const newSocket = io(config.url, {
        path: config.path,
        transports: ["websocket", "polling"],
        withCredentials: true,
        timeout: 10000,
        forceNew: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        autoConnect: true,
        query: {
          userId: auth.user.id,
          role: auth.user.role,
        },
      });

      socketRef.current = newSocket;

      // Event Handlers
      newSocket.on("connect", () => {
        console.log(`✅ SOCKET CONNECTED to ${config.url}!`);
        console.log("🔗 Socket ID:", newSocket.id);
        console.log("📡 Transport:", newSocket.io.engine.transport.name);
        setIsConnected(true);
        setConnectionError(null);
      });

      newSocket.on("connection_success", (data) => {
        console.log("🎉 Server connection confirmation:", data);
      });

      // ✅ CRITICAL: ADD ALERT HANDLERS BACK
      newSocket.on("new_alert", (data) => {
        console.log("🚨 NEW ALERT RECEIVED:", data);
        setNewAlert(data);
        setAlerts((prev) => [data, ...prev.slice(0, 49)]); // Keep last 50 alerts
      });

      newSocket.on("new_alert_broadcast", (data) => {
        console.log("📢 BROADCAST ALERT RECEIVED:", data);
        setNewAlert(data);
        setAlerts((prev) => [data, ...prev.slice(0, 49)]);
      });

      newSocket.on("new_message", (messageData) => {
        console.log("📨 New message received in context:", messageData);
      });

      newSocket.on("connect_error", (error) => {
        console.error("❌ CONNECTION ERROR:", error);
        console.log("🔍 Error type:", error.type);
        console.log("🔍 Error message:", error.message);

        setConnectionError({
          message: error.message,
          type: error.type,
          url: config.url,
          path: config.path,
          timestamp: new Date().toISOString(),
        });
        setIsConnected(false);
      });

      newSocket.on("disconnect", (reason) => {
        console.log("❌ DISCONNECTED:", reason);
        setIsConnected(false);
      });

      newSocket.on("reconnect", (attemptNumber) => {
        console.log(`🔄 Reconnected after ${attemptNumber} attempts`);
        setIsConnected(true);
        setConnectionError(null);
      });

      newSocket.on("reconnect_error", (error) => {
        console.error("❌ Reconnection error:", error);
      });

      newSocket.on("reconnect_failed", () => {
        console.error("❌ Reconnection failed after all attempts");
      });

      newSocket.on("test_connection", (data) => {
        console.log("📨 Test connection from server:", data);
      });

      newSocket.on("test_response", (data) => {
        console.log("📨 Test response from server:", data);
      });

      newSocket.on("room_joined", (data) => {
        console.log("🚪 Room joined confirmation:", data);
      });

      setSocket(newSocket);
    } catch (error) {
      console.error("💥 Failed to create socket instance:", error);
      setConnectionError({
        message: "Failed to initialize socket connection",
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }

    return () => {
      console.log("🧹 Cleaning up socket...");
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setAlerts([]); // ✅ CLEANUP ALERTS
        setNewAlert(null);
      }
    };
  }, [auth?.isAuthenticated, auth?.user?.id]);

  // Test connection function
  const testConnection = () => {
    if (socketRef.current?.connected) {
      console.log("📤 Sending test message...");
      socketRef.current.emit("test_message", {
        message: "Hello from client!",
        userId: auth?.user?.id,
        timestamp: new Date().toISOString(),
      });
    } else {
      console.log("❌ Cannot test - socket not connected");
    }
  };

  // Join room function
  const joinRoom = (roomId) => {
    if (socketRef.current?.connected) {
      console.log(`🚪 Joining room: ${roomId}`);
      socketRef.current.emit("join_room", roomId);
    } else {
      console.log("❌ Cannot join room - socket not connected");
    }
  };

  // Send message function
  const sendMessage = (receiverId, message) => {
    if (socketRef.current?.connected) {
      console.log("📤 Sending message to:", receiverId);
      socketRef.current.emit("send_message", {
        receiverId,
        message,
        senderId: auth?.user?.id,
        timestamp: new Date().toISOString(),
      });
    } else {
      console.log("❌ Cannot send message - socket not connected");
    }
  };

  // Manual reconnect
  const reconnect = () => {
    if (socketRef.current) {
      console.log("🔄 Manual reconnection attempted");
      socketRef.current.disconnect();
      setTimeout(() => {
        socketRef.current.connect();
      }, 500);
    }
  };

  // Get connection status
  const getConnectionStatus = () => {
    return {
      isConnected,
      socketId: socketRef.current?.id,
      transport: socketRef.current?.io?.engine?.transport?.name,
      userId: auth?.user?.id,
      url: getSocketConfig().url,
      path: getSocketConfig().path,
    };
  };

  // ✅ CRITICAL: INCLUDE alerts AND newAlert IN CONTEXT VALUE
  const value = {
    socket: socketRef.current,
    isConnected,
    connectionError,
    alerts, // ✅ ADD THIS BACK
    newAlert, // ✅ ADD THIS BACK
    clearNewAlert, // ✅ ADD THIS BACK
    testConnection,
    joinRoom,
    sendMessage,
    reconnect,
    getConnectionStatus,
    userId: auth?.user?.id,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within SocketProvider");
  }
  return context;
};
