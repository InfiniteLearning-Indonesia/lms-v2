import { BookOpen, Users } from "lucide-react";

export function MentorDashboard() {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-6">
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="font-heading font-bold text-lg flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-brand-purple" />
            Manajemen Kelas Ajar
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="border border-border rounded-lg p-4 space-y-3 bg-secondary/35">
              <h3 className="font-heading font-bold text-sm">Mobile Development</h3>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Siswa Terdaftar</span>
                <strong className="text-foreground">24 Siswa</strong>
              </div>
            </div>
            <div className="border border-border rounded-lg p-4 space-y-3 bg-secondary/35">
              <h3 className="font-heading font-bold text-sm">Game Development</h3>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Siswa Terdaftar</span>
                <strong className="text-foreground">18 Siswa</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
        <h2 className="font-heading font-bold text-sm flex items-center gap-2">
          <Users className="w-4 h-4 text-brand-purple" />
          Statistik Ringkas
        </h2>
        <div className="space-y-3 text-xs">
          <div className="flex justify-between border-b border-border pb-2">
            <span className="text-muted-foreground">Total Kelas</span>
            <span className="font-semibold text-foreground">2 Kelas</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Siswa Binaan</span>
            <span className="font-semibold text-foreground">42 Siswa</span>
          </div>
        </div>
      </div>
    </div>
  );
}
