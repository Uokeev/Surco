import type { Metadata, Viewport } from "next";
import { Inter, Lora } from "next/font/google";
import { AuthProvider } from "@/components/AuthProvider";
import { ToastProvider } from "@/components/ui/Toast";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const lora = Lora({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "Surco — Diagnóstico de Cultivos",
  description:
    "Diagnostica enfermedades en tus cultivos usando IA. Basado en guías SAG e INIA para agricultores chilenos.",
  applicationName: "Surco",
  authors: [{ name: "Surco Team" }],
  keywords: [
    "agricultura",
    "diagnóstico",
    "cultivos",
    "SAG",
    "INIA",
    "Chile",
    "fitosanitario",
  ],
  openGraph: {
    title: "Surco — Diagnóstico de Cultivos",
    description:
      "Cultiva inteligencia, cosecha resultados. Diagnóstico fitosanitario con IA.",
    type: "website",
    locale: "es_CL",
  },
  // ─── PWA ──────────────────────────────────────────────
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Surco",
    statusBarStyle: "black-translucent",
  },
  icons: [
    { rel: "apple-touch-icon", url: "/icons/icon.svg" },
  ],
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1E3D2B",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${inter.variable} ${lora.variable}`}>
      <body>
        <ServiceWorkerRegister />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-forest-800 focus:text-white focus:px-4 focus:py-2 focus:rounded-xl focus:outline-2 focus:outline-white focus:outline-offset-2 focus:text-sm focus:font-semibold"
        >
          Saltar al contenido principal
        </a>
        <AuthProvider>
          <ToastProvider>
            <div className="app-container">{children}</div>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
