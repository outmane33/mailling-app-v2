import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { useSendStore } from "../../store/useSendStore";

const ToggleSwitch = ({ label, isOn, onToggle }) => (
  <motion.div
    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-700/30 transition-colors"
    whileHover={{ x: 2 }}
  >
    <span className="text-gray-300 capitalize">{label}</span>
    <button
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        isOn ? "bg-indigo-500" : "bg-gray-600"
      }`}
    >
      <motion.span
        className="inline-block h-4 w-4 transform rounded-full bg-white shadow-lg"
        initial={false}
        animate={{
          x: isOn ? "24px" : "4px",
        }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </button>
  </motion.div>
);

export default function Isps() {
  const { isp, setIsp, setEmailType } = useSendStore();

  const [emailTypeState, setEmailTypeState] = useState({
    fresh: false,
    clean: false,
    opener: false,
    clicker: false,
    leader: false,
    unsubscribers: false,
  });

  const getEmailTypeArray = () => {
    return Object.entries(emailTypeState)
      .filter(([, value]) => value)
      .map(([key]) => key);
  };

  useEffect(() => {
    const emailTypeArray = getEmailTypeArray();
    setEmailType(emailTypeArray);
  }, [emailTypeState]);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };
  return (
    <div className="w-[30%] p-4">
      <motion.div
        className="relative bg-gradient-to-br from-gray-800 to-gray-900 bg-opacity-50 backdrop-blur-xl overflow-hidden rounded-2xl border border-gray-700/50"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        whileHover={{
          boxShadow: "0px 25px 50px -12px rgba(0,0,0,0.7)",
          scale: 1.005,
          transition: { duration: 0.3, ease: "easeOut" },
        }}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-violet-500/10 opacity-50"
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%"],
          }}
          transition={{
            duration: 15,
            ease: "linear",
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />

        <div className="px-6 py-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="h-8 w-1 bg-indigo-500 rounded-full" />
            <Mail className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-semibold text-gray-200">
              ISP Settings
            </h2>
          </motion.div>

          <div className="space-y-4">
            <motion.div
              className="relative"
              whileHover={{ scale: 1.002 }}
              transition={{ duration: 0.2 }}
            >
              <select
                className="w-full bg-gray-800/50 backdrop-blur-sm p-3 rounded-xl border border-gray-600/50 text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-shadow appearance-none cursor-pointer"
                value={isp}
                onChange={(e) => {
                  setIsp(e.target.value);
                }}
              >
                <option>RR</option>
                <option>Yahoo</option>
                <option>Gmail</option>
                <option>Charter</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </motion.div>

            <div className="space-y-1 pt-2">
              {Object.entries(emailTypeState).map(([key, value]) => (
                <ToggleSwitch
                  key={key}
                  label={key}
                  isOn={value}
                  onToggle={() =>
                    setEmailTypeState((prev) => ({
                      ...prev,
                      [key]: !prev[key],
                    }))
                  }
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
