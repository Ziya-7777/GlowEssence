import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { API_URL } from "../../config/api.js";

const BASE_URL = `${API_URL}/api/cart`;

const authHeaders = (token) => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
});

// Add a product to the cart
export const addToCart = createAsyncThunk(
    "cart/addToCart",
    async ({ productId, quantity }, { getState, rejectWithValue }) => {
        try {
            const token = getState().users.token;

            const res = await fetch(`${BASE_URL}/add-to-cart`, {
                method: "POST",
                headers: authHeaders(token),
                body: JSON.stringify({ productId, quantity }),
            });

            const data = await res.json();

            if (!res.ok) {
                return rejectWithValue(data.message || "Failed to add to cart");
            }

            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Get logged in user's cart
export const fetchCart = createAsyncThunk(
    "cart/fetchCart",
    async (_, { getState, rejectWithValue }) => {
        try {
            const token = getState().users.token;

            const res = await fetch(`${BASE_URL}/get-cart`, {
                headers: authHeaders(token),
            });

            const data = await res.json();

            if (!res.ok) {
                return rejectWithValue(data.message || "Failed to load cart");
            }

            return data.cart;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Update quantity of a cart item
export const updateCartItem = createAsyncThunk(
    "cart/updateCartItem",
    async ({ id, quantity }, { getState, rejectWithValue }) => {
        try {
            const token = getState().users.token;

            const res = await fetch(`${BASE_URL}/update/${id}`, {
                method: "PATCH",
                headers: authHeaders(token),
                body: JSON.stringify({ quantity }),
            });

            const data = await res.json();

            if (!res.ok) {
                return rejectWithValue(data.message || "Failed to update quantity");
            }

            return data.cart;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Remove a product from the cart
export const removeCartItem = createAsyncThunk(
    "cart/removeCartItem",
    async (id, { getState, rejectWithValue }) => {
        try {
            const token = getState().users.token;

            const res = await fetch(`${BASE_URL}/remove/${id}`, {
                method: "DELETE",
                headers: authHeaders(token),
            });

            const data = await res.json();

            if (!res.ok) {
                return rejectWithValue(data.message || "Failed to remove item");
            }

            return id;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Empty the whole cart (used right after a successful order payment)
export const clearCart = createAsyncThunk(
    "cart/clearCart",
    async (_, { getState, rejectWithValue }) => {
        try {
            const token = getState().users.token;

            const res = await fetch(`${BASE_URL}/clear`, {
                method: "DELETE",
                headers: authHeaders(token),
            });

            const data = await res.json();

            if (!res.ok) {
                return rejectWithValue(data.message || "Failed to clear cart");
            }

            return true;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const cart = createSlice({
    name: "cart",
    initialState: {
        items: [],
        isLoading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(addToCart.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(addToCart.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(addToCart.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(fetchCart.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchCart.fulfilled, (state, action) => {
                state.isLoading = false;
                state.items = action.payload;
            })
            .addCase(fetchCart.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(updateCartItem.fulfilled, (state, action) => {
                const updated = action.payload;
                const index = state.items.findIndex(
                    (item) => item._id === updated._id
                );
                if (index !== -1) {
                    state.items[index].quantity = updated.quantity;
                }
            })
            .addCase(removeCartItem.fulfilled, (state, action) => {
                state.items = state.items.filter(
                    (item) => item._id !== action.payload
                );
            })
            .addCase(clearCart.fulfilled, (state) => {
                state.items = [];
            });
    },
});

export const cartReducer = cart.reducer;
