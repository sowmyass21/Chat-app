import { createSlice } from "@reduxjs/toolkit";


const initialState = {
  lastOpenedChatId: null,
  messagesMeta: {},
  loadingConnections: false,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setLastOpenedChatId: (state, action) => {
      state.lastOpenedChatId = action.payload;
    },
    upsertLastMessage: (state, action) => {
      const { chatId, lastMessage, timestamp, incrementUnread } =
        action.payload;
      const current = state.messagesMeta[chatId] || { unreadCount: 0 };
      state.messagesMeta[chatId] = {
        ...current,
        lastMessage,
        timestamp,
        unreadCount: incrementUnread
          ? (current.unreadCount || 0) + 1
          : current.unreadCount || 0,
      };
    },
    markAsRead: (state, action) => {
      const chatId = action.payload;
      if (state.messagesMeta[chatId]) {
        state.messagesMeta[chatId].unreadCount = 0;
      }
    },
    setLoadingConnections: (state, action) => {
      state.loadingConnections = action.payload;
    },
  },
});

export const {
  setLastOpenedChatId,
  upsertLastMessage,
  markAsRead,
  setLoadingConnections,
} = chatSlice.actions;
export default chatSlice.reducer;
