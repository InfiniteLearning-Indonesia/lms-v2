"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import LinkExtension from "@tiptap/extension-link";
import { useEffect, useState } from "react";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Code,
  Link as LinkIcon,
  Unlink,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ content, onChange, placeholder = "Tulis isi materi di sini..." }: RichTextEditorProps) {
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkInputUrl, setLinkInputUrl] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit,
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-brand-purple underline cursor-pointer",
        },
      }),
    ],
    editorProps: {
      attributes: {
        class:
          "prose dark:prose-invert max-w-none focus:outline-none p-4 min-h-[220px] text-sm leading-relaxed text-foreground font-sans [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:font-heading [&_h1]:text-foreground [&_h1]:mt-3 [&_h1]:mb-2 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:font-heading [&_h2]:text-foreground [&_h2]:mt-2.5 [&_h2]:mb-1.5 [&_p]:text-sm [&_p]:leading-relaxed [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-2 [&_code]:font-mono [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded",
      },
    },
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || "");
    }
  }, [content, editor]);

  if (!editor) return null;

  const openLinkModal = () => {
    const currentUrl = editor.getAttributes("link").href || "";
    setLinkInputUrl(currentUrl);
    setIsLinkModalOpen(true);
  };

  const handleSaveLink = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    let url = linkInputUrl.trim();
    if (!url) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      if (!/^https?:\/\//i.test(url) && !url.startsWith("mailto:") && !url.startsWith("tel:")) {
        url = `https://${url}`;
      }
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }
    setIsLinkModalOpen(false);
  };

  const handleRemoveLink = () => {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    setIsLinkModalOpen(false);
  };

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-background focus-within:ring-1 focus-within:ring-brand-purple font-sans">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-secondary/50 border-b border-border text-foreground text-xs">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded hover:bg-muted transition-colors ${editor.isActive("bold") ? "bg-brand-purple/20 text-brand-purple font-bold" : ""}`}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded hover:bg-muted transition-colors ${editor.isActive("italic") ? "bg-brand-purple/20 text-brand-purple" : ""}`}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>

        <div className="w-px h-4 bg-border mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-1.5 rounded hover:bg-muted transition-colors ${editor.isActive("heading", { level: 1 }) ? "bg-brand-purple/20 text-brand-purple font-bold" : ""}`}
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-1.5 rounded hover:bg-muted transition-colors ${editor.isActive("heading", { level: 2 }) ? "bg-brand-purple/20 text-brand-purple font-bold" : ""}`}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </button>

        <div className="w-px h-4 bg-border mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded hover:bg-muted transition-colors ${editor.isActive("bulletList") ? "bg-brand-purple/20 text-brand-purple" : ""}`}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded hover:bg-muted transition-colors ${editor.isActive("orderedList") ? "bg-brand-purple/20 text-brand-purple" : ""}`}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`p-1.5 rounded hover:bg-muted transition-colors ${editor.isActive("codeBlock") ? "bg-brand-purple/20 text-brand-purple" : ""}`}
          title="Code Block"
        >
          <Code className="w-4 h-4" />
        </button>

        <div className="w-px h-4 bg-border mx-1" />

        <button
          type="button"
          onClick={openLinkModal}
          className={`p-1.5 rounded hover:bg-muted transition-colors ${editor.isActive("link") ? "bg-brand-purple/20 text-brand-purple" : ""}`}
          title="Sisipkan / Edit Link"
        >
          <LinkIcon className="w-4 h-4" />
        </button>
        {editor.isActive("link") && (
          <button
            type="button"
            onClick={handleRemoveLink}
            className="p-1.5 rounded hover:bg-red-500/10 text-red-500 transition-colors"
            title="Hapus Link"
          >
            <Unlink className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Editor Content Area */}
      <EditorContent
        editor={editor}
        className="bg-background text-foreground font-sans cursor-text"
      />

      {/* Link Dialog Modal */}
      <Dialog open={isLinkModalOpen} onOpenChange={setIsLinkModalOpen}>
        <DialogContent className="sm:max-w-md z-[100]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground font-heading">
              <LinkIcon className="w-5 h-5 text-brand-purple" />
              Sisipkan / Edit Tautan (Link)
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveLink} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Alamat Tautan (URL)
              </label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="url"
                  placeholder="https://contoh-link.com"
                  value={linkInputUrl}
                  onChange={(e) => setLinkInputUrl(e.target.value)}
                  className="pl-9 h-10 bg-background text-sm"
                  autoFocus
                />
              </div>
            </div>
            <DialogFooter className="flex justify-between sm:justify-between items-center gap-2 pt-2">
              {editor.isActive("link") ? (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleRemoveLink}
                  className="text-xs flex items-center gap-1.5"
                >
                  <Unlink className="w-3.5 h-3.5" />
                  Hapus Tautan
                </Button>
              ) : (
                <div />
              )}
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsLinkModalOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-brand-purple hover:bg-brand-purple-hover text-white font-semibold"
                >
                  Simpan Tautan
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
