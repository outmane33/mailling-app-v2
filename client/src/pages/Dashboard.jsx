import { useEffect } from "react";
import Header from "../components/common/Header";
import StatCard from "../components/common/StatCard";
import { motion } from "framer-motion";
import {
  Mail,
  BadgeCheck,
  Send,
  MousePointerClick,
  FlaskConical,
  PackageCheck,
  MousePointer,
  Users,
} from "lucide-react";
import DailyClickAndLeadChannel from "../components/dashboard/DailyClickChart";
import OffersStatistics from "../components/dashboard/OffersStatistics";
import SendStatistics from "../components/dashboard/SendStatistics";
import { useStatisticsStore } from "../store/useStatisticsStore";

export default function Dashboard() {
  const { statistics, loading, error, fetchStatistics } = useStatisticsStore();

  useEffect(() => {
    fetchStatistics();
    // Set up polling every 5 minutes
    const interval = setInterval(fetchStatistics, 300000);
    return () => clearInterval(interval);
  }, [fetchStatistics]);

  const statCardsData = [
    {
      name: "ACTIVE BOITES",
      icon: Mail,
      value: statistics.activeDrops.toString(),
      color: "#22d3ee",
      bgColor: "rgba(34, 211, 238, 0.2)",
      iconColor: "#22d3ee",
    },
    {
      name: "DAILY DROPS",
      icon: BadgeCheck,
      value: statistics.dailyDrops.toString(),
      color: "#a855f7",
      bgColor: "rgba(168, 85, 247, 0.2)",
      iconColor: "#a855f7",
    },
    {
      name: "DAILY SENT",
      icon: Send,
      value: statistics.dailySent.toString(),
      color: "#f43f5e",
      bgColor: "rgba(244, 63, 94, 0.2)",
      iconColor: "#f43f5e",
    },
    {
      name: "DAILY CLICK",
      icon: MousePointerClick,
      value: statistics.dailyClicks.toString(),
      color: "#0ea5e9",
      bgColor: "rgba(14, 165, 233, 0.2)",
      iconColor: "#0ea5e9",
    },
    {
      name: "DAILY TEST",
      icon: FlaskConical,
      value: statistics.dailyTests.toString(),
      color: "#facc15",
      bgColor: "rgba(250, 204, 21, 0.2)",
      iconColor: "#facc15",
    },
    {
      name: "DAILY DELIVERED",
      icon: PackageCheck,
      value: statistics.dailyDelivered.toString(),
      color: "#06b6d4",
      bgColor: "rgba(6, 182, 212, 0.2)",
      iconColor: "#06b6d4",
    },
    {
      name: "MONTHLY CLICK",
      icon: MousePointer,
      value: statistics.monthlyClicks.toString(),
      color: "#14b8a6",
      bgColor: "rgba(20, 184, 166, 0.2)",
      iconColor: "#14b8a6",
    },
    {
      name: "USERS",
      icon: Users,
      value: statistics.usersCount.toString(),
      color: "#10b981",
      bgColor: "rgba(16, 185, 129, 0.2)",
      iconColor: "#10b981",
    },
  ];

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">Loading...</div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto relative z-10">
      <Header title="Dashboard" />
      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
        {/* STATS */}
        <motion.div
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          {statCardsData.map((card, index) => (
            <motion.div
              key={`${card.name}-${index}`}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: [0.43, 0.13, 0.23, 0.96],
              }}
              whileHover={{
                scale: 1.05,
                transition: { duration: 0.2 },
              }}
              whileTap={{ scale: 0.95 }}
            >
              <StatCard
                name={card.name}
                icon={card.icon}
                value={card.value}
                color={card.color}
              />
            </motion.div>
          ))}
        </motion.div>
        {/* CHARTS */}
        <DailyClickAndLeadChannel data={statistics.dailyStats} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <OffersStatistics />
          <SendStatistics />
        </div>
      </main>
    </div>
  );
}
