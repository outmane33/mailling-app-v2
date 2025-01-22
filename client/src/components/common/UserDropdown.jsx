import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, User, Settings, ChevronDown, Bell, Mail } from "lucide-react";

export default function UserDropdown({ user }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-2 rounded-full hover:bg-gray-800/50 transition-colors duration-200"
      >
        {/* Avatar */}
        <div className="relative">
          <img
            src={user.avatar || "/api/placeholder/40/40"}
            alt="User avatar"
            className="w-10 h-10 rounded-full border-2 border-gray-700"
          />
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900" />
        </div>

        {/* User Name */}
        <div className="flex items-center gap-2">
          <div className="text-left">
            <p className="text-sm font-medium text-gray-200">{user.name}</p>
            <p className="text-xs text-gray-400">{user.email}</p>
          </div>
          <ChevronDown
            size={16}
            className={`text-gray-400 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-30"
            />

            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-72 z-40"
            >
              <div className="bg-gray-900 rounded-xl shadow-xl border border-gray-800 overflow-hidden">
                {/* User Info Section */}
                <div className="p-4 border-b border-gray-800">
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatar || "/api/placeholder/48/48"}
                      alt="User avatar"
                      className="w-12 h-12 rounded-full border-2 border-gray-700"
                    />
                    <div>
                      <p className="font-medium text-gray-200">{user.name}</p>
                      <p className="text-sm text-gray-400">{user.email}</p>
                    </div>
                  </div>
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-3 gap-1 p-4 border-b border-gray-800 bg-gray-800/50">
                  <div className="text-center">
                    <p className="text-lg font-semibold text-gray-200">28</p>
                    <p className="text-xs text-gray-400">Projects</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-gray-200">12</p>
                    <p className="text-xs text-gray-400">Teams</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-gray-200">5.2k</p>
                    <p className="text-xs text-gray-400">Points</p>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="p-2">
                  <button className="flex items-center gap-3 w-full p-3 text-sm text-gray-300 hover:bg-gray-800 rounded-lg transition-colors duration-200">
                    <User size={18} />
                    <span>Profile Settings</span>
                  </button>
                  <button className="flex items-center gap-3 w-full p-3 text-sm text-gray-300 hover:bg-gray-800 rounded-lg transition-colors duration-200">
                    <Bell size={18} />
                    <span>Notifications</span>
                    <span className="ml-auto bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                      3
                    </span>
                  </button>
                  <button className="flex items-center gap-3 w-full p-3 text-sm text-gray-300 hover:bg-gray-800 rounded-lg transition-colors duration-200">
                    <Mail size={18} />
                    <span>Messages</span>
                  </button>
                  <button className="flex items-center gap-3 w-full p-3 text-sm text-gray-300 hover:bg-gray-800 rounded-lg transition-colors duration-200">
                    <Settings size={18} />
                    <span>Account Settings</span>
                  </button>
                </div>

                {/* Logout Button */}
                <div className="p-2 border-t border-gray-800">
                  <button className="flex items-center gap-3 w-full p-3 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors duration-200">
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
