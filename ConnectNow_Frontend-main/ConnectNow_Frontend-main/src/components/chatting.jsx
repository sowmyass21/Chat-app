import { useParams, useNavigate } from "react-router-dom";
import { MdSend, MdArrowBack, MdMoreVert, MdSearch } from "react-icons/md";
import { useEffect, useState, useRef, useMemo } from "react";
import { createSocketConnection } from "../utils/socket";
import { useDispatch, useSelector } from "react-redux";
import { addConnections } from "../utils/connectionSlice";
import {
  setLastOpenedChatId,
  upsertLastMessage,
  markAsRead,
  setLoadingConnections,
} from "../utils/chatSlice";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { motion, AnimatePresence } from "framer-motion";

const Chatting = () => {
  const { targetUserId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline] = useState(true); 
  const user = useSelector((store) => store.user);
  const connections = useSelector((store) => store.connection);
  const safeConnections = useMemo(() => connections || [], [connections]);
  const dispatch = useDispatch();
  const [search, setSearch] = useState("");
  const chatState = useSelector((store) => store.chat);
  const isLoadingConnections = chatState?.loadingConnections;
  const messagesMeta = chatState?.messagesMeta || {};
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(() => new Set());
  const userId = user?._id;

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!userId) return;

    socketRef.current = createSocketConnection();
    const socket = socketRef.current;

    socket.emit("joinChat", { userId, targetUserId });

    socket.on("messageReceived", ({ firstName, text }) => {
      const timestamp = new Date().toISOString();
      setMessages((prevMessages) => [
        ...prevMessages,
        { firstName, text, timestamp },
      ]);

      const isIncoming = firstName !== user.firstName;
      dispatch(
        upsertLastMessage({
          chatId: targetUserId,
          lastMessage: text,
          timestamp,
          incrementUnread: isIncoming,
        })
      );
      setIsTyping(false);
    });

    socket.on("userTyping", () => {
      setIsTyping(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000);
    });

    // Presence: announce and listen (requires backend support)
    socket.emit("announceOnline", { userId });
    socket.on("userOnline", ({ userId: uid }) => {
      setOnlineUsers((prev) => new Set(prev).add(uid));
    });
    socket.on("userOffline", ({ userId: uid }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        next.delete(uid);
        return next;
      });
    });

    return () => {
      socket.disconnect();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [userId, targetUserId, dispatch, user?.firstName]);

 
  useEffect(() => {
    const fetchConnections = async () => {
      if (!userId) return;
      if (safeConnections && safeConnections.length > 0) return;
      try {
        dispatch(setLoadingConnections(true));
        const res = await axios.get(`${BASE_URL}/user/connections`, {
          withCredentials: true,
        });
        if (Array.isArray(res.data?.Data)) {
          dispatch(addConnections(res.data.Data));
        }
      } catch (e) {
        console.error("Failed to load connections for chat sidebar", e);
      } finally {
        dispatch(setLoadingConnections(false));
      }
    };
    fetchConnections();
  }, [userId, safeConnections, dispatch]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    socketRef.current.emit("sendMessage", {
      firstName: user.firstName,
      userId,
      targetUserId,
      text: newMessage,
    });
    setNewMessage("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const filteredConnections = safeConnections.filter((c) => {
    const name = `${c?.firstName || ""} ${c?.lastName || ""}`.toLowerCase();
    return name.includes(search.toLowerCase());
  });

  const activeUser = safeConnections.find((c) => c?._id === targetUserId);

  useEffect(() => {
    if (targetUserId) {
      dispatch(setLastOpenedChatId(targetUserId));
      dispatch(markAsRead(targetUserId));
    }
  }, [targetUserId, dispatch]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="h-screen max-w-6xl mx-auto px-4 py-6">
        <div className="h-full w-full rounded-2xl overflow-hidden bg-white/50 backdrop-blur-xl border border-white/30 shadow-xl flex">
          <aside className="hidden md:flex w-80 flex-col border-r border-white/30 bg-white/40 backdrop-blur-md">
            <div className="px-4 py-3 border-b border-white/30 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800">Chats</h3>
              <span className="text-[10px] text-slate-500 bg-white/60 border border-white/40 rounded-full px-2 py-0.5">
                {connections?.length || 0}
              </span>
            </div>
            <div className="p-3">
              <div className="relative">
                <MdSearch
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search chats"
                  className="w-full pl-9 pr-3 py-2.5 bg-white/70 border border-white/40 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {isLoadingConnections ? (
                <ul className="p-3 space-y-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <li key={i} className="animate-pulse">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full bg-slate-200" />
                        <div className="flex-1">
                          <div className="h-3 bg-slate-200 rounded w-1/2 mb-2" />
                          <div className="h-2 bg-slate-200 rounded w-1/3" />
                        </div>
                        <div className="w-6 h-4 bg-slate-200 rounded-full" />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : filteredConnections.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm px-4 text-center">
                  No connections yet
                </div>
              ) : (
                <ul className="py-2">
                  {filteredConnections.map((c) => {
                    const isActive = c?._id === targetUserId;
                    const meta = messagesMeta[c?._id];
                    const online = onlineUsers.has(c?._id);
                    return (
                      <li key={c?._id}>
                        <button
                          onClick={() => navigate(`/chat/${c?._id}`)}
                          className={`w-full text-left px-3 py-2.5 flex items-center space-x-3 hover:bg-white/60 transition-colors ${
                            isActive ? "bg-white/70" : ""
                          }`}
                        >
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-blue-700 text-white flex items-center justify-center text-xs font-semibold">
                            {(c?.firstName?.[0] || "?").toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-slate-800 truncate">
                              {c?.firstName} {c?.lastName}
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                              {meta?.lastMessage || "Tap to chat"}
                            </p>
                          </div>
                          <div className="flex flex-col items-end ml-2">
                            <div className="flex items-center space-x-1">
                              {online && (
                                <span className="w-2 h-2 bg-accent rounded-full" />
                              )}
                              {meta?.timestamp && (
                                <span className="text-[10px] text-slate-400">
                                  {new Date(meta.timestamp).toLocaleTimeString(
                                    [],
                                    {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    }
                                  )}
                                </span>
                              )}
                            </div>
                            {meta?.unreadCount > 0 && (
                              <span className="mt-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-primary text-white rounded-full text-[10px] font-semibold">
                                {meta.unreadCount}
                              </span>
                            )}
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </aside>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            <div className="bg-white/60 backdrop-blur-xl border-b border-white/30">
              <div className="flex items-center justify-between px-4 md:px-6 py-3">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setIsDrawerOpen(true)}
                    className="md:hidden p-2 hover:bg-white/60 rounded-full transition-colors border border-white/30"
                    aria-label="Open chat list"
                  >
                    <MdArrowBack
                      size={24}
                      className="rotate-180 text-slate-600"
                    />
                  </button>
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-primary to-blue-700 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                        {(
                          activeUser?.firstName?.[0] ||
                          user?.firstName?.[0] ||
                          "U"
                        ).toUpperCase()}
                      </div>
                      {isOnline && (
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-accent rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">
                        {activeUser
                          ? `${activeUser.firstName} ${
                              activeUser.lastName || ""
                            }`
                          : "Chat Conversation"}
                      </h2>
                      <p className="text-sm text-slate-500 flex items-center">
                        {isOnline ? (
                          <>
                            <span className="w-2 h-2 bg-accent rounded-full mr-2 animate-pulse"></span>
                            Active now
                          </>
                        ) : (
                          "Offline"
                        )}
                      </p>
                    </div>
                  </div>
                </div>
                <button className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <MdMoreVert size={24} className="text-slate-600" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 bg-gradient-to-br from-white/40 to-white/20">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                  >
                    <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <svg
                        className="w-10 h-10 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        ></path>
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      No messages yet
                    </h3>
                    <p className="text-slate-500 max-w-sm">
                      Start the conversation by sending a message below
                    </p>
                  </motion.div>
                </div>
              ) : (
                <div className="space-y-4 max-w-4xl mx-auto">
                  <AnimatePresence>
                    {messages.map((msg, index) => {
                      const isOwnMessage = msg.firstName === user.firstName;
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                          className={`flex ${
                            isOwnMessage ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`flex items-end space-x-2 max-w-lg ${
                              isOwnMessage
                                ? "flex-row-reverse space-x-reverse"
                                : ""
                            }`}
                          >
                            {/* Avatar */}
                            {!isOwnMessage && (
                              <div className="w-8 h-8 bg-gradient-to-br from-slate-300 to-slate-400 rounded-full flex items-center justify-center text-white text-sm font-medium mb-1">
                                {msg.firstName?.[0]?.toUpperCase() || "?"}
                              </div>
                            )}

                            {/* Message Bubble */}
                            <div className="flex flex-col">
                              <div
                                className={`px-4 py-3 rounded-2xl shadow-sm ${
                                  isOwnMessage
                                    ? "bg-gradient-to-br from-primary to-blue-700 text-white rounded-br-sm"
                                    : "bg-white text-slate-800 border border-slate-200 rounded-bl-sm"
                                }`}
                              >
                                {!isOwnMessage && (
                                  <p className="text-xs font-semibold mb-1 opacity-70">
                                    {msg.firstName}
                                  </p>
                                )}
                                <p className="text-sm leading-relaxed break-words">
                                  {msg.text}
                                </p>
                              </div>
                              <span
                                className={`text-xs text-slate-400 mt-1 px-2 ${
                                  isOwnMessage ? "text-right" : "text-left"
                                }`}
                              >
                                {formatTime(msg.timestamp)}
                              </span>
                            </div>

                            {/* Avatar for own messages */}
                            {isOwnMessage && (
                              <div className="w-8 h-8 bg-gradient-to-br from-primary to-blue-700 rounded-full flex items-center justify-center text-white text-sm font-medium mb-1">
                                {msg.firstName?.[0]?.toUpperCase() || "?"}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </div>
              )}

              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center space-x-2 text-slate-500 text-sm mt-2"
                >
                  <div className="flex space-x-1 px-4 py-2 bg-white rounded-full shadow-sm border border-slate-200">
                    <div
                      className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Modern Input Area (glassy) */}
            <div className="bg-white/60 backdrop-blur-xl border-t border-white/30 px-4 md:px-6 py-4">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-end space-x-3">
                  <div className="flex-1 relative">
                    <textarea
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      rows={1}
                      className="w-full px-4 py-3 pr-12 border border-white/40 bg-white/70 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder-slate-400 resize-none transition-all shadow-sm hover:border-white/60"
                      style={{
                        minHeight: "48px",
                        maxHeight: "120px",
                      }}
                    />
                    <div className="absolute right-3 bottom-3 text-xs text-slate-500">
                      {newMessage.length > 0 && (
                        <span>{newMessage.length}</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="bg-gradient-to-br from-primary to-blue-700 hover:from-blue-700 hover:to-primary text-white p-4 rounded-2xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md transform active:scale-95"
                  >
                    <MdSend size={22} />
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-2 text-center">
                  Press{" "}
                  <kbd className="px-2 py-0.5 bg-slate-100 border border-slate-300 rounded text-slate-600 font-mono">
                    Enter
                  </kbd>{" "}
                  to send •{" "}
                  <kbd className="px-2 py-0.5 bg-slate-100 border border-slate-300 rounded text-slate-600 font-mono">
                    Shift+Enter
                  </kbd>{" "}
                  for new line
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Mobile Drawer for chat list */}
        <AnimatePresence>
          {isDrawerOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm md:hidden"
              onClick={() => setIsDrawerOpen(false)}
            >
              <motion.div
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                transition={{ type: "spring", stiffness: 260, damping: 24 }}
                className="absolute left-0 top-0 bottom-0 w-80 bg-white/80 backdrop-blur-xl border-r border-white/30 shadow-2xl p-3"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between px-1 py-2 border-b border-white/30">
                  <h3 className="text-sm font-semibold text-slate-800">
                    Chats
                  </h3>
                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    className="text-slate-600 text-sm px-2 py-1 rounded hover:bg-white/70"
                  >
                    Close
                  </button>
                </div>
                <div className="mt-3">
                  <div className="relative">
                    <MdSearch
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      size={18}
                    />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search chats"
                      className="w-full pl-9 pr-3 py-2.5 bg-white/70 border border-white/40 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                <div className="mt-2 overflow-y-auto h-[calc(100%-90px)]">
                  <ul className="py-2">
                    {filteredConnections.map((c) => {
                      const isActive = c?._id === targetUserId;
                      const meta = messagesMeta[c?._id];
                      return (
                        <li key={c?._id}>
                          <button
                            onClick={() => {
                              setIsDrawerOpen(false);
                              navigate(`/chat/${c?._id}`);
                            }}
                            className={`w-full text-left px-3 py-2.5 flex items-center space-x-3 hover:bg-white/60 transition-colors ${
                              isActive ? "bg-white/70" : ""
                            }`}
                          >
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-blue-700 text-white flex items-center justify-center text-xs font-semibold">
                              {(c?.firstName?.[0] || "?").toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-slate-800 truncate">
                                {c?.firstName} {c?.lastName}
                              </p>
                              <p className="text-xs text-slate-500 truncate">
                                {meta?.lastMessage || "Tap to chat"}
                              </p>
                            </div>
                            {meta?.unreadCount > 0 && (
                              <span className="mt-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-primary text-white rounded-full text-[10px] font-semibold">
                                {meta.unreadCount}
                              </span>
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Chatting;
