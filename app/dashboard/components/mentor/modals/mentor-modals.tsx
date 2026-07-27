"use client";
import { useState } from "react";
import { toast } from "sonner";
import { AlertCircle, Loader2, Save, ShieldAlert, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CompetencyItem, MentorClass } from "../types";

interface MentorModalsProps {
  // Add Competency Modal
  isAddCompetencyModalOpen: boolean;
  setIsAddCompetencyModalOpen: (v: boolean) => void;
  handleCreateCompetency: (e: React.FormEvent<HTMLFormElement>) => void;

  // Edit Competency Modal
  editingCompetency: CompetencyItem | null;
  setEditingCompetency: (v: CompetencyItem | null) => void;
  handleUpdateCompetency: (e: React.FormEvent<HTMLFormElement>) => void;

  // Add Material Modal
  isAddMaterialModalOpen: boolean;
  setIsAddMaterialModalOpen: (v: boolean) => void;
  materialType: string;
  setMaterialType: (v: string) => void;
  handleCreateMaterial: (e: React.FormEvent<HTMLFormElement>) => void;
  competencies: CompetencyItem[];

  // Add Assignment Modal
  isAddAssignmentModalOpen: boolean;
  setIsAddAssignmentModalOpen: (v: boolean) => void;
  handleCreateAssignment: (e: React.FormEvent<HTMLFormElement>) => void;

  // Edit Weight Modal
  editingWeightCompetency: CompetencyItem | null;
  setEditingWeightCompetency: (v: CompetencyItem | null) => void;
  classes: MentorClass[];
  weightUpdates: Record<string, number>;
  handleWeightChange: (assignmentId: string, val: string) => void;
  handleSaveWeights: () => void;
  isSavingWeights: boolean;

  // Suspend Student Dialog
  isSuspendDialogOpen: boolean;
  setIsSuspendDialogOpen: (v: boolean) => void;
  selectedStudentForSuspend: any | null;
  suspendActionType: "suspend" | "unsuspend";
  suspendError: string | null;
  isSuspending: boolean;
  countdown: number;
  handleSuspendStudent: () => void;

  // Rubrik Assessment Modals
  editingRubrikAssessment?: any;
  setEditingRubrikAssessment?: (v: any) => void;
  handleUpdateRubrikAssessment?: (e: React.FormEvent<HTMLFormElement>) => void;
  isAddRubrikAssessmentModalOpen?: boolean;
  setIsAddRubrikAssessmentModalOpen?: (v: boolean) => void;
  handleCreateRubrikAssessment?: (e: React.FormEvent<HTMLFormElement>) => void;
  editingWeightRubrikAssessment?: any;
  setEditingWeightRubrikAssessment?: (v: any) => void;
  handleSaveRubrikAssessmentWeights?: (id: string, payload: { competencies: any[]; subAssessments: any[] }) => Promise<void>;
  rubrikAssessments?: any[];
}

