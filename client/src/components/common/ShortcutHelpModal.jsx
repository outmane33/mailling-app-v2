import React from "react";
import { Command, Type, Hash, Box, Link, Eye, Database, X } from "lucide-react";

const ShortcutHelpModal = ({ isOpen, setIsOpen }) => {
  const shortcuts = [
    {
      icon: <Type className="w-4 h-4" />,
      command: 'random("text", 10) or random("t")',
      description: "Random lowercase text",
    },
    {
      icon: <Type className="w-4 h-4" />,
      command: 'random("TEXT", 15) or random("T")',
      description: "Random uppercase text",
    },
    {
      icon: <Hash className="w-4 h-4" />,
      command: 'random("number", 20) or random("n")',
      description: "Random numbers",
    },
    {
      icon: <Box className="w-4 h-4" />,
      command: "[p_1]",
      description: "First placeholder",
    },
    {
      icon: <Database className="w-4 h-4" />,
      command: "[static_domain]",
      description: "Static domain input",
    },
    {
      icon: <Eye className="w-4 h-4" />,
      command: "[open]",
      description: "Track open",
    },
    {
      icon: <Link className="w-4 h-4" />,
      command: "[url]",
      description: "Track click",
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl w-full max-w-lg transform scale-100 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <div className="flex items-center space-x-3">
            <Command className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Shortcuts
            </h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-zinc-400 hover:text-zinc-100 transition-colors rounded-full p-1 hover:bg-zinc-800"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-2">
            {shortcuts.map((shortcut, index) => (
              <div
                key={index}
                className="flex items-center space-x-4 p-3 rounded-lg hover:bg-zinc-800/50 transition-all duration-200 border border-transparent hover:border-zinc-700 group"
              >
                <div className="flex-shrink-0 text-zinc-400 group-hover:text-blue-400 transition-colors">
                  {shortcut.icon}
                </div>
                <div className="flex-grow min-w-0">
                  <code className="text-sm text-zinc-300 font-mono bg-zinc-800/50 px-2 py-1 rounded">
                    {shortcut.command}
                  </code>
                  <div className="text-xs text-zinc-500 mt-1">
                    {shortcut.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-zinc-800 p-4">
          <div className="flex items-center justify-center space-x-2 text-sm text-zinc-400">
            <Command className="w-4 h-4" />
            <span>
              Press{" "}
              <kbd className="px-2 py-1 bg-zinc-800 rounded-md border border-zinc-700 text-zinc-300 text-sm">
                ?
              </kbd>{" "}
              to toggle shortcuts
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShortcutHelpModal;
