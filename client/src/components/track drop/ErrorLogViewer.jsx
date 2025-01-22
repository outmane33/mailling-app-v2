import React, { useEffect } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  Clock,
  Mail,
  RefreshCw,
  Server,
  XCircle,
} from "lucide-react";
import { useErrorStore } from "../../store/useErrorStore";

const ErrorCard = ({ error }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-4"
  >
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-2">
        <AlertCircle className="text-red-500" size={24} />
        <span className="text-lg font-semibold">{error.type}</span>
      </div>
      <span className="text-sm text-gray-500">
        <Clock className="inline mr-1" size={16} />
        {new Date(error.timestamp).toLocaleString()}
      </span>
    </div>

    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Mail className="text-gray-400" size={16} />
        <span>From: {error.sender}</span>
      </div>
      <div className="flex items-center space-x-2">
        <Mail className="text-gray-400" size={16} />
        <span>To: {error.recipient}</span>
      </div>
      <div className="flex items-center space-x-2">
        <Server className="text-gray-400" size={16} />
        <span>Service: {error.service}</span>
      </div>
    </div>

    <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-md">
      <XCircle className="inline mr-2 text-red-500" size={16} />
      <span className="text-red-600 dark:text-red-400">{error.message}</span>
    </div>
  </motion.div>
);

const ErrorLogViewer = () => {
  const { errors, loading, fetchErrors } = useErrorStore();

  useEffect(() => {
    fetchErrors();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto text-white">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Email Error Logs</h2>
        <button
          onClick={fetchErrors}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors"
        >
          <RefreshCw size={16} />
          <span>Refresh</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <RefreshCw className="animate-spin text-purple-600" size={32} />
        </div>
      ) : errors.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <AlertCircle className="mx-auto mb-4" size={48} />
          <p>No errors found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {errors.map((error, index) => (
            <ErrorCard key={index} error={error} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ErrorLogViewer;
