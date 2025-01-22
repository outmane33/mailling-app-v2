import Header from "../components/common/Header";
import HeaderProduction from "../components/send page/HeaderProduction";
import BodyProduction from "../components/send page/BodyProduction";
import EmailConfig from "../components/send page/EmailConfig";
import AllBoites from "../components/send page/AllBoites";
import SenderIp from "../components/send page/SenderIp";
import OfferInfo from "../components/send page/OfferInfo";
import Recipientes from "../components/send page/Recipientes";
import Placeholders from "../components/send page/Placeholders";
import { motion } from "framer-motion";
import Isps from "../components/send page/Isps";
import SelectData from "../components/send page/SelectData";
import TestButton from "../components/send page/TestButton";
import { Send, FlaskConical, Info } from "lucide-react";
import { useSendStore } from "../store/useSendStore";
import ShortcutHelpModal from "../components/common/ShortcutHelpModal";
import { useState } from "react";
import ConfirmModal from "../components/send page/ConfirmModal";
import { v4 as uuidv4 } from "uuid";

export default function SendPage() {
  const { sendTest, sendDrop } = useSendStore();
  const handleClick = (text) => {
    switch (text) {
      case "Test":
        sendTest();
        break;
      case "Drop":
        // sendDrop();
        setIsModalOpen(true);
        break;
      case "Help":
        setIsOpen(true);
        break;
      default:
        break;
    }
  };

  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex-1 overflow-auto relative z-10">
      <Header title="Production" />
      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
        {/* boites && offers */}
        <motion.div
          className="flex gap-16 mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <AllBoites />
          <SenderIp />
          <OfferInfo />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5 }}
        >
          <EmailConfig />
        </motion.div>
        {/* header && body */}
        <div className="flex gap-12 mb-10">
          <HeaderProduction />
          <BodyProduction />
        </div>
        {/* recipientes && placeholders */}
        <div className="flex gap-12 mb-10">
          <Recipientes />
          <Placeholders />
        </div>
        {/* Filters && select data */}
        <div className="flex gap-12 mb-10">
          <Isps />
          <SelectData />
        </div>
        {buttons.map((button, index) => (
          <TestButton
            key={index}
            {...button}
            onClick={() => handleClick(button.label)}
          />
        ))}
      </main>
      <ShortcutHelpModal isOpen={isOpen} setIsOpen={setIsOpen} />
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        value={uuidv4()}
        onConfirm={sendDrop}
      />
    </div>
  );
}

const buttons = [
  {
    Icon: FlaskConical,
    label: "Test",
    bgColor: "bg-purple-600",
    hoverColor: "hover:bg-purple-500",
    position: "50%",
  },
  {
    Icon: Send,
    label: "Drop",
    bgColor: "bg-amber-500",
    hoverColor: "hover:bg-amber-400",
    position: "calc(50% + 80px)",
  },
  {
    Icon: Info,
    label: "Help",
    bgColor: "bg-rose-600",
    hoverColor: "hover:bg-rose-500",
    position: "calc(50% + 160px)",
  },
];
