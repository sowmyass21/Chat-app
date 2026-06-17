import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addRequest, removeRequest } from "../utils/requestSlice";
import { motion } from "framer-motion";
import { addToast } from "../utils/notificationsSlice";

const ReceivedRequests = () => {
  const requests = useSelector((store) => store.request);
  const dispatch = useDispatch();
  const [sentRequests, setSentRequests] = useState([]);
  const [loadingSent, setLoadingSent] = useState(true);
  const [loadingReceived, setLoadingReceived] = useState(true);

  const reviewRequest = async (status, _id) => {
    try {
      await axios.post(
        `${BASE_URL}/request/review/${status}/${_id}`,
        {},
        { withCredentials: true }
      );
      dispatch(removeRequest(_id));
      dispatch(addToast(`Request ${status}`, "success", 2500));
    } catch (err) {
      console.error("Error reviewing request:", err);

      let errorMessage = "Failed to review request";
      if (!err.response) {
        errorMessage = "Network error. Please check your connection.";
      } else if (err.response.status === 401) {
        errorMessage = "Session expired. Please login again.";
      } else if (err.response.status === 404) {
        errorMessage = "Request not found or already processed.";
      } else if (err.response.status >= 500) {
        errorMessage = "Server error. Please try again.";
      } else {
        errorMessage =
          err.response?.data?.message || err.response?.data || errorMessage;
      }

      dispatch(addToast(errorMessage, "error", 3500));
    }
  };

  const handleWithdraw = async (userId, requestId) => {
    try {
      await axios.delete(`${BASE_URL}/request/withdraw/${userId}`, {
        withCredentials: true,
      });
      setSentRequests((prev) => prev.filter((r) => r._id !== requestId));
      dispatch(addToast("Request withdrawn", "success", 2500));
    } catch (err) {
      console.error("Error withdrawing request:", err);

      let errorMessage = "Failed to withdraw request";
      if (!err.response) {
        errorMessage = "Network error. Please check your connection.";
      } else if (err.response.status === 401) {
        errorMessage = "Session expired. Please login again.";
      } else if (err.response.status === 404) {
        errorMessage = "Request not found or already withdrawn.";
      } else if (err.response.status >= 500) {
        errorMessage = "Server error. Please try again.";
      } else {
        errorMessage =
          err.response?.data?.message || err.response?.data || errorMessage;
      }

      dispatch(addToast(errorMessage, "error", 3500));
    }
  };

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoadingReceived(true);
        const res = await axios.get(`${BASE_URL}/user/request/received`, {
          withCredentials: true,
        });
        dispatch(addRequest(res.data.Data));
      } catch (err) {
        console.error("Error fetching received requests:", err);
      } finally {
        setLoadingReceived(false);
      }
    };

    const fetchSentRequests = async () => {
      try {
        setLoadingSent(true);
        const res = await axios.get(`${BASE_URL}/user/request/sent`, {
          withCredentials: true,
        });
        setSentRequests(res.data.Data || []);
      } catch (err) {
        console.error("Error fetching sent requests:", err);
      } finally {
        setLoadingSent(false);
      }
    };

    fetchRequests();
    fetchSentRequests();
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-900 mb-3">
            Connection Requests
          </h1>
          <p className="text-slate-600">
            Manage your sent and received connection requests
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT: Sent Requests (Pending Outgoing) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-900">
                Sent Requests
              </h2>
              <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                {sentRequests.length} pending
              </span>
            </div>

            {loadingSent ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-slate-500 mt-4">Loading sent requests...</p>
              </div>
            ) : sentRequests.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-full mx-auto mb-4 flex items-center justify-center">
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
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    ></path>
                  </svg>
                </div>
                <p className="text-slate-500">No pending sent requests</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {sentRequests.map((req) => {
                  if (!req.toUserId) return null;
                  const { _id, firstName, lastName, photoUrl, age, about } =
                    req.toUserId;

                  return (
                    <motion.div
                      key={req._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-slate-50 rounded-xl p-4 border border-slate-200 hover:border-primary transition-colors"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="w-14 h-14 bg-slate-200 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                          {photoUrl ? (
                            <img
                              className="w-full h-full object-cover"
                              alt="Profile"
                              src={photoUrl}
                            />
                          ) : (
                            <svg
                              className="w-7 h-7 text-slate-400"
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

                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900">
                            {firstName} {lastName}
                          </h3>
                          {age && (
                            <p className="text-xs text-slate-500 mt-0.5">
                              Age: {age}
                            </p>
                          )}
                          <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                            {about || "No description available"}
                          </p>
                          <div className="mt-3 flex space-x-2">
                            <button
                              onClick={() => handleWithdraw(_id, req._id)}
                              className="text-xs px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 rounded-lg font-medium transition-colors"
                            >
                              Withdraw
                            </button>
                            <span className="text-xs px-3 py-1.5 bg-accent/10 text-accent rounded-lg font-medium">
                              Pending
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT: Received Requests (Incoming) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-900">
                Received Requests
              </h2>
              <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                {requests.length} new
              </span>
            </div>

            {loadingReceived ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-slate-500 mt-4">
                  Loading received requests...
                </p>
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-full mx-auto mb-4 flex items-center justify-center">
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
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    ></path>
                  </svg>
                </div>
                <p className="text-slate-500">
                  No connection requests available
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {requests.map((req) => {
                  if (!req.fromUserId) return null;

                  const { firstName, lastName, photoUrl, age, about } =
                    req.fromUserId;

                  return (
                    <motion.div
                      key={req._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-slate-50 rounded-xl p-4 border border-slate-200 hover:border-primary transition-colors"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="w-14 h-14 bg-slate-200 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                          {photoUrl ? (
                            <img
                              className="w-full h-full object-cover"
                              alt="Profile"
                              src={photoUrl}
                            />
                          ) : (
                            <svg
                              className="w-7 h-7 text-slate-400"
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

                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900">
                            {firstName} {lastName}
                          </h3>
                          {age && (
                            <p className="text-xs text-slate-500 mt-0.5">
                              Age: {age}
                            </p>
                          )}
                          <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                            {about || "No description available"}
                          </p>
                          <div className="mt-3 flex space-x-2">
                            <button
                              onClick={() => reviewRequest("accepted", req._id)}
                              className="text-xs px-3 py-1.5 bg-accent hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors flex items-center space-x-1"
                            >
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M5 13l4 4L19 7"
                                ></path>
                              </svg>
                              <span>Accept</span>
                            </button>
                            <button
                              onClick={() => reviewRequest("rejected", req._id)}
                              className="text-xs px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg font-medium transition-colors flex items-center space-x-1"
                            >
                              <svg
                                className="w-3 h-3"
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
                              <span>Reject</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReceivedRequests;
