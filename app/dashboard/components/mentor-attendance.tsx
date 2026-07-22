import { useEffect, useState } from "react";
import { Loader2, Calendar as CalendarIcon, Save, AlertCircle, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { TrendingUp } from "lucide-react";

import { Eye, FileText, Image as ImageIcon, Paperclip, User } from "lucide-react";

export function MentorAttendance({ batchId, mentorId }: { batchId: string, mentorId: string }) {
  const [loading, setLoading] = useState(true);
  const [activeDays, setActiveDays] = useState<Date[]>([]);
  const [holidays, setHolidays] = useState<{ date: string, name: string }[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [batch, setBatch] = useState<any>(null);
  const [month, setMonth] = useState<Date>(new Date());
  
  const [students, setStudents] = useState<any[]>([]);
  const [allAttendances, setAllAttendances] = useState<any[]>([]);
  const [modalAttendances, setModalAttendances] = useState<Record<string, string>>({});
  const [permissionRequests, setPermissionRequests] = useState<any[]>([]);
  const [selectedPermission, setSelectedPermission] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const fetchData = async () => {
    if (!batchId) return;
    setLoading(true);
    try {
      // Fetch active days and holidays
      const daysRes = await fetch(`http://localhost:7000/attendance/active-days/${batchId}`, {
        headers: { Accept: "application/json" },
        credentials: "include"
      });
      const daysData = await daysRes.json();
      if (daysData.days) {
        setActiveDays(daysData.days.map((d: string) => new Date(d)));
      }
      if (daysData.holidays) {
        setHolidays(daysData.holidays);
      }

      // Fetch batch details for start and end date
      const batchRes = await fetch(`http://localhost:7000/classes/batches`, {
        headers: { Accept: "application/json" },
        credentials: "include"
      });
      const batchData = await batchRes.json();
      const foundBatch = batchData.find((b: any) => b.id === batchId);
      if (foundBatch) {
        setBatch(foundBatch);
        const now = new Date();
        const start = foundBatch.startDate ? new Date(foundBatch.startDate) : now;
        const end = foundBatch.endDate ? new Date(foundBatch.endDate) : now;
        if (now < start) setMonth(start);
        else if (now > end) setMonth(end);
        else setMonth(now);
      }

      // Fetch students
      const classesRes = await fetch(`http://localhost:7000/classes/mentor-classes`, {
        headers: { Accept: "application/json" },
        credentials: "include"
      });
      const classes = await classesRes.json();
      const activeClass = classes.find((c: any) => c.batchId === batchId);
      if (activeClass && activeClass.enrolledStudents) {
        setStudents(activeClass.enrolledStudents);
      }

      // Fetch ALL attendances for this mentor's students in this batch
      const attRes = await fetch(`http://localhost:7000/attendance?batchId=${batchId}&mentorId=${mentorId}`, {
        headers: { Accept: "application/json" },
        credentials: "include"
      });
      const attData = await attRes.json();
      setAllAttendances(Array.isArray(attData) ? attData : []);

      // Fetch permission requests for this batch
      const permRes = await fetch(`http://localhost:7000/attendance/permission-requests?batchId=${batchId}`, {
        headers: { Accept: "application/json" },
        credentials: "include"
      });
      if (permRes.ok) {
        const permData = await permRes.json();
        setPermissionRequests(Array.isArray(permData) ? permData : []);
      }

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [batchId, mentorId]);

  // Update modal state when date is selected
  useEffect(() => {
    if (!selectedDate || students.length === 0) return;
    
    const tzOffset = selectedDate.getTimezoneOffset() * 60000;
    const localDateStr = (new Date(selectedDate.getTime() - tzOffset)).toISOString().split('T')[0];
    
    const attData: Record<string, string> = {};
    const dateAtts = allAttendances.filter(d => d.date.startsWith(localDateStr));
    dateAtts.forEach(d => {
      attData[d.studentId] = d.status;
    });
    setModalAttendances(attData);
    setSaveMessage(null);
  }, [selectedDate, allAttendances, students]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  const handleStatusChange = (studentId: string, status: string) => {
    setModalAttendances(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSave = async () => {
    if (!selectedDate || !batchId) return;
    setSaving(true);
    setSaveMessage(null);

    const tzOffset = selectedDate.getTimezoneOffset() * 60000;
    const localDateStr = (new Date(selectedDate.getTime() - tzOffset)).toISOString().split('T')[0];

    const payload = {
      attendances: Object.entries(modalAttendances).map(([studentId, status]) => ({
        studentId,
        batchId,
        date: localDateStr,
        status
      }))
    };

    try {
      const res = await fetch(`http://localhost:7000/attendance/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include"
      });

      if (res.ok) {
        setSaveMessage({ type: 'success', text: "Absensi berhasil disimpan!" });
        // Refresh all attendances
        fetchData();
        setTimeout(() => {
          setIsModalOpen(false);
          setSaveMessage(null);
        }, 1000);
      } else {
        const error = await res.json();
        setSaveMessage({ type: 'error', text: error.message || "Gagal menyimpan absensi" });
      }
    } catch (err) {
      console.error(err);
      setSaveMessage({ type: 'error', text: "Terjadi kesalahan jaringan" });
    } finally {
      setSaving(false);
    }
  };

  const CustomDayButton = ({ day, modifiers, ...props }: any) => {
    const date = day.date;
    if (modifiers.outside || day.outside) {
      return <div className="h-full w-full opacity-0 pointer-events-none"></div>;
    }

    const tzOffset = date.getTimezoneOffset() * 60000;
    const localDateStr = (new Date(date.getTime() - tzOffset)).toISOString().split('T')[0];

    const holiday = holidays.find(h => h.date === localDateStr);
    const dayOfWeek = date.getDay();
    const isFriday = dayOfWeek === 5;
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    const isActive = activeDays.some(d => 
      d.getDate() === date.getDate() && 
      d.getMonth() === date.getMonth() && 
      d.getFullYear() === date.getFullYear()
    );

    const today = new Date();
    today.setHours(0,0,0,0);
    const isToday = date.getTime() === today.getTime();

    // Calculate stats
    const dateAtts = allAttendances.filter(d => d.date.startsWith(localDateStr));
    const hadir = dateAtts.filter(a => a.status.includes('Hadir')).length;
    const alpha = dateAtts.filter(a => a.status === 'Alpha').length;

    let cellBg = "bg-card hover:bg-secondary/20 cursor-pointer";
    let content = null;

    if (holiday || isWeekend) {
      // Priority 1: Tanggal Merah (Holiday or Weekend) -> RED
      const label = holiday ? (holiday.name || "Libur Nasional") : "Weekend (Libur)";
      cellBg = "bg-red-500/10 border-red-500/30 text-red-600 cursor-not-allowed font-medium";
      content = (
        <div className="mt-auto flex flex-col justify-end w-full">
          <span className="text-[10px] font-bold bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-200 px-1.5 py-0.5 rounded-sm inline-block self-start leading-tight">
            {label}
          </span>
        </div>
      );
    } else if (isFriday) {
      // Priority 2: Hari Jumat Asynchronous -> GREEN (Libur Absen)
      cellBg = "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 cursor-not-allowed font-medium";
      content = (
        <div className="mt-auto flex flex-col justify-end w-full">
          <span className="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 px-1.5 py-0.5 rounded-sm inline-block self-start leading-tight">
            Hari Asynchronous
          </span>
        </div>
      );
    } else if (!isActive) {
      cellBg = "bg-secondary/20 text-muted-foreground opacity-50 cursor-not-allowed";
    } else {
      content = (
        <div className="mt-auto pt-2 flex flex-col gap-1 w-full">
          {dateAtts.length > 0 ? (
            <>
              <div className="flex justify-between items-center bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-sm">
                <span className="text-[9px] font-bold">Hadir</span>
                <span className="text-[10px] font-bold">{hadir}</span>
              </div>
              <div className="flex justify-between items-center bg-red-50 text-red-700 px-1.5 py-0.5 rounded-sm">
                <span className="text-[9px] font-bold">Alpha</span>
                <span className="text-[10px] font-bold">{alpha}</span>
              </div>
            </>
          ) : (
            <div className="text-[10px] italic text-muted-foreground text-center bg-secondary/50 rounded-sm py-0.5">
              Belum Diisi
            </div>
          )}
        </div>
      );
    }

    return (
      <div 
        {...props}
        onClick={(e) => {
          if (!holiday && !isFriday && !isWeekend && isActive) {
            handleDateSelect(date);
          } else {
            e.preventDefault();
          }
        }}
        className={`h-full w-full p-2 border rounded-lg flex flex-col items-start transition-all ${cellBg} ${isToday ? 'ring-2 ring-brand-purple' : ''}`}
      >
        <div className={`text-xs font-semibold ${isToday ? 'text-brand-purple' : 'text-foreground'}`}>
          {date.getDate()}
        </div>
        {content}
      </div>
    );
  };

  if (loading && allAttendances.length === 0) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-brand-purple" />
      </div>
    );
  }

  if (!batchId) {
    return (
      <Alert className="border-border bg-card">
        <AlertCircle className="w-4 h-4 text-brand-purple" />
        <AlertTitle>Tidak ada batch aktif</AlertTitle>
        <AlertDescription>Pilih atau tunggu hingga kelas batch aktif tersedia.</AlertDescription>
      </Alert>
    );
  }

  // Generate chart data for current month
  const chartData = [];
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  let activeDaysMonth = 0;

  for (let d = 1; d <= daysInMonth; d++) {
    const iterDate = new Date(month.getFullYear(), month.getMonth(), d);
    
    // Format to local date string yyyy-mm-dd safely
    const iterLocalDateStr = new Date(iterDate.getTime() - iterDate.getTimezoneOffset() * 60000).toISOString().split('T')[0];
    
    // Check if it's an active day (not holiday, not weekend, not Friday Asynchronous, and in activeDays)
    const isDayActive = activeDays.some(ad => ad.getDate() === iterDate.getDate() && ad.getMonth() === iterDate.getMonth());
    const isHoliday = holidays.some(h => h.date === iterLocalDateStr);
    const isWeekend = iterDate.getDay() === 0 || iterDate.getDay() === 6;
    const isFriday = iterDate.getDay() === 5;

    if (isDayActive && !isHoliday && !isWeekend && !isFriday) {
      activeDaysMonth++;
      
      const dayAtts = allAttendances.filter(a => a.date.startsWith(iterLocalDateStr));
      const hadirCount = dayAtts.filter(a => a.status.includes('Hadir')).length;
      const izinCount = dayAtts.filter(a => a.status.includes('Izin') || a.status.includes('Sakit')).length;
      const alphaCount = dayAtts.filter(a => a.status === 'Alpha').length;
      
      chartData.push({
        name: d.toString(),
        Hadir: hadirCount,
        "Izin/Sakit": izinCount,
        Alpha: alphaCount,
        fullDate: iterLocalDateStr
      });
    }
  }

  const chartConfig = {
    Hadir: { label: "Hadir", color: "#10b981" },
    "Izin/Sakit": { label: "Izin/Sakit", color: "#f59e0b" },
    Alpha: { label: "Alpha", color: "#ef4444" },
  };

  return (
    <div className="w-full space-y-6">
      <Card className="border-border shadow-sm w-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-brand-purple" />
            Kalender Absensi Mentor
          </CardTitle>
          <CardDescription className="text-sm">
            Kalender informasi kehadiran kelas. Klik hari aktif untuk mengisi form absen. Tanggal merah akan dinonaktifkan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeDays.length === 0 && (
            <Alert variant="destructive" className="mb-4 text-sm p-3 h-auto leading-tight">
              <AlertDescription>
                Tanggal mulai/selesai Batch belum diatur oleh Admin, sehingga hari aktif kosong.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="w-full bg-background rounded-xl border p-4 shadow-sm">
            <Calendar
              mode="single"
              className="w-full"
              month={month}
              onMonthChange={setMonth}
              startMonth={batch?.startDate ? new Date(batch.startDate) : undefined}
              endMonth={batch?.endDate ? new Date(batch.endDate) : undefined}
              components={{
                DayButton: (props: any) => <CustomDayButton {...props} />
              }}
              classNames={{
                months: "relative w-full flex flex-col space-y-4",
                month: "space-y-4 w-full",
                month_grid: "w-full border-collapse space-y-1",
                weekdays: "flex w-full mb-2",
                weekday: "text-muted-foreground w-full font-bold text-sm uppercase py-2 text-center",
                week: "flex w-full mt-2 gap-2",
                day: "min-h-[120px] w-full p-0 relative",
                button_previous: "absolute left-0 top-1 h-8 w-8 bg-background hover:bg-secondary border rounded-md flex items-center justify-center z-20",
                button_next: "absolute right-0 top-1 h-8 w-8 bg-background hover:bg-secondary border rounded-md flex items-center justify-center z-20",
                nav: "absolute inset-x-0 top-0 flex w-full items-center justify-between pointer-events-none [&>*]:pointer-events-auto",
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border shadow-sm w-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-brand-purple" />
            Statistik Kehadiran Bulanan
          </CardTitle>
          <CardDescription className="text-sm">
            Tren kehadiran siswa untuk bulan {month.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 bg-secondary/30 rounded-lg p-4 flex flex-col md:flex-row justify-between items-center gap-4 border">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Bulan Ini</p>
              <h3 className="text-2xl font-bold font-heading">{month.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</h3>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground font-medium">Total Hari Aktif</p>
              <div className="text-2xl font-bold font-heading flex items-end justify-end gap-2">
                <span className="text-emerald-600">{activeDaysMonth}</span>
                <span className="text-base text-muted-foreground mb-1">Hari</span>
              </div>
            </div>
          </div>

          {chartData.length === 0 ? (
            <div className="py-12 text-center border rounded-xl bg-secondary/10">
              <p className="text-muted-foreground">Tidak ada hari aktif pada bulan ini.</p>
            </div>
          ) : (
            <div className="h-[300px] w-full">
              <ChartContainer config={chartConfig} className="h-full w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tickMargin={10} 
                      tick={{ fill: '#6b7280', fontSize: 12 }} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#6b7280', fontSize: 12 }} 
                      allowDecimals={false}
                    />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Legend verticalAlign="top" height={36} />
                    <Line type="monotone" dataKey="Hadir" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="Izin/Sakit" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="Alpha" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── SEKSI DAFTAR PERIZINAN SISWA (FORM IZIN) ── */}
      {(() => {
        const monthlyPermissionRequests = permissionRequests.filter((req) => {
          if (!req.date) return false;
          const reqDate = new Date(req.date);
          return (
            reqDate.getFullYear() === month.getFullYear() &&
            reqDate.getMonth() === month.getMonth()
          );
        });

        const monthName = month.toLocaleDateString("id-ID", { month: "long", year: "numeric" });

        return (
          <Card className="border-border shadow-sm w-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center justify-between font-heading font-bold">
                <span className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-brand-purple" />
                  Daftar Pengajuan Form Izin Siswa ({monthName})
                </span>
                <Badge variant="outline" className="bg-brand-purple/10 text-brand-purple border-brand-purple/30 text-xs font-semibold">
                  {monthlyPermissionRequests.length} Permohonan
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Daftar pengajuan izin/sakit siswa binaan pada bulan {monthName}. Status kehadiran siswa otomatis terisi sebagai Izin/Sakit.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {monthlyPermissionRequests.length === 0 ? (
                <div className="py-8 text-center border border-dashed rounded-xl bg-secondary/10">
                  <p className="text-xs text-muted-foreground">
                    Belum ada siswa yang mengajukan Form Izin pada bulan <strong>{monthName}</strong> ini.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-border rounded-xl">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-secondary/40 border-b border-border text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                        <th className="p-3">Siswa Pemohon</th>
                        <th className="p-3">Tanggal Izin</th>
                        <th className="p-3">Kategori</th>
                        <th className="p-3">Alasan Ketidakhadiran</th>
                        <th className="p-3 text-center">Aksi / Berkas</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {monthlyPermissionRequests.map((req) => (
                        <tr key={req.id} className="hover:bg-secondary/20 transition-colors">
                          <td className="p-3">
                            <div className="font-semibold text-foreground">{req.student?.name || "Siswa"}</div>
                            <div className="text-[10px] text-muted-foreground font-mono break-all">{req.student?.email}</div>
                          </td>
                          <td className="p-3 font-medium">
                            {new Date(req.date).toLocaleDateString("id-ID", {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </td>
                          <td className="p-3">
                            <Badge
                              variant="outline"
                              className={
                                req.category === "Sakit"
                                  ? "bg-amber-500/10 text-amber-600 border-amber-500/30 text-[10px]"
                                  : "bg-brand-purple/10 text-brand-purple border-brand-purple/30 text-[10px]"
                              }
                            >
                              {req.category}
                            </Badge>
                          </td>
                          <td className="p-3 max-w-xs truncate text-muted-foreground">{req.reason}</td>
                          <td className="p-3 text-center">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedPermission(req)}
                              className="h-8 text-xs text-brand-purple border-brand-purple/30 hover:bg-brand-purple/10 gap-1 px-3"
                            >
                              <Eye className="w-3.5 h-3.5" /> Lihat Form Izin
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })()}

      {/* Dialog Preview Form Izin for Mentor */}
      <Dialog open={!!selectedPermission} onOpenChange={() => setSelectedPermission(null)}>
        {selectedPermission && (
          <DialogContent className="w-[95vw] max-w-3xl sm:max-w-3xl max-h-[90vh] overflow-y-auto font-sans p-6">
            <DialogHeader>
              <DialogTitle className="text-lg font-heading font-bold text-foreground flex items-center gap-2">
                <FileText className="w-5 h-5 text-brand-purple" />
                Form Izin Siswa: {selectedPermission.student?.name}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Pengajuan {selectedPermission.category} untuk tanggal{" "}
                <strong>
                  {new Date(selectedPermission.date).toLocaleDateString("id-ID", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </strong>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-2 text-xs">
              <div className="p-4 rounded-xl bg-secondary/30 border border-border space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-muted-foreground pb-3 border-b border-border/50">
                  <div>
                    <span className="text-[10px] text-muted-foreground/70 block">Nama Siswa:</span>
                    <strong className="text-foreground text-sm">{selectedPermission.student?.name}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground/70 block">Email Siswa:</span>
                    <span className="font-mono text-foreground break-all">{selectedPermission.student?.email}</span>
                  </div>
                </div>
                <div>
                  <span className="font-bold text-foreground block text-xs">Alasan Ketidakhadiran:</span>
                  <p className="text-muted-foreground whitespace-pre-line mt-1 text-xs leading-relaxed">{selectedPermission.reason}</p>
                </div>
              </div>

              {/* Bukti Dokumen Preview */}
              <div className="space-y-2">
                <h4 className="font-bold text-foreground flex items-center gap-1.5">
                  <Paperclip className="w-4 h-4 text-brand-purple" /> Bukti Dokumen / Surat Dokter ({selectedPermission.proofFiles?.length || 0})
                </h4>
                {selectedPermission.proofFiles && selectedPermission.proofFiles.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedPermission.proofFiles.map((fileData: string, idx: number) => {
                      const isPdf = fileData.startsWith("data:application/pdf");
                      return (
                        <div key={idx} className="border border-border rounded-xl p-3 bg-card space-y-2">
                          {isPdf ? (
                            <a
                              href={fileData}
                              download={`bukti-izin-${selectedPermission.student?.name}-${idx + 1}.pdf`}
                              className="text-brand-purple font-semibold flex items-center gap-2 underline p-3 text-xs bg-brand-purple/10 rounded-lg hover:bg-brand-purple/20 transition-colors"
                            >
                              <FileText className="w-4 h-4" /> Download PDF #{idx + 1}
                            </a>
                          ) : (
                            <img
                              src={fileData}
                              alt={`Bukti #${idx + 1}`}
                              className="w-full max-h-72 object-contain rounded-lg border border-border/50 bg-black/20"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-muted-foreground italic text-[11px]">Tidak ada dokumen lampiran.</p>
                )}
              </div>

              {/* Bukti Chat Mentor Preview */}
              <div className="space-y-2">
                <h4 className="font-bold text-foreground flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-emerald-600" /> Tangkapan Layar Chat Mentor ({selectedPermission.mentorChatFiles?.length || 0})
                </h4>
                {selectedPermission.mentorChatFiles && selectedPermission.mentorChatFiles.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedPermission.mentorChatFiles.map((fileData: string, idx: number) => (
                      <div key={idx} className="border border-border rounded-xl p-3 bg-card">
                        <img
                          src={fileData}
                          alt={`Chat #${idx + 1}`}
                          className="w-full max-h-72 object-contain rounded-lg border border-border/50 bg-black/20"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground italic text-[11px]">Tidak ada bukti chat mentor.</p>
                )}
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* Attendance Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="w-[95vw] max-w-7xl sm:max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl text-brand-purple">
              Absensi - {selectedDate?.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </DialogTitle>
            <DialogDescription className="text-sm">
              Perbarui status kehadiran masing-masing siswa untuk kelas hari ini. Pastikan Anda mengklik Simpan sebelum menutup jendela ini.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-2">
            {saveMessage && (
              <Alert className={saveMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'}>
                {saveMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <AlertTitle className="text-sm font-semibold">{saveMessage.text}</AlertTitle>
              </Alert>
            )}

            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-secondary/50 text-sm font-bold text-muted-foreground uppercase">
                    <th className="py-4 px-6">Nama Siswa</th>
                    <th className="py-4 px-6 text-center">Status Saat Ini</th>
                    <th className="py-4 px-6 text-right">Pilih Kehadiran</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-base">
                  {students.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-12 text-center text-muted-foreground">Belum ada siswa di kelas ini.</td>
                    </tr>
                  ) : (
                    students.map((student) => {
                      const status = modalAttendances[student.id];
                      return (
                        <tr key={student.id} className="hover:bg-secondary/20 transition-colors">
                          <td className="py-4 px-6">
                            <div className="font-semibold text-foreground">{student.name}</div>
                            <div className="text-sm text-muted-foreground">{student.email}</div>
                          </td>
                          <td className="py-4 px-6 text-center">
                            {status ? (
                              <Badge variant="outline" className={
                                status.includes('Hadir') ? 'bg-emerald-100 text-emerald-800 border-emerald-200 py-1 px-3 text-xs' :
                                status.includes('Izin') ? 'bg-amber-100 text-amber-800 border-amber-200 py-1 px-3 text-xs' :
                                'bg-red-100 text-red-800 border-red-200 py-1 px-3 text-xs'
                              }>
                                {status}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-sm italic">Belum Diisi</span>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex justify-end">
                              <Select 
                                value={status || ""} 
                                onValueChange={(val) => val && handleStatusChange(student.id, val)}
                              >
                                <SelectTrigger className="w-[200px] h-12 text-sm">
                                  <SelectValue placeholder="Pilih Status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Hadir On-Cam">Hadir On-Cam</SelectItem>
                                  <SelectItem value="Hadir Off-cam">Hadir Off-cam</SelectItem>
                                  <SelectItem value="Izin/Sakit">Izin/Sakit</SelectItem>
                                  <SelectItem value="Alpha">Alpha</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <DialogFooter className="mt-4 pt-4 border-t">
            <Button variant="outline" size="lg" onClick={() => setIsModalOpen(false)} disabled={saving}>
              Batal & Tutup
            </Button>
            <Button 
              onClick={handleSave} 
              size="lg"
              disabled={saving || students.length === 0}
              className="bg-brand-purple hover:bg-brand-purple-hover text-white gap-2 font-bold px-8"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              SIMPAN ABSENSI
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
