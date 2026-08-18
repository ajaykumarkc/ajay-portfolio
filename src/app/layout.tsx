import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { site } from "@/lib/data";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const description =
  "Software Engineer II and founding engineer at Lenity Health, building production AI voice-agent platforms, event-driven backends, and real-time dashboards. Based in Bengaluru, India.";

export const metadata: Metadata = {
  // Update this to your custom domain after deploying.
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — Software Engineer`,
    template: `%s — ${site.name}`,
  },
  description,
  keywords: [
    "Ajay Kumar Koilathachetta",
    "Software Engineer",
    "Founding Engineer",
    "AI Voice Agents",
    "Java",
    "Spring Boot",
    "React",
    "TypeScript",
    "Bengaluru",
  ],
  authors: [{ name: site.name, url: site.links.github }],
  creator: site.name,
  openGraph: {
    type: "website",
    url: "/",
    title: `${site.name} — Software Engineer`,
    description,
    siteName: site.name,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — Software Engineer`,
    description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0c",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background">{children}</body>
    </html>
  );
}
