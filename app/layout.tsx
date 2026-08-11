import type { Metadata } from "next";
import { Lexend_Deca, Inclusive_Sans } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const lexendDeca = Lexend_Deca({
  variable: "--font-lexend-deca",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const inclusiveSans = Inclusive_Sans({
  variable: "--font-inclusive-sans",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Infinite Learning",
  description:
    "Platform manajemen pembelajaran yang menghubungkan siswa, mentor, dan administrator dalam satu ekosistem digital.",
  icons: {
    icon: "/favicon.jpeg",
    shortcut: "/favicon.jpeg",
    apple: "/favicon.jpeg",
  },
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
      <head>
        <link rel="icon" href="/favicon.jpeg?v=2" type="image/jpeg" />
        <link rel="shortcut icon" href="/favicon.jpeg?v=2" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/favicon.jpeg?v=2" />
      </head>
      <body className="min-h-full flex flex-col font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            {children}
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
