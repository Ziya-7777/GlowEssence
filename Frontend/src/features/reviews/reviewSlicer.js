import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { API_URL } from "../../config/api.js";

const BASE_URL = `${API_URL}/api/review`;

const authHeaders = (token) => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
});

// A normal fetch(), but it gives up after a few seconds instead of
// hanging forever if the backend/database is slow or unreachable.
const fetchWithTimeout = async (url, options = {}, timeoutMs = 8000) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
        return await fetch(url, { ...options, signal: controller.signal });
    } finally {
        clearTimeout(timeoutId);
    }
};

// Get all reviews for one product
export const fetchReviews = createAsyncThunk(
    "reviews/fetchReviews",
    async (productId, { getState, rejectWithValue }) => {
        try {
            const token = getState().users.token;

            const res = await fetchWithTimeout(`${BASE_URL}/all-reviews/${productId}`, {
                headers: authHeaders(token),
            });

            const data = await res.json();

            if (!res.ok) {
                return rejectWithValue(data.message || "Failed to load reviews");
            }

            return data.reviews;
        } catch (error) {
            if (error.name === "AbortError") {
                return rejectWithValue("This is taking too long. Please check your connection and try again.");
            }
            return rejectWithValue(error.message);
        }
    }
);

// Get the most recent, highest-rated reviews across all products.
// Public endpoint - no login needed, used for the homepage testimonials.
export const fetchRecentReviews = createAsyncThunk(
    "reviews/fetchRecentReviews",
    async (_, { rejectWithValue }) => {
        try {
            const res = await fetchWithTimeout(`${BASE_URL}/recent`);

            const data = await res.json();

            if (!res.ok) {
                return rejectWithValue(data.message || "Failed to load reviews");
            }

            return data.reviews;
        } catch (error) {
            if (error.name === "AbortError") {
                return rejectWithValue("This is taking too long. Please check your connection and try again.");
            }
            return rejectWithValue(error.message);
        }
    }
);

// Add a new review for a product
export const addReview = createAsyncThunk(
    "reviews/addReview",
    async ({ productId, rating, comment }, { getState, rejectWithValue }) => {
        try {
            const token = getState().users.token;

            const res = await fetchWithTimeout(`${BASE_URL}/add-review`, {
                method: "POST",
                headers: authHeaders(token),
                body: JSON.stringify({ productId, rating, comment }),
            });

            const data = await res.json();

            if (!res.ok) {
                return rejectWithValue(data.message || "Failed to add review");
            }

            return data.review;
        } catch (error) {
            if (error.name === "AbortError") {
                return rejectWithValue("This is taking too long. Please check your connection and try again.");
            }
            return rejectWithValue(error.message);
        }
    }
);

const reviews = createSlice({
    name: "reviews",
    initialState: {
        items: [],
        // separate list for the homepage carousel (recent reviews
        // across all products), kept apart from a single product's reviews
        recentItems: [],
        isLoadingRecent: false,
        isLoading: false,
        error: null,
    },
    reducers: {
        clearReviewError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchReviews.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchReviews.fulfilled, (state, action) => {
                state.isLoading = false;
                state.items = action.payload;
            })
            .addCase(fetchReviews.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(fetchRecentReviews.pending, (state) => {
                state.isLoadingRecent = true;
            })
            .addCase(fetchRecentReviews.fulfilled, (state, action) => {
                state.isLoadingRecent = false;
                state.recentItems = action.payload;
            })
            .addCase(fetchRecentReviews.rejected, (state) => {
                state.isLoadingRecent = false;
            })
            .addCase(addReview.pending, (state) => {
                state.error = null;
            })
            // NOTE: addReview's response only has the reviewer's id, not their
            // name (the backend doesn't populate it on create). So instead of
            // trying to add it to the list here, the page just calls
            // fetchReviews again after this succeeds to get the full,
            // populated list back.
            .addCase(addReview.rejected, (state, action) => {
                state.error = action.payload;
            });
    },
});

export const { clearReviewError } = reviews.actions;
export const reviewReducer = reviews.reducer;
