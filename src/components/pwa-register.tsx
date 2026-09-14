"use client";

import { useEffect } from "react";

/**
 * ثبت Service Worker - فقط در بیلد پروداکشن
 * در محیط dev ثبت نمی‌شود تا HMR مختل نشود.
 */
export function PwaRegister() {
  useEffect(() => {
    if (
      process.env.NODE_ENV === "production" &&
      typeof window !== "undefined" &&
      "serviceWorker" in navigator
    ) {
      const register = () => {
        navigator.serviceWorker
          .register("/sw.js", { scope: "/" })
          .catch((err) => {
            console.warn("SW registration failed:", err);
          });
      };

      if (document.readyState === "complete") {
        register();
      } else {
        window.addEventListener("load", register, { once: true });
        return () => window.removeEventListener("load", register);
      }
    }
  }, []);

  return null;
}
