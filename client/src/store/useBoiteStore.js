import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useBoiteStore = create((set) => ({
  senders: [],
  loading: false,
  error: null,

  getAllSenders: async (isp) => {
    set({ loading: true });
    try {
      const res = await axiosInstance.get(`/api/v1/boites/${isp}`);
      set({ senders: res.data.emails });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ loading: false });
    }
  },
}));
