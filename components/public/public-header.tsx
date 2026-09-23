import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

type PublicHeaderProps = {
  homeLabel: string;
  navigationLabel: string;
  statusLabel: string;
  loginLabel: string;
};

export function PublicHeader({ homeLabel, navigationLabel, statusLabel, loginLabel }: PublicHeaderProps) {
  return (
    <header className="border-b border-border/80 bg-background/95">
      <div className="mx-auto flex min-h-18 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" aria-label={homeLabel} className="inline-flex min-h-11 items-center rounded-lg py-2">
          <Image src="/logo-black.png" alt="Infinite Learning" width={180} height={32} className="h-7 w-auto dark:hidden" priority />
          <Image src="/logo-white.png" alt="Infinite Learning" width={180} height={32} className="hidden h-7 w-auto dark:block" priority />
        </Link>
        <nav aria-label={navigationLabel} className="flex items-center gap-1 sm:gap-2">
          <Link href="/status" className="hidden min-h-11 items-center rounded-lg px-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:inline-flex">
            {statusLabel}
          </Link>
          <ThemeToggle />
          <Link href="/login" className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/85 sm:px-4">
            {loginLabel}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </nav>
      </div>
    </header>
  );
}
