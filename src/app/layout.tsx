import type { Metadata, Viewport } from "next";
import { AuthProvider } from "@/components/AuthProvider";
import "./globals.css";

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
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#1E3D2B",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          <div className="app-container">{children}</div>
        </AuthProvider>
      </body>
    </html>
  );
}
