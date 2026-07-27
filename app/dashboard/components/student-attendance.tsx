import { useEffect, useState } from "react";
import { Loader2, Calendar as CalendarIcon, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";

export function StudentAttendance({ batchId, studentId }: { batchId: string, studentId: string }) {
  const [attendances, setAttendances] = useState<any[]>([]);
  const [activeDays, setActiveDays] = useState<Date[]>([]);
  const [holidays, setHolidays] = useState<{ date: string, name: string }[]>([]);
  const [mentorAsyncDays, setMentorAsyncDays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [batch, setBatch] = useState<any>(null);
  
  // Calendar Month State
  const [month, setMonth] = useState<Date>(new Date());
  
  useEffect(() => {
    if (!batchId) return;

    // Fetch batch details to get startDate and endDate
    fetch(`http://localhost:7000/classes/batches`, {
      headers: { Accept: "application/json" },
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => {
        const found = data.find((b: any) => b.id === batchId);
        if (found) {
          setBatch(found);
          const now = new Date();
          const start = found.startDate ? new Date(found.startDate) : now;
          const end = found.endDate ? new Date(found.endDate) : now;
          if (now < start) setMonth(start);
          else if (now > end) setMonth(end);
          else setMonth(now);
        }
      })
      .catch(console.error);

    fetch(`http://localhost:7000/attendance/active-days/${batchId}`, {
      headers: { Accept: "application/json" },
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => {
        if (data.days) {
          setActiveDays(data.days.map((d: string) => new Date(d)));
        }
        if (data.holidays) {
          setHolidays(data.holidays);
        }
      })
      .catch(console.error);

    // Fetch student mentor async days
    fetch(`http://localhost:7000/classes/attendance/async-days/student`, {
      headers: { Accept: "application/json" },
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => {
        setMentorAsyncDays(Array.isArray(data) ? data : []);
      })
      .catch(console.error);

    fetch(`http://localhost:7000/attendance?batchId=${batchId}&studentId=${studentId}`, {
      headers: { Accept: "application/json" },
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => {
        setAttendances(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [batchId, studentId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <Loader2 className="w-8 h-8 text-brand-purple animate-spin" />
        <p className="mt-4 text-xs text-muted-foreground animate-pulse font-heading">
          Memuat riwayat kehadiran...
        </p>
      </div>
    );
  }

  // Filter attendances for current selected calendar month
  const selectedMonthName = month.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
  const monthlyAttendances = attendances.filter(a => {
    const d = new Date(a.date);
    return d.getMonth() === month.getMonth() && d.getFullYear() === month.getFullYear();
  });

  // Calculate monthly stats
  const hadir = monthlyAttendances.filter(a => a.status.includes('Hadir')).length;
  const izin = monthlyAttendances.filter(a => a.status.includes('Izin') || a.status.includes('Sakit')).length;
  const alpha = monthlyAttendances.filter(a => a.status === 'Alpha').length;

  // Calculate Option A Required Days & Attendance Percentage
  const daysInCurrentMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  let requiredActiveDaysCount = 0;
  for (let d = 1; d <= daysInCurrentMonth; d++) {
    const iterDate = new Date(month.getFullYear(), month.getMonth(), d);
    const iterLocalDateStr = new Date(iterDate.getTime() - iterDate.getTimezoneOffset() * 60000).toISOString().split('T')[0];
    const isDayActive = activeDays.some(ad => ad.getDate() === iterDate.getDate() && ad.getMonth() === iterDate.getMonth());
    const isHoliday = holidays.some(h => h.date === iterLocalDateStr);
    const isWeekend = iterDate.getDay() === 0 || iterDate.getDay() === 6;
    const isFriday = iterDate.getDay() === 5;
    const isAsync = isFriday || mentorAsyncDays.some((a: any) => a.date === iterLocalDateStr);

    if (isDayActive && !isHoliday && !isWeekend && !isAsync) {
      requiredActiveDaysCount++;
    }
  }

  const attendancePercentage = requiredActiveDaysCount > 0
    ? Math.min(100, Math.round((hadir / requiredActiveDaysCount) * 100))
    : 100;

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
    const isMentorAsync = mentorAsyncDays.some((a: any) => a.date === localDateStr);

    const attendance = attendances.find(a => a.date.startsWith(localDateStr));
    
    const isActive = activeDays.some(d => 
      d.getDate() === date.getDate() && 
      d.getMonth() === date.getMonth() && 
      d.getFullYear() === date.getFullYear()
    );

    const today = new Date();
    today.setHours(0,0,0,0);
    const isPast = date < today;
    const isToday = date.getTime() === today.getTime();

    let cellBg = "bg-card";
    let statusBadge = null;

    if (holiday || isWeekend) {
      const label = holiday ? (holiday.name || "Libur Nasional") : "Weekend (Libur)";
      cellBg = "bg-red-500/10 border-red-500/30 text-red-600 font-medium";
      statusBadge = (
        <div className="mt-auto pt-2">
          <span className="inline-flex items-center rounded-sm bg-red-100 dark:bg-red-950 px-1.5 py-0.5 text-[10px] font-bold text-red-700 dark:text-red-300 border border-red-200">
            {label}
          </span>
        </div>
      );
    } else if (isFriday || isMentorAsync) {
      const badgeText = isFriday ? "Hari Asynchronous (Jumat)" : "Hari Asynchronous";
      cellBg = "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 font-medium";
      statusBadge = (
        <div className="mt-auto pt-2">
          <span className="inline-flex items-center rounded-sm bg-emerald-100 dark:bg-emerald-950 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200">
            {badgeText}
          </span>
        </div>
      );
    } else if (!isActive) {
      cellBg = "bg-secondary/20 text-muted-foreground opacity-50";
    } else if (attendance) {
      if (attendance.status.includes('Hadir')) {
        cellBg = "bg-emerald-50 border-emerald-200";
        statusBadge = (
          <div className="mt-auto pt-2">
            <span className="inline-flex items-center rounded-sm bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">
              {attendance.status}
            </span>
          </div>
        );
      } else if (attendance.status.includes('Izin') || attendance.status.includes('Sakit')) {
        cellBg = "bg-amber-50 border-amber-200";
        statusBadge = (
          <div className="mt-auto pt-2">
            <span className="inline-flex items-center rounded-sm bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
              {attendance.status}
            </span>
          </div>
        );
      } else {
        cellBg = "bg-red-50 border-red-200";
        statusBadge = (
          <div className="mt-auto pt-2">
            <span className="inline-flex items-center rounded-sm bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-800">
              Alpha
            </span>
          </div>
        );
      }
    } else if (isPast) {
      cellBg = "bg-card";
      statusBadge = (
        <div className="mt-auto pt-2">
          <span className="text-[10px] italic text-muted-foreground">Belum Diisi</span>
        </div>
      );
    }

    return (
      <div 
        {...props}
        className={`h-full w-full p-2.5 border rounded-lg flex flex-col items-start transition-all ${cellBg} ${isToday ? 'ring-2 ring-brand-purple' : ''}`}
      >
        <div className={`text-xs font-semibold ${isToday ? 'text-brand-purple' : ''}`}>
          {date.getDate()}
        </div>
        {statusBadge}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="bg-emerald-50 border-emerald-100 shadow-sm">
          <CardHeader className="py-4 pb-2">
            <CardTitle className="text-sm font-semibold text-emerald-800 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Hadir
              </span>
              <span className="text-[10px] font-normal text-emerald-700/80 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                {selectedMonthName}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-700">{hadir}</div>
          </CardContent>
        </Card>
        <Card className="bg-amber-50 border-amber-100 shadow-sm">
          <CardHeader className="py-4 pb-2">
            <CardTitle className="text-sm font-semibold text-amber-800 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" /> Izin / Sakit
              </span>
              <span className="text-[10px] font-normal text-amber-700/80 bg-amber-100/80 px-2 py-0.5 rounded-md">
                {selectedMonthName}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-700">{izin}</div>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-100 shadow-sm">
          <CardHeader className="py-4 pb-2">
            <CardTitle className="text-sm font-semibold text-red-800 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <XCircle className="w-4 h-4" /> Alpha
              </span>
              <span className="text-[10px] font-normal text-red-700/80 bg-red-100/80 px-2 py-0.5 rounded-md">
                {selectedMonthName}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-700">{alpha}</div>
          </CardContent>
        </Card>
        <Card className="bg-brand-purple/5 border-brand-purple/20 shadow-sm">
          <CardHeader className="py-4 pb-2">
            <CardTitle className="text-sm font-semibold text-brand-purple flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" /> Kehadiran (Opsi A)
              </span>
              <span className="text-[10px] font-normal text-brand-purple bg-brand-purple/10 px-2 py-0.5 rounded-md">
                {requiredActiveDaysCount} Hari Wajib
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-brand-purple">{attendancePercentage}%</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border shadow-sm w-full">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-brand-purple" />
            Riwayat Kehadiran (Full Calendar)
          </CardTitle>
          <CardDescription>
            Lihat rekaman kehadiran secara visual pada kalender tiap bulannya.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full bg-background rounded-xl shadow-sm border p-4">
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
    </div>
  );
}
