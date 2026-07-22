"use client";

import {
  GraduationCap,
  Loader2,
  Phone,
  Save,
  School,
  Settings,
  Upload,
  User,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MentorProfile } from "./types";

interface MentorProfileSettingsProps {
  profile?: MentorProfile;
  myName: string;
  setMyName: (v: string) => void;
  myWhatsapp: string;
  setMyWhatsapp: (v: string) => void;
  myInstitution: string;
  setMyInstitution: (v: string) => void;
  myStudyProgram: string;
  setMyStudyProgram: (v: string) => void;
  myAvatarUrl: string;
  setMyAvatarUrl: (v: string) => void;
  isSavingProfile: boolean;
  profileSaveError: string | null;
  profileSaveSuccess: string | null;
  handleProfileFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSaveProfile: (e: React.FormEvent) => void;
}

export function MentorProfileSettings({
  profile,
  myName,
  setMyName,
  myWhatsapp,
  setMyWhatsapp,
  myInstitution,
  setMyInstitution,
  myStudyProgram,
  setMyStudyProgram,
  myAvatarUrl,
  setMyAvatarUrl,
  isSavingProfile,
  profileSaveError,
  profileSaveSuccess,
  handleProfileFileChange,
  handleSaveProfile,
}: MentorProfileSettingsProps) {
  const defaultAvatars = [
    "/avatars/avatar_1.png",
    "/avatars/avatar_2.png",
    "/avatars/avatar_3.png",
    "/avatars/avatar_4.png",
    "/avatars/avatar_5.png",
  ];

  const getEffectiveAvatar = () => {
    if (myAvatarUrl) return myAvatarUrl;
    const code = profile?.id
      ? profile.id.charCodeAt(0) + profile.id.charCodeAt(profile.id.length - 1)
      : 1;
    const index = (code % 5) + 1;
    return `/avatars/avatar_${index}.png`;
  };

  return (
    <Card className="border-border bg-card shadow-sm w-full font-sans">
      <CardHeader className="border-b border-border pb-4">
        <CardTitle className="font-heading font-bold text-lg flex items-center gap-2 text-foreground">
          <Settings className="w-5 h-5 text-brand-purple" />
          Edit Profil Saya
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Perbarui data pribadi Anda yang tersimpan di sistem.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSaveProfile} className="space-y-6">
          {profileSaveSuccess && (
            <Alert className="border-green-500/20 bg-green-500/5 text-green-600 dark:text-green-400">
              <AlertDescription className="text-xs font-medium">{profileSaveSuccess}</AlertDescription>
            </Alert>
          )}
          {profileSaveError && (
            <Alert className="border-red-500/20 bg-red-500/5 text-red-600 dark:text-red-400">
              <AlertDescription className="text-xs font-medium">{profileSaveError}</AlertDescription>
            </Alert>
          )}

          {/* Avatar Management */}
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-4 border-b border-border/50">
            <div className="relative group shrink-0">
              <img
                src={getEffectiveAvatar()}
                alt="Foto Profil"
                className="w-24 h-24 rounded-full object-cover border-2 border-brand-purple/20 shadow-md transition-all group-hover:brightness-90"
              />
              <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                <Upload className="w-5 h-5" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfileFileChange}
                  className="hidden"
                />
              </label>
            </div>
            <div className="space-y-4 w-full">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Unggah Foto Profil Baru
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfileFileChange}
                  className="block w-full text-xs text-muted-foreground file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-brand-purple/10 file:text-brand-purple hover:file:bg-brand-purple/20 cursor-pointer"
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  Mendukung format PNG, JPG, JPEG, WEBP, dll. Maksimal 5MB.
                </p>
              </div>

              {/* Choose from Default Avatars */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Pilih dari Avatar Default:
                </label>
                <div className="flex gap-2">
                  {defaultAvatars.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setMyAvatarUrl(url)}
                      className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all hover:scale-105 hover:shadow-xs cursor-pointer ${
                        myAvatarUrl === url
                          ? "border-brand-purple scale-105 shadow-sm"
                          : "border-transparent"
                      }`}
                    >
                      <img
                        src={url}
                        alt={`Avatar default ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-brand-purple" />
                Nama Lengkap
              </label>
              <Input
                value={myName}
                onChange={(e) => setMyName(e.target.value)}
                required
                placeholder="Nama Anda"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-brand-purple" />
                Nomor WhatsApp
              </label>
              <Input
                value={myWhatsapp}
                onChange={(e) => setMyWhatsapp(e.target.value)}
                placeholder="Contoh: 08123456789"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                <School className="w-3.5 h-3.5 text-brand-purple" />
                Asal Institusi / Kampus
              </label>
              <Input
                value={myInstitution}
                onChange={(e) => setMyInstitution(e.target.value)}
                placeholder="Contoh: Universitas Indonesia"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5 text-brand-purple" />
                Program Studi
              </label>
              <Input
                value={myStudyProgram}
                onChange={(e) => setMyStudyProgram(e.target.value)}
                placeholder="Contoh: Teknik Informatika"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
            <Button
              type="submit"
              disabled={isSavingProfile}
              className="bg-brand-purple hover:bg-brand-purple-hover text-white text-xs font-semibold h-10 px-6 flex items-center gap-1.5 cursor-pointer"
            >
              {isSavingProfile ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
