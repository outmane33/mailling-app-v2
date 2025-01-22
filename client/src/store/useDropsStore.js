import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

export const useDropsStore = create((set, get) => ({
  drops: [],
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    pageSize: 10,
    totalPages: 0,
    totalItems: 0,
    hasNextPage: false,
    hasPrevPage: false,
  },
  filters: {
    status: "",
    campaignName: "",
    mailer: "",
    offer: "",
    isp: "",
    startDate: "",
    endDate: "",
  },
  sort: {
    field: "createdAt",
    order: "desc",
  },
  stats: {
    totalDrops: 0,
    activeDrops: 0,
    totalOpens: 0,
    totalClicks: 0,
  },

  // Actions
  setFilters: (newFilters) =>
    set({ filters: { ...get().filters, ...newFilters } }),
  setSort: (field, order) => set({ sort: { field, order } }),
  setPage: (page) =>
    set((state) => ({
      pagination: { ...state.pagination, currentPage: page },
    })),
  setPageSize: (pageSize) =>
    set((state) => ({
      pagination: { ...state.pagination, pageSize },
    })),

  // Fetch drops with all parameters
  fetchDrops: async () => {
    const state = get();
    const { filters, sort, pagination } = state;

    set({ loading: true, error: null });

    try {
      const queryParams = new URLSearchParams({
        page: pagination.currentPage,
        pageSize: pagination.pageSize,
        sortBy: sort.field,
        sortOrder: sort.order,
        ...filters,
      });

      const response = await axiosInstance.get(`/api/v1/drop?${queryParams}`);

      set({
        drops: response.data.data.drops,
        pagination: response.data.data.pagination,
        stats: response.data.data.stats,
        loading: false,
      });
    } catch (error) {
      set({
        error: error.message,
        loading: false,
      });
    }
  },

  // Reset all filters and reload
  resetFilters: () => {
    set((state) => ({
      filters: {
        status: "",
        campaignName: "",
        mailer: "",
        offer: "",
        isp: "",
        startDate: "",
        endDate: "",
      },
      pagination: {
        ...state.pagination,
        currentPage: 1,
      },
    }));
    get().fetchDrops();
  },
}));
