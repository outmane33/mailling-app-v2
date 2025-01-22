import { create } from "zustand";
import { axiosInstance } from "../lib/axios";

export const useErrorStore = create((set) => ({
  errors: [],
  loading: false,
  fetchErrors: async () => {
    set({ loading: true });
    try {
      const { data } = await axiosInstance.get("/api/v1/send/errorLog");
      set({ errors: data.errors });
    } catch (err) {
      console.error("Failed to fetch errors:", err);
    } finally {
      set({ loading: false });
    }
  },
}));
