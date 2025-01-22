import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";
import { useAuthStore } from "./useAuthStore";

export const useSendStore = create((set, get) => ({
  login: [],
  affiliate_network: null,
  offer: null,
  header: "",
  contentTransferEncoding: "7bit",
  contentType: "text/html",
  staticDomain: null,
  body: "",
  isp: "RR",
  placeholders: {},
  recipientes: [],
  service: "gmail",
  startFrom: 0,
  count: 0,
  duplicate: 1,
  country: "United States",
  afterTest: 1000,
  email_type: null,
  dataListName: "",
  status: "active",

  setLogin: (emails) => set({ login: emails }),
  setAffiliateNetwork: (network) => set({ affiliate_network: network }),
  setOffer: (offer) => set({ offer: offer }),
  setHeader: (header) => set({ header: header }),
  setContentTransferEncoding: (contentTransferEncoding) => {
    set({ contentTransferEncoding: contentTransferEncoding });
  },
  setContentType: (contentType) => set({ contentType: contentType }),
  setStaticDomain: (staticDomain) => set({ staticDomain: staticDomain }),
  setBody: (body) => set({ body: body }),
  setIsp: (isp) => set({ isp: isp }),
  setPlaceholders: (placeholders) => set({ placeholders: placeholders }),
  setRecipientes: (recipientes) => set({ recipientes: recipientes }),
  setService: (service) => set({ service: service }),

  setStartFrom: (startFrom) => set({ startFrom: startFrom }),
  setCount: (count) => set({ count: count }),
  setDuplicate: (duplicate) => set({ duplicate: duplicate }),
  setCountry: (country) => set({ country: country }),

  setAfterTest: (afterTest) => set({ afterTest: afterTest }),

  setEmailType: (email_type) => set({ email_type: email_type }),

  setDataListName: (dataListName) => set({ dataListName: dataListName }),

  sendTest: async () => {
    if (!get().affiliate_network) {
      toast.error("Please select an affiliate network");
      return;
    } else if (get().login.length === 0) {
      toast.error("Please select an email account");
      return;
    } else if (!get().offer) {
      toast.error("Please select an offer");
      return;
    } else if (get().recipientes.length === 0) {
      toast.error("Please enter at least one recipient");
      return;
    } else if (
      !get().header.trim() ||
      Object.keys(get().handleHeader()).length === 0
    ) {
      toast.error("Please enter a valid header");
      return;
    }
    let emailData = {
      affiliate_network: get().affiliate_network,
      campaignName: uuidv4(),
      contentTransferEncoding: get().contentTransferEncoding,
      ...get().handleBody(),
      isp: get().isp,
      login: get().login,
      mailer: useAuthStore.getState().authUser.username,
      offer: get().offer,
      placeholders: get().placeholders,
      recipientes: get().recipientes,
      service: get().service,
      ...get().handleHeader(),
    };

    try {
      const res = await axiosInstance.post("/api/v1/send/test", emailData);
      toast.success(res.data.message);
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },
  sendDrop: async (campaignName) => {
    if (!get().affiliate_network) {
      toast.error("Please select an affiliate network");
      return;
    } else if (get().login.length === 0) {
      toast.error("Please select an email account");
      return;
    } else if (!get().offer) {
      toast.error("Please select an offer");
      return;
    } else if (get().recipientes.length === 0) {
      toast.error("Please enter at least one recipient");
      return;
    } else if (
      !get().header.trim() ||
      Object.keys(get().handleHeader()).length === 0
    ) {
      toast.error("Please enter a valid header");
      return;
    } else if (get().count === 0) {
      toast.error("Please enter a valid count");
      return;
    } else if (get().dataListName === "") {
      toast.error("Please enter a valid dataListName");
      return;
    }
    let emailData = {
      login: get().login,
      ...get().handleBody(),
      ...get().handleHeader(),
      contentTransferEncoding: get().contentTransferEncoding,
      placeholders: get().placeholders,
      isp: get().isp,
      campaignName,
      mailer: useAuthStore.getState().authUser.username,
      offer: get().offer,
      service: get().service,
      startFrom: parseInt(get().startFrom),
      count: parseInt(get().count),
      duplicate: parseInt(get().duplicate),
      country: get().country,
      afterTest: parseInt(get().afterTest),
      email_type: get().email_type,
      testEmail: get().recipientes[0],
      dataListName: get().dataListName,
    };
    try {
      const res = await axiosInstance.post("/api/v1/send/drop", emailData);
      toast.success(res.data.message);
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },
  // handleHeader
  handleHeader: () => {
    try {
      let headerData = {};
      let lines = get()
        .header.replace(/\[static_domain\]/g, get().staticDomain)
        .split("\n");
      // lines = get().header.split("\n");
      lines.forEach((e) => {
        let line = e.trim().split(/:(.*)/s);
        if (line[0].trim() !== "" && line[1].trim() !== "") {
          let headerKey = line[0].toLowerCase().trim();
          let headerValue = line[1].trim();

          // Map special headers to the correct keys
          switch (headerKey) {
            case "reply-to":
              headerKey = "replyTo";
              break;
            case "message-id":
              headerKey = "messageId";
              break;
            case "x-sg-eid":
              headerKey = "xSgEid";
              break;
            case "x-entity-id":
              headerKey = "xEntityId";
              break;
            case "x-feedback-id":
              headerKey = "xFeedbackId";
              break;
            case "list-unsubscribe":
              headerKey = "listUnsubscribe";
              break;
            case "mime-version":
              headerKey = "mimeVersion";
              break;
            case "x-priority":
              headerKey = "xPriority";
              break;
            case "x-custom-header":
              headerKey = "xCustomHeader";
              break;
          }
          headerData[headerKey] = headerValue;
        }
      });
      return headerData;
    } catch {
      return {};
    }
  },
  handleBody: () => {
    let data = {};
    if (get().contentType === "text/plain") {
      data.text = get().body.replace(/\[static_domain\]/g, get().staticDomain);
    } else if (get().contentType === "text/html") {
      data.html = get().body.replace(/\[static_domain\]/g, get().staticDomain);
    } else {
      data.html = get().body.replace(/\[static_domain\]/g, get().staticDomain);
      data.text = "Hello World";
    }

    return data;
  },
  pauseDrop: async (campaignName) => {
    try {
      const res = await axiosInstance.post("/api/v1/send/pauseCampaign", {
        campaignName,
      });
      set({ status: res.data.status });
      toast.success(res.data.message);
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },
  resumeDrop: async (campaignName) => {
    try {
      const res = await axiosInstance.post("/api/v1/send/resumeCampaign", {
        campaignName,
      });
      set({ status: res.data.status });
      toast.success(res.data.message);
      try {
        const result = await axiosInstance.post(
          "/api/v1/send/drop",
          res.data.drop
        );
        toast.success(result.data.message);
      } catch (error) {
        toast.error(error.response.data.message);
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },
  stopDrop: async (campaignName) => {
    try {
      const res = await axiosInstance.post("/api/v1/send/stopCampaign", {
        campaignName,
      });
      set({ status: res.data.status });
      toast.success(res.data.message);
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },
}));
