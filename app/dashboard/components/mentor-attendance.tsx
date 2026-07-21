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
      cellBg = "bg-red-50/50 border-dashed text-red-900/60 cursor-not-allowed";
      content = (
        <div className="mt-auto flex flex-col justify-end w-full">
          <span className="text-[10px] font-semibold bg-red-100 text-red-700 px-1.5 py-0.5 rounded-sm inline-block self-start leading-tight">
            {holiday ? holiday.name : "Weekend"}
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
          if (!holiday && !isWeekend && isActive) {
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
    
    // Check if it's an active day (not holiday, not weekend, and in activeDays)
    const isDayActive = activeDays.some(ad => ad.getDate() === iterDate.getDate() && ad.getMonth() === iterDate.getMonth());
    const isHoliday = holidays.some(h => h.date === iterLocalDateStr);
    const isWeekend = iterDate.getDay() === 0 || iterDate.getDay() === 6;

    if (isDayActive && !isHoliday && !isWeekend) {
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
