"use client";

import ReactMarkdown from "react-markdown";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  if (!content) return null;

  return (
    <div className={`prose dark:prose-invert max-w-none text-xs leading-relaxed space-y-2 font-sans ${className}`}>
      <ReactMarkdown
        components={{
          p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
          strong: ({ children }) => <strong className="font-bold text-foreground">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          ul: ({ children }) => <ul className="list-disc pl-4 space-y-1 my-2">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-4 space-y-1 my-2">{children}</ol>,
          li: ({ children }) => <li className="text-xs leading-relaxed">{children}</li>,
          h1: ({ children }) => <h1 className="font-heading font-bold text-base my-2 text-foreground">{children}</h1>,
          h2: ({ children }) => <h2 className="font-heading font-bold text-sm my-2 text-foreground">{children}</h2>,
          h3: ({ children }) => <h3 className="font-heading font-semibold text-xs my-1 text-foreground">{children}</h3>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-brand-purple/40 pl-3 py-1 italic my-2 bg-muted/30 rounded-r text-muted-foreground">
              {children}
            </blockquote>
          ),
          code: ({ children }) => (
            <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-[11px] text-brand-purple">
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="bg-secondary/70 p-3 rounded-lg overflow-x-auto text-[11px] font-mono my-2 border border-border">
              {children}
            </pre>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
