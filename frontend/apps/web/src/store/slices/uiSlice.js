// File: E:/civic-reporter/apps/web/src/store/slices/uiSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedIssueId: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setSelectedIssue: (state, action) => {
      state.selectedIssueId = action.payload;
    },
  },
});

export const { setSelectedIssue } = uiSlice.actions;
export default uiSlice.reducer;