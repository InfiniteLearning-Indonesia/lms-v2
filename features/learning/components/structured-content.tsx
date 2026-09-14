import { CircleAlert, Info, ShieldAlert } from "lucide-react";
import type { ContentBlock } from "../model";
import { safeContentUrl } from "../model";

export function StructuredContent({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="max-w-[72ch] space-y-4 text-[0.95rem] leading-7">
      {blocks.map((block, index) => {
        const key = `${block.type}-${index}`;
        if (block.type === "heading") {
          return block.level === 2
            ? <h2 key={key} className="pt-2 font-heading text-xl font-semibold tracking-tight">{block.text}</h2>
            : <h3 key={key} className="pt-1 font-heading text-lg font-semibold">{block.text}</h3>;
        }
        if (block.type === "paragraph") return <p key={key} className="whitespace-pre-wrap text-foreground/85">{block.text}</p>;
        if (block.type === "list") {
          return <ul key={key} className="list-disc space-y-2 pl-6 text-foreground/85">{block.items.map((item) => <li key={item}>{item}</li>)}</ul>;
        }
        if (block.type === "callout") {
          const Icon = block.tone === "warning" ? ShieldAlert : Info;
          return (
            <aside key={key} className={`rounded-xl border p-4 ${block.tone === "warning" ? "border-amber-500/30 bg-amber-500/5" : "border-primary/20 bg-primary/5"}`}>
              <div className="flex items-start gap-3">
                <Icon className={`mt-0.5 size-5 shrink-0 ${block.tone === "warning" ? "text-amber-600 dark:text-amber-300" : "text-primary"}`} aria-hidden="true" />
                <div><p className="font-heading text-sm font-semibold">{block.title}</p><p className="mt-1 text-sm leading-6 text-muted-foreground">{block.text}</p></div>
              </div>
            </aside>
          );
        }
        const safeUrl = safeContentUrl(block.url);
        return safeUrl ? (
          <a key={key} href={safeUrl} target="_blank" rel="noreferrer noopener" className="inline-flex min-h-11 items-center rounded-lg font-semibold text-primary underline decoration-primary/30 underline-offset-4 hover:decoration-primary">
            {block.label}
          </a>
        ) : (
          <span key={key} role="status" className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm text-muted-foreground">
            <CircleAlert className="size-4 shrink-0 text-amber-600" aria-hidden="true" />{block.label}
          </span>
        );
      })}
    </div>
  );
}
