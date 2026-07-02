"use client";

import { useEffect } from "react";

/**
 * Registra el Service Worker para PWA offline support.
 * Se ejecuta solo en el cliente, después del primer render.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      // Esperar a que la página cargue completamente
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("[SW] Registrado:", registration.scope);
          })
          .catch((error) => {
            console.warn("[SW] Error de registro:", error);
          });
      });
    }
  }, []);

  // Este componente no renderiza nada visible
  return null;
}