export function MentorModals({
  isAddCompetencyModalOpen,
  setIsAddCompetencyModalOpen,
  handleCreateCompetency,
  editingCompetency,
  setEditingCompetency,
  handleUpdateCompetency,
  isAddMaterialModalOpen,
  setIsAddMaterialModalOpen,
  materialType,
  setMaterialType,
  handleCreateMaterial,
  competencies,
  isAddAssignmentModalOpen,
  setIsAddAssignmentModalOpen,
  handleCreateAssignment,
  editingWeightCompetency,
  setEditingWeightCompetency,
  classes,
  weightUpdates,
  handleWeightChange,
  handleSaveWeights,
  isSavingWeights,
  isSuspendDialogOpen,
  setIsSuspendDialogOpen,
  selectedStudentForSuspend,
  suspendActionType,
  suspendError,
  isSuspending,
  countdown,
  handleSuspendStudent,
  editingRubrikAssessment,
  setEditingRubrikAssessment,
  handleUpdateRubrikAssessment,
  isAddRubrikAssessmentModalOpen,
  setIsAddRubrikAssessmentModalOpen,
  handleCreateRubrikAssessment,
  editingWeightRubrikAssessment,
  setEditingWeightRubrikAssessment,
  handleSaveRubrikAssessmentWeights,
  rubrikAssessments = [],
}: MentorModalsProps) {
  const [selectedCompetencyName, setSelectedCompetencyName] = useState("");
  const [selectedRubricIds, setSelectedRubricIds] = useState<string[]>([]);
  return (
    <>
      {/* Add Competency Modal */}
      {isAddCompetencyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs font-sans">
          <div className="bg-card p-6 rounded-xl border border-border shadow-xl w-[400px]">
            <h3 className="font-heading font-bold text-lg mb-4 text-foreground">
              Tambah Kompetensi Baru
            </h3>
            <form onSubmit={handleCreateCompetency} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">
                  Nama Kompetensi
                </label>
                <Input name="name" required placeholder="Contoh: Intro to React" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">
                  Kategori
                </label>
                <select
                  name="category"
                  required
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm text-foreground"
                >
                  <option value="Technical Skill">Technical Skill</option>
                  <option value="Soft Skills (CCA)">Soft Skills (CCA)</option>
                  <option value="Capstone Project">Capstone Project</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">
                  Fase
                </label>
                <select
                  name="phase"
                  required
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm text-foreground"
                >
                  <option value="Micro">Micro</option>
                  <option value="Massive">Massive</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddCompetencyModalOpen(false)}
                >
                  Batal
                </Button>
                <Button type="submit" className="bg-brand-purple hover:bg-brand-purple-hover text-white">
                  Simpan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Competency Modal */}
      {editingCompetency && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs font-sans">
          <div className="bg-card p-6 rounded-xl border border-border shadow-xl w-[400px]">
            <h3 className="font-heading font-bold text-lg mb-4 text-foreground">
              Edit Kompetensi
            </h3>
            <form onSubmit={handleUpdateCompetency} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">
                  Nama Kompetensi
                </label>
                <Input name="name" required defaultValue={editingCompetency.name} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">
                  Kategori
                </label>
                <select
                  name="category"
                  required
                  defaultValue={editingCompetency.category}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm text-foreground"
                >
                  <option value="Technical Skill">Technical Skill</option>
                  <option value="Soft Skills (CCA)">Soft Skills (CCA)</option>
                  <option value="Capstone Project">Capstone Project</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">
                  Fase
                </label>
                <select
                  name="phase"
                  required
                  defaultValue={editingCompetency.phase || "Micro"}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm text-foreground"
                >
                  <option value="Micro">Micro</option>
                  <option value="Massive">Massive</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingCompetency(null)}
                >
                  Batal
                </Button>
                <Button type="submit" className="bg-brand-purple hover:bg-brand-purple-hover text-white">
                  Simpan Perubahan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Material Modal */}
      {isAddMaterialModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs font-sans">
          <div className="bg-card p-6 rounded-xl border border-border shadow-xl w-[500px]">
            <h3 className="font-heading font-bold text-lg mb-4 text-foreground">
              Tambah Materi Baru
            </h3>
            <form onSubmit={handleCreateMaterial} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">
                  Judul Materi
                </label>
                <Input
                  name="title"
                  required
                  placeholder="Contoh: Fundamental State Management"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">
                  Tipe Materi
                </label>
                <select
                  name="type"
                  required
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm text-foreground"
                  value={materialType}
                  onChange={(e) => setMaterialType(e.target.value)}
                >
                  <option value="pdf">PDF</option>
                  <option value="video">Video</option>
                  <option value="link">Tautan Luar</option>
                  <option value="custom">Custom Editor (HTML Embed)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 flex items-center justify-between text-foreground">
                  Kompetensi Terkait
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddMaterialModalOpen(false);
                      setIsAddCompetencyModalOpen(true);
                    }}
                    className="text-xs text-brand-purple hover:underline"
                  >
                    + Buat Baru
                  </button>
                </label>
                <select
                  name="competency"
                  required
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm text-foreground"
                >
                  <option value="">Pilih Kompetensi...</option>
                  {competencies.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name} ({c.category})
                    </option>
                  ))}
                </select>
              </div>
              {materialType === "custom" ? (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-foreground">
                      Kode HTML Embed (Canva, YouTube, dll)
                    </label>
                    <textarea
                      name="content"
                      required
                      className="w-full p-3 rounded-md border border-input bg-background text-sm font-mono text-foreground"
                      rows={4}
                      placeholder="<iframe src='...' />"
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-foreground">
                      Keterangan / Caption (Opsional)
                    </label>
                    <textarea
                      name="caption"
                      className="w-full p-3 rounded-md border border-input bg-background text-sm text-foreground"
                      rows={2}
                      placeholder="Tuliskan instruksi atau keterangan tambahan di sini..."
                    ></textarea>
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">
                    URL / Link Materi
                  </label>
                  <Input name="url" type="url" required placeholder="https://..." />
                </div>
              )}
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddMaterialModalOpen(false)}
                >
                  Batal
                </Button>
                <Button type="submit" className="bg-brand-purple hover:bg-brand-purple-hover text-white">
                  Simpan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Assignment Modal */}
      {isAddAssignmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs font-sans">
          <div className="bg-card p-6 rounded-xl border border-border shadow-xl w-[500px]">
            <h3 className="font-heading font-bold text-lg mb-4 text-foreground">
              Tambah Tugas Baru
            </h3>
            <form onSubmit={handleCreateAssignment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">
                  Judul Tugas
                </label>
                <Input name="title" required placeholder="Contoh: Proyek Akhir React" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 flex items-center justify-between text-foreground">
                  Kompetensi Terkait
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddAssignmentModalOpen(false);
                      setIsAddCompetencyModalOpen(true);
                    }}
                    className="text-xs text-brand-purple hover:underline"
                  >
                    + Buat Baru
                  </button>
                </label>
                <select
                  name="competency"
                  required
                  value={selectedCompetencyName}
                  onChange={(e) => {
                    const name = e.target.value;
                    setSelectedCompetencyName(name);
                    const comp = competencies.find((c) => c.name === name);
                    const crit = comp?.rubric?.criteria || [];
                    setSelectedRubricIds(crit.map((c: any) => c.id || c.title));
                  }}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm text-foreground"
                >
                  <option value="">Pilih Kompetensi...</option>
                  {competencies.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name} ({c.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Rubrik Penilaian Terkait (Spesifik AI) */}
              {selectedCompetencyName && (
                <div className="p-3 bg-secondary/30 border border-border rounded-lg space-y-2">
                  <input
                    type="hidden"
                    name="selectedRubrics"
                    value={JSON.stringify(selectedRubricIds)}
                  />
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-foreground">
                      Rubrik Penilaian Terkait
                    </label>
                    <span className="text-[10px] font-semibold text-brand-purple bg-brand-purple/10 px-2 py-0.5 rounded-full">
                      {selectedRubricIds.length} Rubrik Terpilih
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Pilih rubrik kriteria spesifik di bawah ini.
                  </p>

                  {(() => {
                    const comp = competencies.find((c) => c.name === selectedCompetencyName);
                    const criteria = comp?.rubric?.criteria || [];

                    if (criteria.length === 0) {
                      return (
                        <p className="text-xs text-amber-600 dark:text-amber-400 italic">
                          Belum ada rubrik detail pada kompetensi ini. AI akan menilai berdasarkan instruksi umum tugas.
                        </p>
                      );
                    }

                    return (
                      <div className="space-y-1.5 pt-1 max-h-36 overflow-y-auto pr-1">
                        {criteria.map((crit: any) => {
                          const critKey = crit.id || crit.title;
                          const isChecked = selectedRubricIds.includes(critKey);
                          return (
                            <label
                              key={critKey}
                              className="flex items-start gap-2 text-xs text-foreground cursor-pointer hover:bg-secondary/60 p-1.5 rounded-md transition-colors border border-border/50 bg-background"
                            >
                              <input
                                type="checkbox"
                                value={critKey}
                                checked={isChecked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedRubricIds([...selectedRubricIds, critKey]);
                                  } else {
                                    setSelectedRubricIds(
                                      selectedRubricIds.filter((id) => id !== critKey)
                                    );
                                  }
                                }}
                                className="mt-0.5 rounded border-input text-brand-purple focus:ring-brand-purple"
                              />
                              <span className="leading-tight font-medium">{crit.title}</span>
                            </label>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1 flex items-center justify-between text-foreground">
                  Tipe Pengumpulan
                  <span className="text-[10px] text-muted-foreground font-normal bg-secondary px-2 py-0.5 rounded-full">
                    Format Wajib
                  </span>
                </label>
                <select
                  name="submissionType"
                  required
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm text-foreground"
                >
                  <option value="github">Link GitHub (Tugas Kode & Automasi)</option>
                  <option value="figma">Link Figma (Tugas UI/UX)</option>
                  <option value="drive">Link Google Drive / Docs / Sheets</option>
                  <option value="any">Link Bebas</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">
                  Deskripsi & Instruksi
                </label>
                <textarea
                  name="description"
                  required
                  className="w-full p-3 rounded-md border border-input bg-background text-sm text-foreground"
                  rows={4}
                  placeholder="Jelaskan detail instruksi tugas..."
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">
                  Tenggat Waktu (Due Date)
                </label>
                <Input name="dueDate" type="datetime-local" required />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddAssignmentModalOpen(false)}
                >
                  Batal
                </Button>
                <Button type="submit" className="bg-brand-purple hover:bg-brand-purple-hover text-white">
                  Simpan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Weight Modal */}
      {editingWeightCompetency &&
        (() => {
          const compAssignments = classes.flatMap((cls: any) =>
            (cls.assignments || []).filter(
              (a: any) => a.competency === editingWeightCompetency.id
            )
          );
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs font-sans">
              <div className="bg-card p-6 rounded-xl border border-border shadow-xl w-[600px] max-w-[90vw]">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="font-heading font-bold text-lg text-foreground">
                      Pengaturan Bobot: {editingWeightCompetency.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Atur bobot tugas untuk kompetensi ini.
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-full"
                    onClick={() => setEditingWeightCompetency(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="max-h-[60vh] overflow-y-auto mb-6 pr-2">
                  {compAssignments.length === 0 ? (
                    <div className="p-4 text-center text-xs text-muted-foreground bg-muted/20 rounded-lg">
                      Tidak ada tugas di bawah kompetensi ini.
                    </div>
                  ) : (
                    <table className="w-full text-sm text-left">
                      <thead className="bg-muted/50 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        <tr>
                          <th className="px-4 py-2 font-medium">Judul Tugas</th>
                          <th className="px-4 py-2 font-medium">Kelas</th>
                          <th className="px-4 py-2 font-medium text-right w-48">Bobot (%)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {compAssignments.map((assignment: any) => {
                          const currentVal =
                            weightUpdates[assignment.id] !== undefined
                              ? weightUpdates[assignment.id]
                              : assignment.weight || 0.1;
                          const cls = classes.find((c: any) => c.id === assignment.classId);
                          return (
                            <tr key={assignment.id} className="hover:bg-muted/30 transition-colors">
                              <td className="px-4 py-3">
                                <span className="font-semibold text-foreground text-xs">
                                  {assignment.title}
                                </span>
                                <div className="text-[10px] text-muted-foreground mt-0.5 max-w-[200px] truncate">
                                  {assignment.description}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-[10px] text-muted-foreground">
                                  {cls?.program?.name}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="1"
                                    className="w-16 text-right h-7 text-xs font-medium border-border focus-visible:border-brand-purple"
                                    value={currentVal}
                                    onChange={(e) =>
                                      handleWeightChange(assignment.id, e.target.value)
                                    }
                                  />
                                  <span className="text-muted-foreground text-[10px] font-medium w-8 text-left">
                                    ({(currentVal * 100).toFixed(0)}%)
                                  </span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
                <div className="flex justify-end gap-2 pt-4 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingWeightCompetency(null)}
                  >
                    Tutup
                  </Button>
                  <Button
                    onClick={() => {
                      handleSaveWeights();
                      setEditingWeightCompetency(null);
                    }}
                    disabled={
                      isSavingWeights || Object.keys(weightUpdates).length === 0
                    }
                    className="bg-brand-purple hover:bg-brand-purple-hover text-white cursor-pointer"
                  >
                    {isSavingWeights ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Simpan Perubahan Bobot
                  </Button>
                </div>
              </div>
            </div>
          );
        })()}

      {/* Suspend Student Dialog */}
      <Dialog open={isSuspendDialogOpen} onOpenChange={setIsSuspendDialogOpen}>
        <DialogContent className="sm:max-w-md bg-card border border-border">
          <DialogHeader>
            <DialogTitle
              className={`flex items-center gap-2 font-heading font-bold text-base ${suspendActionType === "suspend" ? "text-amber-600" : "text-emerald-600"
                }`}
            >
              <ShieldAlert className="w-5 h-5" />
              {suspendActionType === "suspend"
                ? "Tangguhkan Akses Murid"
                : "Aktifkan Kembali Akses Murid"}
            </DialogTitle>
            <DialogDescription className="text-xs pt-1.5 leading-relaxed text-muted-foreground font-sans">
              {suspendActionType === "suspend"
                ? "Apakah Anda yakin ingin menangguhkan sementara (Suspend) akses masuk murid ini ke LMS?"
                : "Apakah Anda yakin ingin memulihkan/mengaktifkan kembali akses masuk murid ini ke LMS?"}
            </DialogDescription>
          </DialogHeader>

          {selectedStudentForSuspend && (
            <div className="bg-secondary/40 border border-border rounded-lg p-3.5 space-y-1.5 text-xs font-sans">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nama Murid:</span>
                <span className="font-semibold text-foreground">
                  {selectedStudentForSuspend.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-mono text-muted-foreground">
                  {selectedStudentForSuspend.email}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Program Studi:</span>
                <span className="font-medium text-brand-purple">
                  {selectedStudentForSuspend.selectedProgram || "Web Development"}
                </span>
              </div>
            </div>
          )}

          {suspendError && (
            <Alert variant="destructive" className="py-2.5 px-3">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription className="text-2xs font-medium">
                {suspendError}
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter className="gap-2 sm:gap-0 font-sans border-t border-border/40 pt-3">
            <DialogClose
              render={
                <Button variant="outline" size="sm" className="text-xs font-semibold">
                  Batal
                </Button>
              }
            />
            <Button
              variant={suspendActionType === "suspend" ? "destructive" : "default"}
              size="sm"
              disabled={isSuspending || countdown > 0}
              onClick={handleSuspendStudent}
              className={`text-xs font-semibold gap-1.5 cursor-pointer ${suspendActionType === "unsuspend"
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-red-600 hover:bg-red-700 text-white"
                }`}
            >
              {isSuspending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Memproses...
                </>
              ) : (
                `${suspendActionType === "suspend" ? "Ya, Suspend Akses" : "Ya, Aktifkan Akses"}${countdown > 0 ? ` (${countdown}s)` : ""
                }`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Rubrik Assessment Modal */}
      {isAddRubrikAssessmentModalOpen && handleCreateRubrikAssessment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs font-sans">
          <div className="bg-card p-6 rounded-xl border border-border shadow-xl w-[420px]">
            <h3 className="font-heading font-bold text-lg mb-4 text-foreground">
              Tambah Rubrik Assessment Baru
            </h3>
            <form onSubmit={handleCreateRubrikAssessment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">
                  Nama Rubrik Assessment
                </label>
                <Input name="name" required placeholder="Contoh: Career Coaching / Capstone Project" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">
                  Fase Assessment
                </label>
                <select
                  name="phase"
                  required
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm text-foreground"
                >
                  <option value="Micro">Phase Micro</option>
                  <option value="Massive">Phase Massive</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddRubrikAssessmentModalOpen?.(false)}
                >
                  Batal
                </Button>
                <Button type="submit" size="sm" className="bg-brand-purple hover:bg-brand-purple/90 text-white">
                  Simpan Rubrik
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Rubrik Assessment Modal */}
      {editingRubrikAssessment && handleUpdateRubrikAssessment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs font-sans">
          <div className="bg-card p-6 rounded-xl border border-border shadow-xl w-[420px]">
            <h3 className="font-heading font-bold text-lg mb-4 text-foreground">
              Edit Rubrik Assessment
            </h3>
            <form onSubmit={handleUpdateRubrikAssessment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">
                  Nama Rubrik Assessment
                </label>
                <Input
                  name="name"
                  defaultValue={editingRubrikAssessment.name}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">
                  Fase Assessment
                </label>
                <select
                  name="phase"
                  defaultValue={editingRubrikAssessment.phase || "Micro"}
                  required
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm text-foreground"
                >
                  <option value="Micro">Phase Micro</option>
                  <option value="Massive">Phase Massive</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingRubrikAssessment?.(null)}
                >
                  Batal
                </Button>
                <Button type="submit" size="sm" className="bg-brand-purple hover:bg-brand-purple/90 text-white">
                  Simpan Perubahan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Weight for Rubrik Assessment Modal */}
      {editingWeightRubrikAssessment && (
        <RubrikAssessmentWeightModal
          editingWeightRubrikAssessment={editingWeightRubrikAssessment}
          setEditingWeightRubrikAssessment={setEditingWeightRubrikAssessment}
          competencies={competencies}
          rubrikAssessments={rubrikAssessments}
          handleSaveRubrikAssessmentWeights={handleSaveRubrikAssessmentWeights}
        />
      )}
    </>
  );
}

function RubrikAssessmentWeightModal({
  editingWeightRubrikAssessment,
  setEditingWeightRubrikAssessment,
  competencies,
  rubrikAssessments,
  handleSaveRubrikAssessmentWeights,
}: {
  editingWeightRubrikAssessment: any;
  setEditingWeightRubrikAssessment?: (v: any) => void;
  competencies: CompetencyItem[];
  rubrikAssessments: any[];
  handleSaveRubrikAssessmentWeights?: (id: string, payload: { competencies: any[]; subAssessments: any[] }) => Promise<void>;
}) {
  const [compWeights, setCompWeights] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    if (editingWeightRubrikAssessment?.competencies) {
      for (const item of editingWeightRubrikAssessment.competencies) {
        map[item.competencyId] = item.weight;
      }
    }
    return map;
  });

  const [subWeights, setSubWeights] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    if (editingWeightRubrikAssessment?.subAssessments) {
      for (const item of editingWeightRubrikAssessment.subAssessments) {
        map[item.assessmentId] = item.weight;
      }
    }
    return map;
  });

  const [isSaving, setIsSaving] = useState(false);

  const availableOtherRAs = rubrikAssessments.filter(
    (r) => r.id !== editingWeightRubrikAssessment.id
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const competenciesPayload = Object.entries(compWeights)
        .filter(([_, w]) => w > 0)
        .map(([competencyId, weight]) => ({ competencyId, weight }));

      const subAssessmentsPayload = Object.entries(subWeights)
        .filter(([_, w]) => w > 0)
        .map(([assessmentId, weight]) => ({ assessmentId, weight }));

      if (handleSaveRubrikAssessmentWeights) {
        await handleSaveRubrikAssessmentWeights(editingWeightRubrikAssessment.id, {
          competencies: competenciesPayload,
          subAssessments: subAssessmentsPayload,
        });
      } else {
        const res = await fetch(
          `http://localhost:7000/classes/rubrik-assessments/${editingWeightRubrikAssessment.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              competencies: competenciesPayload,
              subAssessments: subAssessmentsPayload,
            }),
            credentials: "include",
          }
        );
        if (res.ok) {
          toast.success("Bobot Rubrik Assessment berhasil disimpan!");
          setEditingWeightRubrikAssessment?.(null);
          window.location.reload();
        } else {
          toast.error("Gagal menyimpan bobot.");
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const totalCompWeight = Object.values(compWeights).reduce((a, b) => a + (b || 0), 0);
  const totalSubWeight = Object.values(subWeights).reduce((a, b) => a + (b || 0), 0);
  const totalWeight = totalCompWeight + totalSubWeight;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs font-sans">
      <div className="bg-card p-6 rounded-xl border border-border shadow-xl w-[640px] max-w-[95vw] max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center pb-3 border-b border-border">
          <div>
            <h3 className="font-heading font-bold text-lg text-foreground">
              Atur Komposisi & Bobot: {editingWeightRubrikAssessment.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Pilih kompetensi atau sub-assessment yang menyusun nilai rubrik ini (misal: 0.5 = 50%).
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 rounded-full cursor-pointer"
            onClick={() => setEditingWeightRubrikAssessment?.(null)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-6 pr-2">
          {/* Section 1: Kompetensi */}
          <div>
            <h4 className="font-heading font-bold text-sm text-brand-purple mb-3 flex items-center justify-between">
              <span>1. Kompetensi Terhubung</span>
              <span className="text-xs text-muted-foreground font-normal">
                Subtotal Bobot: {totalCompWeight.toFixed(2)}
              </span>
            </h4>
            {competencies.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">Belum ada kompetensi.</p>
            ) : (
              <div className="space-y-2">
                {competencies.map((comp) => {
                  const currentWeight = compWeights[comp.id] ?? 0;
                  return (
                    <div
                      key={comp.id}
                      className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-secondary/20 text-xs"
                    >
                      <div>
                        <p className="font-semibold text-foreground">{comp.name}</p>
                        <p className="text-[10px] text-muted-foreground">{comp.category}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-muted-foreground">Bobot:</span>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          max="1"
                          placeholder="0.0"
                          value={currentWeight === 0 ? "" : currentWeight}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setCompWeights((prev) => ({ ...prev, [comp.id]: val }));
                          }}
                          className="w-20 h-8 text-xs font-bold text-center"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 2: Sub-Assessments */}
          {availableOtherRAs.length > 0 && (
            <div>
              <h4 className="font-heading font-bold text-sm text-brand-purple mb-3 flex items-center justify-between">
                <span>2. Sub-Assessment Terhubung (Opsional)</span>
                <span className="text-xs text-muted-foreground font-normal">
                  Subtotal Bobot: {totalSubWeight.toFixed(2)}
                </span>
              </h4>
              <div className="space-y-2">
                {availableOtherRAs.map((ra) => {
                  const currentWeight = subWeights[ra.id] ?? 0;
                  return (
                    <div
                      key={ra.id}
                      className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-secondary/20 text-xs"
                    >
                      <div>
                        <p className="font-semibold text-foreground">{ra.name}</p>
                        <p className="text-[10px] text-muted-foreground">Fase: {ra.phase || "Micro"}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-muted-foreground">Bobot:</span>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          max="1"
                          placeholder="0.0"
                          value={currentWeight === 0 ? "" : currentWeight}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setSubWeights((prev) => ({ ...prev, [ra.id]: val }));
                          }}
                          className="w-20 h-8 text-xs font-bold text-center"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Total Summary */}
          <div className="p-3 rounded-lg bg-brand-purple/10 border border-brand-purple/20 flex items-center justify-between text-xs">
            <span className="font-bold text-brand-purple">Total Bobot Keseluruhan:</span>
            <span className="font-extrabold text-brand-purple text-sm">
              {totalWeight.toFixed(2)} {totalWeight === 1 ? "(100% Ideal)" : ""}
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setEditingWeightRubrikAssessment?.(null)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSaving}
              className="bg-brand-purple hover:bg-brand-purple/90 text-white font-semibold cursor-pointer"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
              Simpan Bobot Rubrik
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
