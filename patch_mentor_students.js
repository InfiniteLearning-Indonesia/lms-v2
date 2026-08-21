const fs = require('fs');
const file = '/Users/febriyann/GitHub/InfiniteLearning/LMS-Project/frontend/app/dashboard/components/mentor/mentor-students-view.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'import { Input } from "@/components/ui/input";',
  `import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { API_BASE_URL } from "@/lib/config";`
);

content = content.replace(
  'interface MentorStudentsViewProps {',
  `interface MentorStudentsViewProps {
  onRefreshData?: () => void;`
);

content = content.replace(
  '  onOpenSuspendDialog,',
  `  onOpenSuspendDialog,
  onRefreshData,`
);

const stateCode = `
  // Claim Mentee Modal States
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [unassignedStudents, setUnassignedStudents] = useState<any[]>([]);
  const [isLoadingUnassigned, setIsLoadingUnassigned] = useState(false);
  const [claimSearch, setClaimSearch] = useState("");
  const [selectedToClaim, setSelectedToClaim] = useState<string[]>([]);
  const [isSubmittingClaim, setIsSubmittingClaim] = useState(false);

  const fetchUnassignedStudents = async () => {
    setIsLoadingUnassigned(true);
    try {
      const res = await fetch(\`\${API_BASE_URL}/classes/unassigned-students\`, {
        headers: { Accept: "application/json" },
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setUnassignedStudents(data);
      } else {
        toast.error("Gagal memuat daftar siswa unassigned");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setIsLoadingUnassigned(false);
    }
  };

  const handleOpenClaimModal = () => {
    setIsClaimModalOpen(true);
    setClaimSearch("");
    setSelectedToClaim([]);
    fetchUnassignedStudents();
  };

  const handleClaimMentees = async () => {
    if (selectedToClaim.length === 0) return;
    setIsSubmittingClaim(true);
    let successCount = 0;
    
    try {
      for (const studentId of selectedToClaim) {
        const res = await fetch(\`\${API_BASE_URL}/classes/claim-mentee\`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ studentId }),
        });
        if (res.ok) successCount++;
      }
      
      if (successCount > 0) {
        toast.success(\`Berhasil menambahkan \${successCount} siswa ke daftar binaan!\`);
        setIsClaimModalOpen(false);
        if (onRefreshData) onRefreshData();
      } else {
        toast.error("Gagal menambahkan siswa");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan saat menambahkan siswa");
    } finally {
      setIsSubmittingClaim(false);
    }
  };

  const filteredUnassigned = unassignedStudents.filter(s => {
    const q = claimSearch.toLowerCase();
    return (
      (s.name && s.name.toLowerCase().includes(q)) ||
      (s.email && s.email.toLowerCase().includes(q))
    );
  });
`;

content = content.replace(
  '  // Exclude mentors & facilitators from students view',
  stateCode + '\n  // Exclude mentors & facilitators from students view'
);

const buttonCode = `
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {!isReadOnly && (
                <Dialog open={isClaimModalOpen} onOpenChange={setIsClaimModalOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={handleOpenClaimModal} variant="default" size="sm" className="h-9 gap-1.5">
                      <Plus className="w-4 h-4" /> Tambah Mentee
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-[450px] border border-border bg-popover p-6 rounded-xl shadow-lg font-sans">
                    <DialogHeader className="mb-4">
                      <DialogTitle className="font-heading font-bold text-lg text-foreground flex items-center gap-2">
                        <UserCheck className="w-5 h-5 text-brand-purple" /> Tambah Personal Mentee
                      </DialogTitle>
                      <DialogDescription className="text-xs text-muted-foreground mt-1">
                        Pilih siswa yang belum memiliki personal mentor untuk ditambahkan ke daftar binaan Anda.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 mb-4">
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                        <Input
                          placeholder="Cari nama atau email..."
                          value={claimSearch}
                          onChange={(e) => setClaimSearch(e.target.value)}
                          className="pl-9 h-9 text-xs"
                        />
                      </div>

                      <div className="border border-border rounded-lg overflow-hidden max-h-[300px] flex flex-col">
                        {isLoadingUnassigned ? (
                          <div className="p-8 text-center text-xs text-muted-foreground">Memuat data...</div>
                        ) : filteredUnassigned.length === 0 ? (
                          <div className="p-8 text-center text-xs text-muted-foreground">
                            {unassignedStudents.length === 0 
                              ? "Semua siswa di angkatan ini sudah memiliki personal mentor ✅" 
                              : "Tidak ada siswa yang cocok dengan pencarian"}
                          </div>
                        ) : (
                          <div className="overflow-y-auto">
                            <div className="divide-y divide-border">
                              {filteredUnassigned.map(s => (
                                <div key={s.id} className="flex items-start gap-3 p-3 hover:bg-secondary/20 transition-colors">
                                  <Checkbox 
                                    id={\`claim-\${s.id}\`} 
                                    checked={selectedToClaim.includes(s.id)}
                                    onCheckedChange={(checked) => {
                                      if (checked) setSelectedToClaim(prev => [...prev, s.id]);
                                      else setSelectedToClaim(prev => prev.filter(id => id !== s.id));
                                    }}
                                    className="mt-1"
                                  />
                                  <label htmlFor={\`claim-\${s.id}\`} className="flex-1 cursor-pointer">
                                    <div className="text-sm font-semibold text-foreground">{s.name}</div>
                                    <div className="text-xs text-muted-foreground mt-0.5">{s.email}</div>
                                    <div className="text-[10px] font-medium text-brand-purple bg-brand-purple/10 inline-block px-1.5 py-0.5 rounded mt-1.5">
                                      {s.selectedProgram || "Program"}
                                    </div>
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <DialogFooter className="flex justify-end gap-2 border-t border-border pt-4">
                      <Button variant="outline" size="sm" onClick={() => setIsClaimModalOpen(false)}>
                        Batal
                      </Button>
                      <Button 
                        variant="default" 
                        size="sm" 
                        onClick={handleClaimMentees}
                        disabled={selectedToClaim.length === 0 || isSubmittingClaim}
                      >
                        {isSubmittingClaim ? "Memproses..." : \`Tambahkan (\${selectedToClaim.length})\`}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
              
              <div className="relative w-full sm:w-64">
`;

content = content.replace(
  '<div className="flex items-center gap-3 w-full sm:w-auto">\n              <div className="relative w-full sm:w-64">',
  buttonCode
);

fs.writeFileSync(file, content);
console.log('Patched mentor-students-view.tsx successfully');
