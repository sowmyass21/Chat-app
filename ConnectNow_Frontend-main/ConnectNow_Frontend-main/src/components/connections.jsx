import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addConnections } from "../utils/connectionSlice";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const Connections = () => {
  const connectionsData = useSelector((store) => store.connection);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState("grid");
  const [loading, setLoading] = useState(true);
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [error, setError] = useState(null);

  // Filtered and sorted connections
  const filteredConnections = useMemo(() => {
    const connections = connectionsData || [];
    let filtered = connections.filter((connection) => {
      const fullName = `${connection?.firstName || ""} ${
        connection?.lastName || ""
      }`.toLowerCase();
      const about = (connection?.about || "").toLowerCase();
      const search = searchTerm.toLowerCase();
      return fullName.includes(search) || about.includes(search);
    });

    // Sort connections
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return (a?.firstName || "").localeCompare(b?.firstName || "");
        case "age":
          return (a?.age || 0) - (b?.age || 0);
        case "recent":
          return new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [connectionsData, searchTerm, sortBy]);

  useEffect(() => {
    const fetchConnections = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await axios.get(`${BASE_URL}/user/connections`, {
          withCredentials: true,
        });

        if (res.data?.Data) {
          dispatch(addConnections(res.data.Data));
        } else {
          console.warn("No connections found");
        }
      } catch (err) {
        console.error("Error fetching connections:", err);

        // Handle different error scenarios
        if (!err.response) {
          setError(
            "Unable to load connections. Please check your internet connection."
          );
        } else if (err.response.status === 401) {
          setError("Session expired. Please login again.");
        } else if (err.response.status === 404) {
          setError("No connections found.");
        } else if (err.response.status >= 500) {
          setError("Server error. Please try again later.");
        } else {
          setError(
            err.response?.data?.message ||
              "Failed to load connections. Please try again."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchConnections();
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            My Connections
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Build meaningful relationships with fellow developers, collaborate
            on projects, and grow your professional network
          </p>
          <div className="mt-6 flex items-center justify-center space-x-4 text-sm text-slate-500">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-accent rounded-full"></div>
              <span>
                {filteredConnections.length} Connection
                {filteredConnections.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="w-px h-4 bg-slate-300"></div>
            <div className="flex items-center space-x-2">
              <svg
                className="w-4 h-4 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                ></path>
              </svg>
              <span>Active Network</span>
            </div>
          </div>
        </motion.div>

        {/* Search and Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-6 items-center">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  ></path>
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search connections by name or expertise..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder-slate-400 transition-all"
              />
            </div>

            {/* Sort & View Controls */}
            <div className="flex items-center space-x-4">
              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all cursor-pointer"
                >
                  <option value="name">Sort by Name</option>
                  <option value="age">Sort by Age</option>
                  <option value="recent">Recently Added</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </div>
              </div>

              {/* View Mode Toggle */}
              <div className="flex bg-slate-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === "grid"
                      ? "bg-white text-primary shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    ></path>
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === "list"
                      ? "bg-white text-primary shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 10h16M4 14h16M4 18h16"
                    ></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
                <svg
                  className="w-8 h-8 text-primary animate-spin"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  ></path>
                </svg>
              </div>
              <p className="text-slate-500 text-lg">
                Loading your connections...
              </p>
            </div>
          </div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-red-50 rounded-full mx-auto mb-6 flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Failed to Load Connections
              </h3>
              <p className="text-slate-600 mb-6">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  ></path>
                </svg>
                Retry
              </button>
            </div>
          </motion.div>
        ) : filteredConnections.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-slate-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                {searchTerm ? (
                  <svg
                    className="w-12 h-12 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    ></path>
                  </svg>
                ) : (
                  <svg
                    className="w-12 h-12 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    ></path>
                  </svg>
                )}
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                {searchTerm ? "No matches found" : "No connections yet"}
              </h3>
              <p className="text-slate-500 mb-6">
                {searchTerm
                  ? `No connections match "${searchTerm}". Try adjusting your search terms.`
                  : "Start connecting with fellow developers to build your network and collaborate on exciting projects."}
              </p>
              {searchTerm ? (
                <button
                  onClick={() => setSearchTerm("")}
                  className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                  Clear Search
                </button>
              ) : (
                <button
                  onClick={() => navigate("/feed")}
                  className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    ></path>
                  </svg>
                  Find Developers
                </button>
              )}
            </div>
          </motion.div>
        ) : (
          <AnimatePresence>
            {viewMode === "grid" ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {filteredConnections.map((con, index) => {
                  const {
                    _id,
                    firstName,
                    lastName,
                    photoUrl,
                    age,
                    about,
                    skills,
                  } = con || {};
                  return (
                    <motion.div
                      key={_id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 group cursor-pointer"
                      onClick={() => setSelectedConnection(con)}
                    >
                      <div className="text-center">
                        {/* Profile Image */}
                        <div className="relative">
                          <div className="w-20 h-20 bg-slate-100 rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden ring-4 ring-white shadow-lg group-hover:scale-105 transition-transform">
                            {photoUrl ? (
                              <img
                                className="w-full h-full object-cover"
                                alt="User"
                                src={photoUrl}
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                            ) : (
                              <svg
                                className="w-10 h-10 text-slate-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                ></path>
                              </svg>
                            )}
                          </div>
                          {/* Online Status Indicator */}
                          <div className="absolute bottom-0 right-1/2 transform translate-x-1/2 translate-y-2">
                            <div className="w-4 h-4 bg-accent rounded-full border-2 border-white"></div>
                          </div>
                        </div>

                        {/* User Info */}
                        <h3 className="font-bold text-slate-900 mb-1 text-lg">
                          {firstName
                            ? `${firstName} ${lastName || ""}`
                            : "Unknown User"}
                        </h3>
                        {age && (
                          <p className="text-sm text-slate-500 mb-2 flex items-center justify-center">
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M8 7V3a4 4 0 118 0v4m-4 8v4m-4-4h8M8 7h8"
                              ></path>
                            </svg>
                            {age} years old
                          </p>
                        )}

                        {/* About */}
                        <p className="text-sm text-slate-600 mb-4 line-clamp-2 min-h-[2.5rem]">
                          {about ||
                            "Developer passionate about creating amazing software solutions."}
                        </p>

                        {/* Skills Tags */}
                        {skills && (
                          <div className="flex flex-wrap gap-1 justify-center mb-4">
                            {skills
                              .split(",")
                              .slice(0, 3)
                              .map((skill, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium"
                                >
                                  {skill.trim()}
                                </span>
                              ))}
                            {skills.split(",").length > 3 && (
                              <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                                +{skills.split(",").length - 3}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/chat/${_id}`);
                            }}
                            className="flex-1 bg-primary hover:bg-blue-700 text-white py-2.5 px-4 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2 group"
                          >
                            <svg
                              className="w-4 h-4 group-hover:scale-110 transition-transform"
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
                            <span>Message</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedConnection(con);
                            }}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-2.5 rounded-xl transition-colors"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              ></path>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {filteredConnections.map((con, index) => {
                  const {
                    _id,
                    firstName,
                    lastName,
                    photoUrl,
                    age,
                    about,
                    skills,
                  } = con || {};
                  return (
                    <motion.div
                      key={_id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-all duration-300 group"
                    >
                      <div className="flex items-center space-x-6">
                        {/* Profile Image */}
                        <div className="relative flex-shrink-0">
                          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center overflow-hidden ring-4 ring-white shadow-lg">
                            {photoUrl ? (
                              <img
                                className="w-full h-full object-cover"
                                alt="User"
                                src={photoUrl}
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                            ) : (
                              <svg
                                className="w-8 h-8 text-slate-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                ></path>
                              </svg>
                            )}
                          </div>
                          <div className="absolute -bottom-1 -right-1">
                            <div className="w-4 h-4 bg-accent rounded-full border-2 border-white"></div>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-bold text-slate-900 mb-1 text-lg">
                                {firstName
                                  ? `${firstName} ${lastName || ""}`
                                  : "Unknown User"}
                              </h3>
                              {age && (
                                <p className="text-sm text-slate-500 mb-2 flex items-center">
                                  <svg
                                    className="w-4 h-4 mr-1"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M8 7V3a4 4 0 118 0v4m-4 8v4m-4-4h8M8 7h8"
                                    ></path>
                                  </svg>
                                  {age} years old
                                </p>
                              )}
                              <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                                {about ||
                                  "Developer passionate about creating amazing software solutions."}
                              </p>
                              {skills && (
                                <div className="flex flex-wrap gap-1">
                                  {skills
                                    .split(",")
                                    .slice(0, 5)
                                    .map((skill, idx) => (
                                      <span
                                        key={idx}
                                        className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium"
                                      >
                                        {skill.trim()}
                                      </span>
                                    ))}
                                  {skills.split(",").length > 5 && (
                                    <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                                      +{skills.split(",").length - 5} more
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex space-x-2 ml-4">
                              <button
                                onClick={() => navigate(`/chat/${_id}`)}
                                className="bg-primary hover:bg-blue-700 text-white py-2 px-4 rounded-xl font-medium transition-colors flex items-center space-x-2"
                              >
                                <svg
                                  className="w-4 h-4"
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
                                <span>Message</span>
                              </button>
                              <button
                                onClick={() => setSelectedConnection(con)}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-xl transition-colors"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                  ></path>
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Connection Detail Modal */}
        <AnimatePresence>
          {selectedConnection && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => setSelectedConnection(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl p-8 max-w-md w-full mx-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center">
                  <div className="w-24 h-24 bg-slate-100 rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden">
                    {selectedConnection.photoUrl ? (
                      <img
                        className="w-full h-full object-cover"
                        alt="User"
                        src={selectedConnection.photoUrl}
                      />
                    ) : (
                      <svg
                        className="w-12 h-12 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        ></path>
                      </svg>
                    )}
                  </div>

                  <h3 className="text-2xl font-bold text-slate-900 mb-2">
                    {selectedConnection.firstName} {selectedConnection.lastName}
                  </h3>

                  {selectedConnection.age && (
                    <p className="text-slate-500 mb-4">
                      {selectedConnection.age} years old
                    </p>
                  )}

                  <p className="text-slate-600 mb-6 leading-relaxed">
                    {selectedConnection.about || "No description available"}
                  </p>

                  {selectedConnection.skills && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-slate-700 mb-3">
                        Skills
                      </h4>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {selectedConnection.skills
                          .split(",")
                          .map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium"
                            >
                              {skill.trim()}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        navigate(`/chat/${selectedConnection._id}`);
                        setSelectedConnection(null);
                      }}
                      className="flex-1 bg-primary hover:bg-blue-700 text-white py-3 px-6 rounded-xl font-medium transition-colors"
                    >
                      Start Chat
                    </button>
                    <button
                      onClick={() => setSelectedConnection(null)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 px-6 rounded-xl font-medium transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Connections;
