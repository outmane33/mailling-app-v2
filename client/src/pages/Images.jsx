import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Upload, Image as ImageIcon, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "../components/common/Header";
import { useImageStore } from "../store/useImageStore";
import ConfirmationModal from "../components/common/ConfirmationModal";
import moment from "moment";

const UploadSection = ({
  isLoading,
  onFileChange,
  dragActive,
  handleDrag,
  handleDrop,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="mb-8"
  >
    <div
      className={`relative border-2 border-dashed rounded-lg p-4 sm:p-8 text-center transition-colors duration-200 ${
        dragActive
          ? "border-blue-500 bg-blue-50/10"
          : "border-gray-600 hover:border-gray-500"
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        type="file"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={onFileChange}
        accept="image/*"
      />

      <div className="space-y-4">
        <motion.div
          className="flex justify-center"
          animate={{ scale: isLoading ? 0.95 : 1 }}
          transition={{ duration: 0.2 }}
        >
          {isLoading ? (
            <Loader2 className="h-8 w-8 sm:h-12 sm:w-12 text-blue-500 animate-spin" />
          ) : (
            <Upload className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
          )}
        </motion.div>
        <div className="space-y-2">
          <p className="text-base sm:text-xl font-medium text-gray-300">
            Drop your images here, or click to upload
          </p>
          <p className="text-xs sm:text-sm text-gray-400">
            Supports: JPG, PNG, GIF (Max size: 10MB)
          </p>
        </div>
      </div>
    </div>
  </motion.div>
);

const ImageRow = ({ upload, onDelete }) => (
  <motion.tr
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="hover:bg-gray-700/30"
  >
    <td className="px-3 sm:px-6 py-4">
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg overflow-hidden bg-gray-700"
      >
        <img
          src={upload.fileName}
          alt={upload.fileName}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </motion.div>
    </td>
    <td className="px-3 sm:px-6 py-4">
      <div className="flex items-center">
        <ImageIcon className="h-4 w-4 text-gray-400 mr-2" />
        <span className="text-gray-200 text-sm sm:text-sm  max-w-[100px] sm:max-w-[200px]">
          {upload.fileName}
        </span>
      </div>
    </td>
    <td className="hidden sm:table-cell px-6 py-4 text-gray-300 text-sm">
      {upload?.uploadedBy?.username || "Anonymous"}
    </td>
    <td className="hidden md:table-cell px-6 py-4 text-gray-300 text-sm">
      {moment(upload.createdAt).fromNow()}
    </td>
    <td className="hidden lg:table-cell px-6 py-4 text-gray-300 text-sm">
      {Math.round(upload.size / 1024)} KB
    </td>
    <td className="px-3 sm:px-6 py-4">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
        onClick={onDelete}
      >
        <X className="h-4 w-4 text-red-400" />
      </motion.button>
    </td>
  </motion.tr>
);

export default function Images() {
  const {
    uploads,
    isLoading,
    error,
    uploadImage,
    deleteImage,
    pagination,
    stats,
    fetchUploads,
  } = useImageStore();
  const [dragActive, setDragActive] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageId, setSelectedImageId] = useState(null);

  const handlePageChange = useCallback(
    (newPage) => {
      fetchUploads(newPage);
    },
    [fetchUploads]
  );

  useEffect(() => {
    fetchUploads();
  }, [fetchUploads]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  }, []);

  const handleDrop = useCallback(
    async (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        await uploadImage(files[0]);
      }
    },
    [uploadImage]
  );

  const handleChange = useCallback(
    async (e) => {
      e.preventDefault();
      const files = e.target.files;
      if (files && files.length > 0) {
        await uploadImage(files[0]);
      }
    },
    [uploadImage]
  );

  const handleDelete = useCallback((upload) => {
    setIsModalOpen(true);
    setSelectedImage(upload.fileName);
    setSelectedImageId(upload._id);
  }, []);

  const handleImageDelete = useCallback(async () => {
    await deleteImage(selectedImageId);
    setIsModalOpen(false);
  }, [deleteImage, selectedImageId]);

  const sortedUploads = useMemo(() => {
    return [...uploads].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }, [uploads]);

  const StatsSection = () => (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      {[
        { label: "Total Images", value: stats.totalImages },
        {
          label: "Total Size",
          value: `${(stats.totalSize / (1024 * 1024)).toFixed(2)} MB`,
        },
        {
          label: "Average Size",
          value: `${(stats.averageSize / 1024).toFixed(2)} KB`,
        },
      ].map(({ label, value }) => (
        <div key={label} className="bg-gray-900/50 p-4 rounded-lg">
          <h3 className="text-gray-400 text-sm">{label}</h3>
          <p className="text-xl font-semibold text-gray-200">{value}</p>
        </div>
      ))}
    </div>
  );

  const Pagination = () => (
    <div className="mt-4 flex justify-center gap-2">
      {Array.from({ length: pagination.pages }, (_, i) => (
        <button
          key={i + 1}
          onClick={() => handlePageChange(i + 1)}
          className={`px-3 py-1 rounded ${
            pagination.current === i + 1
              ? "bg-blue-500 text-white"
              : "bg-gray-700 hover:bg-gray-600"
          }`}
        >
          {i + 1}
        </button>
      ))}
    </div>
  );

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 flex items-center justify-center"
      >
        <div className="text-red-500">Error: {error}</div>
      </motion.div>
    );
  }

  return (
    <div className="flex-1 overflow-auto relative z-10">
      <Header title="Images" />
      <main className="max-w-8xl mx-auto py-4 px-2 sm:py-6 sm:px-4 lg:px-8">
        <UploadSection
          isLoading={isLoading}
          onFileChange={handleChange}
          dragActive={dragActive}
          handleDrag={handleDrag}
          handleDrop={handleDrop}
        />
        <StatsSection />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900/50 rounded-lg overflow-hidden"
        >
          <div className="px-3 sm:px-6 py-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-gray-200">
              Recent Uploads
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-400 text-xs sm:text-sm">
                  <th className="px-3 sm:px-6 py-3 font-medium">Preview</th>
                  <th className="px-3 sm:px-6 py-3 font-medium">Filename</th>
                  <th className="hidden sm:table-cell px-6 py-3 font-medium">
                    Uploaded By
                  </th>
                  <th className="hidden md:table-cell px-6 py-3 font-medium">
                    Date
                  </th>
                  <th className="hidden lg:table-cell px-6 py-3 font-medium">
                    Size
                  </th>
                  <th className="px-3 sm:px-6 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                <AnimatePresence>
                  {sortedUploads.map((upload) => (
                    <ImageRow
                      key={upload._id}
                      upload={upload}
                      onDelete={() => handleDelete(upload)}
                    />
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </motion.div>
        <Pagination />
      </main>

      <AnimatePresence>
        {isModalOpen && (
          <ConfirmationModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            imageUrl={selectedImage}
            onConfirm={handleImageDelete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
