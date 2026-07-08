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
        {children}
      </body>
    </html>
  );
}
