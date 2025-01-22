import { memo } from "react";
import { Zap } from "lucide-react";
import { useSendStore } from "../../store/useSendStore";

const InputField = memo(({ label, icon: Icon, type = "text", ...props }) => (
  <div className="flex flex-col gap-2 w-full">
    <p className="text-sm font-medium text-gray-200 whitespace-nowrap">
      {label}
    </p>
    <div className="relative">
      {type === "select" ? (
        <select
          className="w-full bg-gray-700 text-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          {...props}
        >
          {props.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <>
          <input
            type={type}
            className="w-full bg-gray-700 text-gray-100 placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            {...props}
          />
          {Icon && (
            <Icon className="absolute left-3 top-2.5 text-gray-400" size={18} />
          )}
        </>
      )}
    </div>
  </div>
));

InputField.displayName = "InputField";

const EmailConfig = () => {
  const {
    setContentTransferEncoding,
    setContentType,
    setStaticDomain,
    setAfterTest,
  } = useSendStore();

  const contentTypeOptions = [
    { value: "text/html", label: "text/html" },
    { value: "text/plain", label: "text/plain" },
    { value: "multipart/alternative", label: "multipart/alternative" },
  ];

  const transferEncodingOptions = [
    { value: "7bit", label: "7bit" },
    { value: "8bit", label: "8bit" },
    { value: "base64", label: "base64" },
    { value: "quoted-printable", label: "quoted-printable" },
  ];

  const linkTypeOptions = [
    { value: "Routing", label: "Routing" },
    { value: "encrypted", label: "encrypted" },
    { value: "encrypted attr", label: "encrypted attr" },
    { value: "encrypted attrbased", label: "encrypted attrbased" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8 mb-6 md:mb-8 lg:mb-10 text-white">
      <InputField
        label="Content Type"
        type="select"
        options={contentTypeOptions}
        onChange={(e) => setContentType(e.target.value)}
      />

      <InputField
        label="Trans Enc"
        type="select"
        options={transferEncodingOptions}
        onChange={(e) => setContentTransferEncoding(e.target.value)}
      />

      <InputField
        label="Test After"
        icon={Zap}
        placeholder="1000"
        onChange={(e) => setAfterTest(e.target.value)}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:col-span-1">
        <InputField
          label="Link Type"
          type="select"
          options={linkTypeOptions}
          onChange={() => {}}
        />

        <InputField
          label="Static Domain"
          icon={Zap}
          placeholder="Static Domain..."
          onChange={(e) => setStaticDomain(e.target.value)}
        />
      </div>
    </div>
  );
};

export default memo(EmailConfig);
