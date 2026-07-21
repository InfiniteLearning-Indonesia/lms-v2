import { useEffect, useState, useRef, useCallback } from "react";
import { Loader2, Calendar as CalendarIcon, AlertTriangle, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Calendar } from "@/components/ui/calendar";

export function StudentAttendance({ batchId, studentId }: { batchId: string, studentId: string }) {
  const [attendances, setAttendances] = useState<any[]>([]);
  const [activeDays, setActiveDays] = useState<Date[]>([]);
  const [holidays, setHolidays] = useState<{ date: string, name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [batch, setBatch] = useState<any>(null);
  
  // Calendar Month State
  const [month, setMonth] = useState<Date>(new Date());
  
  // SP Popup logic
  const [spLevel, setSpLevel] = useState<number>(0);
  const [spPopupOpen, setSpPopupOpen] = useState(false);
  const [spAgreed, setSpAgreed] = useState(false);
  const [spCountdown, setSpCountdown] = useState(60);
  const spTimerRef = useRef<NodeJS.Timeout | null>(null);

  const startSpCountdown = useCallback(() => {
    setSpCountdown(60);
    if (spTimerRef.current) clearInterval(spTimerRef.current);
    spTimerRef.current = setInterval(() => {
      setSpCountdown((prev) => {
        if (prev <= 1) {
          if (spTimerRef.current) clearInterval(spTimerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

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
          // Auto set calendar month to current month if within range, else to start date
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

    fetch(`http://localhost:7000/attendance?batchId=${batchId}&studentId=${studentId}`, {
      headers: { Accept: "application/json" },
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => {
        setAttendances(Array.isArray(data) ? data : []);
        setLoading(false);
        
        if (Array.isArray(data) && data.length > 0) {
          const maxSp = Math.max(...data.map((d: any) => d.spLevel || 0));
          if (maxSp > 0) {
            setSpLevel(maxSp);
            setSpPopupOpen(true);
            startSpCountdown();
          }
        }
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
      
    return () => {
      if (spTimerRef.current) clearInterval(spTimerRef.current);
    }
  }, [batchId, studentId, startSpCountdown]);

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

  const getSPContent = (level: number) => {
    if (level === 1) return { title: "SURAT PERINGATAN 1 (SP1)", color: "bg-amber-500", txtColor: "text-amber-500" };
    if (level === 2) return { title: "SURAT PERINGATAN 2 (SP2)", color: "bg-orange-500", txtColor: "text-orange-500" };
    return { title: "SURAT PERINGATAN 3 (SP3)", color: "bg-red-600", txtColor: "text-red-600" };
  };

  const spContent = spLevel > 0 ? getSPContent(spLevel) : null;
  
  // Calculate stats
  const hadir = attendances.filter(a => a.status.includes('Hadir')).length;
  const izin = attendances.filter(a => a.status.includes('Izin')).length;
  const alpha = attendances.filter(a => a.status === 'Alpha').length;

  const CustomDayButton = ({ day, modifiers, ...props }: any) => {
    const date = day.date;
    if (modifiers.outside || day.outside) {
      return <div className="h-full w-full opacity-0 pointer-events-none"></div>;
    }

    const tzOffset = date.getTimezoneOffset() * 60000;
    const localDateStr = (new Date(date.getTime() - tzOffset)).toISOString().split('T')[0];

    // Check holiday
    const holiday = holidays.find(h => h.date === localDateStr);
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Check attendance
    const attendance = attendances.find(a => a.date.startsWith(localDateStr));
    
    // Check if it's an active day (not weekend, not holiday, and within batch range)
    const isActive = activeDays.some(d => 
      d.getDate() === date.getDate() && 
      d.getMonth() === date.getMonth() && 
      d.getFullYear() === date.getFullYear()
    );

    // Is it a past/future day?
    const today = new Date();
    today.setHours(0,0,0,0);
    const isPast = date < today;
    const isToday = date.getTime() === today.getTime();

    // Determine cell styling
    let cellBg = "bg-card";
    let statusBadge = null;

    if (holiday || isWeekend) {
      cellBg = "bg-secondary/40 border-dashed text-muted-foreground";
      statusBadge = (
        <div className="mt-auto pt-2 text-[10px] font-medium leading-tight opacity-70">
          {holiday ? holiday.name : "Weekend"}
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
      // Past active day without attendance -> missing
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
      {/* SP Popup */}
      {spContent && (
        <AlertDialog open={spPopupOpen}>
          <AlertDialogContent className="max-w-xl max-h-[90vh] overflow-hidden p-0 border border-border shadow-2xl">
            <div className={`${spContent.color} px-6 py-5 relative overflow-hidden`}>
              <div className="relative flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-white" />
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">{spContent.title}</h2>
                  <p className="text-white/80 text-xs font-medium">Batas ketidakhadiran telah terlampaui.</p>
                </div>
              </div>
            </div>
            <div className="px-6 py-5 space-y-4 text-sm text-foreground">
              <p>Anda telah mencapai <strong>Alpha (tidak hadir tanpa keterangan)</strong> melewati batas toleransi bulan ini.</p>
              <p>Satu tingkat Alpha lagi berpotensi menyebabkan sanksi yang lebih berat hingga suspend otomatis dari sistem.</p>
              
              <label className={`flex items-start gap-3 mt-4 ${spCountdown > 0 ? 'opacity-50' : 'cursor-pointer'}`}>
                <input
                  type="checkbox"
                  checked={spAgreed}
                  onChange={e => setSpAgreed(e.target.checked)}
                  disabled={spCountdown > 0}
                  className="mt-1"
                />
                <span className="text-xs text-muted-foreground">
                  Saya telah membaca peringatan ini dan akan berkomitmen untuk memperbaiki kehadiran saya.
                </span>
              </label>
            </div>
            <AlertDialogFooter className="px-6 pb-5 pt-0">
              <AlertDialogAction
                disabled={spCountdown > 0 || !spAgreed}
                onClick={() => setSpPopupOpen(false)}
                className={`w-full ${spCountdown > 0 || !spAgreed ? 'bg-secondary' : spContent.color} text-white`}
              >
                {spCountdown > 0 ? `Mohon dibaca (${spCountdown}s)` : 'Saya Mengerti dan Setuju'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-emerald-50 border-emerald-100 shadow-sm">
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-semibold text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Hadir
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-700">{hadir}</div>
          </CardContent>
        </Card>
        <Card className="bg-amber-50 border-amber-100 shadow-sm">
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-semibold text-amber-800 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Izin / Sakit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-700">{izin}</div>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-100 shadow-sm">
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-semibold text-red-800 flex items-center gap-2">
              <XCircle className="w-4 h-4" /> Alpha
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-700">{alpha}</div>
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
