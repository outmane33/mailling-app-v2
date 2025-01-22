import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Globe, Hash, Copy, RotateCw } from "lucide-react";
import { useSendStore } from "../../store/useSendStore";
import { useBoiteStore } from "../../store/useDataStore";

const ToggleSwitch = ({ label, isOn, onToggle }) => (
  <motion.div
    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-700/30 transition-colors"
    whileHover={{ x: 2 }}
  >
    <span className="text-gray-300 capitalize">{label}</span>
    <button
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        isOn ? "bg-cyan-500" : "bg-gray-600"
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

const InputField = ({ label, icon: Icon, placeholder, onChange }) => (
  <motion.div
    className="flex-1"
    whileHover={{ scale: 1.01 }}
    transition={{ duration: 0.2 }}
  >
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center gap-2 text-gray-300">
        <Icon className="w-4 h-4" />
        <p className="text-sm font-medium">{label}</p>
      </div>
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          onChange={onChange}
          className="w-full bg-gray-800/50 backdrop-blur-sm p-3 rounded-xl border border-gray-600/50 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-shadow"
        />
      </div>
    </div>
  </motion.div>
);

export default function SelectData() {
  const {
    setStartFrom,
    setCount,
    setDuplicate,
    setCountry,
    isp,
    country,
    email_type,
    setDataListName,
  } = useSendStore();
  const { data, getDataInfo } = useBoiteStore();
  const [dataName, setDataName] = useState({
    rr: false,
  });

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

  useEffect(() => {
    getDataInfo({ isp, country, email_type });
    setDataName({ rr: false });
    setDataListName("");
  }, [email_type, country, isp, getDataInfo]);

  return (
    <div className="flex-1 p-4">
      <motion.div
        className="relative bg-gradient-to-br from-gray-800 to-gray-900 bg-opacity-50 backdrop-blur-xl overflow-hidden rounded-2xl border border-gray-700/50 h-full"
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
          className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-teal-500/10 opacity-50"
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
            <div className="h-8 w-1 bg-cyan-500 rounded-full" />
            <Globe className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-semibold text-gray-200">
              Data Selection
            </h2>
          </motion.div>

          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-6">
              <motion.div
                className="relative col-span-1"
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
              >
                <label className="flex items-center gap-2 text-gray-300 text-sm font-medium mb-2">
                  <Globe className="w-4 h-4" />
                  Countries
                </label>
                <select
                  className="w-full bg-gray-800/50 backdrop-blur-sm p-3 rounded-xl border border-gray-600/50 text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-shadow appearance-none cursor-pointer"
                  onChange={(e) => setCountry(e.target.value)}
                >
                  <option>United States</option>
                  <option>Canada</option>
                  <option>United Kingdom</option>
                </select>
              </motion.div>

              <InputField
                label="Start"
                icon={Hash}
                placeholder="0"
                onChange={(e) => setStartFrom(e.target.value)}
              />
              <InputField
                label="Count"
                icon={Copy}
                placeholder="0"
                onChange={(e) => setCount(e.target.value)}
              />
              <InputField
                label="Duplicate Data"
                icon={RotateCw}
                placeholder="1"
                onChange={(e) => setDuplicate(e.target.value)}
              />
            </div>

            {data &&
              data.map((item, index) => (
                <ToggleSwitch
                  key={index}
                  label={`${item[0]} - ${item[1]}`}
                  isOn={dataName.rr}
                  onToggle={() => {
                    const newValue = !dataName.rr;
                    setDataName({
                      ...dataName,
                      rr: newValue,
                    });

                    if (newValue) {
                      // Save the label when toggled ON
                      setDataListName(`${item[0]} - ${item[1]}`);
                    } else {
                      // Optionally, clear the label when toggled OFF
                      setDataListName("");
                    }
                  }}
                />
              ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
