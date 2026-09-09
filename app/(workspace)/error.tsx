"use client";
import { ErrorState } from "@/components/ui-v3/states";
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) { return <ErrorState title="Workspace gagal dimuat" onRetry={reset} />; }
