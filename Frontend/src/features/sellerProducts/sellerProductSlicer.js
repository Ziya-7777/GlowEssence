import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { API_URL } from "../../config/api.js";

const BASE_URL = `${API_URL}/api/product`;

const authHeaders = (token) => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
});

// Get only the logged-in seller's own products
export const fetchMyProducts = createAsyncThunk(
    "sellerProducts/fetchMyProducts",
    async (_, { getState, rejectWithValue }) => {
        try {
            const token = getState().seller.token;

            const res = await fetch(`${BASE_URL}/my-products`, {
                headers: authHeaders(token),
            });

            const data = await res.json();

            if (!res.ok) {
                return rejectWithValue(data.message || "Failed to load your products");
            }

            return data.product;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Add a new product
export const createProduct = createAsyncThunk(
    "sellerProducts/createProduct",
    async (productData, { getState, rejectWithValue }) => {
        try {
            const token = getState().seller.token;

            const res = await fetch(`${BASE_URL}/add-product`, {
                method: "POST",
                headers: authHeaders(token),
                body: JSON.stringify(productData),
            });

            const data = await res.json();

            if (!res.ok) {
                const message = Array.isArray(data) ? data[0]?.msg : data.message;
                return rejectWithValue(message || "Failed to add product");
            }

            return data.product;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Update one of the seller's own products
export const updateProduct = createAsyncThunk(
    "sellerProducts/updateProduct",
    async ({ id, updates }, { getState, rejectWithValue }) => {
        try {
            const token = getState().seller.token;

            const res = await fetch(`${BASE_URL}/${id}`, {
                method: "PATCH",
                headers: authHeaders(token),
                body: JSON.stringify(updates),
            });

            const data = await res.json();

            if (!res.ok) {
                return rejectWithValue(data.message || "Failed to update product");
            }

            return data.product;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Get the logged-in seller's own dashboard numbers
// (total products listed, total revenue earned so far)
export const fetchSellerDashboard = createAsyncThunk(
    "sellerProducts/fetchSellerDashboard",
    async (_, { getState, rejectWithValue }) => {
        try {
            const token = getState().seller.token;

            const res = await fetch(`${API_URL}/api/seller/dashboard`, {
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

// Delete one of the seller's own products
export const deleteProduct = createAsyncThunk(
    "sellerProducts/deleteProduct",
    async (id, { getState, rejectWithValue }) => {
        try {
            const token = getState().seller.token;

            const res = await fetch(`${BASE_URL}/${id}`, {
                method: "DELETE",
                headers: authHeaders(token),
            });

            const data = await res.json();

            if (!res.ok) {
                return rejectWithValue(data.message || "Failed to delete product");
            }

            return id;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const sellerProducts = createSlice({
    name: "sellerProducts",
    initialState: {
        items: [],
        summary: null,
        isLoading: false,
        error: null,
        message: null,
    },
    reducers: {
        clearSellerProductStatus: (state) => {
            state.error = null;
            state.message = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchMyProducts.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchMyProducts.fulfilled, (state, action) => {
                state.isLoading = false;
                state.items = action.payload;
            })
            .addCase(fetchMyProducts.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(createProduct.pending, (state) => {
                state.isLoading = true;
                state.error = null;
                state.message = null;
            })
            .addCase(createProduct.fulfilled, (state, action) => {
                state.isLoading = false;
                state.message = "Product added successfully.";
                state.items.push(action.payload);
            })
            .addCase(createProduct.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(updateProduct.fulfilled, (state, action) => {
                const index = state.items.findIndex(
                    (item) => item._id === action.payload._id
                );
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
            })
            .addCase(updateProduct.rejected, (state, action) => {
                state.error = action.payload;
            })
            .addCase(deleteProduct.fulfilled, (state, action) => {
                state.items = state.items.filter((item) => item._id !== action.payload);
            })
            .addCase(deleteProduct.rejected, (state, action) => {
                state.error = action.payload;
            })
            .addCase(fetchSellerDashboard.fulfilled, (state, action) => {
                state.summary = action.payload;
            })
            .addCase(fetchSellerDashboard.rejected, (state, action) => {
                state.error = action.payload;
            });
    },
});

export const { clearSellerProductStatus } = sellerProducts.actions;
export const sellerProductReducer = sellerProducts.reducer;
