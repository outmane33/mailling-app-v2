import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useBoiteStore = create((set) => ({
  data: [],
  loading: false,
  error: null,

  getDataInfo: async (info) => {
    set({ loading: true });
    try {
      const res = await axiosInstance.post(`/api/v1/data`, info);
      set({ data: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ loading: false });
    }
  },
}));
