import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useImageStore = create((set, get) => ({
  uploads: [],
  isLoading: false,
  error: null,
  pagination: { total: 0, pages: 0, current: 1, limit: 10 },
  stats: { totalImages: 0, totalSize: 0, averageSize: 0 },

  fetchUploads: async (page = 1) => {
    try {
      set({ isLoading: true, error: null });
      const response = await axiosInstance.get(
        `/api/v1/images?page=${page}&limit=10`
      );
      set({
        uploads: response.data.images,
        pagination: response.data.pagination,
        stats: response.data.stats,
        isLoading: false,
      });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch uploads",
        isLoading: false,
      });
    }
  },

  uploadImage: async (file) => {
    try {
      set({ isLoading: true, error: null });

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error("File size exceeds 10MB limit");
      }

      // Validate file type
      const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
      if (!allowedTypes.includes(file.type)) {
        throw new Error(
          "Invalid file type. Only JPG, PNG, and GIF are allowed"
        );
      }

      const formData = new FormData();
      formData.append("image", file);

      const response = await axiosInstance.post(
        "/api/v1/images/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            // You can handle upload progress here if needed
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 0)
            );
          },
        }
      );

      // Add the new upload to the state
      const uploads = get().uploads;
      set({
        uploads: [response.data, ...uploads],
        isLoading: false,
      });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to upload image",
        isLoading: false,
      });
    }
  },

  deleteImage: async (id) => {
    try {
      set({ isLoading: true, error: null });
      const res = await axiosInstance.delete(`/api/v1/images/${id}`);

      toast.success(res.data.message);

      // Remove the deleted image from state
      const uploads = get().uploads.filter((upload) => upload._id !== id);
      set({ uploads, isLoading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to delete image",
        isLoading: false,
      });
    }
  },
}));
