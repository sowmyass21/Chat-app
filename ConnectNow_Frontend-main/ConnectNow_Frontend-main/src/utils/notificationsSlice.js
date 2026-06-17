import { createSlice, nanoid } from "@reduxjs/toolkit";

const notificationsSlice = createSlice({
  name: "notifications",
  initialState: [],
  reducers: {
    addToast: {
      reducer: (state, action) => {
        state.push(action.payload);
      },
      prepare: (message, variant = "error", timeout = 3000) => ({
        payload: { id: nanoid(), message, variant, timeout },
      }),
    },
    removeToast: (state, action) =>
      state.filter((t) => t.id !== action.payload),
  },
});

export const { addToast, removeToast } = notificationsSlice.actions;
export default notificationsSlice.reducer;
