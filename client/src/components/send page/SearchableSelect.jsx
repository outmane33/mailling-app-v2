import { useState, useRef, useEffect } from "react";
import { Search, ChevronDown } from "lucide-react";

export const SearchableSelect = ({
  label,
  options,
  placeholder = "Search...",
  onSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedValue, setSelectedValue] = useState("");
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOptionSelect = (option) => {
    setSelectedValue(option);
    setSearchTerm("");
    setIsOpen(false);
    if (onSelect) onSelect(option); // Notify parent of the selected value
  };

  return (
    <div className="flex flex-col gap-2 w-full" ref={dropdownRef}>
      <p>{label}</p>
      <div className="relative">
        <div
          className="bg-gray-700 p-2 rounded-lg flex items-center justify-between cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className={selectedValue ? "text-white" : "text-gray-400"}>
            {selectedValue || placeholder}
          </span>
          <ChevronDown
            className={`transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
            size={20}
          />
        </div>

        {isOpen && (
          <div className="absolute w-full mt-1 bg-gray-700 rounded-lg shadow-lg z-10 border border-gray-600">
            <div className="p-2 border-b border-gray-600">
              <div className="relative">
                <Search
                  className="absolute left-2 top-2.5 text-gray-400"
                  size={16}
                />
                <input
                  type="text"
                  className="w-full bg-gray-800 rounded-md pl-8 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 hover:bg-gray-600 cursor-pointer"
                    onClick={() => handleOptionSelect(option)}
                  >
                    {option}
                  </div>
                ))
              ) : (
                <div className="px-4 py-2 text-gray-400">No results found</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
