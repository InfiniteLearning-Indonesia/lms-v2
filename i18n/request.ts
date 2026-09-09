import { getRequestConfig } from "next-intl/server";
import messages from "@/messages/id.json";

export const locale = "id" as const;

export default getRequestConfig(() => ({
  locale,
  messages,
}));
