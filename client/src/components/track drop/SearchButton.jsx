import { useRef, useState } from "react";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
export default function SearchButton({ stats, setStats }) {
  const [isInputVisible, setIsInputVisible] = useState(false);
  const inputRef = useRef(null);
  const handleContainerClick = (e) => {
    e.preventDefault();
    if (!isInputVisible) {
      setIsInputVisible(true);
      // Focus input after animation
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };
  const handleChange = (e) => {
    setStats({ ...stats, campaignName: e.target.value });
  };
  return (
    <motion.div
      className="fixed bottom-10 right-10"
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onClick={() => {
        inputRef.current?.focus();
      }}
      onBlur={() => {
        setIsInputVisible(false);
      }}
    >
      <div
        onClick={handleContainerClick}
        className={`
  group relative flex items-center gap-2 
  font-semibold bg-white text-gray-700
  overflow-hidden transition-all duration-300 ease-in-out
  hover:bg-gray-50 cursor-pointer
  shadow-lg hover:shadow-xl
  before:absolute before:inset-0 before:bg-gray-500/10
  before:translate-x-[-150%] before:skew-x-[-45deg] before:transition-transform
  hover:before:translate-x-[150%] before:duration-700
  active:scale-95
  ${
    isInputVisible
      ? "rounded-lg px-4 py-2 w-64"
      : "rounded-full px-6 p-4 max-w-fit"
  }
`}
      >
        <Search
          size={24}
          color="currentColor"
          className={`
    transform transition-transform duration-300 shrink-0
    ${isInputVisible ? "rotate-90" : "group-hover:rotate-12"}
  `}
          onClick={(e) => {
            e.stopPropagation();
            if (isInputVisible) {
              setIsInputVisible(false);
            }
          }}
        />

        <input
          ref={inputRef}
          type="text"
          placeholder="Search..."
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => {
            handleChange(e);
          }}
          className={`
    bg-transparent border-none outline-none 
    placeholder-gray-400 text-gray-700 w-full
    transition-all duration-300
    ${isInputVisible ? "ml-2 opacity-100" : "w-0 opacity-0 p-0"}
    focus:ring-0
  `}
          style={{
            width: isInputVisible ? "100%" : "0",
            pointerEvents: isInputVisible ? "auto" : "none",
          }}
        />

        <div
          className="
  absolute inset-0 bg-gradient-to-r from-gray-500/0 
  via-gray-300/10 to-gray-500/0 opacity-0 
  group-hover:opacity-100 transition-opacity duration-300
"
        />
      </div>
    </motion.div>
  );
}
