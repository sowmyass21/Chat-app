import { createSlice } from "@reduxjs/toolkit";


const normalizeFeed = (payload) => {
  if (!payload) return { Data: [] };
  if (Array.isArray(payload)) return { Data: payload };
  if (Array.isArray(payload.Data)) return { Data: payload.Data };
  if (Array.isArray(payload.data)) return { Data: payload.data };
  return { Data: [] };
};

const feedSlice = createSlice({
  name: "feed",
  initialState: { Data: [] },
  reducers: {
    addFeed: (state, action) => {
      return normalizeFeed(action.payload);
    },
    addUserToFeed: (state, action) => {
      const user = action.payload;
      if (!user || !user._id) return state;
      if (Array.isArray(state)) {
        const exists = state.some((u) => u._id === user._id);
        return exists ? state : [user, ...state];
      }
      const current = Array.isArray(state.Data) ? state.Data : [];
      const exists = current.some((u) => u._id === user._id);
      return exists ? state : { ...state, Data: [user, ...current] };
    },

    updateUserRequestInfo: (state, action) => {
      const { userId, requestInfo } = action.payload || {};
      if (!userId) return state;
      if (Array.isArray(state)) {
        return state.map((u) =>
          u._id === userId ? { ...u, requestInfo: requestInfo || null } : u
        );
      }
      const current = Array.isArray(state.Data) ? state.Data : [];
      const updated = current.map((u) =>
        u._id === userId ? { ...u, requestInfo: requestInfo || null } : u
      );
      return { ...state, Data: updated };
    },
    removeFromFeed: (state, action) => {
      if (Array.isArray(state)) {
        return state.filter((user) => user._id !== action.payload);
      }
      const next = (state.Data || []).filter(
        (user) => user._id !== action.payload
      );
      return { ...state, Data: next };
    },
  },
});

export const { addFeed, addUserToFeed, updateUserRequestInfo, removeFromFeed } =
  feedSlice.actions;
export default feedSlice.reducer;
