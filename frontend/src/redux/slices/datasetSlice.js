import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../services/api";

const initialState = {
  datasets: [],
  activeDataset: null,
  activeRows: [],
  isLoading: false,
  isRowsLoading: false,
  isError: false,
  message: "",
};

// Async Thunk: Fetch all user datasets
export const fetchUserDatasets = createAsyncThunk(
  "datasets/fetchAll",
  async (_, thunkAPI) => {
    try {
      const response = await API.get("/datasets");
      return response.data.data;
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.error) ||
        "Failed to fetch datasets";
      return thunkAPI.rejectWithValue(message);
    }
  },
);

// Async Thunk: Fetch dataset details + rows by ID
export const fetchDatasetById = createAsyncThunk(
  "datasets/fetchById",
  async (datasetId, thunkAPI) => {
    try {
      const response = await API.get(`/datasets/${datasetId}`);
      // Returns response payload (e.g. response.data.data or response.data)
      return response.data.data || response.data;
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.error) ||
        "Failed to fetch dataset details";
      return thunkAPI.rejectWithValue(message);
    }
  },
);

// Async Thunk: Upload new dataset
export const uploadDatasetFile = createAsyncThunk(
  "datasets/upload",
  async (formData, thunkAPI) => {
    try {
      const response = await API.post("/datasets/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data.data;
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.error) ||
        "Upload failed";
      return thunkAPI.rejectWithValue(message);
    }
  },
);

// Async Thunk: Delete dataset
export const deleteDataset = createAsyncThunk(
  "datasets/delete",
  async (datasetId, thunkAPI) => {
    try {
      await API.delete(`/datasets/${datasetId}`);
      return datasetId;
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.error) ||
        "Failed to delete dataset";
      return thunkAPI.rejectWithValue(message);
    }
  },
);

export const datasetSlice = createSlice({
  name: "dataset",
  initialState,
  reducers: {
    setActiveDataset: (state, action) => {
      state.activeDataset = action.payload;
    },
    clearActiveDataset: (state) => {
      state.activeDataset = null;
      state.activeRows = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(fetchUserDatasets.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUserDatasets.fulfilled, (state, action) => {
        state.isLoading = false;
        state.datasets = action.payload;
      })
      .addCase(fetchUserDatasets.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Fetch By ID (Rows)
      .addCase(fetchDatasetById.pending, (state) => {
        state.isRowsLoading = true;
      })
      .addCase(fetchDatasetById.fulfilled, (state, action) => {
        state.isRowsLoading = false;
        const payload = action.payload;

        // Exhaustive extraction logic for any backend format
        let extractedRows = [];
        if (Array.isArray(payload)) {
          extractedRows = payload;
        } else if (Array.isArray(payload?.rows)) {
          extractedRows = payload.rows;
        } else if (Array.isArray(payload?.data)) {
          extractedRows = payload.data;
        } else if (Array.isArray(payload?.parsedData)) {
          extractedRows = payload.parsedData;
        } else if (Array.isArray(payload?.cleanedData)) {
          extractedRows = payload.cleanedData;
        } else if (Array.isArray(payload?.records)) {
          extractedRows = payload.records;
        } else if (Array.isArray(payload?.dataset?.rows)) {
          extractedRows = payload.dataset.rows;
        } else if (Array.isArray(payload?.dataset?.parsedData)) {
          extractedRows = payload.dataset.parsedData;
        }

        state.activeRows = extractedRows;
      })
      .addCase(fetchDatasetById.rejected, (state, action) => {
        state.isRowsLoading = false;
        state.activeRows = [];
        state.isError = true;
        state.message = action.payload;
      })
      // Upload
      .addCase(uploadDatasetFile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(uploadDatasetFile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.datasets.unshift(action.payload);
        state.activeDataset = action.payload;
      })
      .addCase(uploadDatasetFile.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Delete
      .addCase(deleteDataset.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteDataset.fulfilled, (state, action) => {
        state.isLoading = false;
        const deletedId = action.payload;
        state.datasets = state.datasets.filter(
          (d) => d._id !== deletedId && d.id !== deletedId,
        );
        if (
          state.activeDataset &&
          (state.activeDataset._id === deletedId ||
            state.activeDataset.id === deletedId)
        ) {
          state.activeDataset = null;
          state.activeRows = [];
        }
      })
      .addCase(deleteDataset.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { setActiveDataset, clearActiveDataset } = datasetSlice.actions;
export default datasetSlice.reducer;
