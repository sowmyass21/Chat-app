import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { removeToast } from "../utils/notificationsSlice";

const ToastContainer = () => {
  const toasts = useSelector((s) => s.notifications);
  const dispatch = useDispatch();

  useEffect(() => {
   
    const timers = toasts.map((t) =>
      setTimeout(() => dispatch(removeToast(t.id)), t.timeout || 3000)
    );
    return () => timers.forEach((id) => clearTimeout(id));
  }, [toasts, dispatch]);

  if (!toasts.length) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] space-y-3">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`rounded-xl shadow-lg border px-4 py-3 text-sm max-w-xs backdrop-blur bg-white/95 ${
            t.variant === "error"
              ? "border-red-200 text-red-700"
              : t.variant === "success"
              ? "border-emerald-200 text-emerald-700"
              : "border-slate-200 text-slate-700"
          }`}
        >
          <div className="flex items-start gap-2">
            <span className="mt-0.5">
              {t.variant === "error" ? (
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
                    d="M12 9v2m0 4h.01M4.93 4.93l14.14 14.14M12 3a9 9 0 100 18 9 9 0 000-18z"
                  />
                </svg>
              ) : (
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </span>
            <div className="flex-1">{t.message}</div>
            <button
              aria-label="Dismiss"
              onClick={() => dispatch(removeToast(t.id))}
              className="text-slate-400 hover:text-slate-600"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
