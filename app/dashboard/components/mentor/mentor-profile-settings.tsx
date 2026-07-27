"use client";

import { useState, useEffect } from "react";
import {
  Code2,
  Cpu,
  Globe,
  GraduationCap,
  Key,
  Layout,
  Loader2,
  Phone,
  RefreshCw,
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

  // AI & API Credentials Configuration State
  const [githubToken, setGithubToken] = useState("");
  const [figmaToken, setFigmaToken] = useState("");
  const [googleAiStudioKey, setGoogleAiStudioKey] = useState("");
  const [groqApiKey, setGroqApiKey] = useState("");
  const [aiProvider, setAiProvider] = useState("ollama");
  const [ollamaHost, setOllamaHost] = useState("http://localhost:11434");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedOllamaModel, setSelectedOllamaModel] = useState("gemma3:1b");
  const [selectedGroqModel, setSelectedGroqModel] = useState("llama-3.3-70b-versatile");
  const [selectedGeminiModel, setSelectedGeminiModel] = useState("gemini-2.5-flash");
  
  const [availableModels, setAvailableModels] = useState<Array<{ id: string; name: string }>>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [isSavingAiConfig, setIsSavingAiConfig] = useState(false);
  const [aiConfigSuccess, setAiConfigSuccess] = useState<string | null>(null);
  const [aiConfigError, setAiConfigError] = useState<string | null>(null);

  // Fetch AI Config on Mount
  useEffect(() => {
    fetch("http://localhost:7000/classes/mentor/ai-config", {
      credentials: "include",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setGithubToken(data.githubToken || "");
          setFigmaToken(data.figmaToken || "");
          setGoogleAiStudioKey(data.googleAiStudioKey || "");
          setGroqApiKey(data.groqApiKey || "");
          const provider = data.aiProvider || "ollama";
          setAiProvider(provider);
          setOllamaHost(data.ollamaHost || "http://localhost:11434");
          
          const ollamaMod = data.selectedOllamaModel || "gemma3:1b";
          const groqMod = data.selectedGroqModel || "llama-3.3-70b-versatile";
          const geminiMod = data.selectedGeminiModel || "gemini-2.5-flash";
          
          setSelectedOllamaModel(ollamaMod);
          setSelectedGroqModel(groqMod);
          setSelectedGeminiModel(geminiMod);

          const activeMod = provider === "groq" ? groqMod : provider === "gemini" ? geminiMod : ollamaMod;
          setSelectedModel(data.selectedModel || activeMod);

          // Automatically fetch available models
          autoFetchModels(
            provider,
            data.ollamaHost || "http://localhost:11434",
            data.groqApiKey || "",
            data.googleAiStudioKey || "",
            data.selectedModel || activeMod
          );
        }
      })
      .catch(() => {});
  }, []);

  const handleProviderChange = (newProvider: string) => {
    setAiProvider(newProvider);
    if (newProvider === "groq") {
      setSelectedModel(selectedGroqModel);
    } else if (newProvider === "gemini") {
      setSelectedModel(selectedGeminiModel);
    } else {
      setSelectedModel(selectedOllamaModel);
    }
  };

  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId);
    if (aiProvider === "groq") setSelectedGroqModel(modelId);
    else if (aiProvider === "gemini") setSelectedGeminiModel(modelId);
    else setSelectedOllamaModel(modelId);
  };

  const autoFetchModels = async (
    provider: string,
    host: string,
    groqKey: string,
    geminiKey: string,
    savedModel: string
  ) => {
    setIsLoadingModels(true);
    try {
      let hostOrApiKey = "";
      if (provider === "ollama") hostOrApiKey = host;
      else if (provider === "groq") hostOrApiKey = groqKey;
      else if (provider === "gemini") hostOrApiKey = geminiKey;

      const res = await fetch("http://localhost:7000/classes/mentor/ai-models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ provider, hostOrApiKey }),
      });

      if (res.ok) {
        const models = await res.json();
        if (Array.isArray(models) && models.length > 0) {
          setAvailableModels(models);
          if (!savedModel) {
            handleModelChange(models[0].id);
          }
        }
      }
    } catch (e) {
    } finally {
      setIsLoadingModels(false);
    }
  };

  // Fetch Dynamic Models from Backend Proxy
  const handleFetchModels = async () => {
    if (aiProvider === "groq" && !groqApiKey) {
      setAiConfigError("Masukkan Groq API Key terlebih dahulu.");
      setAvailableModels([]);
      return;
    }
    if (aiProvider === "gemini" && !googleAiStudioKey) {
      setAiConfigError("Masukkan Google AI Studio API Key terlebih dahulu.");
      setAvailableModels([]);
      return;
    }

    setIsLoadingModels(true);
    setAiConfigError(null);
    try {
      let hostOrApiKey = "";
      if (aiProvider === "ollama") hostOrApiKey = ollamaHost;
      else if (aiProvider === "groq") hostOrApiKey = groqApiKey;
      else if (aiProvider === "gemini") hostOrApiKey = googleAiStudioKey;

      const res = await fetch("http://localhost:7000/classes/mentor/ai-models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ provider: aiProvider, hostOrApiKey }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || "Gagal mengambil daftar model dari provider.");
      }
      const models = await res.json();
      setAvailableModels(models);
      if (models.length > 0 && (!selectedModel || !models.some((m: any) => m.id === selectedModel))) {
        handleModelChange(models[0].id);
      }
      setAiConfigSuccess("Daftar model terdeteksi & berhasil diperbarui!");
      setTimeout(() => setAiConfigSuccess(null), 3000);
    } catch (err: any) {
      setAvailableModels([]);
      setAiConfigError(err.message || "Gagal memuat model.");
    } finally {
      setIsLoadingModels(false);
    }
  };

  // Save AI & API Configuration
  const handleSaveAiConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingAiConfig(true);
    setAiConfigError(null);
    setAiConfigSuccess(null);
    try {
      const res = await fetch("http://localhost:7000/classes/mentor/ai-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          githubToken,
          figmaToken,
          googleAiStudioKey,
          groqApiKey,
          aiProvider,
          ollamaHost,
          selectedModel,
          selectedOllamaModel,
          selectedGroqModel,
          selectedGeminiModel,
        }),
      });

      if (!res.ok) throw new Error("Gagal menyimpan pengaturan AI.");
      setAiConfigSuccess("Pengaturan AI & API Tokens berhasil disimpan!");
      setTimeout(() => setAiConfigSuccess(null), 3000);
    } catch (err: any) {
      setAiConfigError(err.message || "Gagal menyimpan.");
    } finally {
      setIsSavingAiConfig(false);
    }
  };

  return (
    <div className="space-y-6 w-full font-sans">
      {/* Card 1: Edit Profil Saya */}
      <Card className="border-border bg-card shadow-sm w-full">
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
                    <span>Simpan Profil</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Card 2: Integrasi API Tokens & Pengaturan AI Evaluator */}
      <Card className="border-border bg-card shadow-sm w-full">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="font-heading font-bold text-lg flex items-center gap-2 text-foreground">
            <Cpu className="w-5 h-5 text-brand-purple" />
            Integrasi API Tokens & Configuration AI Evaluator
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Konfigurasi kunci API (GitHub, Figma, Cloud AI) dan provider LLM yang digunakan untuk fitur Evaluasi Massal (AI).
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSaveAiConfig} className="space-y-6">
            {aiConfigSuccess && (
              <Alert className="border-green-500/20 bg-green-500/5 text-green-600 dark:text-green-400">
                <AlertDescription className="text-xs font-medium">{aiConfigSuccess}</AlertDescription>
              </Alert>
            )}
            {aiConfigError && (
              <Alert className="border-red-500/20 bg-red-500/5 text-red-600 dark:text-red-400">
                <AlertDescription className="text-xs font-medium">{aiConfigError}</AlertDescription>
              </Alert>
            )}

            {/* Provider Selection */}
            <div className="space-y-3 bg-secondary/30 p-4 rounded-xl border border-border">
              <label className="block text-xs font-bold text-foreground">
                Pilih Active AI Provider:
              </label>
              <div className="grid sm:grid-cols-3 gap-3">
                <label
                  className={`p-3 rounded-lg border flex flex-col gap-1 cursor-pointer transition-all ${
                    aiProvider === "ollama"
                      ? "border-brand-purple bg-brand-purple/5 font-semibold text-brand-purple"
                      : "border-border bg-card hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="aiProvider"
                      value="ollama"
                      checked={aiProvider === "ollama"}
                      onChange={(e) => handleProviderChange(e.target.value)}
                    />
                    <span className="text-xs">Ollama (Local / Cloud Host)</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-normal">
                    Menghubungkan ke server Ollama lokal atau instansi Cloud pribadi.
                  </span>
                </label>

                <label
                  className={`p-3 rounded-lg border flex flex-col gap-1 cursor-pointer transition-all ${
                    aiProvider === "groq"
                      ? "border-brand-purple bg-brand-purple/5 font-semibold text-brand-purple"
                      : "border-border bg-card hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="aiProvider"
                      value="groq"
                      checked={aiProvider === "groq"}
                      onChange={(e) => handleProviderChange(e.target.value)}
                    />
                    <span className="text-xs">Groq Cloud AI</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-normal">
                    Kecepatan tinggi via Groq API (LLaMA-3.3 70B, Mixtral, dll).
                  </span>
                </label>

                <label
                  className={`p-3 rounded-lg border flex flex-col gap-1 cursor-pointer transition-all ${
                    aiProvider === "gemini"
                      ? "border-brand-purple bg-brand-purple/5 font-semibold text-brand-purple"
                      : "border-border bg-card hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="aiProvider"
                      value="gemini"
                      checked={aiProvider === "gemini"}
                      onChange={(e) => handleProviderChange(e.target.value)}
                    />
                    <span className="text-xs">Google AI Studio (Gemini)</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-normal">
                    Platform AI resmi Google (Gemini 1.5 Flash, 2.0 Flash, dll).
                  </span>
                </label>
              </div>
            </div>

            {/* Provider Configuration Details */}
            <div className="grid sm:grid-cols-2 gap-4">
              {aiProvider === "ollama" && (
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-brand-purple" />
                    Ollama Host URL (Lokal / Cloud Endpoint)
                  </label>
                  <Input
                    value={ollamaHost}
                    onChange={(e) => setOllamaHost(e.target.value)}
                    placeholder="http://localhost:11434 atau https://ollama.my-domain.com"
                  />
                </div>
              )}

              {aiProvider === "groq" && (
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <Key className="w-3.5 h-3.5 text-brand-purple" />
                    Groq API Key
                  </label>
                  <Input
                    type="password"
                    value={groqApiKey}
                    onChange={(e) => setGroqApiKey(e.target.value)}
                    placeholder="gsk_..."
                  />
                </div>
              )}

              {aiProvider === "gemini" && (
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <Key className="w-3.5 h-3.5 text-brand-purple" />
                    Google AI Studio API Key (Gemini)
                  </label>
                  <Input
                    type="password"
                    value={googleAiStudioKey}
                    onChange={(e) => setGoogleAiStudioKey(e.target.value)}
                    placeholder="AIzaSy..."
                  />
                </div>
              )}

              {/* Dynamic Model Selector */}
              <div className="space-y-1.5 sm:col-span-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <Cpu className="w-3.5 h-3.5 text-brand-purple" />
                    Pilihan Model Tersimpan ({aiProvider.toUpperCase()}):
                  </label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleFetchModels}
                    disabled={isLoadingModels}
                    className="text-xs text-brand-purple hover:underline h-7 px-2 cursor-pointer"
                  >
                    {isLoadingModels ? (
                      <Loader2 className="w-3 h-3 animate-spin mr-1" />
                    ) : (
                      <RefreshCw className="w-3 h-3 mr-1" />
                    )}
                    Muat Model Tersedia
                  </Button>
                </div>

                {(() => {
                  let options: Array<{ id: string; name: string }> = [];

                  if (availableModels.length > 0) {
                    options = availableModels;
                  } else {
                    const savedCurr = selectedModel || (aiProvider === "groq" ? selectedGroqModel : aiProvider === "gemini" ? selectedGeminiModel : selectedOllamaModel);
                    if (savedCurr) {
                      options = [{ id: savedCurr, name: `${savedCurr} (Model Tersimpan)` }];
                    } else if (aiProvider === "groq" && !groqApiKey) {
                      options = [{ id: "", name: "⚠️ Masukkan Groq API Key terlebih dahulu" }];
                    } else if (aiProvider === "gemini" && !googleAiStudioKey) {
                      options = [{ id: "", name: "⚠️ Masukkan Google AI Studio API Key terlebih dahulu" }];
                    } else {
                      options = [{ id: "", name: "⚠️ Klik 'Muat Model Tersedia' untuk mengambil daftar model" }];
                    }
                  }

                  return (
                    <select
                      value={selectedModel || (options.length > 0 ? options[0].id : "")}
                      onChange={(e) => handleModelChange(e.target.value)}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-xs text-foreground font-medium cursor-pointer"
                    >
                      {options.map((m) => (
                        <option key={m.id || m.name} value={m.id} disabled={!m.id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  );
                })()}
              </div>
            </div>

            {/* External Platform API Tokens */}
            <div className="border-t border-border pt-4 space-y-4">
              <h4 className="font-heading font-bold text-sm text-foreground">
                External Platform API Tokens (Inspeksi Tautan Tugas)
              </h4>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <Code2 className="w-3.5 h-3.5 text-foreground" />
                    GitHub Personal Access Token (Opsional)
                  </label>
                  <Input
                    type="password"
                    value={githubToken}
                    onChange={(e) => setGithubToken(e.target.value)}
                    placeholder="ghp_..."
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Digunakan untuk membaca struktur repositori dan file kode tugas mentee.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <Layout className="w-3.5 h-3.5 text-purple-500" />
                    Figma Personal Access Token (Opsional)
                  </label>
                  <Input
                    type="password"
                    value={figmaToken}
                    onChange={(e) => setFigmaToken(e.target.value)}
                    placeholder="figd_..."
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Digunakan untuk membaca struktur halaman, frame, dan komponen desain UI/UX.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
              <Button
                type="submit"
                disabled={isSavingAiConfig}
                className="bg-brand-purple hover:bg-brand-purple-hover text-white text-xs font-semibold h-10 px-6 flex items-center gap-1.5 cursor-pointer"
              >
                {isSavingAiConfig ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menyimpan Konfigurasi AI...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Simpan Pengaturan AI & Tokens</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
