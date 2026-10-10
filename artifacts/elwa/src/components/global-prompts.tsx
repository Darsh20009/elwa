import { useEffect } from "react";
import { subscribeToPush } from "@/lib/push-utils";

const PERMISSION_ATTEMPT_KEY = "elwa_push_permission_attempted_at";
const PERMISSION_ATTEMPT_COOLDOWN = 7 * 24 * 60 * 60 * 1000;

let customerSubscriptionAttempt: Promise<boolean> | null = null;

function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true;
}

function isCapacitorNative() {
  return !!(window as any).Capacitor?.isNative ||
    window.location.protocol === "capacitor:" ||
    (window.location.hostname === "localhost" && !!(window as any).Capacitor);
}

function isEmployeePage() {
  const path = window.location.pathname;
  return path.startsWith("/employee") || path.startsWith("/manager") ||
    path.startsWith("/admin") || path.startsWith("/qirox") ||
    path === "/0" || path.startsWith("/owner") || path.startsWith("/executive");
}

function getCustomerUserId(): string {
  try {
    const stored = localStorage.getItem("qahwa-customer") || localStorage.getItem("currentCustomer");
    if (stored) {
      const customer = JSON.parse(stored);
      if (customer?.id || customer?._id) return customer.id || customer._id;
      if (customer?.phone) return `phone:${customer.phone}`;
    }
  } catch {
    // Continue as a guest if the stored customer profile is unavailable.
  }
  return "visitor";
}

function subscribeCurrentCustomer() {
  if (!customerSubscriptionAttempt) {
    customerSubscriptionAttempt = subscribeToPush({
      userType: "customer",
      userId: getCustomerUserId(),
    }).finally(() => {
      customerSubscriptionAttempt = null;
    });
  }
  return customerSubscriptionAttempt;
}

export function GlobalPrompts() {
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      isCapacitorNative() ||
      isEmployeePage() ||
      !("Notification" in window)
    ) {
      return;
    }

    let cancelled = false;
    let handled = false;
    let removeInteractionListeners = () => {};

    const subscribeIfGranted = () => {
      if (!cancelled && Notification.permission === "granted") {
        void subscribeCurrentCustomer();
      }
    };

    if (Notification.permission === "granted") {
      subscribeIfGranted();
      return () => {
        cancelled = true;
      };
    }

    if (
      Notification.permission !== "default" ||
      (isIOS() && !isStandalone())
    ) {
      return;
    }

    try {
      const lastAttempt = Number(localStorage.getItem(PERMISSION_ATTEMPT_KEY)) || 0;
      if (lastAttempt && Date.now() - lastAttempt < PERMISSION_ATTEMPT_COOLDOWN) {
        return;
      }
    } catch {
      // Keep permission prompting available if storage is blocked.
    }

    const requestOnFirstInteraction = () => {
      if (handled) return;
      handled = true;
      removeInteractionListeners();

      if (Notification.permission === "granted") {
        subscribeIfGranted();
        return;
      }
      if (Notification.permission !== "default") return;

      try {
        localStorage.setItem(PERMISSION_ATTEMPT_KEY, String(Date.now()));
      } catch {
        // The browser permission request can still proceed without storage.
      }

      try {
        void Notification.requestPermission()
          .then((permission) => {
            if (permission === "granted" && !cancelled) {
              return subscribeCurrentCustomer();
            }
            return false;
          })
          .catch((error) => {
            console.warn("[Push] Permission request failed:", error);
          });
      } catch (error) {
        console.warn("[Push] Permission request failed:", error);
      }
    };

    removeInteractionListeners = () => {
      window.removeEventListener("click", requestOnFirstInteraction, true);
      window.removeEventListener("keydown", requestOnFirstInteraction, true);
    };

    window.addEventListener("click", requestOnFirstInteraction, true);
    window.addEventListener("keydown", requestOnFirstInteraction, true);

    return () => {
      cancelled = true;
      removeInteractionListeners();
    };
  }, []);

  return null;
}