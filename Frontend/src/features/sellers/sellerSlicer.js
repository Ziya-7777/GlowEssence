import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { API_URL } from "../../config/api.js";

const BASE_URL = `${API_URL}/api/seller`;

// Register a new seller (business account)
export const registerSeller = createAsyncThunk(
    "seller/registerSeller",
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

// Login seller
export const loginSeller = createAsyncThunk(
    "seller/loginSeller",
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

// Get the logged-in seller's full details (name, email, business info, ...)
// Login only gives us { id, name }, so this fetches everything else.
export const fetchSellerProfileDetails = createAsyncThunk(
    "seller/fetchSellerProfileDetails",
    async (sellerId, { getState, rejectWithValue }) => {
        try {
            const token = getState().seller.token;

            const res = await fetch(`${BASE_URL}/profile/${sellerId}`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await res.json();

            if (!res.ok) {
                return rejectWithValue(data.message || "Failed to load profile");
            }

            return data.seller;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const storedSeller = localStorage.getItem("geSeller");
const storedSellerToken = localStorage.getItem("geSellerToken");

const seller = createSlice({
    name: "seller",
    initialState: {
        currentSeller: storedSeller ? JSON.parse(storedSeller) : null,
        token: storedSellerToken || null,
        // full profile details (email, business name, gstin, ...), filled in by fetchSellerProfileDetails
        profile: null,
        isLoading: false,
        error: null,
        message: null,
    },
    reducers: {
        logoutSeller: (state) => {
            state.currentSeller = null;
            state.token = null;
            state.profile = null;
            localStorage.removeItem("geSeller");
            localStorage.removeItem("geSellerToken");
        },
        clearSellerStatus: (state) => {
            state.error = null;
            state.message = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Register
            .addCase(registerSeller.pending, (state) => {
                state.isLoading = true;
                state.error = null;
                state.message = null;
            })
            .addCase(registerSeller.fulfilled, (state, action) => {
                state.isLoading = false;
                state.message = action.payload.message;
            })
            .addCase(registerSeller.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Login
            .addCase(loginSeller.pending, (state) => {
                state.isLoading = true;
                state.error = null;
                state.message = null;
            })
            .addCase(loginSeller.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentSeller = {
                    id: action.payload.sellerId,
                    name: action.payload.name,
                    role: "seller",
                };
                state.token = action.payload.token;
                localStorage.setItem("geSeller", JSON.stringify(state.currentSeller));
                localStorage.setItem("geSellerToken", action.payload.token);
            })
            .addCase(loginSeller.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Fetch full profile
            .addCase(fetchSellerProfileDetails.fulfilled, (state, action) => {
                state.profile = action.payload;
            });
    },
});

export const { logoutSeller, clearSellerStatus } = seller.actions;
export const sellerReducer = seller.reducer;
