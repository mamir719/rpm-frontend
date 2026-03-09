import React, { useState, useEffect, useRef, useContext } from "react";
import axios from "axios";
import { useSocket } from "../context/SocketContext";
import { AuthContext } from "../context/AuthProvider";
import { Search, Send, UserRound, ArrowLeft, MessageSquare } from "lucide-react";

const API_BASE = import.meta.env.VITE_BACKEND_API || "http://localhost:4000";

const PatientChat = () => {
  const { auth } = useContext(AuthContext);
  const { socket, isConnected, joinRoom } = useSocket();
  const [clinicians, setClinicians] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const currentUser = auth?.user;

  useEffect(() => {
    fetchClinicians();
  }, []);

  useEffect(() => {
    if (socket && selectedDoc) {
      // Listen for incoming messages
      socket.on("new_message", (message) => {
        // Only add if message belongs to current conversation
        const receivedSenderId = String(message.senderId || message.sender_id);
        const receivedReceiverId = String(message.receiverId || message.receiver_id);
        const currentDocId = String(selectedDoc.id);
        const myId = String(currentUser?.id);

        if (
          (receivedSenderId === currentDocId && receivedReceiverId === myId) ||
          (receivedSenderId === myId && receivedReceiverId === currentDocId)
        ) {
          setMessages((prev) => {
            // Robust duplicate check
            const isDuplicate = prev.some((m) => {
              // Priority 1: ID check
              if (m.id && message.id && m.id === message.id) return true;
              
              // Priority 2: Content + Timestamp + Sender check (for safety)
              return (
                m.message === message.message &&
                String(m.senderId || m.sender_id) === String(message.senderId || message.sender_id) &&
                new Date(m.created_at).getTime() === new Date(message.created_at).getTime()
              );
            });

            if (isDuplicate) return prev;
            return [...prev, message];
          });
          scrollToBottom();
        }
      });

      return () => {
        socket.off("new_message");
      };
    }
  }, [socket, selectedDoc]);

  const fetchClinicians = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/messages/clinicians`, {
        withCredentials: true,
      });
      if (res.data.success) {
        setClinicians(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch clinicians:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadConversation = async (docId) => {
    try {
      const res = await axios.get(`${API_BASE}/api/messages/conversation/${docId}`, {
        withCredentials: true,
      });
      if (res.data.success) {
        setMessages(res.data.data);
        scrollToBottom();
      }
    } catch (err) {
      console.error("Failed to load conversation:", err);
    }
  };

  const handleSelectDoc = (doc) => {
    setSelectedDoc(doc);
    loadConversation(doc.id);
    if (isConnected && doc.id) {
      joinRoom(doc.id);
    }
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || !selectedDoc) return;

    try {
      // Send to API API emits via socket
      const { data } = await axios.post(
        `${API_BASE}/api/messages/send`,
        { receiverId: selectedDoc.id, message: newMessage },
        { withCredentials: true }
      );
      setNewMessage("");
      // Append the newly created message to our state immediately for snappier UI
      // ONLY if it hasn't been added by the socket yet
      if (data?.success && data?.data) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.data.id)) return prev;
          return [...prev, data.data];
        });
        scrollToBottom();
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const formatMessageTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
    </div>
  );

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 h-[calc(100vh-8rem)] flex overflow-hidden">
      
      {/* Sidebar - Clinicians List */}
      <div className={`${selectedDoc ? 'hidden md:flex' : 'flex'} w-full md:w-80 flex-col border-r border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50`}>
        <div className="p-4 border-b border-gray-100 dark:border-slate-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">My Doctors</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search doctors..."
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2">
          {clinicians.length === 0 ? (
            <p className="text-center text-gray-500 py-6 text-sm">No assigned doctors found.</p>
          ) : (
            clinicians.map((doc) => (
              <button
                key={doc.id}
                onClick={() => handleSelectDoc(doc)}
                className={`w-full text-left flex items-center gap-3 p-3 rounded-2xl transition-all ${
                  selectedDoc?.id === doc.id
                    ? "bg-primary/10 dark:bg-primary/30 text-primary dark:text-blue-400"
                    : "hover:bg-gray-100 dark:hover:bg-slate-700/50 text-gray-700 dark:text-gray-300"
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 dark:bg-primary/20 border border-primary/30 flex items-center justify-center text-primary dark:text-blue-400 font-bold shrink-0">
                  {doc.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold truncate">Dr. {doc.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Clinician</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`${!selectedDoc ? 'hidden md:flex' : 'flex'} flex-1 flex-col bg-white dark:bg-slate-800`}>
        {selectedDoc ? (
          <>
            {/* Chat Header */}
            <div className="h-16 border-b border-gray-100 dark:border-slate-700 flex items-center px-4 md:px-6 gap-4">
              <button 
                onClick={() => setSelectedDoc(null)}
                className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-full"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="w-10 h-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary dark:text-blue-400 font-bold">
                {selectedDoc.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-gray-800 dark:text-white">Dr. {selectedDoc.name}</h3>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-gray-50/30 dark:bg-slate-900/10">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-3">
                  <UserRound size={48} className="opacity-20" />
                  <p>Send a message to start the conversation</p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const msgSenderId = msg.senderId || msg.sender_id;
                  const isMe = String(msgSenderId) === String(currentUser?.id);
                  return (
                    <div
                      key={msg.id || index}
                      className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-5 py-3 shadow-sm ${
                          isMe
                            ? "bg-primary text-white rounded-tr-sm"
                            : "bg-white dark:bg-slate-700 text-gray-800 dark:text-white border border-gray-100 dark:border-slate-600 rounded-tl-sm"
                        }`}
                      >
                        <p className="text-sm md:text-base">{msg.message}</p>
                        <p
                          className={`text-[10px] mt-1 text-right ${
                            isMe ? "text-blue-200" : "text-gray-400"
                          }`}
                        >
                          {msg.created_at ? formatMessageTime(msg.created_at) : "Just now"}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-4 bg-white dark:bg-slate-800 border-t border-gray-100 dark:border-slate-700">
              <form
                onSubmit={handleSendMessage}
                className="flex items-center gap-3 bg-gray-50 dark:bg-slate-900 p-2 rounded-full border border-gray-200 dark:border-slate-700"
              >
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-transparent border-none focus:ring-0 px-4 text-gray-800 dark:text-white outline-none"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-3 bg-primary hover:bg-blue-800 disabled:opacity-50 disabled:hover:bg-primary text-white rounded-full transition-colors flex shrink-0"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <MessageSquare size={64} className="opacity-20 mb-4" />
            <p className="text-lg font-medium">Select a doctor to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientChat;
