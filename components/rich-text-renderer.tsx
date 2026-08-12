"use client";

import React from "react";
import { MarkdownRenderer } from "./markdown-renderer";

interface RichTextRendererProps {
  content: string;
  className?: string;
}

export const decodeHtmlEntities = (str: string): string => {
  if (!str) return "";
  let decoded = str;
  // Decode up to 2 layers of escaping if stored double-escaped
  for (let i = 0; i < 2; i++) {
    if (decoded.includes("&lt;") || decoded.includes("&gt;") || decoded.includes("&amp;")) {
      decoded = decoded
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
    } else {
      break;
    }
  }
  return decoded;
};

export function RichTextRenderer({ content, className = "" }: RichTextRendererProps) {
  if (!content) return null;

  const rawDecoded = decodeHtmlEntities(content);

  // Check if content contains HTML tags (e.g. TipTap output, iframe, <h2>, <p>, <strong>, etc.)
  const isHtml = /<[a-z][\s\S]*>/i.test(rawDecoded);

  if (isHtml) {
    return (
      <div
        className={`prose prose-sm dark:prose-invert max-w-none font-sans text-foreground leading-relaxed 
          [&_h1]:text-2xl [&_h1]:font-black [&_h1]:font-heading [&_h1]:my-4 [&_h1]:text-foreground
          [&_h2]:text-xl [&_h2]:font-bold [&_h2]:font-heading [&_h2]:my-3 [&_h2]:text-foreground
          [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:font-heading [&_h3]:my-2 [&_h3]:text-foreground
          [&_p]:my-2 [&_p]:leading-relaxed
          [&_strong]:font-bold [&_strong]:text-foreground
          [&_em]:italic
          [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2
          [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-2
          [&_li]:my-0.5
          [&_blockquote]:border-l-4 [&_blockquote]:border-brand-purple/60 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-3 [&_blockquote]:bg-secondary/30 [&_blockquote]:py-2 [&_blockquote]:rounded-r-lg
          [&_code]:bg-secondary [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:font-mono [&_code]:text-xs [&_code]:text-brand-purple
          [&_pre]:bg-slate-900 [&_pre]:text-slate-100 [&_pre]:p-4 [&_pre]:rounded-xl [&_pre]:overflow-x-auto [&_pre]:my-3
          [&_a]:text-brand-purple [&_a]:font-semibold [&_a]:underline [&_a]:underline-offset-2
          [&_iframe]:!w-full [&_iframe]:!aspect-video [&_iframe]:!h-auto [&_iframe]:max-w-full [&_iframe]:rounded-xl [&_iframe]:border-0 [&_iframe]:my-4 [&_iframe]:shadow-md
          ${className}`}
        dangerouslySetInnerHTML={{ __html: rawDecoded }}
      />
    );
  }

  return <MarkdownRenderer content={content} className={className} />;
}

export const stripHtml = (html: string): string => {
  if (!html) return "";
  const decoded = decodeHtmlEntities(html);
  return decoded.replace(/<[^>]*>?/gm, "").trim();
};
