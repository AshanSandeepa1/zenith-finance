import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { SessionProvider } from "@/components/providers/session-provider";
import { CurrencyProvider } from "@/components/providers/currency-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { USD_LKR_RATE } from "@/lib/currency";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Zenith Finance",
  description: "Personal finance & net worth tracking dashboard",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <SessionProvider>
            {/* Static fallback for public pages (landing/login/register), which
                don't display any currency — keeps them statically generated.
                The dashboard layout nests a session-aware CurrencyProvider
                with live rates that shadows this one for signed-in users. */}
            <CurrencyProvider
              initialDisplayCurrency="LKR"
              usdToLkrRate={USD_LKR_RATE}
              usdToLkrFetchedAt={null}
              lkrToDisplayRate={1}
            >
              {children}
            </CurrencyProvider>
          </SessionProvider>
          <Toaster richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
