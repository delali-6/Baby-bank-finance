"use client";

import { useEffect, useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

export function PwaProvider() {
  const online = useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true
  );

  useEffect(() => {
    if (
      process.env.NODE_ENV === "production" &&
      "serviceWorker" in navigator
    ) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  if (online) return null;

  return (
    <div
      role="alert"
      className="fixed inset-x-0 top-0 z-50 bg-warning-soft px-4 py-3 text-center text-sm font-medium text-warning"
    >
      You are offline. Recording and viewing transactions is unavailable until
      your connection returns. Nothing is saved on this device.
    </div>
  );
}
