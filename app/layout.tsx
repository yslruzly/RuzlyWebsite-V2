import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  icons: { icon: "/images/favicon.svg" },
  title: "Ruzly Macatula — AI Engineer & Full-Stack Developer",
  description:
    "Portfolio of Ruzly Macatula (John), aspiring software engineer and 3rd-year BS Computer Science student at UE Manila building web and mobile applications.",
  openGraph: {
    title: "Ruzly Macatula — AI Engineer & Full-Stack Developer",
    description:
      "AI-powered products built with Next.js, TypeScript, RAG pipelines, and agentic workflows. Based in Manila, Philippines.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`dark ${GeistSans.variable} ${GeistMono.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        {children}
      </body>
    </html>
  );
}
