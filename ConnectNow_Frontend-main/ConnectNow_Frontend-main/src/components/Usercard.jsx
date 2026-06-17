import axios from "axios";
import { useState } from "react";
import PropTypes from "prop-types";
import { BASE_URL } from "../utils/constants";
import { useDispatch } from "react-redux";
import { removeFromFeed, addUserToFeed } from "../utils/feedSlice";
import { addToast } from "../utils/notificationsSlice";
import { Link } from "react-router-dom";

const Usercard = ({ user, variant = "grid" }) => {
  const { _id, photoUrl, firstName, lastName, about, skills } = user;
  const dispatch = useDispatch();
  const [responseStatus, setResponseStatus] = useState(null);
  const [reqInfo, setReqInfo] = useState(user.requestInfo || null);
  const [withdrawing, setWithdrawing] = useState(false);

  const handleSendRequest = async (status, userId) => {
    if (reqInfo) return; 
    setResponseStatus(status === "interested" ? "Interested" : "Ignored");
    dispatch(removeFromFeed(userId));

    try {
      await axios.post(
        `${BASE_URL}/request/send/${status}/${userId}`,
        {},
        { withCredentials: true }
      );
     
    } catch (err) {
      console.error("Error in request:", err);

      dispatch(addUserToFeed(user));

      let errorMessage = "Failed to send request. Please try again.";
      if (!err.response) {
        errorMessage =
          "Network error. Please check your connection and try again.";
      } else if (err.response.status === 401) {
        errorMessage = "Session expired. Please login again.";
      } else if (err.response.status === 400) {
        errorMessage =
          err.response?.data?.message || "Invalid request. Please try again.";
      } else if (err.response.status === 409) {
        errorMessage = "You've already sent a request to this user.";
      } else if (err.response.status >= 500) {
        errorMessage = "Server error. Please try again later.";
      } else {
        errorMessage =
          err.response?.data?.message || err.response?.data || errorMessage;
      }

      dispatch(addToast(errorMessage, "error", 3500));
    }
  };

  const handleWithdraw = async () => {
    try {
      setWithdrawing(true);
      await axios.delete(`${BASE_URL}/request/withdraw/${_id}`, {
        withCredentials: true,
      });
      setReqInfo(null);
      setResponseStatus(null);
      dispatch(addToast("Request withdrawn", "success", 2500));
    } catch (err) {
      console.error("Error withdrawing request:", err);

      let errorMessage = "Failed to withdraw request.";
      if (!err.response) {
        errorMessage = "Network error. Please check your connection.";
      } else if (err.response.status === 401) {
        errorMessage = "Session expired. Please login again.";
      } else if (err.response.status === 404) {
        errorMessage = "Request not found or already withdrawn.";
      } else if (err.response.status >= 500) {
        errorMessage = "Server error. Please try again later.";
      } else {
        errorMessage =
          err.response?.data?.message || err.response?.data || errorMessage;
      }

      dispatch(addToast(errorMessage, "error", 3500));
    } finally {
      setWithdrawing(false);
    }
  };

  // Shared avatar element
  const Avatar = (
    <div
      className={`${
        variant === "spotlight" ? "w-32 h-32" : "w-20 h-20"
      } bg-slate-100 rounded-full mx-auto md:mx-0 mb-4 md:mb-0 flex items-center justify-center overflow-hidden`}
    >
      {photoUrl ? (
        <img src={photoUrl} alt="User" className="w-full h-full object-cover" />
      ) : (
        <svg
          className={`${
            variant === "spotlight" ? "w-16 h-16" : "w-10 h-10"
          } text-slate-400`}
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
  );

  const Skills = (
    <>
      {skills && (
        <div className="flex flex-wrap gap-2 mb-3">
          {String(skills)
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
            .slice(0, 6)
            .map((s, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 text-xs rounded-full bg-slate-100 text-slate-700 border border-slate-200"
              >
                {s}
              </span>
            ))}
        </div>
      )}
    </>
  );

  const StatusBanner = responseStatus && (
    <div
      className={`mb-5 p-3 rounded-lg ${
        responseStatus === "Interested"
          ? "bg-accent/10 text-accent"
          : "bg-slate-100 text-slate-600"
      }`}
    >
      <p className="font-medium">
        {responseStatus === "Interested"
          ? "✓ Connection request sent!"
          : "User ignored"}
      </p>
    </div>
  );

  const Actions = (
    <div className={`flex ${variant === "spotlight" ? "gap-4" : "space-x-3"}`}>
      {reqInfo && reqInfo.status === "interested" ? (
        reqInfo.direction === "outgoing" ? (
          <>
            <button
              onClick={handleWithdraw}
              disabled={withdrawing}
              className={`flex-1 py-3 rounded-xl font-medium transition-colors border ${
                withdrawing
                  ? "bg-slate-200 text-slate-500 cursor-not-allowed border-slate-200"
                  : "bg-white hover:bg-rose-50 text-rose-700 border-rose-200"
              }`}
            >
              {withdrawing ? "Withdrawing..." : "Withdraw"}
            </button>
            <button
              disabled
              className="flex-1 py-3 rounded-xl font-medium bg-accent/10 text-accent cursor-not-allowed"
            >
              Pending
            </button>
          </>
        ) : (
          <>
            <button
              disabled
              className="flex-1 py-3 rounded-xl font-medium bg-accent/10 text-accent cursor-not-allowed"
            >
              Pending
            </button>
            <Link
              to="/requestreceived"
              className="flex-1 py-3 rounded-xl font-semibold text-white bg-primary hover:bg-blue-700 text-center"
            >
              Review
            </Link>
          </>
        )
      ) : (
        <>
          <button
            className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
              responseStatus === "Ignored"
                ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
            onClick={() => handleSendRequest("ignore", _id)}
            disabled={responseStatus !== null}
          >
            {responseStatus === "Ignored" ? "Ignored" : "Ignore"}
          </button>
          <button
            className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
              responseStatus === "Interested"
                ? "bg-accent text-white cursor-not-allowed"
                : "bg-accent hover:bg-emerald-600 text-white"
            }`}
            onClick={() => handleSendRequest("interested", _id)}
            disabled={responseStatus !== null}
          >
            {responseStatus === "Interested" ? "Request Sent" : "Interested"}
          </button>
        </>
      )}
    </div>
  );

  // Spotlight variant: larger, two-column layout
  if (variant === "spotlight") {
    return (
      <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/80 shadow-xl p-8 md:p-10 max-w-3xl w-full">
        <div className="absolute inset-0 rounded-3xl pointer-events-none bg-gradient-to-tr from-primary/5 via-white/0 to-emerald-100/20" />
        <div className="relative md:flex md:items-start md:space-x-8">
          {Avatar}
          <div className="flex-1">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-1 tracking-tight">
              {firstName} {lastName}
            </h2>
            <div className="mb-4">
              {Skills}
              <p className="text-slate-700 leading-relaxed">
                {about || "No description available"}
              </p>
            </div>
            {StatusBanner}
            {Actions}
          </div>
        </div>
      </div>
    );
  }

  // Grid/default variant
  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-shadow p-6 h-full">
      <div className="md:flex md:items-center md:space-x-4">
        {Avatar}
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-xl font-bold text-slate-900 mb-1">
            {firstName} {lastName}
          </h2>
          {Skills}
          <p className="text-sm text-slate-600 mb-4 line-clamp-3">
            {about || "No description available"}
          </p>
          {StatusBanner}
          {Actions}
        </div>
      </div>
    </div>
  );
};

Usercard.propTypes = {
  user: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    photoUrl: PropTypes.string,
    firstName: PropTypes.string.isRequired,
    lastName: PropTypes.string,
    about: PropTypes.string,
    skills: PropTypes.string,
    requestInfo: PropTypes.shape({
      exists: PropTypes.bool,
      status: PropTypes.string,
      direction: PropTypes.string,
      requestId: PropTypes.string,
    }),
  }).isRequired,
  variant: PropTypes.oneOf(["grid", "spotlight"]),
};

export default Usercard;
