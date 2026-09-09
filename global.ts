import messages from "@/messages/id.json";

declare module "next-intl" {
  interface AppConfig {
    Locale: "id";
    Messages: typeof messages;
  }
}
