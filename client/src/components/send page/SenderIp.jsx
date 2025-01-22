import { useEffect } from "react";
import { useBoiteStore } from "../../store/useBoiteStore";
import { useSendStore } from "../../store/useSendStore";

export default function SenderIp() {
  const { service, setService } = useSendStore();

  const { getAllSenders } = useBoiteStore();
  useEffect(() => {
    getAllSenders(service);
  }, [getAllSenders, service]);

  const handleSelectionChange = (event) => {
    setService(event.target.value);
  };

  return (
    <div className="w-[20%] flex flex-col gap-2 text-base font-medium text-white">
      <p>Sender ISP: {service}</p>
      <select
        size="9"
        className="bg-gray-700 py-2 px-4 rounded-lg w-full"
        value={service}
        onChange={handleSelectionChange}
      >
        <option>gmail</option>
        <option>yahoo</option>
      </select>
    </div>
  );
}
