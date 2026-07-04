import { BookOpen, Clock } from "lucide-react";

export function StudentDashboard() {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-6">
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="font-heading font-bold text-lg flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-brand-purple" />
            Kelas Belajar Anda
          </h2>
          <div className="space-y-4">
            <div className="border border-border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-sm">AI Development</h3>
                <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-brand-purple/10 text-brand-purple border border-brand-purple/20">
                  Aktif
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-2xs text-muted-foreground font-medium">
                  <span>Progres Kelas</span>
                  <span className="tabular-nums">65%</span>
                </div>
                <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                  <div className="bg-brand-purple h-full rounded-full" style={{ width: "65%" }} />
                </div>
              </div>
            </div>

            <div className="border border-border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-sm">Web Development and UI/UX Design</h3>
                <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-brand-purple/10 text-brand-purple border border-brand-purple/20">
                  Aktif
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-2xs text-muted-foreground font-medium">
                  <span>Progres Kelas</span>
                  <span className="tabular-nums">20%</span>
                </div>
                <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                  <div className="bg-brand-purple h-full rounded-full" style={{ width: "20%" }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="font-heading font-bold text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-purple" />
            Tugas Mendatang
          </h2>
          <p className="text-xs text-muted-foreground">Belum ada tugas yang perlu dikumpulkan.</p>
        </div>
      </div>
    </div>
  );
}
