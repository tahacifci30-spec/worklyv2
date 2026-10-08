import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  openGraph: {
    siteName: "Werkly",
    locale: "nl_NL",
    type: "website",
    title: "Werkly: van aanvraag tot factuur",
    description: "Minder administratie en sneller van aanvraag naar factuur.",
  },
  title: {
    default: "Werkly: van aanvraag tot factuur",
    template: "%s · Werkly",
  },
  description:
    "Werkly helpt installatiebedrijven van aanvraag tot factuur: klantformulier met richtlijnofferte, planning, monteur, offerte en factuur in één programma.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="nl" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
