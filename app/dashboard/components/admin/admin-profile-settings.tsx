"use client";

import {
  AlertCircle,
  CheckCircle2,
  GraduationCap,
  Loader2,
  Phone,
  Save,
  School,
  Settings,
  Upload,
  User,
} from "lucide-react";

interface AdminProfileSettingsProps {
  profile?: {
    id: string;
    name: string;
    email: string;
    role: string;
    roles?: string[];
    whatsapp?: string | null;
    institution?: string | null;
    studyProgram?: string | null;
    avatarUrl?: string | null;
  };
  profileName: string;
  setProfileName: (v: string) => void;
  profileWhatsapp: string;
  setProfileWhatsapp: (v: string) => void;
  profileInstitution: string;
  setProfileInstitution: (v: string) => void;
  profileStudyProgram: string;
  setProfileStudyProgram: (v: string) => void;
  profileAvatarUrl: string;
  setProfileAvatarUrl: (v: string) => void;
  isSavingProfile: boolean;
  profileSaveError: string | null;
  profileSaveSuccess: string | null;
  handleProfileFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSaveProfile: (e: React.FormEvent) => void;
}

export function AdminProfileSettings({
  profile,
  profileName,
  setProfileName,
  profileWhatsapp,
  setProfileWhatsapp,
  profileInstitution,
  setProfileInstitution,
  profileStudyProgram,
  setProfileStudyProgram,
  profileAvatarUrl,
  setProfileAvatarUrl,
  isSavingProfile,
  profileSaveError,
  profileSaveSuccess,
  handleProfileFileChange,
  handleSaveProfile,
}: AdminProfileSettingsProps) {
  const defaultAvatars = [
    "/avatars/avatar_1.png",
    "/avatars/avatar_2.png",
    "/avatars/avatar_3.png",
    "/avatars/avatar_4.png",
    "/avatars/avatar_5.png",
  ];

  const getEffectiveAvatar = () => {
    if (profileAvatarUrl) return profileAvatarUrl;
    const code = profile?.id
      ? profile.id.charCodeAt(0) + profile.id.charCodeAt(profile.id.length - 1)
      : 1;
    const index = (code % 5) + 1;
    return `/avatars/avatar_${index}.png`;
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
        <div>
          <h2 className="font-heading font-bold text-lg text-foreground flex items-center gap-2">
            <Settings className="w-5 h-5 text-brand-purple" />
            Pengaturan Akun Admin
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Perbarui data diri, nomor kontak WhatsApp, dan foto profil akun administrator Anda.
          </p>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-6">
          {profileSaveSuccess && (
            <div className="p-3 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{profileSaveSuccess}</span>
            </div>
          )}
          {profileSaveError && (
            <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{profileSaveError}</span>
            </div>
          )}

          {/* Avatar Selection */}
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-4 border-b border-border/50">
            <div className="relative group shrink-0">
              <img
                src={getEffectiveAvatar()}
                alt="Foto Profil"
                className="w-20 h-20 rounded-full object-cover border-2 border-brand-purple/20 shadow-md transition-all group-hover:brightness-90"
              />
              <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                <Upload className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfileFileChange}
                  className="hidden"
                />
              </label>
            </div>
            <div className="space-y-3 w-full">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Unggah Foto Profil Baru
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfileFileChange}
                  className="block w-full text-xs text-muted-foreground file:mr-4 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-brand-purple/10 file:text-brand-purple hover:file:bg-brand-purple/20 cursor-pointer"
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  Mendukung format PNG, JPG, JPEG, WEBP, dll. Maksimal 5MB.
                </p>
              </div>

              {/* Choose from Default Avatars */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Pilih dari Avatar Default:
                </label>
                <div className="flex gap-2">
                  {defaultAvatars.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setProfileAvatarUrl(url)}
                      className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-all hover:scale-105 hover:shadow-xs cursor-pointer ${
                        profileAvatarUrl === url
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

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-brand-purple" />
                Nama Lengkap
              </label>
              <input
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                required
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm text-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Nama Anda"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-brand-purple" />
                Nomor WhatsApp
              </label>
              <input
                value={profileWhatsapp}
                onChange={(e) => setProfileWhatsapp(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm text-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Contoh: 08123456789"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                <School className="w-3.5 h-3.5 text-brand-purple" />
                Asal Institusi / Kampus
              </label>
              <input
                value={profileInstitution}
                onChange={(e) => setProfileInstitution(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm text-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Contoh: Universitas Indonesia"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5 text-brand-purple" />
                Program Studi
              </label>
              <input
                value={profileStudyProgram}
                onChange={(e) => setProfileStudyProgram(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm text-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Contoh: Teknik Informatika"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
            <button
              type="submit"
              disabled={isSavingProfile}
              className="bg-brand-purple hover:bg-brand-purple-hover text-white text-xs font-semibold h-10 px-6 rounded-md flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
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
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
