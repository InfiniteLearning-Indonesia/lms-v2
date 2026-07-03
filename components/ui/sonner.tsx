"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-4 text-emerald-500 shrink-0" />
        ),
        info: (
          <InfoIcon className="size-4 text-blue-500 shrink-0" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4 text-amber-500 shrink-0" />
        ),
        error: (
          <OctagonXIcon className="size-4 text-red-500 shrink-0" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin text-primary shrink-0" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            "group toast flex items-center gap-3 border border-border rounded-lg bg-card p-4 text-sm text-foreground shadow-lg group-data-[type=success]:border-emerald-500/20 group-data-[type=success]:bg-emerald-500/5 dark:group-data-[type=success]:bg-emerald-500/10 group-data-[type=error]:border-red-500/20 group-data-[type=error]:bg-red-500/5 dark:group-data-[type=error]:bg-red-500/10 group-data-[type=warning]:border-amber-500/20 group-data-[type=warning]:bg-amber-500/5 dark:group-data-[type=warning]:bg-amber-500/10 group-data-[type=info]:border-blue-500/20 group-data-[type=info]:bg-blue-500/5 dark:group-data-[type=info]:bg-blue-500/10",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
