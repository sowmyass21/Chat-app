import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { addFeed } from "../utils/feedSlice";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Usercard from "./Usercard";

const Feed = () => {
  const feed = useSelector((store) => store.feed);
  const dispatch = useDispatch();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState(null);
  const [visibleCount, setVisibleCount] = useState(9);

  const [filters, setFilters] = useState({
    skills: "",
    location: "",
    sortBy: "newest", // newest, oldest, nameAZ, nameZA
  });
  const [filteredFeed, setFilteredFeed] = useState([]);

  useEffect(() => {
    const getFeed = async () => {
      
      const hasData =
        (feed.Data && feed.Data.length > 0) ||
        (Array.isArray(feed) && feed.length > 0);
      if (hasData) return;

      setError(null);

      try {
        const res = await axios.get(BASE_URL + "/feed", {
          withCredentials: true,
        });
        console.log("Feed API Response:", res.data);
        dispatch(addFeed(res.data));
      } catch (err) {
        console.error("Feed API Error:", err);

        if (!err.response) {
          setError(
            "Unable to load feed. Please check your internet connection."
          );
        } else if (err.response.status === 401) {
          setError("Session expired. Please login again.");
        } else if (err.response.status === 404) {
          setError("No users found to display.");
        } else if (err.response.status >= 500) {
          setError("Server error. Please try again later.");
        } else {
          setError(
            err.response?.data?.message ||
              "Failed to load feed. Please try again."
          );
        }
      }
    };

    getFeed();
  }, [feed, dispatch]);

  const handleNext = () => {
    if (filteredFeed && currentIndex < filteredFeed.length - 1) {
      setCurrentIndex((prevIndex) => prevIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prevIndex) => prevIndex - 1);
    }
  };

  useEffect(() => {
    console.log("Feed state:", feed);
    console.log("Feed.Data:", feed.Data);

    let feedData = [];
    if (feed.Data && Array.isArray(feed.Data)) {
      feedData = feed.Data;
    } else if (Array.isArray(feed)) {
      feedData = feed;
    }

    if (feedData.length === 0) {
      setFilteredFeed([]);
      return;
    }

    let filtered = [...feedData];
    console.log("Initial feed data:", filtered.length, filtered);
    console.log("Current filters:", filters);

    const fresh = filtered.filter((u) => !u.requestInfo);
    setFilteredFeed(fresh);
    if (currentIndex >= fresh.length) {
      setCurrentIndex(0);
    }
  }, [feed, filters, currentIndex]);

  const getVisibleUsers = () => {
    if (!filteredFeed || filteredFeed.length === 0) return [];
    if (viewMode === "stack") return [filteredFeed[currentIndex]];
    if (viewMode === "grid") return filteredFeed;
    return filteredFeed;
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      skills: "",
      location: "",
      sortBy: "newest",
    });
  };

  const loadMore = () => {
    setVisibleCount((c) => c + 9);
  };

  const visibleUsersForGrid = () =>
    getVisibleUsers().slice(0, Math.min(visibleCount, filteredFeed.length));

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute top-1/3 -right-24 w-[28rem] h-[28rem] rounded-full bg-emerald-200/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[50rem] h-[50rem] rounded-full bg-blue-100/30 blur-3xl" />
      </div>
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Discover New Connections
              </h1>
              <p className="text-slate-600">
                Find and connect with talented professionals in your field
              </p>
            </div>

            {/* Header Controls */}
            <div className="flex items-center space-x-4">
              {/* View Mode Toggle */}
              <div className="flex bg-slate-100 rounded-xl p-1">
                {["stack", "grid"].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      viewMode === mode
                        ? "bg-primary text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {mode === "stack" && (
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
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        ></path>
                      </svg>
                    )}
                    {mode === "grid" && (
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
                          d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                        ></path>
                      </svg>
                    )}
                  </button>
                ))}
              </div>

              {/* Auto-play removed */}

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium text-slate-600 transition-colors"
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
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  ></path>
                </svg>
                <span>Filter</span>
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          {feed.Data && feed.Data.length > 0 && (
            <div className="mt-6 flex items-center justify-between bg-white/60 backdrop-blur-md rounded-xl p-4 border border-slate-200">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  <span className="text-sm font-medium text-slate-700">
                    {filteredFeed.length} Profile
                    {filteredFeed.length > 1 ? "s" : ""}{" "}
                    {filteredFeed.length !== feed.Data.length
                      ? `(${feed.Data.length} total)`
                      : "Available"}
                  </span>
                </div>
                {viewMode === "stack" && filteredFeed.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-accent rounded-full"></div>
                    <span className="text-sm font-medium text-slate-700">
                      Profile {currentIndex + 1} of {filteredFeed.length}
                    </span>
                  </div>
                )}
              </div>

              {/* Progress Indicator for Stack Mode */}
              {viewMode === "stack" && filteredFeed.length > 1 && (
                <div className="flex items-center space-x-1">
                  {filteredFeed.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentIndex
                          ? "bg-primary w-6"
                          : "bg-slate-300 hover:bg-slate-400"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white border-b border-slate-200 shadow-sm overflow-hidden"
          >
            <div className="max-w-6xl mx-auto px-6 py-6">
              <div className="bg-slate-50 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Filter & Sort Profiles
                  </h3>
                  <button
                    onClick={resetFilters}
                    className="text-sm text-primary hover:text-blue-700 font-medium transition-colors"
                  >
                    Reset All
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Skills Filter */}

                  {/* Skills Filter */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">
                      Skills
                    </label>
                    <input
                      type="text"
                      value={filters.skills}
                      onChange={(e) =>
                        handleFilterChange("skills", e.target.value)
                      }
                      placeholder="React, Node.js, Python..."
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                    />
                    <div className="text-xs text-slate-500 mt-1">
                      Separate skills with commas
                    </div>
                  </div>

                  {/* Location Filter */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">
                      Location
                    </label>
                    <input
                      type="text"
                      value={filters.location}
                      onChange={(e) =>
                        handleFilterChange("location", e.target.value)
                      }
                      placeholder="City, Country..."
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                    />
                    <div className="text-xs text-slate-500 mt-1">
                      Search by location
                    </div>
                  </div>

                  {/* Sort By */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">
                      Sort By
                    </label>
                    <select
                      value={filters.sortBy}
                      onChange={(e) =>
                        handleFilterChange("sortBy", e.target.value)
                      }
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm bg-white"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="nameAZ">Name A-Z</option>
                      <option value="nameZA">Name Z-A</option>
                      <option value="ageAsc">Age: Low to High</option>
                      <option value="ageDesc">Age: High to Low</option>
                    </select>
                  </div>
                </div>

                {/* Filter Results Summary */}
                <div className="mt-6 pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-slate-600">
                        <span className="font-medium">
                          {filteredFeed.length}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium">
                          {feed.Data?.length || 0}
                        </span>{" "}
                        profiles match your filters
                      </div>
                      {(filters.skills || filters.location) && (
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-accent rounded-full"></div>
                          <span className="text-xs text-slate-500">
                            Filters active
                          </span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
                    >
                      Hide Filters
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Error State */}
        {error && (
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
                Oops! Something went wrong
              </h3>
              <p className="text-slate-600 mb-6">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  dispatch(addFeed([])); // Clear feed to trigger refetch
                }}
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
                Try Again
              </button>
            </div>
          </motion.div>
        )}

        {!error && (
          <>
            {!feed ||
            (Array.isArray(feed) && feed.length === 0) ||
            (!feed.Data && !Array.isArray(feed)) ? (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-white rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg">
                  <svg
                    className="w-10 h-10 text-primary animate-spin"
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
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  Loading Your Feed
                </h3>
                <p className="text-slate-600 text-lg">
                  Discovering amazing professionals for you...
                </p>
              </div>
            ) : (feed.Data && feed.Data.length > 0) ||
              (Array.isArray(feed) && feed.length > 0) ? (
              filteredFeed.length > 0 ? (
                <div className="relative">
                  {/* Stack View */}
                  {viewMode === "stack" && (
                    <div className="flex items-center justify-center min-h-[600px]">
                      <div className="relative">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={currentIndex}
                            initial={{ opacity: 0, scale: 0.8, y: 50 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: -50 }}
                            transition={{
                              type: "spring",
                              stiffness: 200,
                              damping: 20,
                            }}
                            className="relative"
                          >
                            <Usercard user={filteredFeed[currentIndex]} />
                          </motion.div>
                        </AnimatePresence>

                        {/* Navigation Arrows */}
                        <button
                          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-20 w-14 h-14 bg-white border-2 border-slate-200 rounded-full flex items-center justify-center hover:bg-slate-50 hover:border-primary transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                          onClick={handlePrevious}
                          disabled={currentIndex === 0}
                        >
                          <svg
                            className="w-6 h-6 text-slate-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M15 19l-7-7 7-7"
                            ></path>
                          </svg>
                        </button>

                        <button
                          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-20 w-14 h-14 bg-white border-2 border-slate-200 rounded-full flex items-center justify-center hover:bg-slate-50 hover:border-primary transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                          onClick={handleNext}
                          disabled={currentIndex === filteredFeed.length - 1}
                        >
                          <svg
                            className="w-6 h-6 text-slate-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 5l7 7-7 7"
                            ></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Grid View */}
                  {viewMode === "grid" && (
                    <>
                      {/* Spotlight hero card */}
                      {filteredFeed.length > 0 && (
                        <div className="mb-8">
                          <Usercard
                            user={filteredFeed[0]}
                            variant="spotlight"
                          />
                        </div>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {visibleUsersForGrid()
                          .slice(filteredFeed.length > 0 ? 1 : 0)
                          .map((user, index) => (
                            <motion.div
                              key={user._id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                            >
                              <Usercard user={user} />
                            </motion.div>
                          ))}
                      </div>
                      {visibleCount < filteredFeed.length && (
                        <div className="flex justify-center mt-10">
                          <button
                            onClick={loadMore}
                            className="px-6 py-3 bg-white/70 backdrop-blur-md border border-slate-200 hover:bg-white rounded-xl font-medium text-slate-700 shadow-sm"
                          >
                            Load more
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <div className="text-center py-20">
                  <div className="w-20 h-20 bg-white rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg">
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
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      ></path>
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">
                    No Matches Found
                  </h3>
                  <p className="text-slate-600 text-lg mb-6">
                    Try adjusting your filters to see more profiles.
                  </p>
                  <button
                    onClick={resetFilters}
                    className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              )
            ) : (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-white rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg">
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
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    ></path>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  {filteredFeed.length === 0 && feed.Data?.length > 0
                    ? "No Matches Found"
                    : "No Connections Available"}
                </h3>
                <p className="text-slate-600 text-lg mb-6">
                  {filteredFeed.length === 0 && feed.Data?.length > 0
                    ? "Try adjusting your filters to see more profiles."
                    : "It looks like there are no new professionals to discover right now."}
                </p>
                <div className="flex space-x-4">
                  {filteredFeed.length === 0 && feed.Data?.length > 0 && (
                    <button
                      onClick={resetFilters}
                      className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
                    >
                      Clear Filters
                    </button>
                  )}
                  <button className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
                    Refresh Feed
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Feed;
