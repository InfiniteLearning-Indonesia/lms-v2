"use client";

import { API_BASE_URL } from "@/lib/config";
import { logout } from "@/lib/logout";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ExternalLink,
  Copy,
  Check,
  Loader2,
  Video,
  BookOpen,
  Clock,
  Sparkles,
  FileText,
  Compass,
  ArrowUpRight,
  Maximize2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { RichTextRenderer } from "@/components/rich-text-renderer";
import { toast } from "sonner";

export default function MaterialDetailPage() {
  const router = useRouter();
  const params = useParams();
  const classId = params.classId as string;
  const materialId = params.materialId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [materialData, setMaterialData] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [iframeFailed, setIframeFailed] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/auth/me`, {
      headers: { Accept: "application/json" },
      credentials: "include",
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Unauthorized");
      })
      .then((data) => setProfile(data))
      .catch((err) => {
        console.error("Gagal memuat profil:", err);
        router.push("/login");
      });
  }, [router]);

  const handleLogout = () => { logout(); };

  useEffect(() => {
    fetch(`${API_BASE_URL}/classes/${classId}/material/${materialId}`, {
      headers: { Accept: "application/json" },
      credentials: "include",
    })
      .then((res) => {
        if (res.status === 401) {
          router.push("/login");
          throw new Error("Unauthorized");
        }
        if (!res.ok) throw new Error("Gagal mengambil data materi");
        return res.json();
      })
      .then((data) => {
        setMaterialData(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }, [classId, materialId, router]);

  if (isLoading || !materialData) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <Loader2 className="w-10 h-10 text-brand-purple animate-spin" />
        <p className="mt-4 text-sm text-muted-foreground animate-pulse font-heading font-medium">
          Memuat detail materi…
        </p>
      </div>
    );
  }

  // Extract external target URL if present (must start with http:// or https://)
  const rawUrlCandidate = [materialData.url, materialData.content].find(
    (val) => typeof val === "string" && (val.trim().startsWith("http://") || val.trim().startsWith("https://"))
  );
  const targetUrl = rawUrlCandidate ? rawUrlCandidate.trim() : null;

  // Extract Rich Text / HTML / Markdown content if not an HTTP link
  const getMaterialBodyContent = () => {
    const candidates = [materialData.content, materialData.url, materialData.description];
    for (const c of candidates) {
      if (typeof c === "string" && c.trim() !== "" && !c.trim().startsWith("http://") && !c.trim().startsWith("https://")) {
        return c;
      }
    }
    return "";
  };

  const bodyContent = getMaterialBodyContent();

  // Convert YouTube link to embeddable player URL
  const getEmbedUrl = (url: string): string => {
    if (!url) return "";
    let u = url.trim();
    if (u.includes("youtu.be/")) {
      const videoId = u.split("youtu.be/")[1]?.split("?")[0]?.split("&")[0];
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }
    if (u.includes("youtube.com/watch")) {
      try {
        const urlParams = new URLSearchParams(u.split("?")[1]);
        const videoId = urlParams.get("v");
        if (videoId) return `https://www.youtube.com/embed/${videoId}`;
      } catch (e) { }
    }
    return u;
  };

  const embedUrl = targetUrl ? getEmbedUrl(targetUrl) : null;
  const isYouTube = targetUrl && (targetUrl.includes("youtube.com") || targetUrl.includes("youtu.be"));

  // Sites known to block iframe embedding (Craft.me, Notion, etc.)
  const isDirectExternalSite = targetUrl && (targetUrl.includes("craft.me") || targetUrl.includes("notion.site"));
  const canEmbedIframe = isYouTube || (embedUrl && !isDirectExternalSite && !iframeFailed);

  const isVideo = materialData.type === "video" || isYouTube;
  const isCustom = materialData.type === "custom";
  const isText = (materialData.type === "text" || !!bodyContent) && !targetUrl;

  const getUrlTypeInfo = (url: string) => {
    const u = url.toLowerCase();
    if (u.includes("craft.me")) return { name: "Dokumen Craft.me", badge: "Craft Document" };
    if (u.includes("figma.com")) return { name: "Prototipe / File Figma", badge: "Figma Design" };
    if (u.includes("pdf")) return { name: "Berkas Dokumen PDF", badge: "PDF File" };
    if (u.includes("drive.google.com") || u.includes("docs.google.com")) return { name: "Google Drive / Docs", badge: "Google Cloud" };
    if (u.includes("youtube.com") || u.includes("youtu.be")) return { name: "Video Youtube", badge: "YouTube Video" };
    return { name: "Tautan Sumber Eksternal", badge: "Link Eksternal" };
  };

  const urlInfo = targetUrl ? getUrlTypeInfo(targetUrl) : null;

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Tautan materi berhasil disalin!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans selection:bg-brand-purple/20 selection:text-brand-purple">
      <Navbar
        profile={profile}
        onLogout={handleLogout}
        title="Materi Kelas"
        showBackButton={true}
        backUrl={`/dashboard/class/${classId}`}
      />

      {/* ── Main Content ── */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Header Bar with Action Buttons */}
        <div className="space-y-4 border-b border-border/60 pb-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Badge variant="outline" className="border-brand-purple/40 text-brand-purple bg-brand-purple/10 font-bold text-[10px] tracking-wider uppercase px-3 py-1">
                {materialData.type === "custom"
                  ? "Custom Embed (HTML)"
                  : materialData.type === "video" || isVideo
                    ? "Video Pembelajaran"
                    : materialData.type === "pdf"
                      ? "Dokumen PDF"
                      : materialData.type === "url"
                        ? (urlInfo?.badge || "Tautan Luar")
                        : "Artikel / Rich Text"}
              </Badge>
              <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                <Clock className="w-3.5 h-3.5" />
                Diunggah {materialData.createdAt ? new Date(materialData.createdAt).toLocaleDateString('id-ID') : "Baru saja"}
              </span>
            </div>

            {/* Top Quick Actions (Compact & Clean) */}
            {targetUrl && (
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyLink(targetUrl)}
                  className="h-9 px-3 text-xs gap-1.5 border-border hover:bg-secondary cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Tersalin" : "Salin Link"}</span>
                </Button>

                <a
                  href={targetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-9 px-4 rounded-lg bg-brand-purple hover:bg-brand-purple-hover text-white font-heading font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Buka Link / Dokumen</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>

          <h1 className="font-heading font-black text-2xl md:text-3xl lg:text-4xl text-foreground tracking-tight">
            {materialData.title}
          </h1>
        </div>

        {/* Content Viewer / Embedded Frame Section */}
        <div className="bg-card border border-border/80 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          {targetUrl ? (
            <div className="w-full flex flex-col">
              <div className="bg-secondary/40 border-b border-border/60 p-3 px-5 flex items-center justify-between text-xs text-muted-foreground font-medium">
                <span className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-brand-purple" />
                  {isYouTube ? "Pemutar Video YouTube" : "Akses Dokumen Interaktif"}
                </span>
                <a
                  href={targetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-purple font-semibold hover:underline flex items-center gap-1"
                >
                  <span>Buka di Tab Baru</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              </div>

              {/* Embedded Player / Fallback Card Container */}
              {canEmbedIframe ? (
                <div className={`w-full bg-black/5 dark:bg-black/40 relative ${isYouTube ? "aspect-video" : "min-h-[550px]"}`}>
                  <iframe
                    src={embedUrl || undefined}
                    title={materialData.title}
                    onError={() => setIframeFailed(true)}
                    className={`w-full border-0 rounded-b-2xl ${isYouTube ? "h-full" : "h-[600px]"}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                /* 🚀 Sleek Fallback Card for External Links (Craft.me, Notion, Web) */
                <div className="p-8 sm:p-12 bg-gradient-to-b from-secondary/30 via-background to-secondary/20 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-purple to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-brand-purple/20">
                    <ExternalLink className="w-7 h-7" />
                  </div>
                  <div className="max-w-md space-y-1.5">
                    <h3 className="font-heading font-bold text-base text-foreground">
                      {urlInfo?.name || "Dokumen / Tautan Eksternal"}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Materi ini disajikan melalui platform eksternal. Klik tombol di bawah ini untuk membuka dokumen secara lengkap di tab baru.
                    </p>
                  </div>
                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                    <a
                      href={targetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-3 rounded-xl bg-brand-purple hover:bg-brand-purple-hover text-white font-heading font-bold text-xs shadow-md transition-all flex items-center gap-2 hover:scale-[1.02] cursor-pointer"
                    >
                      <span>Buka Dokumen / Link Materi</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </a>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleCopyLink(targetUrl)}
                      className="h-10 px-4 text-xs gap-1.5 border-border hover:bg-secondary cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Salin Link</span>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : bodyContent ? (
            <div className="p-6 md:p-8 bg-card space-y-4">
              <RichTextRenderer content={bodyContent} />
            </div>
          ) : (
            <div className="h-[250px] bg-secondary/20 flex flex-col items-center justify-center text-muted-foreground border-b border-border space-y-2 p-6">
              <BookOpen className="w-12 h-12 text-brand-purple/60" />
              <p className="font-heading font-bold text-sm text-foreground">Dokumen Referensi Materi</p>
              <p className="text-xs text-muted-foreground text-center max-w-md">
                Gunakan tombol tautan materi di bagian atas untuk mengakses berkas referensi kelas secara lengkap.
              </p>
            </div>
          )}

          {/* Description Section (only if description is distinct from bodyContent) */}
          <div className="p-6 md:p-8 space-y-3 bg-card border-t border-border/60">
            <h3 className="font-heading font-bold text-base text-foreground flex items-center gap-2 border-b border-border/50 pb-2.5">
              <FileText className="w-4 h-4 text-brand-purple" />
              Deskripsi & Catatan Materi
            </h3>
            <div className="font-sans text-xs sm:text-sm leading-relaxed text-foreground/90">
              {materialData.description && materialData.description !== bodyContent ? (
                <RichTextRenderer content={materialData.description} />
              ) : (
                <span className="text-muted-foreground italic">
                  Tidak ada deskripsi tambahan untuk materi ini.
                </span>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
