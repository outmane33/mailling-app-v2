import Header from "../components/common/Header";
import DropMonitorTable from "../components/drop monitor/DropMonitorTable";

export default function DropMonitor() {
  return (
    <div className="flex-1 overflow-auto relative z-10">
      <Header title="Drop Monitor" />
      <main className="max-w-8xl mx-auto py-4 sm:py-6 px-2 sm:px-4 lg:px-8">
        <DropMonitorTable />
      </main>
    </div>
  );
}
