import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSignUp: false,
  isLogin: false,
  isCheckingAuth: false,
  onlineUsers: [],
  socket: null,
  drop: {
    emailSent: null,
    total: 0,
    status: "active",
    campaignName: null,
  },

  checkAuth: async () => {
    set({ isCheckingAuth: true });
    try {
      const res = await axiosInstance.get("/api/v1/auth/check");
      set({ authUser: res.data.user });
      get().connectSocket();
    } catch (error) {
      console.log(error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSignUp: true });
    try {
      const res = await axiosInstance.post("/api/v1/auth/signup", data);
      set({ authUser: res.data.user });
      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isSignUp: false });
    }
  },
  login: async (data) => {
    set({ isLogin: true });
    try {
      const res = await axiosInstance.post("/api/v1/auth/signin", data);
      set({ authUser: res.data.user });
      toast.success("Logged in successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isLogin: false });
    }
  },
  logout: async () => {
    try {
      await axiosInstance.get("/api/v1/auth/signout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;
    const socket = io(import.meta.env.VITE_BASE_URL, {
      query: {
        userId: authUser._id,
      },
    });
    socket.connect();
    set({ socket });
    socket.on("getOnlineUsers", (onlineUsers) => {
      set({ onlineUsers });
    });
  },
  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
  subscribeToDrops: () => {
    const socket = get().socket;
    if (!socket) return;

    socket.on("emailSent", (emailSent) => {
      set((state) => ({
        drop: {
          ...state.drop,
          emailSent,
          total: emailSent.total || state.drop.total,
          campaignName: emailSent.campaignName,
        },
      }));
    });

    socket.on("dropStatus", (status) => {
      set((state) => ({
        drop: {
          ...state.drop,
          status,
        },
      }));
    });
  },

  unsubscribeFromDrops: () => {
    const socket = get().socket;
    if (!socket) return;

    socket.off("emailSent");
    socket.off("dropStatus");
  },

  // Method to update drop status
  updateDropStatus: (status) => {
    set((state) => ({
      drop: {
        ...state.drop,
        status,
      },
    }));
  },
}));
