import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/lib/theme";
import "./globals.css";

// Runs before paint so a returning visitor who picked light mode doesn't see
// a flash of the dark theme first. Dark needs no entry here — it's the plain
// :root default already.
const THEME_INIT_SCRIPT = `
try {
  if (localStorage.getItem("theme") === "light") {
    document.documentElement.dataset.theme = "light";
  }
} catch (e) {}
`;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fantasy Island",
  description: "See your NFL fantasy roster and league standings at a glance.",
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#090b12",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      // The blocking script below sets data-theme on this element before
      // React hydrates, on purpose (that's what avoids a flash of the wrong
      // theme) — that intentionally makes the server and client markup
      // differ, which React would otherwise flag as a hydration mismatch.
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
