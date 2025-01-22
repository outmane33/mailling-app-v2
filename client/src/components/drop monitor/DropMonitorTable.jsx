import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import moment from "moment";
import {
  Search,
  ChevronUp,
  ChevronDown,
  BarChart2,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react";
import { useDropsStore } from "../../store/useDropsStore";

export default function DropMonitorTable() {
  const {
    drops,
    loading,
    error,
    pagination,
    filters,
    sort,
    stats,
    fetchDrops,
    setFilters,
    setSort,
    setPage,
    setPageSize,
    resetFilters,
  } = useDropsStore();

  useEffect(() => {
    fetchDrops();
  }, [pagination.currentPage, pagination.pageSize, sort.field, sort.order]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (filters.campaignName || filters.mailer || filters.offer) {
        fetchDrops();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [filters]);

  const handleSort = (column) => {
    const newOrder =
      sort.field === column && sort.order === "asc" ? "desc" : "asc";
    setSort(column, newOrder);
  };

  const statusColors = {
    active: "bg-green-500/20 text-green-400 ring-green-500/30",
    paused: "bg-yellow-500/20 text-yellow-400 ring-yellow-500/30",
    completed: "bg-blue-500/20 text-blue-400 ring-blue-500/30",
    stopped: "bg-red-500/20 text-red-400 ring-red-500/30",
  };

  const displayFields = [
    "campaignName",
    "mailer",
    "createdAt",
    "isp",
    "status",
    "total",
    "opens",
    "clicks",
    "leads",
    "unsubs",
  ];

  if (error) {
    return (
      <div className="text-red-400 p-4 bg-red-500/10 rounded-lg">
        Error: {error}
      </div>
    );
  }

  return (
    <motion.div
      className="bg-gradient-to-br from-gray-900 to-gray-800 shadow-2xl rounded-2xl p-2 sm:p-4 md:p-6 border border-gray-700/50 w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex flex-col gap-4 md:gap-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <h2 className="text-xl md:text-2xl font-semibold text-gray-100">
              Drop Monitor
            </h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fetchDrops()}
              className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors"
            >
              <RefreshCw size={18} />
            </motion.button>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-700/70 transition-colors text-sm md:text-base"
            >
              <Download size={16} className="hidden sm:block" />
              Export
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-700/70 transition-colors text-sm md:text-base"
            >
              <BarChart2 size={16} className="hidden sm:block" />
              Analytics
            </motion.button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-4">
          {Object.entries(stats).map(([key, value]) => (
            <div key={key} className="bg-gray-800/50 p-3 md:p-4 rounded-xl">
              <h3 className="text-gray-400 text-xs md:text-sm">
                {key.replace(/([A-Z])/g, " $1").trim()}
              </h3>
              <p className="text-lg md:text-2xl font-semibold text-gray-100">
                {value.toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        {/* Search and Filter Section */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search campaigns..."
              className="w-full bg-gray-800/50 text-gray-100 placeholder-gray-500 rounded-xl pl-10 pr-4 py-2 md:py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 border border-gray-700/50 text-sm md:text-base"
              value={filters.campaignName}
              onChange={(e) => setFilters({ campaignName: e.target.value })}
            />
            <Search
              className="absolute left-3 top-2.5 md:top-3 text-gray-500"
              size={18}
            />
          </div>

          <select
            value={filters.status}
            onChange={(e) => {
              setFilters({ status: e.target.value });
              fetchDrops();
            }}
            className="bg-gray-800/50 text-gray-100 rounded-xl px-4 py-2 md:py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 border border-gray-700/50 text-sm md:text-base"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
            <option value="stopped">Stopped</option>
          </select>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetFilters}
            className="p-2 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-700/70 transition-colors"
          >
            <RefreshCw size={18} />
          </motion.button>
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto rounded-xl border border-gray-700/50">
          <div className="min-w-full inline-block align-middle">
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-700/50">
                <thead className="bg-gray-800/50">
                  <tr>
                    {displayFields.map((column) => (
                      <th
                        key={column}
                        onClick={() => handleSort(column)}
                        className="px-3 md:px-6 py-3 md:py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-700/30 transition-colors"
                      >
                        <div className="flex items-center gap-1 md:gap-2">
                          <span className="hidden sm:inline">{column}</span>
                          <span className="sm:hidden">
                            {column.slice(0, 3)}
                          </span>
                          {sort.field === column &&
                            (sort.order === "asc" ? (
                              <ChevronUp size={14} />
                            ) : (
                              <ChevronDown size={14} />
                            ))}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50 bg-gray-800/20">
                  <AnimatePresence>
                    {drops.map((drop) => (
                      <motion.tr
                        key={drop._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        whileHover={{
                          backgroundColor: "rgba(55, 65, 81, 0.3)",
                        }}
                        className="transition-colors"
                      >
                        {displayFields.map((field) => (
                          <td
                            key={field}
                            className="px-3 md:px-6 py-2 md:py-4 whitespace-nowrap text-xs md:text-sm"
                          >
                            {field === "status" ? (
                              <span
                                className={`px-2 md:px-3 py-1 rounded-full ring-1 ${
                                  statusColors[drop[field]]
                                }`}
                              >
                                {drop[field]}
                              </span>
                            ) : field === "createdAt" ? (
                              <span className="text-gray-300">
                                {moment(drop[field]).format(
                                  "MMM DD, YYYY HH:mm"
                                )}
                              </span>
                            ) : typeof drop[field] === "number" ? (
                              <div className="flex items-center gap-1 md:gap-2">
                                <span className="text-gray-300">
                                  {drop[field].toLocaleString()}
                                </span>
                                {drop.total && field !== "total" && (
                                  <span className="text-xs text-gray-500 hidden sm:inline">
                                    {((drop[field] / drop.total) * 100).toFixed(
                                      1
                                    )}
                                    %
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-300">
                                {field === "campaignName" &&
                                drop[field].length > 20
                                  ? `${drop[field]}`
                                  : drop[field]}
                              </span>
                            )}
                          </td>
                        ))}
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Pagination Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-2 md:px-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
            <select
              value={pagination.pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="w-full sm:w-auto bg-gray-800/50 text-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50 border border-gray-700/50 text-sm"
            >
              {[10, 20, 30, 50].map((size) => (
                <option key={size} value={size}>
                  {size} per page
                </option>
              ))}
            </select>
            <span className="text-gray-400 text-xs md:text-sm">
              {(pagination.currentPage - 1) * pagination.pageSize + 1} -{" "}
              {Math.min(
                pagination.currentPage * pagination.pageSize,
                pagination.totalItems
              )}{" "}
              of {pagination.totalItems}
            </span>
          </div>

          <div className="flex items-center gap-1 md:gap-2 w-full sm:w-auto justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setPage(pagination.currentPage - 1)}
              disabled={!pagination.hasPrevPage}
              className={`p-1 md:p-2 rounded-lg transition-colors ${
                pagination.hasPrevPage
                  ? "bg-gray-700/50 text-gray-300 hover:bg-gray-700/70"
                  : "bg-gray-800/50 text-gray-500 cursor-not-allowed"
              }`}
            >
              <ChevronLeft size={16} />
            </motion.button>

            <div className="flex items-center gap-1">
              {Array.from(
                { length: Math.min(3, pagination.totalPages) },
                (_, i) => {
                  const pageNum = pagination.currentPage - 1 + i;
                  if (pageNum > 0 && pageNum <= pagination.totalPages) {
                    return (
                      <motion.button
                        key={pageNum}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setPage(pageNum)}
                        className={`w-6 h-6 md:w-8 md:h-8 rounded-lg transition-colors text-xs md:text-sm ${
                          pagination.currentPage === pageNum
                            ? "bg-blue-500/20 text-blue-400"
                            : "bg-gray-700/50 text-gray-300 hover:bg-gray-700/70"
                        }`}
                      >
                        {pageNum}
                      </motion.button>
                    );
                  }
                  return null;
                }
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setPage(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage}
              className={`p-1 md:p-2 rounded-lg transition-colors ${
                pagination.hasNextPage
                  ? "bg-gray-700/50 text-gray-300 hover:bg-gray-700/70"
                  : "bg-gray-800/50 text-gray-500 cursor-not-allowed"
              }`}
            >
              <ChevronRight size={16} />
            </motion.button>
          </div>
        </div>
        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center rounded-2xl">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
