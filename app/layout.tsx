import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { JetBrains_Mono } from "next/font/google";
import Preloader from "@/components/ui/Preloader";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  title: "Ruzly Macatula — Aspiring AI & Software Engineer",
  description:
    "Hi, I'm Ruzly — an aspiring AI & software engineer and CS student in Manila, turning ideas into RAG-powered, full-stack web and mobile apps.",
  openGraph: {
    title: "Ruzly Macatula — Aspiring AI & Software Engineer",
    description:
      "Hi, I'm Ruzly — an aspiring AI & Software Engineer and CS student in Manila, turning ideas into RAG-powered, full-stack web and mobile apps.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        {/* Apply the saved theme before paint to avoid a light/dark flash. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme')||'dark';var d=window.matchMedia('(prefers-color-scheme: dark)').matches;var light=t==='light'||(t==='system'&&!d);document.documentElement.classList.toggle('light',light);}catch(e){}})();`,
          }}
        />
        <Preloader />
        {children}
      </body>
    </html>
  );
}
