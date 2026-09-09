import type { Metadata } from "next";
import localFont from "next/font/local";
import { NextIntlClientProvider } from "next-intl";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/lib/query/provider";
import "./globals.css";

const lexendDeca = localFont({
  src: "./fonts/LexendDeca[wght].ttf",
  variable: "--font-lexend-deca",
  weight: "100 900",
  display: "swap",
  fallback: ["Arial", "sans-serif"],
});

const inclusiveSans = localFont({
  src: "./fonts/InclusiveSans[wght].ttf",
  variable: "--font-inclusive-sans",
  weight: "300 700",
  display: "swap",
  fallback: ["Arial", "sans-serif"],
});

export const metadata: Metadata = {
  title: "Infinite Learning",
  description:
    "Platform manajemen pembelajaran yang menghubungkan siswa, mentor, dan administrator dalam satu ekosistem digital.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${lexendDeca.variable} ${inclusiveSans.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <NextIntlClientProvider>
              <TooltipProvider>
                {children}
                <Toaster />
              </TooltipProvider>
            </NextIntlClientProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
