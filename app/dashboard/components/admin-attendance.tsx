import { API_BASE_URL } from "@/lib/config";
import { useEffect, useState } from "react";
import { Loader2, Users, Search, AlertCircle, CalendarDays, BarChart3, Calendar as CalendarIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend, LineChart, Line } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { TrendingUp } from "lucide-react";

export function AdminAttendance({ batches }: { batches: any[] }) {
  const [attendances, setAttendances] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<string>(batches.length > 0 ? batches[0].id : "all");

  const [activeDays, setActiveDays] = useState<Date[]>([]);
  const [holidays, setHolidays] = useState<{ date: string, name: string }[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [batchDetails, setBatchDetails] = useState<any>(null);
  const [month, setMonth] = useState<Date>(new Date());

  const [selectedMentor, setSelectedMentor] = useState<string>("all");
  const [mentorsList, setMentorsList] = useState<any[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    fetchAttendances(controller.signal);
    return () => controller.abort();
  }, [selectedBatch, selectedMentor]);

  useEffect(() => {
    if (selectedBatch && selectedBatch !== "all") {
      const controller = new AbortController();
      fetchActiveDays(selectedBatch, controller.signal);
      return () => controller.abort();
    } else {
      setActiveDays([]);
      setHolidays([]);
      setMentorsList([]);
      setSelectedMentor("all");
    }
  }, [selectedBatch]);

  const fetchActiveDays = async (batchId: string, signal?: AbortSignal) => {
    try {
      const res = await fetch(`${API_BASE_URL}/attendance/active-days/${batchId}`, {
        headers: { Accept: "application/json" },
        credentials: "include",
        signal,
      });
      if (!res.ok) throw new Error("Gagal memuat hari aktif");
      const data = await res.json();
      if (data.days) {
        setActiveDays(
          data.days.map((dStr: string) => {
            const parts = dStr.split("T")[0].split("-");
            return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
          })
        );
      }
      if (data.holidays) {
        setHolidays(data.holidays);
      }

      const batchRes = await fetch(`${API_BASE_URL}/classes/batches`, {
        headers: { Accept: "application/json" },
        credentials: "include"
      });
      if (!batchRes.ok) throw new Error("Gagal memuat data batch");
      const batchData = await batchRes.json();
      const foundBatch = batchData.find((b: any) => b.id === batchId);
      if (foundBatch) {
        setBatchDetails(foundBatch);

        if (foundBatch.includedPrograms) {
          const allMentors = foundBatch.includedPrograms.flatMap((p: any) => p.mentors || []);
          const uniqueMentors = Array.from(new Map(allMentors.map((m: any) => [m.id, m])).values());
          setMentorsList(uniqueMentors);
        } else {
          setMentorsList([]);
        }

        const now = new Date();
        const start = foundBatch.startDate ? new Date(foundBatch.startDate) : now;
        const end = foundBatch.endDate ? new Date(foundBatch.endDate) : now;
        if (now < start) setMonth(start);
        else if (now > end) setMonth(end);
        else setMonth(now);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAttendances = async (signal?: AbortSignal) => {
    setLoading(true);
    let url = `${API_BASE_URL}/attendance`;
    if (selectedBatch && selectedBatch !== "all") {
      url += `?batchId=${selectedBatch}`;
    }
    if (selectedMentor && selectedMentor !== "all") {
      url += (url.includes('?') ? '&' : '?') + `mentorId=${selectedMentor}`;
    }
    try {
      const res = await fetch(url, {
        headers: { Accept: "application/json" },
        credentials: "include",
        signal,
      });
      if (res.ok) {
        const data = await res.json();
        setAttendances(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setIsModalOpen(true);
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

    const isActive = activeDays.length > 0 && activeDays.some(d =>
      d.getDate() === date.getDate() &&
      d.getMonth() === date.getMonth() &&
      d.getFullYear() === date.getFullYear()
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isToday = date.getTime() === today.getTime();

    // Calculate stats for this date
    const dateAtts = attendances.filter(d => d.date.startsWith(localDateStr));
    const hadir = dateAtts.filter(a => a.status.includes('Hadir')).length;
    const izin = dateAtts.filter(a => a.status.includes('Izin') || a.status.includes('Sakit')).length;
    const alpha = dateAtts.filter(a => a.status === 'Alpha').length;

    let inBatchRange = true;
    if (batchDetails?.startDate && batchDetails?.endDate) {
      const bStart = new Date(batchDetails.startDate);
      bStart.setHours(0, 0, 0, 0);
      const bEnd = new Date(batchDetails.endDate);
      bEnd.setHours(23, 59, 59, 999);
      const target = new Date(date);
      target.setHours(12, 0, 0, 0);
      inBatchRange = target >= bStart && target <= bEnd;
    }

    let cellBg = "bg-card hover:bg-secondary/20 cursor-pointer";
    let content = null;

    if (selectedBatch === "all") {
      cellBg = "bg-secondary/20 text-muted-foreground opacity-50 cursor-not-allowed";
      content = <div className="mt-auto text-[10px] text-center w-full">Pilih Batch Spesifik</div>;
    } else if (!inBatchRange) {
      cellBg = "bg-secondary/20 text-muted-foreground opacity-50 cursor-not-allowed";
    } else if (holiday || isWeekend) {
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
    } else {
      content = (
        <div className="mt-auto pt-2 flex flex-col gap-1 w-full">
          {dateAtts.length > 0 ? (
            <>
              <div className="flex justify-between items-center bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-sm">
                <span className="text-[9px] font-bold">Hadir</span>
                <span className="text-[10px] font-bold">{hadir}</span>
              </div>
              <div className="flex justify-between items-center bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-sm">
                <span className="text-[9px] font-bold">Izin</span>
                <span className="text-[10px] font-bold">{izin}</span>
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
          if (selectedBatch !== "all" && inBatchRange && !holiday && !isFriday && !isWeekend) {
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

  // Get data for the selected date modal
  let selectedDateAtts: any[] = [];
  let chartData: any[] = [];

  if (selectedDate) {
    const tzOffset = selectedDate.getTimezoneOffset() * 60000;
    const localDateStr = (new Date(selectedDate.getTime() - tzOffset)).toISOString().split('T')[0];
    selectedDateAtts = attendances.filter(d => d.date.startsWith(localDateStr));

    const hadir = selectedDateAtts.filter(a => a.status.includes('Hadir')).length;
    const izin = selectedDateAtts.filter(a => a.status.includes('Izin') || a.status.includes('Sakit')).length;
    const alpha = selectedDateAtts.filter(a => a.status === 'Alpha').length;

    chartData = [
      { name: "Hadir", value: hadir, fill: "#10b981" }, // emerald-500
      { name: "Izin/Sakit", value: izin, fill: "#f59e0b" }, // amber-500
      { name: "Alpha", value: alpha, fill: "#ef4444" }, // red-500
    ];
  }

  const chartConfig = {
    Hadir: { label: "Hadir", color: "#10b981" },
    "Izin/Sakit": { label: "Izin/Sakit", color: "#f59e0b" },
    Alpha: { label: "Alpha", color: "#ef4444" },
  };

  // Generate line chart data for current month
  const monthlyChartData = [];
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  let activeDaysMonth = 0;

  if (selectedBatch !== "all") {
    for (let d = 1; d <= daysInMonth; d++) {
      const iterDate = new Date(month.getFullYear(), month.getMonth(), d);

      const iterLocalDateStr = new Date(iterDate.getTime() - iterDate.getTimezoneOffset() * 60000).toISOString().split('T')[0];

      const isDayActive = activeDays.some(ad => ad.getDate() === iterDate.getDate() && ad.getMonth() === iterDate.getMonth());
      const isHoliday = holidays.some(h => h.date === iterLocalDateStr);
      const isWeekend = iterDate.getDay() === 0 || iterDate.getDay() === 6;
      const isFriday = iterDate.getDay() === 5;

      if (isDayActive && !isHoliday && !isWeekend && !isFriday) {
        activeDaysMonth++;

        const dayAtts = attendances.filter(a => a.date.startsWith(iterLocalDateStr));
        const hadirCount = dayAtts.filter(a => a.status.includes('Hadir')).length;
        const izinCount = dayAtts.filter(a => a.status.includes('Izin') || a.status.includes('Sakit')).length;
        const alphaCount = dayAtts.filter(a => a.status === 'Alpha').length;

        monthlyChartData.push({
          name: d.toString(),
          Hadir: hadirCount,
          "Izin/Sakit": izinCount,
          Alpha: alphaCount,
        });
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h2 className="font-heading font-bold text-lg flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-brand-purple" />
            Rekap Absensi Global (Kalender)
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Pantau statistik harian dari seluruh siswa di dalam suatu Batch.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <Select value={selectedBatch} onValueChange={(val) => {
            if (val) {
              setSelectedBatch(val);
              setSelectedMentor("all");
            }
          }}>
            <SelectTrigger className="w-full sm:w-[200px] h-10 text-sm bg-secondary/50 font-semibold">
              <SelectValue placeholder="Pilih Batch">
                {selectedBatch === "all" ? "Semua Batch (Pilih Spesifik)" : batches.find(b => b.id === selectedBatch)?.name}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Batch (Pilih Spesifik)</SelectItem>
              {batches.map(b => (
                <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedBatch !== "all" && mentorsList.length > 0 && (
            <Select value={selectedMentor} onValueChange={(val) => val && setSelectedMentor(val)}>
              <SelectTrigger className="w-full sm:w-[200px] h-10 text-sm bg-secondary/50 font-semibold">
                <SelectValue placeholder="Filter Mentor">
                  {selectedMentor === "all" ? "Semua Mentor" : mentorsList.find(m => m.id === selectedMentor)?.name}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Mentor</SelectItem>
                {mentorsList.map((m: any) => (
                  <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      <Card className="border-border shadow-sm w-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-brand-purple" />
            Kalender Statistik Admin
          </CardTitle>
          <CardDescription className="text-sm">
            Klik hari pada kalender untuk melihat grafik absensi harian secara rinci.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selectedBatch === "all" ? (
            <div className="py-24 text-center border rounded-xl bg-secondary/20">
              <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-bold text-foreground">Pilih Batch Terlebih Dahulu</h3>
              <p className="text-muted-foreground text-sm mt-2 max-w-md mx-auto">
                Kalender membutuhkan konteks Batch untuk menentukan hari libur dan menampilkan data absen dengan akurat.
              </p>
            </div>
          ) : activeDays.length === 0 && !loading ? (
            <Alert variant="destructive" className="mb-4 text-sm p-3 h-auto leading-tight">
              <AlertDescription>
                Tanggal mulai/selesai Batch ini belum diatur, sehingga hari aktif kosong.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="w-full bg-background rounded-xl border p-4 shadow-sm">
              <Calendar
                mode="single"
                className="w-full"
                month={month}
                onMonthChange={setMonth}
                startMonth={batchDetails?.startDate ? new Date(batchDetails.startDate) : undefined}
                endMonth={batchDetails?.endDate ? new Date(batchDetails.endDate) : undefined}
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
                  day: "min-h-[140px] w-full p-0 relative",
                  button_previous: "absolute left-0 top-1 h-8 w-8 bg-background hover:bg-secondary border rounded-md flex items-center justify-center z-20",
                  button_next: "absolute right-0 top-1 h-8 w-8 bg-background hover:bg-secondary border rounded-md flex items-center justify-center z-20",
                  nav: "absolute inset-x-0 top-0 flex w-full items-center justify-between pointer-events-none [&>*]:pointer-events-auto",
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {selectedBatch !== "all" && (
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

            {monthlyChartData.length === 0 ? (
              <div className="py-12 text-center border rounded-xl bg-secondary/10">
                <p className="text-muted-foreground">Tidak ada hari aktif pada bulan ini.</p>
              </div>
            ) : (
              <div className="h-[300px] w-full">
                <ChartContainer config={chartConfig} className="h-full w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
      )}

      {/* Admin Chart Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="w-[95vw] max-w-6xl sm:max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl text-brand-purple flex items-center gap-2">
              <BarChart3 className="w-6 h-6" />
              Statistik Harian - {selectedDate?.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </DialogTitle>
            <DialogDescription className="text-sm">
              Distribusi kehadiran siswa pada hari tersebut.
            </DialogDescription>
          </DialogHeader>

          <div className="my-6">
            {selectedDateAtts.length === 0 ? (
              <div className="text-center py-12 bg-secondary/20 rounded-xl border">
                <p className="text-muted-foreground">Belum ada data absensi untuk hari ini.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="h-[250px] w-full">
                  <ChartContainer config={chartConfig} className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={2}
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip content={<ChartTooltipContent />} />
                        <Legend verticalAlign="bottom" height={36} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>

                <div className="space-y-4">
                  <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 flex justify-between items-center">
                    <span className="font-semibold text-emerald-800">Total Hadir</span>
                    <span className="text-2xl font-bold text-emerald-700">{chartData[0].value}</span>
                  </div>
                  <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 flex justify-between items-center">
                    <span className="font-semibold text-amber-800">Total Izin / Sakit</span>
                    <span className="text-2xl font-bold text-amber-700">{chartData[1].value}</span>
                  </div>
                  <div className="bg-red-50 border border-red-100 rounded-lg p-4 flex justify-between items-center">
                    <span className="font-semibold text-red-800">Total Alpha</span>
                    <span className="text-2xl font-bold text-red-700">{chartData[2].value}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Per-Mentor Breakdown Table (Only shown when "Semua Mentor" filter is active) */}
            {selectedDateAtts.length > 0 && selectedMentor === "all" && mentorsList.length > 0 && (
              <div className="mt-8 border-t border-border pt-6 space-y-4 font-sans">
                <div className="flex items-center justify-between">
                  <h4 className="font-heading font-bold text-sm text-foreground flex items-center gap-2">
                    <Users className="w-4 h-4 text-brand-purple" />
                    Rincian Kehadiran Per-Mentor
                  </h4>
                  <span className="text-xs text-muted-foreground font-medium">
                    Menampilkan {mentorsList.length} Mentor
                  </span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-2xs">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-secondary/40 text-muted-foreground font-semibold uppercase tracking-wider text-[10px] border-b border-border">
                      <tr>
                        <th className="px-4 py-3">Nama Mentor</th>
                        <th className="px-4 py-3 text-center">Hadir</th>
                        <th className="px-4 py-3 text-center">Izin / Sakit</th>
                        <th className="px-4 py-3 text-center">Alpha</th>
                        <th className="px-4 py-3 text-center">Total Absen</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {mentorsList.map((mentor: any) => {
                        const mAtts = selectedDateAtts.filter((a) => a.mentorId === mentor.id);
                        const mHadir = mAtts.filter((a) => a.status.includes('Hadir')).length;
                        const mIzin = mAtts.filter((a) => a.status.includes('Izin') || a.status.includes('Sakit')).length;
                        const mAlpha = mAtts.filter((a) => a.status === 'Alpha').length;
                        const mTotal = mAtts.length;

                        return (
                          <tr key={mentor.id} className="hover:bg-secondary/20 transition-colors">
                            <td className="px-4 py-3 font-semibold text-foreground flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-brand-purple/10 text-brand-purple flex items-center justify-center font-bold text-xs shrink-0">
                                {mentor.name?.charAt(0).toUpperCase() || 'M'}
                              </div>
                              <div>
                                <p className="font-bold">{mentor.name}</p>
                                <p className="text-[10px] text-muted-foreground">{mentor.email || ''}</p>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center font-bold text-emerald-600 bg-emerald-50/50">
                              {mHadir}
                            </td>
                            <td className="px-4 py-3 text-center font-bold text-amber-600 bg-amber-50/50">
                              {mIzin}
                            </td>
                            <td className="px-4 py-3 text-center font-bold text-red-600 bg-red-50/50">
                              {mAlpha}
                            </td>
                            <td className="px-4 py-3 text-center font-semibold text-foreground">
                              {mTotal} Records
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
