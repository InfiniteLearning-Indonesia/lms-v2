import { afterEach, describe, expect, it, vi } from "vitest";
import { publishSessionEvent, subscribeToSessionEvents } from "@/lib/auth/session-channel";

class FakeBroadcastChannel {
  static instances = new Set<FakeBroadcastChannel>();
  listeners = new Set<(event: MessageEvent<unknown>) => void>();

  constructor(public readonly name: string) {
    FakeBroadcastChannel.instances.add(this);
  }

  addEventListener(_type: string, listener: (event: MessageEvent<unknown>) => void) {
    this.listeners.add(listener);
  }

  postMessage(data: unknown) {
    for (const instance of FakeBroadcastChannel.instances) {
      if (instance !== this && instance.name === this.name) {
        for (const listener of instance.listeners) listener({ data } as MessageEvent<unknown>);
      }
    }
  }

  close() {
    FakeBroadcastChannel.instances.delete(this);
  }
}

afterEach(() => {
  vi.unstubAllGlobals();
  FakeBroadcastChannel.instances.clear();
});

describe("FE01 cross-tab session signal", () => {
  it("propagates logout state without carrying a credential", () => {
    vi.stubGlobal("BroadcastChannel", FakeBroadcastChannel);
    const listener = vi.fn();
    const unsubscribe = subscribeToSessionEvents(listener);
    publishSessionEvent("logged-out");
    expect(listener).toHaveBeenCalledWith("logged-out");
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
  });

  it("ignores unknown messages", () => {
    vi.stubGlobal("BroadcastChannel", FakeBroadcastChannel);
    const listener = vi.fn();
    const unsubscribe = subscribeToSessionEvents(listener);
    const sender = new FakeBroadcastChannel("lms-v3-session-events");
    sender.postMessage({ token: "must-not-propagate" });
    expect(listener).not.toHaveBeenCalled();
    sender.close();
    unsubscribe();
  });
});
