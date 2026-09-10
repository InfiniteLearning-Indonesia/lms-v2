export type SessionEvent = "logged-out" | "revoked";

const channelName = "lms-v3-session-events";

export function publishSessionEvent(event: SessionEvent): void {
  if (typeof BroadcastChannel === "undefined") return;
  const channel = new BroadcastChannel(channelName);
  channel.postMessage(event);
  channel.close();
}

export function subscribeToSessionEvents(listener: (event: SessionEvent) => void): () => void {
  if (typeof BroadcastChannel === "undefined") return () => undefined;
  const channel = new BroadcastChannel(channelName);
  channel.addEventListener("message", (message: MessageEvent<unknown>) => {
    if (message.data === "logged-out" || message.data === "revoked") listener(message.data);
  });
  return () => channel.close();
}
