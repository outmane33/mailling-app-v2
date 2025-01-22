import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ArrowUpDown,
  BarChart2,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useTestStore } from "../../store/useTestStore";

export default function TestMonitorTable() {
  const {
    tests,
    loading,
    error,
    pagination,
    filters,
    fetchTests,
    setFilters,
    setPage,
  } = useTestStore();

  useEffect(() => {
    fetchTests();
  }, []);

  const handleSort = (field) => {
    setFilters({
      sortField: field,
      sortOrder:
        filters.sortField === field && filters.sortOrder === "asc"
          ? "desc"
          : "asc",
    });
  };

  const calculatePercentage = (value, total) => {
    return ((value / total) * 100).toFixed(1);
  };

  const TableHeader = ({ label, sortKey }) => (
    <th
      onClick={() => handleSort(sortKey)}
      className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer group hover:bg-gray-700/30 transition-colors"
    >
      <div className="flex items-center gap-2">
        {label}
        <ArrowUpDown
          size={14}
          className={`transition-opacity ${
            filters.sortField === sortKey
              ? "opacity-100"
              : "opacity-0 group-hover:opacity-100"
          }`}
        />
      </div>
    </th>
  );

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <motion.div
      className="bg-gradient-to-br from-gray-800 to-gray-900 shadow-xl rounded-xl p-6 border border-gray-700/50"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-gray-400">
              Test Monitor
            </h2>
            <div className="flex gap-2">
              <motion.div
                className="px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-xs font-medium"
                whileHover={{ scale: 1.05 }}
              >
                Total Tests: {pagination.totalItems}
              </motion.div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-700/70 transition-colors"
            >
              <Download size={18} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-700/70 transition-colors"
            >
              <BarChart2 size={18} />
            </motion.button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search any field..."
            className="w-full bg-gray-800/50 text-gray-100 placeholder-gray-500 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 border border-gray-700/50"
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
          />
          <Search className="absolute left-3 top-3.5 text-gray-500" size={18} />
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-gray-700/50">
          <table className="min-w-full divide-y divide-gray-700/50">
            <thead className="bg-gray-800/50">
              <tr>
                <TableHeader label="Campaign Name" sortKey="campaignName" />
                <TableHeader label="Mailer" sortKey="mailer" />
                <TableHeader label="ISP" sortKey="isp" />
                <TableHeader label="Offer" sortKey="offer" />
                <TableHeader label="Total" sortKey="total" />
                <TableHeader label="Opens" sortKey="opens" />
                <TableHeader label="Clicks" sortKey="clicks" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50 bg-gray-800/20">
              <AnimatePresence>
                {loading ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-4 text-center text-gray-400"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : (
                  tests.map((test) => (
                    <motion.tr
                      key={test._id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      whileHover={{ backgroundColor: "rgba(55, 65, 81, 0.3)" }}
                      className="transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-400">
                        {test.campaignName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {test.mailer}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        <span className="px-2 py-1 bg-gray-700/50 rounded-md">
                          {test.isp}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {test.offer}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-300">
                        {test.total.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-300">
                            {test.opens}
                          </span>
                          <span className="text-xs text-gray-500">
                            {calculatePercentage(test.opens, test.total)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-300">
                            {test.clicks}
                          </span>
                          <span className="text-xs text-gray-500">
                            {calculatePercentage(test.clicks, test.total)}%
                          </span>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-400">
            Showing {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}{" "}
            to{" "}
            {Math.min(
              pagination.currentPage * pagination.itemsPerPage,
              pagination.totalItems
            )}{" "}
            of {pagination.totalItems} results
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(pagination.currentPage - 1)}
              disabled={!pagination.hasPrevPage}
              className="p-2 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-700/70 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => setPage(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage}
              className="p-2 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-700/70 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
