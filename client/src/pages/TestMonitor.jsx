import Header from "../components/common/Header";
import TestMonitorTable from "../components/test monitor/TestMonitorTable";

export default function TestMonitor() {
  return (
    <div className="flex-1 overflow-auto relative z-10">
      <Header title="Drop Monitor" />
      <main className="max-w-8xl mx-auto py-6 px-4 lg:px-8">
        <TestMonitorTable />
      </main>
    </div>
  );
}
