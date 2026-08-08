import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { API_URL } from "../../config/api.js";

const BASE_URL = `${API_URL}/api/order`;

const authHeaders = (token) => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
});

// Step 1: ask backend to create a Razorpay order for all the cart items
// items looks like: [ { productId, quantity }, { productId, quantity }, ... ]
export const createOrder = createAsyncThunk(
    "order/createOrder",
    async (items, { getState, rejectWithValue }) => {
        try {
            const token = getState().users.token;

            const res = await fetch(`${BASE_URL}/create-order`, {
                method: "POST",
                headers: authHeaders(token),
                body: JSON.stringify({ items }),
            });

            const data = await res.json();

            if (!res.ok) {
                return rejectWithValue(data.message || "Failed to start checkout");
            }

            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Step 2: after Razorpay's popup confirms the payment,
// send the payment details back to the backend to verify + save the order
export const verifyOrderPayment = createAsyncThunk(
    "order/verifyOrderPayment",
    async (paymentDetails, { getState, rejectWithValue }) => {
        try {
            const token = getState().users.token;

            const res = await fetch(`${BASE_URL}/verify-payment`, {
                method: "POST",
                headers: authHeaders(token),
                body: JSON.stringify(paymentDetails),
            });

            const data = await res.json();

            if (!res.ok) {
                return rejectWithValue(data.message || "Payment verification failed");
            }

            return data.order;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Cash on Delivery: places the order immediately, no Razorpay popup involved
export const createCodOrder = createAsyncThunk(
    "order/createCodOrder",
    async (items, { getState, rejectWithValue }) => {
        try {
            const token = getState().users.token;

            const res = await fetch(`${BASE_URL}/create-cod-order`, {
                method: "POST",
                headers: authHeaders(token),
                body: JSON.stringify({ items }),
            });

            const data = await res.json();

            if (!res.ok) {
                return rejectWithValue(data.message || "Failed to place order");
            }

            return data.order;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const order = createSlice({
    name: "order",
    initialState: {
        isLoading: false,
        error: null,
        // the order saved in the database after payment succeeds
        completedOrder: null,
    },
    reducers: {
        // used to reset the success/error message when leaving the page
        clearOrderStatus: (state) => {
            state.error = null;
            state.completedOrder = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(createOrder.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createOrder.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(createOrder.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(verifyOrderPayment.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(verifyOrderPayment.fulfilled, (state, action) => {
                state.isLoading = false;
                state.completedOrder = action.payload;
            })
            .addCase(verifyOrderPayment.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(createCodOrder.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createCodOrder.fulfilled, (state, action) => {
                state.isLoading = false;
                state.completedOrder = action.payload;
            })
            .addCase(createCodOrder.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

export const { clearOrderStatus } = order.actions;
export const orderReducer = order.reducer;
