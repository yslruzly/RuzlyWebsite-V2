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
  // Favicon + apple touch icon are auto-detected from app/icon.png and
  // app/apple-icon.png via Next's file conventions — no manual links needed.
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
        {/* runs before anything paints so the saved theme applies right away, no light/dark flash */}
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
