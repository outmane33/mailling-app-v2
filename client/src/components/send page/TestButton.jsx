import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function TestButton({
  position,
  label,
  bgColor,
  hoverColor,
  Icon,
  onClick,
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="fixed right-10 z-50"
      style={{ top: position }}
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`group relative flex items-center gap-3 rounded-full p-4 
                   ${bgColor} ${hoverColor}
                   transition-all duration-300 overflow-hidden`}
      >
        {/* Shine Effect */}
        <div
          className="absolute inset-0 bg-white/20 -skew-x-12 translate-x-[-150%] 
                      group-hover:translate-x-[150%] transition-all duration-700"
        />

        {/* Content Container */}
        <div className="relative flex items-center gap-2">
          {/* Icon */}
          <motion.div
            animate={{ rotate: isHovered ? 12 : 0 }}
            transition={{ duration: 0.3 }}
            className="relative z-10"
          >
            <Icon size={20} className="text-white" />
          </motion.div>

          {/* Label */}
          <AnimatePresence>
            {isHovered && (
              <motion.span
                className="text-sm font-medium text-white whitespace-nowrap"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
              >
                {label}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Particle Effects */}
        <AnimatePresence>
          {isHovered && (
            <>
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-white rounded-full"
                  initial={{
                    opacity: 0,
                    scale: 0,
                    x: "50%",
                    y: "50%",
                  }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1.5, 0],
                    x: ["50%", `${50 + (i - 1) * 30}%`],
                    y: ["50%", `${30 + i * 20}%`],
                  }}
                  transition={{
                    duration: 0.8,
                    delay: i * 0.1,
                    repeat: Infinity,
                    repeatDelay: 0.2,
                  }}
                />
              ))}
            </>
          )}
        </AnimatePresence>
      </button>
    </motion.div>
  );
}
