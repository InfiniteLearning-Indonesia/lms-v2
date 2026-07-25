import { useEffect, useState } from "react";
import { Loader2, Calendar as CalendarIcon, Save, AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, PieChart as PieIcon, CalendarDays, FileSpreadsheet, XCircle, Clock, Eye, FileText, Image as ImageIcon, Paperclip, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { TrendingUp } from "lucide-react";
import { toast } from "sonner";

export function MentorAttendance({ batchId, mentorId, programName }: { batchId: string, mentorId: string, programName?: string }) {
  const [loading, setLoading] = useState(true);
  const [attendanceSubTab, setAttendanceSubTab] = useState<'calendar' | 'recap'>('calendar');
  const [recapMonth, setRecapMonth] = useState<Date>(new Date());
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
      const foundBatch = Array.isArray(batchData) ? batchData.find((b: any) => b.id === batchId) : null;
      if (foundBatch) {
        setBatch(foundBatch);
        const now = new Date();
        const start = foundBatch.startDate ? new Date(foundBatch.startDate) : now;
        const end = foundBatch.endDate ? new Date(foundBatch.endDate) : now;
        if (now < start) setMonth(start);
        else if (now > end) setMonth(end);
        else setMonth(now);
      }

      // Fetch students for this batch (Primary: mentor-classes, Fallback: batches program details)
      let batchStudents: any[] = [];
      try {
        const classesRes = await fetch(`http://localhost:7000/classes/mentor-classes`, {
          headers: { Accept: "application/json" },
          credentials: "include"
        });
        if (classesRes.ok) {
          const classes = await classesRes.json();
          const activeClass = classes.find((c: any) => c.batchId === batchId);
          if (activeClass && activeClass.enrolledStudents && activeClass.enrolledStudents.length > 0) {
            batchStudents = activeClass.enrolledStudents;
          }
        }
      } catch (e) {}

      if (batchStudents.length === 0 && Array.isArray(batchData)) {
        const targetBatch = batchData.find((b: any) => b.id === batchId);
        if (targetBatch && targetBatch.includedPrograms) {
          targetBatch.includedPrograms.forEach((p: any) => {
            if (!programName || (p.name && p.name.toLowerCase() === programName.toLowerCase())) {
              if (p.students && Array.isArray(p.students)) {
                batchStudents.push(...p.students);
              }
            }
          });
        }
      }

      setStudents(batchStudents);

      // Fetch attendances for this batch
      const attUrl = `http://localhost:7000/attendance?batchId=${batchId}`;
      const attRes = await fetch(attUrl, {
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
  }, [selectedDate, allAttendances, students]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSaveMessage(null);
    setIsModalOpen(true);
  };

  const handleStatusChange = (studentId: string, status: string) => {
    setSaveMessage(null);
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

  // ── BATCH MONTH CONSTRAINTS ──
  const batchStart = batch?.startDate ? new Date(batch.startDate) : null;
  const batchEnd = batch?.endDate ? new Date(batch.endDate) : null;

  const isPrevRecapDisabled = batchStart
    ? (recapMonth.getFullYear() < batchStart.getFullYear() ||
        (recapMonth.getFullYear() === batchStart.getFullYear() && recapMonth.getMonth() <= batchStart.getMonth()))
    : false;

  const isNextRecapDisabled = batchEnd
    ? (recapMonth.getFullYear() > batchEnd.getFullYear() ||
        (recapMonth.getFullYear() === batchEnd.getFullYear() && recapMonth.getMonth() >= batchEnd.getMonth()))
    : false;

  // ── RECAP MONTH COMPUTATIONS ──
  const recapActiveDays = activeDays.filter(
    (d) => d.getMonth() === recapMonth.getMonth() && d.getFullYear() === recapMonth.getFullYear()
  );
  const totalActiveDaysMonth = recapActiveDays.length;

  const recapAttendances = allAttendances.filter((a) => {
    const d = new Date(a.date);
    return d.getMonth() === recapMonth.getMonth() && d.getFullYear() === recapMonth.getFullYear();
  });

  const hadirOnCamCount = recapAttendances.filter(a => a.status === 'Hadir On-Cam' || a.status === 'Hadir (On-Cam)').length;
  const hadirOffCamCount = recapAttendances.filter(a => a.status === 'Hadir Off-cam' || a.status === 'Hadir Off-Cam' || a.status === 'Hadir (Off-Cam)').length;
  const izinCount = recapAttendances.filter(a => a.status === 'Izin' || a.status === 'Izin/Sakit').length;
  const sakitCount = recapAttendances.filter(a => a.status === 'Sakit').length;
  const alphaCount = recapAttendances.filter(a => a.status === 'Alpha').length;
  const totalRecordsCount = hadirOnCamCount + hadirOffCamCount + izinCount + sakitCount + alphaCount;

  const pieData = [
    { name: 'Hadir On-Cam', value: hadirOnCamCount, color: '#10B981' },
    { name: 'Hadir Off-Cam', value: hadirOffCamCount, color: '#14B8A6' },
    { name: 'Izin', value: izinCount, color: '#F59E0B' },
    { name: 'Sakit', value: sakitCount, color: '#F97316' },
    { name: 'Alpha', value: alphaCount, color: '#EF4444' },
  ].filter(item => item.value > 0);

  const spThreshold = Math.max(1, Math.floor(totalActiveDaysMonth * 0.10));

  return (
    <div className="w-full space-y-6">
      {/* ── Sub-tab Navigation Bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-card border border-border p-2 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2">
          <Button
            variant={attendanceSubTab === "calendar" ? "default" : "ghost"}
            onClick={() => setAttendanceSubTab("calendar")}
            className={`rounded-xl text-xs font-semibold gap-2 py-2 cursor-pointer transition-all ${
              attendanceSubTab === "calendar"
                ? "bg-brand-purple text-white hover:bg-brand-purple/90 shadow-xs"
                : "text-muted-foreground hover:bg-secondary"
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            Input & Kalender Absensi
          </Button>
          <Button
            variant={attendanceSubTab === "recap" ? "default" : "ghost"}
            onClick={() => setAttendanceSubTab("recap")}
            className={`rounded-xl text-xs font-semibold gap-2 py-2 cursor-pointer transition-all ${
              attendanceSubTab === "recap"
                ? "bg-brand-purple text-white hover:bg-brand-purple/90 shadow-xs"
                : "text-muted-foreground hover:bg-secondary"
            }`}
          >
            <PieIcon className="w-4 h-4" />
            Rekap Absensi Bulanan
          </Button>
        </div>
        <div className="text-xs text-muted-foreground font-medium pr-2">
          Batch: <span className="font-bold text-foreground">{batch?.name || "Aktif"}</span>
        </div>
      </div>

      {attendanceSubTab === "recap" ? (
        <div className="space-y-6">
          {/* Month Navigator Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card border border-border p-5 rounded-2xl shadow-sm">
            <div>
              <h3 className="font-heading font-bold text-xl text-foreground flex items-center gap-2">
                <PieIcon className="w-6 h-6 text-brand-purple" />
                Rekapitulasi Kehadiran Siswa
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Persentase dan rincian statistik kehadiran seluruh siswa per bulan.
              </p>
            </div>
            
            <div className="flex items-center gap-3 bg-secondary/50 p-1.5 rounded-xl border border-border">
              <Button
                variant="ghost"
                size="icon"
                disabled={isPrevRecapDisabled}
                onClick={() => setRecapMonth(new Date(recapMonth.getFullYear(), recapMonth.getMonth() - 1, 1))}
                className="h-8 w-8 rounded-lg hover:bg-card text-foreground cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="flex flex-col items-center px-2">
                <span className="text-sm font-bold text-foreground font-heading">
                  {recapMonth.toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
                </span>
                <span className="text-[10px] text-muted-foreground font-medium">
                  {totalActiveDaysMonth} Hari Aktif Bulan Ini
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                disabled={isNextRecapDisabled}
                onClick={() => setRecapMonth(new Date(recapMonth.getFullYear(), recapMonth.getMonth() + 1, 1))}
                className="h-8 w-8 rounded-lg hover:bg-card text-foreground cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Pie / Donut Chart & Category Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Pie Chart Card */}
            <Card className="lg:col-span-5 border-border shadow-sm bg-card flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold text-foreground flex items-center gap-2 font-heading">
                  <PieIcon className="w-4 h-4 text-brand-purple" />
                  Proporsi Absensi ({recapMonth.toLocaleDateString("id-ID", { month: "long" })})
                </CardTitle>
                <CardDescription className="text-xs">
                  Persentase distribusi status kehadiran untuk bulan ini.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col items-center justify-center p-4">
                {totalRecordsCount > 0 && pieData.length > 0 ? (
                  <div className="w-full h-64 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: any) => [`${value} kali`, "Jumlah"]}
                          contentStyle={{
                            backgroundColor: "var(--card)",
                            borderColor: "var(--border)",
                            borderRadius: "12px",
                            fontSize: "12px",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-2xl font-bold font-heading text-foreground">{totalRecordsCount}</span>
                      <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Total Record</span>
                    </div>
                  </div>
                ) : (
                  <div className="py-16 text-center text-muted-foreground space-y-2">
                    <PieIcon className="w-10 h-10 mx-auto opacity-30" />
                    <p className="text-xs italic">Belum ada data absensi tercatat pada bulan ini.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Category Breakdown Cards */}
            <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-3">
              <Card className="bg-emerald-500/10 border-emerald-500/20 p-4 rounded-xl flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Hadir On-Cam</span>
                  <div className="p-1.5 bg-emerald-500/20 rounded-lg text-emerald-600">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-bold text-emerald-800 dark:text-emerald-300 font-heading">{hadirOnCamCount}</div>
                  <p className="text-[10px] text-emerald-700/80 mt-0.5">
                    {totalRecordsCount > 0 ? Math.round((hadirOnCamCount / totalRecordsCount) * 100) : 0}% dari total
                  </p>
                </div>
              </Card>

              <Card className="bg-teal-500/10 border-teal-500/20 p-4 rounded-xl flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-teal-700 dark:text-teal-400">Hadir Off-Cam</span>
                  <div className="p-1.5 bg-teal-500/20 rounded-lg text-teal-600">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-bold text-teal-800 dark:text-teal-300 font-heading">{hadirOffCamCount}</div>
                  <p className="text-[10px] text-teal-700/80 mt-0.5">
                    {totalRecordsCount > 0 ? Math.round((hadirOffCamCount / totalRecordsCount) * 100) : 0}% dari total
                  </p>
                </div>
              </Card>

              <Card className="bg-amber-500/10 border-amber-500/20 p-4 rounded-xl flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">Izin</span>
                  <div className="p-1.5 bg-amber-500/20 rounded-lg text-amber-600">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-bold text-amber-800 dark:text-amber-300 font-heading">{izinCount}</div>
                  <p className="text-[10px] text-amber-700/80 mt-0.5">
                    {totalRecordsCount > 0 ? Math.round((izinCount / totalRecordsCount) * 100) : 0}% dari total
                  </p>
                </div>
              </Card>

              <Card className="bg-orange-500/10 border-orange-500/20 p-4 rounded-xl flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-orange-700 dark:text-orange-400">Sakit</span>
                  <div className="p-1.5 bg-orange-500/20 rounded-lg text-orange-600">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-bold text-orange-800 dark:text-orange-300 font-heading">{sakitCount}</div>
                  <p className="text-[10px] text-orange-700/80 mt-0.5">
                    {totalRecordsCount > 0 ? Math.round((sakitCount / totalRecordsCount) * 100) : 0}% dari total
                  </p>
                </div>
              </Card>

              <Card className="bg-red-500/10 border-red-500/20 p-4 rounded-xl flex flex-col justify-between col-span-2 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-red-700 dark:text-red-400">Alpha (Tanpa Keterangan)</span>
                  <div className="p-1.5 bg-red-500/20 rounded-lg text-red-600">
                    <XCircle className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-bold text-red-800 dark:text-red-300 font-heading">{alphaCount}</div>
                  <p className="text-[10px] text-red-700/80 mt-0.5">
                    {totalRecordsCount > 0 ? Math.round((alphaCount / totalRecordsCount) * 100) : 0}% dari total
                  </p>
                </div>
              </Card>
            </div>
          </div>

          {/* Student Recap Table */}
          <Card className="border-border shadow-sm bg-card overflow-hidden">
            <CardHeader className="pb-3 border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-foreground flex items-center gap-2 font-heading">
                    <User className="w-4 h-4 text-brand-purple" />
                    Detail Rekap Kehadiran Per Siswa ({recapMonth.toLocaleDateString("id-ID", { month: "long", year: "numeric" })})
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Daftar akumulasi jumlah kehadiran dan persentase setiap siswa pada bulan ini.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-xs font-semibold border-brand-purple/30 text-brand-purple">
                  {students.length} Siswa Binaan
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-secondary/40 text-muted-foreground font-bold uppercase border-b border-border">
                      <th className="py-3.5 px-4">Nama Siswa</th>
                      <th className="py-3.5 px-4 text-center">Kehadiran / Hari Aktif</th>
                      <th className="py-3.5 px-4 text-center">Hadir On-Cam</th>
                      <th className="py-3.5 px-4 text-center">Hadir Off-Cam</th>
                      <th className="py-3.5 px-4 text-center">Izin</th>
                      <th className="py-3.5 px-4 text-center">Sakit</th>
                      <th className="py-3.5 px-4 text-center">Alpha</th>
                      <th className="py-3.5 px-4 text-center">% Kehadiran</th>
                      <th className="py-3.5 px-4 text-center">Status SP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {students.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-12 text-center text-muted-foreground">
                          Belum ada data siswa di kelas ini.
                        </td>
                      </tr>
                    ) : (
                      students.map((st) => {
                        const sAtts = recapAttendances.filter((a) => a.studentId === st.id);
                        const sOnCam = sAtts.filter((a) => a.status === "Hadir On-Cam" || a.status === "Hadir (On-Cam)").length;
                        const sOffCam = sAtts.filter((a) => a.status === "Hadir Off-cam" || a.status === "Hadir Off-Cam" || a.status === "Hadir (Off-Cam)").length;
                        const sHadirTotal = sOnCam + sOffCam;
                        const sIzin = sAtts.filter((a) => a.status === "Izin" || a.status === "Izin/Sakit").length;
                        const sSakit = sAtts.filter((a) => a.status === "Sakit").length;
                        const sAlpha = sAtts.filter((a) => a.status === "Alpha").length;
                        const sPct = totalActiveDaysMonth > 0 ? Math.round((sHadirTotal / totalActiveDaysMonth) * 100) : 0;

                        const isSuspended = st.status === "suspended";
                        let spBadge = <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">Normal</Badge>;
                        if (isSuspended) {
                          spBadge = <Badge className="bg-red-600 text-white font-bold text-[10px]">SUSPENDED</Badge>;
                        } else if (sAlpha >= spThreshold + 2) {
                          spBadge = <Badge className="bg-red-500 text-white font-bold text-[10px]">SP3</Badge>;
                        } else if (sAlpha >= spThreshold + 1) {
                          spBadge = <Badge className="bg-orange-500 text-white font-bold text-[10px]">SP2</Badge>;
                        } else if (sAlpha >= spThreshold) {
                          spBadge = <Badge className="bg-amber-500 text-white font-bold text-[10px]">SP1</Badge>;
                        }

                        return (
                          <tr key={st.id} className="hover:bg-secondary/20 transition-colors">
                            <td className="py-3 px-4">
                              <div className="font-bold text-foreground flex items-center gap-2">
                                {st.name}
                                {isSuspended && (
                                  <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/30 text-[9px] font-bold">
                                    SUSPENDED
                                  </Badge>
                                )}
                              </div>
                              <div className="text-[11px] text-muted-foreground font-mono">{st.email}</div>
                            </td>
                            <td className="py-3 px-4 text-center font-bold text-foreground">
                              {sHadirTotal} / {totalActiveDaysMonth} Hari
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                                {sOnCam}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
                                {sOffCam}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                                {sIzin}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-300">
                                {sSakit}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300">
                                {sAlpha}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                  sPct >= 80
                                    ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                    : sPct >= 70
                                    ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                                    : "bg-red-500/10 text-red-600 border border-red-500/20"
                                }`}
                              >
                                {sPct}%
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">{spBadge}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
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
                reqDate.getMonth() === month.getMonth() &&
                reqDate.getFullYear() === month.getFullYear()
              );
            });

            return (
              <Card className="border-border shadow-sm w-full">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2 font-heading">
                      <FileText className="w-5 h-5 text-brand-purple" />
                      Daftar Pengajuan Form Izin Siswa
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Pengajuan izin/sakit siswa pada bulan {month.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}.
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-xs font-semibold">
                    {monthlyPermissionRequests.length} Pengajuan Bulan Ini
                  </Badge>
                </CardHeader>
                <CardContent>
                  {monthlyPermissionRequests.length === 0 ? (
                    <div className="py-8 text-center border rounded-xl bg-secondary/10">
                      <p className="text-muted-foreground text-xs italic">
                        Tidak ada pengajuan form izin pada bulan {month.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto border rounded-xl">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-secondary/40 text-muted-foreground font-bold uppercase border-b border-border">
                            <th className="p-3">Siswa</th>
                            <th className="p-3">Tanggal Izin</th>
                            <th className="p-3">Kategori</th>
                            <th className="p-3">Alasan</th>
                            <th className="p-3 text-center">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {monthlyPermissionRequests.map((req) => (
                            <tr key={req.id} className="hover:bg-secondary/20 transition-colors">
                              <td className="p-3">
                                <div className="font-semibold text-foreground">{req.student?.name}</div>
                                <div className="text-[11px] text-muted-foreground">{req.student?.email}</div>
                              </td>
                              <td className="p-3 font-medium">
                                {new Date(req.date).toLocaleDateString('id-ID', {
                                  weekday: 'long',
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </td>
                              <td className="p-3">
                                <Badge variant="outline" className={
                                  req.category === 'sakit' ? 'bg-orange-500/10 text-orange-600 border-orange-500/20' : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                                }>
                                  {req.category.toUpperCase()}
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
        </>
      )}

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
                      const isPdf =
                        fileData.startsWith("data:application/pdf") ||
                        fileData.toLowerCase().endsWith(".pdf") ||
                        fileData.toLowerCase().includes(".pdf");
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
                      const isSuspended = student.status === 'suspended';
                      const selectedDateStr = selectedDate ? new Date(selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000).toISOString().split('T')[0] : '';
                      const hasFormIzin = permissionRequests.some(p => p.studentId === student.id && p.date && p.date.startsWith(selectedDateStr));
                      const status = isSuspended ? 'Alpha' : hasFormIzin ? 'Izin/Sakit' : modalAttendances[student.id];
                      return (
                        <tr key={student.id} className={`hover:bg-secondary/20 transition-colors ${isSuspended ? 'bg-red-500/5' : hasFormIzin ? 'bg-amber-500/5' : ''}`}>
                          <td className="py-4 px-6">
                            <div className="font-semibold text-foreground flex items-center gap-2">
                              {student.name}
                              {isSuspended && (
                                <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/30 text-[10px] font-bold">
                                  SUSPENDED
                                </Badge>
                              )}
                              {hasFormIzin && !isSuspended && (
                                <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-[10px] font-bold">
                                  FORM IZIN
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">{student.email}</div>
                          </td>
                          <td className="py-4 px-6 text-center">
                            {isSuspended ? (
                              <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200 py-1 px-3 text-xs font-bold">
                                Alpha (Suspended)
                              </Badge>
                            ) : hasFormIzin ? (
                              <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200 py-1 px-3 text-xs font-bold">
                                Izin/Sakit (Form Izin)
                              </Badge>
                            ) : status ? (
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
                              {isSuspended ? (
                                <div className="text-xs text-red-600 font-semibold bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">
                                  Otomatis Alpha (Suspended)
                                </div>
                              ) : hasFormIzin ? (
                                <div className="text-xs text-amber-700 font-semibold bg-amber-500/10 border border-amber-500/30 px-3 py-2 rounded-lg">
                                  Izin via Form
                                </div>
                              ) : (
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
                              )}
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
