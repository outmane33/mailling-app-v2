import React, { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import Header from "../components/common/Header";
import { motion } from "framer-motion";
import {
  AtSign,
  Timer,
  Play,
  ChartArea,
  MailWarning,
  Pause,
  MonitorX,
} from "lucide-react";
import StatCard from "../components/common/StatCard";
import AnimatedButton from "../components/track drop/AnimatedButton";
import SearchButton from "../components/track drop/SearchButton";
import StepCounter from "../components/track drop/StepCounter";
import { useSendStore } from "../store/useSendStore";
import ErrorLogViewer from "../components/track drop/ErrorLogViewer";

const TrackDrop = () => {
  const { status, pauseDrop, resumeDrop, stopDrop } = useSendStore();

  const [stats, setStats] = useState({
    totalSent: 0,
    fails: 0,
    topMinute: 0,
    status: status,
    total: 1,
    campaignName: null,
  });

  const { subscribeToDrops, unsubscribeFromDrops, drop } = useAuthStore();

  // Update stats when new emails are sent
  useEffect(() => {
    if (drop.emailSent) {
      const { emailSentCount, campaignName, total } = drop.emailSent;
      setStats((prev) => ({
        ...prev,
        totalSent: emailSentCount,
        total,
        campaignName,
        // Calculate top minute based on the last minute's sending rate
        topMinute: Math.max(prev.topMinute, emailSentCount - prev.totalSent),
      }));
    }
  }, [drop.emailSent]);

  // Subscribe to real-time updates
  useEffect(() => {
    subscribeToDrops();
    return () => unsubscribeFromDrops();
  }, [subscribeToDrops, unsubscribeFromDrops]);

  const calculateProgress = () => {
    if (!drop.emailSent) return 0;
    // Assuming total is stored in the drop object
    const total = drop.emailSent.total || 1000; // fallback to 1000 if not set
    return (stats.totalSent / total) * 100;
  };

  const handleClick = async (text) => {
    switch (text) {
      case "Play":
        resumeDrop(stats.campaignName);
        break;
      case "Pause":
        await pauseDrop(stats.campaignName);
        break;
      case "Stop":
        await stopDrop(stats.campaignName);
        break;
      default:
        break;
    }
  };

  const buttons = [
    {
      icon: Play,
      text: "Play",
      colorClasses: {
        background: "bg-purple-600",
        hover: "hover:bg-purple-500",
        gradientFrom: "purple-600/0",
        gradientVia: "purple-400/10",
        gradientTo: "purple-600/0",
      },
    },
    {
      icon: Pause,
      text: "Pause",
      colorClasses: {
        background: "bg-amber-500",
        hover: "hover:bg-amber-400",
        gradientFrom: "amber-500/0",
        gradientVia: "amber-300/10",
        gradientTo: "amber-500/0",
      },
    },
    {
      icon: MonitorX,
      text: "Stop",
      colorClasses: {
        background: "bg-rose-600",
        hover: "hover:bg-rose-500",
        gradientFrom: "rose-600/0",
        gradientVia: "rose-400/10",
        gradientTo: "rose-600/0",
      },
    },
  ];

  return (
    <div className="flex-1 overflow-auto relative z-10">
      <Header title="Track Drop" />
      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8 relative">
        <motion.div
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <StatCard
            name="Status"
            icon={ChartArea}
            value={status}
            color="#6366f1"
          />
          <StatCard
            name="Sent"
            icon={MailWarning}
            value={stats.totalSent.toString()}
            color="#8B5CF6"
          />
          <StatCard
            name="Top Minute"
            icon={Timer}
            value={stats.topMinute.toString()}
            color="#EC4899"
          />
          <StatCard
            name="Progress"
            icon={AtSign}
            value={`${Math.round(calculateProgress())}%`}
            color="#10B981"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5 }}
        >
          <StepCounter steps={stats.totalSent} goal={stats.total} />
        </motion.div>

        {/* <motion.div
          className="w-full bg-gray-200 rounded-full h-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <motion.div
            className="bg-blue-600 h-4 rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: `${calculateProgress()}%` }}
            transition={{ duration: 0.3 }}
          />
        </motion.div> */}

        <motion.div
          className="flex gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
        >
          <div className="flex flex-wrap gap-4 p-4 mx-auto">
            {buttons.map((button, index) => (
              <AnimatedButton
                key={index}
                icon={button.icon}
                text={button.text}
                colorClasses={button.colorClasses}
                onClick={() => {
                  handleClick(button.text);
                }}
              />
            ))}
          </div>
        </motion.div>

        <SearchButton stats={stats} setStats={setStats} />
        <ErrorLogViewer />
      </main>
    </div>
  );
};

export default TrackDrop;
