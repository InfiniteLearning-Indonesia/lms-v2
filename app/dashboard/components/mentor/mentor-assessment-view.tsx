"use client";

import Link from "next/link";
import { FileSpreadsheet, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompetencyItem } from "./types";

interface MentorAssessmentViewProps {
  competencies: CompetencyItem[];
  allStudents: any[];
  onOpenAddCompetency: () => void;
  setEditingCompetency: (comp: any) => void;
  handleDeleteCompetency: (id: string) => void;
  setEditingWeightCompetency: (comp: any) => void;
  calculateCompetencyScore: (studentId: string, compId: string) => number;
  activeSubTab?: "rubric" | "assessment";
}

export function MentorAssessmentView({
  competencies,
  allStudents,
  onOpenAddCompetency,
  setEditingCompetency,
  handleDeleteCompetency,
  setEditingWeightCompetency,
  calculateCompetencyScore,
  activeSubTab = "rubric",
}: MentorAssessmentViewProps) {
  if (activeSubTab === "rubric") {
    return (
      <Card className="border-border bg-card shadow-sm font-sans">
        <CardHeader className="border-b border-border pb-4 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-heading font-bold text-foreground">
              Manajemen Rubrik Kompetensi
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-1">
              Atur patokan nilai dan kriteria evaluasi (rubrik) untuk masing-masing kompetensi secara global.
            </CardDescription>
          </div>
          <Button
            onClick={onOpenAddCompetency}
            size="sm"
            variant="outline"
            className="h-8 text-xs flex items-center gap-1.5 border-brand-purple/20 hover:bg-brand-purple/5 text-brand-purple cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Tambah Kompetensi
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-secondary/30 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  <th className="py-3 px-4">Nama Kompetensi</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-xs">
                {competencies.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-muted-foreground">
                      Belum ada kompetensi.
                    </td>
                  </tr>
                ) : (
                  competencies.map((comp: any) => (
                    <tr key={comp.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-foreground">
                        {comp.name}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-brand-purple/10 text-brand-purple border border-brand-purple/20">
                          {comp.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/dashboard/competency/${comp.id}/rubric`}>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-brand-purple hover:bg-brand-purple/90 text-white font-medium text-[11px] transition-colors shadow-sm cursor-pointer">
                              <FileSpreadsheet className="w-3.5 h-3.5" /> Atur Rubrik
                            </span>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 w-7 p-0 cursor-pointer"
                            onClick={() => setEditingCompetency(comp)}
                          >
                            <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 w-7 p-0 border-red-500/20 hover:bg-red-50 cursor-pointer"
                            onClick={() => handleDeleteCompetency(comp.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card shadow-sm font-sans">
      <CardHeader className="border-b border-border pb-4 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg font-heading font-bold text-foreground">
            Assessment (Gradebook)
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-1">
            Pantau nilai akhir mentee berdasarkan pencapaian kompetensi. Klik nama kompetensi untuk mengatur bobot tugas.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <Tabs defaultValue="Micro" className="w-full">
          <TabsList className="grid w-full max-w-sm grid-cols-2 mb-6">
            <TabsTrigger value="Micro">Phase Micro</TabsTrigger>
            <TabsTrigger value="Massive">Phase Massive</TabsTrigger>
          </TabsList>

          {["Micro", "Massive"].map((phase) => {
            const microComps = competencies.filter(
              (c) => c.phase === "Micro" || (!c.phase && "Micro" === "Micro")
            );
            const massiveComps = competencies.filter((c) => c.phase === "Massive");
            const displayComps = phase === "Micro" ? microComps : massiveComps;

            return (
              <TabsContent key={phase} value={phase} className="space-y-6">
                <div className="overflow-x-auto border border-border rounded-xl">
                  <table className="w-full text-sm text-left whitespace-nowrap">
                    <thead className="bg-muted/50 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3 sticky left-0 z-10 bg-muted/95 backdrop-blur shadow-[1px_0_0_0_#e5e7eb] dark:shadow-[1px_0_0_0_#262626]">
                          Mentee
                        </th>
                        {phase === "Massive" && (
                          <th className="px-4 py-3 bg-brand-purple/10 text-brand-purple border-x border-border text-center">
                            Akumulasi Micro
                          </th>
                        )}
                        {displayComps.map((comp) => (
                          <th
                            key={comp.id}
                            className="px-4 py-3 cursor-pointer hover:text-brand-purple hover:underline transition-colors text-center border-l border-border"
                            onClick={() => setEditingWeightCompetency(comp)}
                            title="Klik untuk mengatur bobot tugas di kompetensi ini"
                          >
                            {comp.name}
                            <Pencil className="w-3 h-3 inline-block ml-1 opacity-50" />
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {allStudents.length === 0 ? (
                        <tr>
                          <td
                            colSpan={displayComps.length + (phase === "Massive" ? 2 : 1)}
                            className="px-4 py-8 text-center text-muted-foreground"
                          >
                            Belum ada mentee yang terdaftar.
                          </td>
                        </tr>
                      ) : (
                        allStudents.map((student) => {
                          const microTotal = microComps.reduce(
                            (acc, comp) => acc + calculateCompetencyScore(student.id, comp.id),
                            0
                          );
                          return (
                            <tr key={student.id} className="hover:bg-muted/30 transition-colors">
                              <td className="px-4 py-3 sticky left-0 z-10 bg-card shadow-[1px_0_0_0_#e5e7eb] dark:shadow-[1px_0_0_0_#262626]">
                                <div className="font-semibold text-foreground text-xs">
                                  {student.name}
                                </div>
                                <div className="text-[10px] text-muted-foreground">
                                  {student.email}
                                </div>
                              </td>

                              {phase === "Massive" && (
                                <td className="px-4 py-3 text-center border-x border-border font-bold text-brand-purple bg-brand-purple/5">
                                  {microTotal.toFixed(1)}
                                </td>
                              )}

                              {displayComps.map((comp) => {
                                const score = calculateCompetencyScore(student.id, comp.id);
                                return (
                                  <td
                                    key={comp.id}
                                    className="px-4 py-3 text-center border-l border-border text-xs font-medium"
                                  >
                                    {score > 0 ? score.toFixed(1) : "-"}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      </CardContent>
    </Card>
  );
}
