import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { API_URL } from "../../config/api.js";

const BASE_URL = `${API_URL}/api/admin`;

const authHeaders = (token) => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
});

// Get every registered user (admin only)
export const fetchAllUsers = createAsyncThunk(
    "admin/fetchAllUsers",
    async (_, { getState, rejectWithValue }) => {
        try {
            const token = getState().users.token;

            const res = await fetch(`${BASE_URL}/users`, {
                headers: authHeaders(token),
            });

            const data = await res.json();

            if (!res.ok) {
                return rejectWithValue(data.message || "Failed to load users");
            }

            return data.users;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Update any user's details (admin only)
export const updateUserByAdmin = createAsyncThunk(
    "admin/updateUserByAdmin",
    async ({ id, updates }, { getState, rejectWithValue }) => {
        try {
            const token = getState().users.token;

            const res = await fetch(`${BASE_URL}/users/${id}`, {
                method: "PATCH",
                headers: authHeaders(token),
                body: JSON.stringify(updates),
            });

            const data = await res.json();

            if (!res.ok) {
                return rejectWithValue(data.message || "Failed to update user");
            }

            return data.user;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Delete any user (admin only)
export const deleteUserByAdmin = createAsyncThunk(
    "admin/deleteUserByAdmin",
    async (id, { getState, rejectWithValue }) => {
        try {
            const token = getState().users.token;

            const res = await fetch(`${BASE_URL}/users/${id}`, {
                method: "DELETE",
                headers: authHeaders(token),
            });

            const data = await res.json();

            if (!res.ok) {
                return rejectWithValue(data.message || "Failed to delete user");
            }

            return id;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Get every registered seller (admin only)
export const fetchAllSellers = createAsyncThunk(
    "admin/fetchAllSellers",
    async (_, { getState, rejectWithValue }) => {
        try {
            const token = getState().users.token;

            const res = await fetch(`${BASE_URL}/sellers`, {
                headers: authHeaders(token),
            });

            const data = await res.json();

            if (!res.ok) {
                return rejectWithValue(data.message || "Failed to load sellers");
            }

            return data.sellers;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Approve / reject a seller (admin only)
export const updateSellerStatusByAdmin = createAsyncThunk(
    "admin/updateSellerStatusByAdmin",
    async ({ id, status }, { getState, rejectWithValue }) => {
        try {
            const token = getState().users.token;

            const res = await fetch(`${BASE_URL}/sellers/${id}/status`, {
                method: "PATCH",
                headers: authHeaders(token),
                body: JSON.stringify({ status }),
            });

            const data = await res.json();

            if (!res.ok) {
                return rejectWithValue(data.message || "Failed to update seller status");
            }

            return data.seller;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Delete any seller (admin only)
export const deleteSellerByAdmin = createAsyncThunk(
    "admin/deleteSellerByAdmin",
    async (id, { getState, rejectWithValue }) => {
        try {
            const token = getState().users.token;

            const res = await fetch(`${BASE_URL}/sellers/${id}`, {
                method: "DELETE",
                headers: authHeaders(token),
            });

            const data = await res.json();

            if (!res.ok) {
                return rejectWithValue(data.message || "Failed to delete seller");
            }

            return id;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Dashboard summary numbers (total users, sellers, products, orders, revenue)
export const fetchDashboardSummary = createAsyncThunk(
    "admin/fetchDashboardSummary",
    async (_, { getState, rejectWithValue }) => {
        try {
            const token = getState().users.token;

            const res = await fetch(`${BASE_URL}/dashboard`, {
                headers: authHeaders(token),
            });

            const data = await res.json();

            if (!res.ok) {
                return rejectWithValue(data.message || "Failed to load dashboard");
            }

            return data.dashboard;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Revenue grouped by month, for the bar chart
export const fetchMonthlyRevenue = createAsyncThunk(
    "admin/fetchMonthlyRevenue",
    async (_, { getState, rejectWithValue }) => {
        try {
            const token = getState().users.token;

            const res = await fetch(`${BASE_URL}/monthly-revenue`, {
                headers: authHeaders(token),
            });

            const data = await res.json();

            if (!res.ok) {
                return rejectWithValue(data.message || "Failed to load revenue");
            }

            return data.revenue;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Best-selling products
export const fetchTopProducts = createAsyncThunk(
    "admin/fetchTopProducts",
    async (_, { getState, rejectWithValue }) => {
        try {
            const token = getState().users.token;

            const res = await fetch(`${BASE_URL}/top-products`, {
                headers: authHeaders(token),
            });

            const data = await res.json();

            if (!res.ok) {
                return rejectWithValue(data.message || "Failed to load top products");
            }

            return data.products;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Most recent orders
export const fetchRecentOrders = createAsyncThunk(
    "admin/fetchRecentOrders",
    async (_, { getState, rejectWithValue }) => {
        try {
            const token = getState().users.token;

            const res = await fetch(`${BASE_URL}/recent-orders`, {
                headers: authHeaders(token),
            });

            const data = await res.json();

            if (!res.ok) {
                return rejectWithValue(data.message || "Failed to load recent orders");
            }

            return data.orders;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const admin = createSlice({
    name: "admin",
    initialState: {
        users: [],
        sellers: [],
        summary: null,
        monthlyRevenue: [],
        topProducts: [],
        recentOrders: [],
        isLoading: false,
        error: null,
        message: null,
    },
    reducers: {
        clearAdminStatus: (state) => {
            state.error = null;
            state.message = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllUsers.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchAllUsers.fulfilled, (state, action) => {
                state.isLoading = false;
                state.users = action.payload;
            })
            .addCase(fetchAllUsers.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(updateUserByAdmin.fulfilled, (state, action) => {
                const index = state.users.findIndex(
                    (user) => user._id === action.payload._id
                );
                if (index !== -1) {
                    state.users[index] = action.payload;
                }
                state.message = "User updated.";
            })
            .addCase(updateUserByAdmin.rejected, (state, action) => {
                state.error = action.payload;
            })
            .addCase(deleteUserByAdmin.fulfilled, (state, action) => {
                state.users = state.users.filter((user) => user._id !== action.payload);
                state.message = "User deleted.";
            })
            .addCase(deleteUserByAdmin.rejected, (state, action) => {
                state.error = action.payload;
            })
            .addCase(fetchAllSellers.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchAllSellers.fulfilled, (state, action) => {
                state.isLoading = false;
                state.sellers = action.payload;
            })
            .addCase(fetchAllSellers.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(updateSellerStatusByAdmin.fulfilled, (state, action) => {
                const index = state.sellers.findIndex(
                    (seller) => seller._id === action.payload._id
                );
                if (index !== -1) {
                    state.sellers[index] = action.payload;
                }
                state.message = `Seller ${action.payload.status}.`;
            })
            .addCase(updateSellerStatusByAdmin.rejected, (state, action) => {
                state.error = action.payload;
            })
            .addCase(deleteSellerByAdmin.fulfilled, (state, action) => {
                state.sellers = state.sellers.filter((seller) => seller._id !== action.payload);
                state.message = "Seller deleted.";
            })
            .addCase(deleteSellerByAdmin.rejected, (state, action) => {
                state.error = action.payload;
            })
            .addCase(fetchDashboardSummary.fulfilled, (state, action) => {
                state.summary = action.payload;
            })
            .addCase(fetchMonthlyRevenue.fulfilled, (state, action) => {
                state.monthlyRevenue = action.payload;
            })
            .addCase(fetchTopProducts.fulfilled, (state, action) => {
                state.topProducts = action.payload;
            })
            .addCase(fetchRecentOrders.fulfilled, (state, action) => {
                state.recentOrders = action.payload;
            });
    },
});

export const { clearAdminStatus } = admin.actions;
export const adminReducer = admin.reducer;