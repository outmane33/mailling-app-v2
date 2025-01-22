import { SearchableSelect } from "./SearchableSelect";
import { useSendStore } from "../../store/useSendStore";

export default function OfferInfo() {
  const { setAffiliateNetwork, setOffer } = useSendStore();
  const offers = [
    "Offer 1",
    "Offer 2",
    "Offer 3",
    "Special Offer",
    "New Offer",
  ];
  const networks = ["Network 1", "Network 2", "Network 3", "Another Network"];
  const froms = ["From Address 1", "From Address 2", "From Address 3"];
  const subjects = ["Subject 1", "Subject 2", "Subject 3", "Important Subject"];

  const handleSelect = (field, value) => {
    if (field === "network") {
      setAffiliateNetwork(value);
    } else {
      setOffer(value);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-[60%] text-base font-medium text-white">
      <div className="flex gap-4">
        {/* Affiliate Network */}
        <div className="flex flex-col gap-2 w-full">
          <SearchableSelect
            label="Affiliate Network"
            options={networks}
            placeholder="Select network..."
            onSelect={(value) => handleSelect("network", value)}
          />
        </div>
        {/* Offers */}
        <div className="flex flex-col gap-2 w-full">
          <SearchableSelect
            label="Offers"
            options={offers}
            placeholder="Select offer..."
            onSelect={(value) => handleSelect("offer", value)}
          />
        </div>
      </div>
      {/* From */}
      <div className="">
        <div className="flex flex-col gap-2 w-full">
          <SearchableSelect
            label="Froms"
            options={froms}
            placeholder="Select from..."
          />
        </div>
      </div>
      {/* Subject */}
      <div className="">
        <div className="flex flex-col gap-2 w-full">
          <SearchableSelect
            label="Subject"
            options={subjects}
            placeholder="Select subject..."
          />
        </div>
      </div>
    </div>
  );
}
