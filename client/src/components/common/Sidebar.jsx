import {
  BarChart2,
  Menu,
  Settings,
  ShoppingCart,
  TrendingUp,
  Send,
  MonitorCog,
  FlaskConical,
  X,
  Images,
} from "lucide-react";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";

const SIDEBAR_ITEMS = [
  {
    name: "Dashboard",
    icon: BarChart2,
    color: "#6366f1",
    href: "/",
  },
  { name: "Send Page", icon: Send, color: "#8B5CF6", href: "/send" },
  { name: "Drop Monitor", icon: MonitorCog, color: "#EC4899", href: "/drop" },
  { name: "Test Monitor", icon: FlaskConical, color: "#10B981", href: "/test" },
  { name: "Track Drop", icon: ShoppingCart, color: "#F59E0B", href: "/track" },
  { name: "Images", icon: Images, color: "#3B82F6", href: "/images" },
  { name: "Settings", icon: Settings, color: "#6EE7B7", href: "/settings" },
];

export default function Sidebar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Handle screen resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    // Initial check
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={handleSidebarToggle}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-gray-800 text-white"
      >
        <Menu size={24} />
      </button>

      {/* Overlay for mobile */}
      <AnimatePresence>
        {isMobile && isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        className={`fixed md:static h-full z-50 transition-all duration-300 ease-in-out flex-shrink-0
          ${
            isSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0"
          }
          ${isMobile ? "w-64" : isSidebarOpen ? "w-64" : "w-20"}`}
        animate={{
          width: isMobile ? 256 : isSidebarOpen ? 256 : 80,
          x: isSidebarOpen ? 0 : isMobile ? -256 : 0,
        }}
      >
        <div className="h-full bg-gray-800 bg-opacity-50 backdrop-blur-md p-4 flex flex-col border-r border-gray-700">
          <div className="flex justify-between items-center">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleSidebarToggle}
              className="p-2 rounded-full hover:bg-gray-700 transition-colors max-w-fit text-white md:block hidden"
            >
              <Menu size={24} />
            </motion.button>

            {/* Close button for mobile */}
            {isMobile && (
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="md:hidden p-2 rounded-full hover:bg-gray-700 transition-colors text-white"
              >
                <X size={24} />
              </button>
            )}
          </div>

          <nav className="mt-8 flex-grow">
            {SIDEBAR_ITEMS.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => isMobile && setIsSidebarOpen(false)}
              >
                <motion.div className="flex items-center text-white p-4 text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors mb-2">
                  <item.icon
                    size={20}
                    style={{ color: item.color, minWidth: "20px" }}
                  />
                  <AnimatePresence>
                    {(isSidebarOpen || isMobile) && (
                      <motion.span
                        className="ml-4 whitespace-nowrap"
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2, delay: 0.3 }}
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </Link>
            ))}
          </nav>
        </div>
      </motion.div>
    </>
  );
}
