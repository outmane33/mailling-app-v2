import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

export const useStatisticsStore = create((set) => ({
  statistics: {
    activeDrops: 0,
    dailyDrops: 0,
    dailySent: 0,
    dailyClicks: 0,
    dailyTests: 0,
    dailyDelivered: 0,
    monthlyClicks: 0,
    usersCount: 0,
    dailyStats: [],
  },
  loading: false,
  error: null,

  fetchStatistics: async () => {
    set({ loading: true });
    try {
      const { data } = await axiosInstance.get("/api/v1/statistics");
      set({
        statistics: data,
        loading: false,
        error: null,
      });
    } catch (error) {
      set({
        error: error?.response?.data?.message || "Failed to fetch statistics",
        loading: false,
        statistics: {
          activeDrops: 0,
          dailyDrops: 0,
          dailySent: 0,
          dailyClicks: 0,
          dailyTests: 0,
          dailyDelivered: 0,
          monthlyClicks: 0,
          usersCount: 0,
          dailyStats: [],
        },
      });
    }
  },
}));
