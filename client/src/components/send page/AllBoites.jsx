import { useBoiteStore } from "../../store/useBoiteStore";
import { useSendStore } from "../../store/useSendStore";

export default function AllBoites() {
  const { senders } = useBoiteStore();
  const { login, setLogin } = useSendStore();
  const handleSelectionChange = (event) => {
    const selectedOptions = Array.from(event.target.selectedOptions)
      .map((option) => senders.find((sender) => sender.email === option.value))
      .filter(Boolean);

    setLogin(selectedOptions);
  };

  return (
    <div className="w-[20%] flex flex-col gap-2 text-base font-medium text-white">
      <p>All Boites ({login.length})</p>
      <select
        multiple
        size="9"
        className="bg-gray-700 py-2 px-4 rounded-lg w-full"
        onChange={handleSelectionChange}
      >
        {senders.map((sender) => (
          <option key={sender.email} value={sender.email}>
            {sender.email}
          </option>
        ))}
      </select>
    </div>
  );
}
