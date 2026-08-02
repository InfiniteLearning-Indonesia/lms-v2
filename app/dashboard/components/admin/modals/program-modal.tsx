"use client";

import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Layers, Plus, UserPlus, Users, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProgramDetail {
  id: string;
  name: string;
  description?: string;
  mentorsCount: number;
  studentsCount: number;
  mentors: { id: string; name: string; email: string; specialization?: string }[];
  students: { id: string; name: string; email: string; mentorName?: string; status: string }[];
  isReadOnly?: boolean;
}

interface ProgramModalProps {
  isOpen: boolean;
  onClose: () => void;
  program: ProgramDetail | null;
  onOpenAssignMentor: () => void;
  onOpenAddStudent: () => void;
}

export function ProgramModal({
  isOpen,
  onClose,
  program,
  onOpenAssignMentor,
  onOpenAddStudent,
}: ProgramModalProps) {
  if (!program) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-xs"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative z-10 bg-card border border-border rounded-xl shadow-xl max-w-4xl w-full p-6 space-y-6 max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div>
                <h3 className="font-heading font-bold text-lg text-foreground flex items-center gap-2">
                  <Layers className="w-5 h-5 text-brand-purple" />
                  Manajemen Program: {program.name} {program.isReadOnly && <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20">(Read-Only)</span>}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {program.isReadOnly ? "Melihat arsip data tim mentor dan siswa binaan batch lama." : "Atur penugasan tim mentor dan pendaftaran siswa binaan."}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <Tabs defaultValue="mentors" className="w-full space-y-4">
              <TabsList className="grid grid-cols-2 w-full bg-secondary/35 border border-border min-h-14 p-1.5 rounded-lg">
                <TabsTrigger
                  value="mentors"
                  className="text-sm font-semibold flex items-center justify-center gap-3 py-2 rounded-md cursor-pointer"
                >
                  <GraduationCap className="w-5 h-5 text-brand-purple shrink-0" />
                  <span>Tim Mentor ({program.mentorsCount})</span>
                </TabsTrigger>
                <TabsTrigger
                  value="students"
                  className="text-sm font-semibold flex items-center justify-center gap-3 py-2 rounded-md cursor-pointer"
                >
                  <Users className="w-5 h-5 text-brand-purple shrink-0" />
                  <span>Murid Terdaftar ({program.studentsCount})</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="mentors" className="space-y-4 outline-hidden">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Daftar mentor akademik yang ditugaskan ke program ini.
                  </p>
                  {!program.isReadOnly && (
                    <button
                      onClick={onOpenAssignMentor}
                      className="px-3 py-1.5 rounded-lg bg-brand-purple text-white hover:bg-brand-purple-hover text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Assign Mentor Baru
                    </button>
                  )}
                </div>

                <div className="border border-border rounded-xl overflow-hidden bg-background max-h-[45vh] overflow-y-auto pr-1">
                  <table className="w-full text-xs text-left border-collapse font-sans">
                    <thead>
                      <tr className="bg-secondary/40 border-b border-border text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                        <th className="p-3">Nama Mentor</th>
                        <th className="p-3">Email</th>
                        <th className="p-3">Spesialisasi / Peran</th>
                      </tr>
                    </thead>
                    <tbody>
                      {program.mentors.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="text-center py-8 text-muted-foreground">
                            Belum ada mentor yang ditugaskan ke program ini.
                          </td>
                        </tr>
                      ) : (
                        program.mentors.map((m) => (
                          <tr
                            key={m.id}
                            className="border-b border-border hover:bg-secondary/15 transition-all text-foreground"
                          >
                            <td className="p-3 font-semibold">{m.name}</td>
                            <td className="p-3 text-muted-foreground">{m.email}</td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded text-3xs font-medium bg-brand-purple/10 text-brand-purple border border-brand-purple/20">
                                {m.specialization || "Primary Mentor"}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              <TabsContent value="students" className="space-y-4 outline-hidden">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Daftar seluruh siswa aktif yang terdaftar dalam program ini.
                  </p>
                  {!program.isReadOnly && (
                    <button
                      onClick={onOpenAddStudent}
                      className="px-3 py-1.5 rounded-lg bg-brand-purple text-white hover:bg-brand-purple-hover text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5" /> Pendaftaran Murid Baru
                    </button>
                  )}
                </div>

                <div className="border border-border rounded-xl overflow-hidden bg-background max-h-[45vh] overflow-y-auto pr-1">
                  <table className="w-full text-xs text-left border-collapse font-sans">
                    <thead>
                      <tr className="bg-secondary/40 border-b border-border text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                        <th className="p-3">Nama Student</th>
                        <th className="p-3">Mentor Akademik</th>
                        <th className="p-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {program.students.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="text-center py-8 text-muted-foreground">
                            Belum ada siswa yang terdaftar di program ini.
                          </td>
                        </tr>
                      ) : (
                        program.students.map((s) => (
                          <tr
                            key={s.id}
                            className="border-b border-border hover:bg-secondary/15 transition-all text-foreground"
                          >
                            <td className="p-3 font-semibold">{s.name}</td>
                            <td className="p-3">
                              <span className="font-medium text-brand-purple">
                                {s.mentorName || "Belum Ditentukan"}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <span
                                className={`px-2 py-0.5 rounded text-3xs font-medium uppercase tracking-wider ${
                                  s.status === "active"
                                    ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                    : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                                }`}
                              >
                                {s.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end pt-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-secondary hover:bg-muted text-foreground text-xs font-semibold transition-colors"
              >
                Tutup
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
