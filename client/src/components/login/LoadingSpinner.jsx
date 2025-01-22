import { Loader } from "lucide-react";

export default function LoadingSpinner() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 z-50">
      <Loader className="w-10 h-10 animate-spin text-blue-500" />
    </div>
  );
}
