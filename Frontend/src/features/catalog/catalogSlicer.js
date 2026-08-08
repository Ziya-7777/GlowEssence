import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { API_URL } from "../../config/api.js";

// Categories and brands are used to fill the dropdowns on the
// seller's "Add Product" form.

const authHeaders = (token) => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
});

export const fetchCategories = createAsyncThunk(
    "catalog/fetchCategories",
    async (_, { getState, rejectWithValue }) => {
        try {
            const token = getState().users.token || getState().seller.token;

            const res = await fetch(`${API_URL}/api/category/get-all-category`, {
                headers: authHeaders(token),
            });

            const data = await res.json();

            if (!res.ok) {
                return rejectWithValue(data.message || "Failed to load categories");
            }

            return data.category;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchBrands = createAsyncThunk(
    "catalog/fetchBrands",
    async (_, { getState, rejectWithValue }) => {
        try {
            const token = getState().users.token || getState().seller.token;

            const res = await fetch(`${API_URL}/api/brand/get-all-brands`, {
                headers: authHeaders(token),
            });

            const data = await res.json();

            if (!res.ok) {
                return rejectWithValue(data.message || "Failed to load brands");
            }

            return data.brands;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// ---------- Category management (admin or seller) ----------

export const createCategory = createAsyncThunk(
    "catalog/createCategory",
    async (name, { getState, rejectWithValue }) => {
        try {
            const token = getState().users.token || getState().seller.token;

            const res = await fetch(`${API_URL}/api/category/add-category`, {
                method: "POST",
                headers: authHeaders(token),
                body: JSON.stringify({ name }),
            });

            const data = await res.json();

            if (!res.ok) {
                return rejectWithValue(data.message || "Failed to add category");
            }

            return data.category;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateCategory = createAsyncThunk(
    "catalog/updateCategory",
    async ({ id, name }, { getState, rejectWithValue }) => {
        try {
            const token = getState().users.token || getState().seller.token;

            const res = await fetch(`${API_URL}/api/category/${id}`, {
                method: "PATCH",
                headers: authHeaders(token),
                body: JSON.stringify({ name }),
            });

            const data = await res.json();

            if (!res.ok) {
                return rejectWithValue(data.message || "Failed to update category");
            }

            return data.category;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const deleteCategory = createAsyncThunk(
    "catalog/deleteCategory",
    async (id, { getState, rejectWithValue }) => {
        try {
            const token = getState().users.token || getState().seller.token;

            const res = await fetch(`${API_URL}/api/category/${id}`, {
                method: "DELETE",
                headers: authHeaders(token),
            });

            const data = await res.json();

            if (!res.ok) {
                return rejectWithValue(data.message || "Failed to delete category");
            }

            return id;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// ---------- Brand management (admin or seller) ----------

export const createBrand = createAsyncThunk(
    "catalog/createBrand",
    async (name, { getState, rejectWithValue }) => {
        try {
            const token = getState().users.token || getState().seller.token;

            const res = await fetch(`${API_URL}/api/brand/add-brand`, {
                method: "POST",
                headers: authHeaders(token),
                body: JSON.stringify({ name }),
            });

            const data = await res.json();

            if (!res.ok) {
                return rejectWithValue(data.message || "Failed to add brand");
            }

            return data.brand;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateBrand = createAsyncThunk(
    "catalog/updateBrand",
    async ({ id, name }, { getState, rejectWithValue }) => {
        try {
            const token = getState().users.token || getState().seller.token;

            const res = await fetch(`${API_URL}/api/brand/${id}`, {
                method: "PATCH",
                headers: authHeaders(token),
                body: JSON.stringify({ name }),
            });

            const data = await res.json();

            if (!res.ok) {
                return rejectWithValue(data.message || "Failed to update brand");
            }

            return data.brand;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const deleteBrand = createAsyncThunk(
    "catalog/deleteBrand",
    async (id, { getState, rejectWithValue }) => {
        try {
            const token = getState().users.token || getState().seller.token;

            const res = await fetch(`${API_URL}/api/brand/${id}`, {
                method: "DELETE",
                headers: authHeaders(token),
            });

            const data = await res.json();

            if (!res.ok) {
                return rejectWithValue(data.message || "Failed to delete brand");
            }

            return id;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const catalog = createSlice({
    name: "catalog",
    initialState: {
        categories: [],
        brands: [],
        isLoading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchCategories.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.isLoading = false;
                state.categories = action.payload;
            })
            .addCase(fetchCategories.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(fetchBrands.fulfilled, (state, action) => {
                state.brands = action.payload;
            })
            .addCase(fetchBrands.rejected, (state, action) => {
                state.error = action.payload;
            })
            // Category management
            .addCase(createCategory.fulfilled, (state, action) => {
                state.categories.push(action.payload);
            })
            .addCase(createCategory.rejected, (state, action) => {
                state.error = action.payload;
            })
            .addCase(updateCategory.fulfilled, (state, action) => {
                const index = state.categories.findIndex(
                    (category) => category._id === action.payload._id
                );
                if (index !== -1) {
                    state.categories[index] = action.payload;
                }
            })
            .addCase(updateCategory.rejected, (state, action) => {
                state.error = action.payload;
            })
            .addCase(deleteCategory.fulfilled, (state, action) => {
                state.categories = state.categories.filter(
                    (category) => category._id !== action.payload
                );
            })
            .addCase(deleteCategory.rejected, (state, action) => {
                state.error = action.payload;
            })
            // Brand management
            .addCase(createBrand.fulfilled, (state, action) => {
                state.brands.push(action.payload);
            })
            .addCase(createBrand.rejected, (state, action) => {
                state.error = action.payload;
            })
            .addCase(updateBrand.fulfilled, (state, action) => {
                const index = state.brands.findIndex(
                    (brand) => brand._id === action.payload._id
                );
                if (index !== -1) {
                    state.brands[index] = action.payload;
                }
            })
            .addCase(updateBrand.rejected, (state, action) => {
                state.error = action.payload;
            })
            .addCase(deleteBrand.fulfilled, (state, action) => {
                state.brands = state.brands.filter(
                    (brand) => brand._id !== action.payload
                );
            })
            .addCase(deleteBrand.rejected, (state, action) => {
                state.error = action.payload;
            });
    },
});

export const catalogReducer = catalog.reducer;
