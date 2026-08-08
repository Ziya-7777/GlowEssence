import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { API_URL } from "../../config/api.js";

const BASE_URL = `${API_URL}/api/user`;

// Register a new user
export const registerUser = createAsyncThunk(
    "user/registerUser",
    async (formData, { rejectWithValue }) => {
        try {
            const res = await fetch(`${BASE_URL}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                // register route can send back either { message } or an array of validation errors
                const message = Array.isArray(data) ? data[0]?.msg : data.message;
                return rejectWithValue(message || "Registration failed");
            }

            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Login user
export const loginUser = createAsyncThunk(
    "user/loginUser",
    async (formData, { rejectWithValue }) => {
        try {
            const res = await fetch(`${BASE_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                return rejectWithValue(data.message || "Login failed");
            }

            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Ask backend to email a password reset link
export const forgotPassword = createAsyncThunk(
    "user/forgotPassword",
    async (email, { rejectWithValue }) => {
        try {
            const res = await fetch(`${BASE_URL}/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                return rejectWithValue(data.message || "Failed to send reset link");
            }

            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Set a new password using the token from the reset link
export const resetPassword = createAsyncThunk(
    "user/resetPassword",
    async ({ token, password }, { rejectWithValue }) => {
        try {
            const res = await fetch(`${BASE_URL}/reset-password/${token}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });

            const data = await res.json();

            if (!res.ok) {
                return rejectWithValue(data.message || "Failed to reset password");
            }

            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Get the logged-in user's full details (name, email, etc.)
// Login only gives us { id, name }, so this fetches everything else.
export const fetchUserProfile = createAsyncThunk(
    "user/fetchUserProfile",
    async (userId, { getState, rejectWithValue }) => {
        try {
            const token = getState().users.token;

            const res = await fetch(`${BASE_URL}/profile/${userId}`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await res.json();

            if (!res.ok) {
                return rejectWithValue(data.message || "Failed to load profile");
            }

            return data.user;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Update the logged-in user's own details (name, email)
// Uses the backend's existing PATCH /api/user/update/:id route.
export const updateUserProfile = createAsyncThunk(
    "user/updateUserProfile",
    async ({ id, updates }, { getState, rejectWithValue }) => {
        try {
            const token = getState().users.token;

            const res = await fetch(`${BASE_URL}/update/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(updates),
            });

            const data = await res.json();

            if (!res.ok) {
                return rejectWithValue(data.message || "Failed to update profile");
            }

            return data.user;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Change the logged-in user's password (needs the current password)
export const changePassword = createAsyncThunk(
    "user/changePassword",
    async ({ id, currentPassword, newPassword }, { getState, rejectWithValue }) => {
        try {
            const token = getState().users.token;

            const res = await fetch(`${BASE_URL}/change-password/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            const data = await res.json();

            if (!res.ok) {
                return rejectWithValue(data.message || "Failed to change password");
            }

            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const storedUser = localStorage.getItem("geUser");
const storedToken = localStorage.getItem("geToken");

const user = createSlice({
    name: "user",
    initialState: {
        users: [],
        currentUser: storedUser ? JSON.parse(storedUser) : null,
        token: storedToken || null,
        // full profile details (name, email, ...), filled in by fetchUserProfile
        profile: null,
        isLoading: false,
        error: null,
        message: null,
    },
    reducers: {
        logoutUser: (state) => {
            state.currentUser = null;
            state.token = null;
            state.profile = null;
            localStorage.removeItem("geUser");
            localStorage.removeItem("geToken");
        },
        clearUserStatus: (state) => {
            state.error = null;
            state.message = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Register
            .addCase(registerUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
                state.message = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.message = action.payload.message;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Login
            .addCase(loginUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
                state.message = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentUser = {
                    id: action.payload.userId,
                    name: action.payload.name,
                    role: action.payload.role,
                };
                state.token = action.payload.token;
                localStorage.setItem("geUser", JSON.stringify(state.currentUser));
                localStorage.setItem("geToken", action.payload.token);
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Forgot Password
            .addCase(forgotPassword.pending, (state) => {
                state.isLoading = true;
                state.error = null;
                state.message = null;
            })
            .addCase(forgotPassword.fulfilled, (state, action) => {
                state.isLoading = false;
                state.message = action.payload.message;
            })
            .addCase(forgotPassword.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Reset Password
            .addCase(resetPassword.pending, (state) => {
                state.isLoading = true;
                state.error = null;
                state.message = null;
            })
            .addCase(resetPassword.fulfilled, (state, action) => {
                state.isLoading = false;
                state.message = action.payload.message;
            })
            .addCase(resetPassword.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Fetch full profile
            .addCase(fetchUserProfile.fulfilled, (state, action) => {
                state.profile = action.payload;
            })
            // Update profile
            .addCase(updateUserProfile.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateUserProfile.fulfilled, (state, action) => {
                state.isLoading = false;
                state.profile = action.payload;

                // keep the lightweight currentUser name in sync too
                // (navbar and other places read the name from here)
                if (state.currentUser) {
                    state.currentUser.name = action.payload.name;
                    localStorage.setItem("geUser", JSON.stringify(state.currentUser));
                }
            })
            .addCase(updateUserProfile.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Change Password
            .addCase(changePassword.pending, (state) => {
                state.isLoading = true;
                state.error = null;
                state.message = null;
            })
            .addCase(changePassword.fulfilled, (state, action) => {
                state.isLoading = false;
                state.message = action.payload.message;
            })
            .addCase(changePassword.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

export const { logoutUser, clearUserStatus } = user.actions;
export const userReducer = user.reducer;
