import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { API_URL } from "../../config/api.js";

const BASE_URL = `${API_URL}/api/product`;

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

// Get every product (used by the Home page and Shop page).
// This endpoint is public - no login needed to browse products.
export const fetchAllProducts = createAsyncThunk(
    "product/fetchAllProducts",
    async (_, { rejectWithValue }) => {
        try {
            // limit=500 so we get everything back in one go - the Shop page
            // (and the Home page's per-category rows) already do their own
            // filtering/sorting/pagination on whatever list they get, so
            // there's no need for the backend to paginate too
            const res = await fetchWithTimeout(`${BASE_URL}/get-all-products?limit=500`);

            const data = await res.json();

            if (!res.ok) {
                return rejectWithValue(data.message || "Failed to load products");
            }

            return data.products;
        } catch (error) {
            if (error.name === "AbortError") {
                return rejectWithValue("This is taking too long. Please check your connection and try again.");
            }
            return rejectWithValue(error.message);
        }
    }
);

// Get one product by its real database id (used by the Product Details page)
export const fetchProductById = createAsyncThunk(
    "product/fetchProductById",
    async (id, { rejectWithValue }) => {
        try {
            const res = await fetchWithTimeout(`${BASE_URL}/${id}`);

            const data = await res.json();

            if (!res.ok) {
                return rejectWithValue(data.message || "Product not found");
            }

            return data.product;
        } catch (error) {
            if (error.name === "AbortError") {
                return rejectWithValue("This is taking too long. Please check your connection and try again.");
            }
            return rejectWithValue(error.message);
        }
    }
);

const product = createSlice({
    name: "product",
    initialState: {
        products: [],
        // list loading/error (fetchAllProducts) - used by Home/Shop/RelatedProducts
        isLoading: false,
        error: null,

        // single-product loading/error (fetchProductById) - kept SEPARATE from
        // the list's isLoading/error above. They used to share the same fields,
        // which meant RelatedProducts' own fetchAllProducts call (fired after
        // the product page finishes loading) would flip the shared isLoading
        // back to true, make ProductDetails re-show "Loading product...",
        // which unmounted RelatedProducts, which then remounted and fired
        // fetchAllProducts again - an endless loading loop.
        currentProduct: null,
        isLoadingCurrent: false,
        currentError: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllProducts.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchAllProducts.fulfilled, (state, action) => {
                state.isLoading = false;
                state.products = action.payload;
            })
            .addCase(fetchAllProducts.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(fetchProductById.pending, (state) => {
                state.isLoadingCurrent = true;
                state.currentError = null;
                state.currentProduct = null;
            })
            .addCase(fetchProductById.fulfilled, (state, action) => {
                state.isLoadingCurrent = false;
                state.currentProduct = action.payload;
            })
            .addCase(fetchProductById.rejected, (state, action) => {
                state.isLoadingCurrent = false;
                state.currentError = action.payload;
            });
    },
});

export const productReducer = product.reducer;
