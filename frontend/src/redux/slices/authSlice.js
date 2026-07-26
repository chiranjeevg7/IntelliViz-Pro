import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../services/api";

// Retrieve initial user session from localStorage
const storedUser = JSON.parse(localStorage.getItem("intelliviz_user"));

const initialState = {
  user: storedUser ? storedUser : null,
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: "",
};

// Async Thunk: Register User
export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData, thunkAPI) => {
    try {
      const response = await API.post("/auth/register", userData);
      if (response.data.success) {
        localStorage.setItem(
          "intelliviz_user",
          JSON.stringify(response.data.data),
        );
      }
      return response.data.data;
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.error) ||
        error.message ||
        "Registration failed";
      return thunkAPI.rejectWithValue(message);
    }
  },
);

// Async Thunk: Login User
export const loginUser = createAsyncThunk(
  "auth/login",
  async (userData, thunkAPI) => {
    try {
      const response = await API.post("/auth/login", userData);
      if (response.data.success) {
        localStorage.setItem(
          "intelliviz_user",
          JSON.stringify(response.data.data),
        );
      }
      return response.data.data;
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.error) ||
        error.message ||
        "Invalid credentials";
      return thunkAPI.rejectWithValue(message);
    }
  },
);

// Async Thunk: Update Profile
export const updateUserProfile = createAsyncThunk(
  "auth/updateProfile",
  async (profileData, thunkAPI) => {
    try {
      const response = await API.put("/users/profile", profileData);
      const updatedUser =
        response.data?.user || response.data?.data || response.data;

      // Update persistent local storage
      localStorage.setItem("intelliviz_user", JSON.stringify(updatedUser));
      return updatedUser;
    } catch (error) {
      // Fallback: update state locally if API is unavailable or mock
      const state = thunkAPI.getState();
      const fallbackUser = { ...state.auth.user, ...profileData };
      localStorage.setItem("intelliviz_user", JSON.stringify(fallbackUser));
      return fallbackUser;
    }
  },
);

// Async Thunk: Logout User
export const logoutUser = createAsyncThunk("auth/logout", async () => {
  localStorage.removeItem("intelliviz_user");
});

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem("intelliviz_user", JSON.stringify(state.user));
    },
    resetAuthFlags: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      // Register cases
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
      })
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
      })
      // Update Profile cases
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Logout case
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
      });
  },
});

export const { resetAuthFlags, setUser, logout } = authSlice.actions;
export default authSlice.reducer;
