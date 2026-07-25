"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { ArrowLeft, Loader2, Save, Plus, Trash2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";


interface Level {
  id: string;
  title: string;
  minScore: number;
  maxScore: number;
}

interface Criterion {
  id: string;
  title: string;
}

interface Rubric {
  levels: Level[];
  criteria: Criterion[];
  cells: Record<string, string>; // key: `${criterionId}-${levelId}`
}

export default function AssignmentRubricPage() {
  const router = useRouter();
  const params = useParams();
  const competencyId = params.competencyId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [competencyData, setCompetencyData] = useState<any>(null);
  
  const [rubric, setRubric] = useState<Rubric>({
    levels: [
      { id: "l1", title: "NO SHOW", minScore: 65, maxScore: 65 },
      { id: "l2", title: "POOR", minScore: 75, maxScore: 79 },
      { id: "l3", title: "FAIR", minScore: 80, maxScore: 84 },
      { id: "l4", title: "GOOD", minScore: 85, maxScore: 89 },
      { id: "l5", title: "EXCELLENT", minScore: 90, maxScore: 95 },
    ],
    criteria: [
      { id: "c1", title: "Kelengkapan dan kerapian code" }
    ],
    cells: {}
  });

  useEffect(() => {
    // In a real app we'd fetch the specific competency to display its name
    // Assuming we have a /competency/:id endpoint, but for now we might just get the list
    fetch(`http://localhost:7000/classes/competencies`, {
      headers: { Accept: "application/json" },
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) {
          throw new Error("Invalid data format received");
        }
        const comp = data.find((c: any) => c.id === competencyId);
        setCompetencyData(comp || { name: 'Kompetensi' });
        if (comp && comp.rubric) {
          setRubric(comp.rubric);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }, [competencyId]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`http://localhost:7000/classes/competency/${competencyId}/rubric`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ rubric })
      });
      if (!res.ok) throw new Error("Gagal menyimpan rubrik");
      toast.success("Rubrik berhasil disimpan!");
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan saat menyimpan rubrik.");
    } finally {
      setIsSaving(false);
    }
  };

  const addLevel = () => {
    const id = `l${Date.now()}`;
    setRubric((prev) => ({
      ...prev,
      levels: [...prev.levels, { id, title: "NEW LEVEL", minScore: 0, maxScore: 0 }]
    }));
  };

  const updateLevel = (id: string, field: keyof Level, value: any) => {
    setRubric((prev) => ({
      ...prev,
      levels: prev.levels.map((l) => (l.id === id ? { ...l, [field]: value } : l))
    }));
  };

  const deleteLevel = (id: string) => {
    if (rubric.levels.length <= 1) return toast.warning("Minimal harus ada 1 level penilaian");
    setRubric((prev) => {
      const newLevels = prev.levels.filter((l) => l.id !== id);
      const newCells = { ...prev.cells };
      // Clean up cells
      Object.keys(newCells).forEach(key => {
        if (key.endsWith(`-${id}`)) delete newCells[key];
      });
      return { ...prev, levels: newLevels, cells: newCells };
    });
  };

  const addCriterion = () => {
    const id = `c${Date.now()}`;
    setRubric((prev) => ({
      ...prev,
      criteria: [...prev.criteria, { id, title: "Kriteria Baru" }]
    }));
  };

  const updateCriterion = (id: string, title: string) => {
    setRubric((prev) => ({
      ...prev,
      criteria: prev.criteria.map((c) => (c.id === id ? { ...c, title } : c))
    }));
  };

  const deleteCriterion = (id: string) => {
    if (rubric.criteria.length <= 1) return toast.warning("Minimal harus ada 1 kriteria");
    setRubric((prev) => {
      const newCriteria = prev.criteria.filter((c) => c.id !== id);
      const newCells = { ...prev.cells };
      // Clean up cells
      Object.keys(newCells).forEach(key => {
        if (key.startsWith(`${id}-`)) delete newCells[key];
      });
      return { ...prev, criteria: newCriteria, cells: newCells };
    });
  };

  const updateCell = (criterionId: string, levelId: string, value: string) => {
    setRubric((prev) => ({
      ...prev,
      cells: {
        ...prev.cells,
        [`${criterionId}-${levelId}`]: value
      }
    }));
  };

  if (isLoading || !competencyData) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <Loader2 className="w-10 h-10 text-brand-purple animate-spin" />
        <p className="mt-4 text-sm text-muted-foreground animate-pulse font-heading">
          Memuat data...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans selection:bg-brand-purple/20 selection:text-brand-purple">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center">
            <img src="/logo-black.png" alt="Infinite Learning Logo" className="dark:hidden h-7 w-auto" />
            <img src="/logo-white.png" alt="Infinite Learning Logo" className="hidden dark:block h-7 w-auto" />
          </Link>
          <span className="text-border font-light text-sm">|</span>
          <span className="font-heading font-medium text-sm text-muted-foreground hidden sm:inline-block">
            Rubrik Penilaian
          </span>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link
            href={`/dashboard?tab=rubric`}
            className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors border border-border px-3 py-1.5 rounded-lg shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Kembali
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full mx-auto px-6 py-8 space-y-6 max-w-[1400px]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-heading font-black text-2xl md:text-3xl text-foreground">
              Pengaturan Rubrik Global
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              Kompetensi: <span className="font-semibold text-foreground">{competencyData?.name}</span>
            </p>
          </div>
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="bg-brand-purple hover:bg-brand-purple/90 min-w-[120px]"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Simpan Rubrik
          </Button>
        </div>

        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/30 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Rubrik ini akan digunakan oleh sistem AI (Ollama) dan Mentor sebagai patokan utama dalam mengevaluasi tugas mentee.</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse min-w-max">
              <thead>
                <tr>
                  <th className="bg-muted/50 border-b border-r border-border p-4 w-[250px] font-heading align-top sticky left-0 z-10 shadow-[1px_0_0_0_hsl(var(--border))]">
                    <div className="flex items-center justify-between">
                      <span>Kriteria Penilaian</span>
                      <Button variant="outline" size="sm" onClick={addCriterion} className="h-7 text-[10px] px-2 bg-background">
                        <Plus className="w-3 h-3 mr-1" /> Baris
                      </Button>
                    </div>
                  </th>
                  {rubric.levels.map((level) => (
                    <th key={level.id} className="bg-brand-purple/5 border-b border-r border-border p-4 w-[280px] align-top relative group">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <Input 
                            value={level.title} 
                            onChange={(e) => updateLevel(level.id, 'title', e.target.value)}
                            className="h-8 font-heading font-bold text-brand-purple bg-transparent border-transparent hover:border-border focus:border-brand-purple px-1"
                          />
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => deleteLevel(level.id)}
                            className="h-6 w-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input 
                            type="number"
                            value={level.minScore} 
                            onChange={(e) => updateLevel(level.id, 'minScore', parseInt(e.target.value) || 0)}
                            className="h-7 text-xs px-2 w-16"
                          />
                          <span className="text-muted-foreground text-xs">-</span>
                          <Input 
                            type="number"
                            value={level.maxScore} 
                            onChange={(e) => updateLevel(level.id, 'maxScore', parseInt(e.target.value) || 0)}
                            className="h-7 text-xs px-2 w-16"
                          />
                        </div>
                      </div>
                    </th>
                  ))}
                  <th className="bg-muted/50 border-b border-border p-4 w-[100px] align-middle text-center">
                    <Button variant="outline" size="sm" onClick={addLevel} className="h-8 text-xs bg-background">
                      <Plus className="w-3 h-3 mr-1" /> Kolom
                    </Button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rubric.criteria.map((criterion) => (
                  <tr key={criterion.id} className="group hover:bg-muted/10">
                    <td className="border-b border-r border-border p-4 bg-background align-top sticky left-0 z-10 shadow-[1px_0_0_0_hsl(var(--border))]">
                      <div className="flex flex-col gap-2 h-full">
                        <textarea
                          value={criterion.title}
                          onChange={(e) => updateCriterion(criterion.id, e.target.value)}
                          className="min-h-[100px] text-sm resize-none border-transparent hover:border-border focus:border-brand-purple bg-transparent px-2 py-1 flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="Nama Kriteria..."
                        />
                        <div className="mt-auto flex justify-end">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => deleteCriterion(criterion.id)}
                            className="h-7 text-xs text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity px-2"
                          >
                            <Trash2 className="w-3 h-3 mr-1" /> Hapus Kriteria
                          </Button>
                        </div>
                      </div>
                    </td>
                    {rubric.levels.map((level) => (
                      <td key={level.id} className="border-b border-r border-border p-3 align-top bg-background hover:bg-muted/30 transition-colors">
                        <textarea
                          value={rubric.cells[`${criterion.id}-${level.id}`] || ''}
                          onChange={(e) => updateCell(criterion.id, level.id, e.target.value)}
                          className="w-full min-h-[120px] text-xs resize-none border-transparent hover:border-border focus:bg-background focus:border-brand-purple focus:ring-1 focus:ring-brand-purple transition-all bg-transparent flex rounded-md border border-input px-3 py-2 shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder={`Deskripsi untuk level ${level.title}...`}
                        />
                      </td>
                    ))}
                    <td className="border-b border-border p-4 bg-muted/10"></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
