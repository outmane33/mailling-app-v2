import { motion } from "framer-motion";
import { Replace } from "lucide-react";
import { useSendStore } from "../../store/useSendStore";

export default function Placeholders() {
  const { setPlaceholders } = useSendStore();
  const handleChange = (e) => {
    setPlaceholders({ p_1: e.target.value });
  };
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

  const textareaVariants = {
    focused: {
      scale: 1.002,
      transition: { duration: 0.2 },
    },
    blur: {
      scale: 1,
      transition: { duration: 0.2 },
    },
  };

  return (
    <div className="flex-1 p-4">
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
          className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-50"
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
            <div className="h-8 w-1 bg-purple-500 rounded-full" />
            <Replace className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-semibold text-gray-200">
              Placeholders
            </h2>
          </motion.div>

          <motion.div
            className="relative"
            whileHover={{ scale: 1.002 }}
            transition={{ duration: 0.2 }}
          >
            <motion.textarea
              className="w-full bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-600/50 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-shadow resize-none"
              rows="12"
              placeholder="Add your placeholder values..."
              variants={textareaVariants}
              whileFocus="focused"
              initial="blur"
              style={{
                boxShadow: "0 0 20px rgba(0,0,0,0.2) inset",
              }}
              onChange={handleChange}
            />

            <div className="absolute bottom-4 right-4 text-gray-400 text-sm">
              Use {"{placeholder}"} syntax
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
