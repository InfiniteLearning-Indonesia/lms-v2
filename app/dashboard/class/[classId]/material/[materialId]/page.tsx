"use client";

import { API_BASE_URL } from "@/lib/config";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { ArrowLeft, Loader2, Video, BookOpen, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/navbar";

export default function MaterialDetailPage() {
  const router = useRouter();
  const params = useParams();
  const classId = params.classId as string;
  const materialId = params.materialId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [materialData, setMaterialData] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

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

  const handleLogout = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        router.push("/login");
      }
    } catch (err) {
      console.error(err);
    }
  };

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
        <p className="mt-4 text-sm text-muted-foreground animate-pulse font-heading">
          Memuat detail materi…
        </p>
      </div>
    );
  }

  const isVideo = materialData.type === "video";
  const isCustom = materialData.type === "custom";
  const isText = materialData.type === "text";

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans selection:bg-brand-purple/20 selection:text-brand-purple">
      <Navbar profile={profile} onLogout={handleLogout} title="Materi Kelas" showBackButton={true} backUrl={`/dashboard/class/${classId}`} />

      {/* ── Main Content ── */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-8 space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-brand-purple text-brand-purple bg-brand-purple/5 font-mono text-[10px] tracking-wider uppercase">
              {isText ? "Artikel / Rich Text" : isCustom ? "Materi Interaktif" : isVideo ? "Video" : "PDF / Teks"}
            </Badge>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {materialData.createdAt ? new Date(materialData.createdAt).toLocaleDateString('id-ID') : "Baru saja"}
            </span>
          </div>

          <h1 className="font-heading font-black text-3xl md:text-4xl text-foreground">
            {materialData.title}
          </h1>
        </div>

        {/* Content Viewer Placeholder */}
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden min-h-[400px] flex flex-col">
          {isText ? (
            <div className="p-6 md:p-8 border-b border-border bg-card">
              <div
                className="prose prose-sm dark:prose-invert max-w-none font-sans text-foreground leading-relaxed [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:text-xl [&_h2]:font-semibold [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded"
                dangerouslySetInnerHTML={{ __html: materialData.content || "<p>Tidak ada konten artikel.</p>" }}
              />
            </div>
          ) : isCustom ? (
            <div className="w-full bg-black/5 dark:bg-black/50 border-b border-border p-4 flex justify-center">
              <div
                className="w-full max-w-5xl aspect-video rounded-xl [&_iframe]:w-full [&_iframe]:h-full [&_iframe]:border-0 [&_iframe]:rounded-lg [&>div]:!mt-0 [&>div]:!mb-0 [&>div]:!mx-auto"
                dangerouslySetInnerHTML={{ __html: materialData.content }}
              />
            </div>
          ) : isVideo ? (
            <div className="aspect-video bg-black/5 dark:bg-black/50 flex flex-col items-center justify-center text-muted-foreground border-b border-border">
              <Video className="w-16 h-16 mb-4 opacity-50" />
              <p className="font-heading font-medium">Video Player Placeholder</p>
              <p className="text-xs opacity-70 mt-1">Video materi akan dimuat di sini</p>
            </div>
          ) : (
            <div className="h-[200px] bg-black/5 dark:bg-black/50 flex flex-col items-center justify-center text-muted-foreground border-b border-border">
              <BookOpen className="w-16 h-16 mb-4 opacity-50" />
              <p className="font-heading font-medium">PDF / Document Viewer Placeholder</p>
            </div>
          )}

          {!isText && (
            <div className="p-6 md:p-8 space-y-4">
              <h3 className="font-heading font-bold text-lg border-b border-border pb-2">
                Deskripsi Materi
              </h3>
              <div className="font-sans text-sm leading-relaxed text-foreground/90 whitespace-pre-line">
                {isCustom
                  ? materialData.url || "Tidak ada keterangan."
                  : materialData.url || "Tidak ada deskripsi tambahan untuk materi ini."}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
