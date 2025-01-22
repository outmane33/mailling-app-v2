import React from "react";
import { Trash2, X } from "lucide-react";

const ConfirmationModal = ({ isOpen, onClose, imageUrl, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl w-full max-w-md transform scale-100 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <h2 className="text-xl font-semibold bg-gradient-to-r from-red-400 to-rose-400 bg-clip-text text-transparent">
            Delete Image
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-100 transition-colors rounded-full p-1 hover:bg-zinc-800"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex flex-col gap-4">
            <div className="relative w-full h-48 rounded-lg overflow-hidden border border-zinc-700">
              <img
                src={imageUrl}
                alt="Image to delete"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
            <p className="text-zinc-300">
              Are you sure you want to delete this image? This action cannot be
              undone.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-zinc-300 hover:text-zinc-100 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-red-500/10"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2.5 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-red-500/50 hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <Trash2 size={18} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
