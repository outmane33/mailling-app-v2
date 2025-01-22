import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

export const useTestStore = create((set) => ({
  tests: [],
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false,
  },
  filters: {
    search: "",
    sortField: "createdAt",
    sortOrder: "desc",
    startDate: null,
    endDate: null,
  },

  // Fetch tests with all parameters
  fetchTests: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const queryParams = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 10,
        sortField: params.sortField || "createdAt",
        sortOrder: params.sortOrder || "desc",
        search: params.search || "",
        ...(params.startDate && { startDate: params.startDate }),
        ...(params.endDate && { endDate: params.endDate }),
      });

      const response = await axiosInstance.get(`/api/v1/test?${queryParams}`);
      set({
        tests: response.data.data,
        pagination: response.data.pagination,
        loading: false,
      });
    } catch (error) {
      set({
        error: error.message,
        loading: false,
      });
    }
  },

  // Update filters and fetch
  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
    useTestStore.getState().fetchTests({
      ...useTestStore.getState().filters,
      ...newFilters,
      page: 1, // Reset to first page when filters change
    });
  },

  // Update page
  setPage: (page) => {
    useTestStore.getState().fetchTests({
      ...useTestStore.getState().filters,
      page,
    });
  },
}));
