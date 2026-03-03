import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, QrCode, CheckCircle, Clock, Calendar, ChevronDown, ChevronUp, BarChart3, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface AttendanceRecord {
  id: string;
  courseCode: string;
  courseName: string;
  date: string;
  time: string;
  status: "present" | "absent";
}

const MOCK_HISTORY: AttendanceRecord[] = [
  { id: "1", courseCode: "EDEL 9101E", courseName: "Introduction to Programming", date: "2025-10-26", time: "10:00 AM", status: "present" },
  { id: "2", courseCode: "EDEL 9101E", courseName: "Introduction to Programming", date: "2025-10-19", time: "10:00 AM", status: "present" },
  { id: "3", courseCode: "EDEL 9101E", courseName: "Introduction to Programming", date: "2025-10-12", time: "10:00 AM", status: "absent" },
  { id: "4", courseCode: "EDEL 9201A", courseName: "Data Structures", date: "2025-10-25", time: "2:00 PM", status: "present" },
  { id: "5", courseCode: "EDEL 9201A", courseName: "Data Structures", date: "2025-10-18", time: "2:00 PM", status: "present" },
  { id: "6", courseCode: "CS 3010", courseName: "Web Development", date: "2025-10-24", time: "11:00 AM", status: "present" },
  { id: "7", courseCode: "CS 3010", courseName: "Web Development", date: "2025-10-17", time: "11:00 AM", status: "absent" },
];

const StatusBadge = ({ status }: { status: "present" | "absent" }) =>
  status === "present" ? (
    <div className="flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 sm:px-3">
      <CheckCircle className="h-3.5 w-3.5 text-success" />
      <span className="text-xs font-medium text-success">Present</span>
    </div>
  ) : (
    <div className="flex items-center gap-1.5 rounded-full bg-destructive/10 px-2.5 py-1 sm:px-3">
      <Clock className="h-3.5 w-3.5 text-destructive" />
      <span className="text-xs font-medium text-destructive">Absent</span>
    </div>
  );

const StudentPortal = () => {
  const [qrInput, setQrInput] = useState("");
  const [history, setHistory] = useState<AttendanceRecord[]>(MOCK_HISTORY);

  const handleScanQR = () => {
    if (!qrInput.trim()) {
      toast.error("Please enter QR code data");
      return;
    }
    try {
      const qrData = JSON.parse(qrInput);
      const expiresAt = new Date(qrData.expiresAt);
      if (new Date() > expiresAt) { toast.error("QR code has expired"); return; }
      const newRecord: AttendanceRecord = {
        id: Date.now().toString(),
        courseCode: qrData.courseCode || "MISC",
        courseName: `Course ${qrData.courseId}`,
        date: new Date().toISOString().split("T")[0],
        time: new Date().toLocaleTimeString(),
        status: "present",
      };
      setHistory([newRecord, ...history]);
      setQrInput("");
      toast.success("Attendance marked successfully!", { description: `You are present for ${newRecord.courseName}` });
    } catch { toast.error("Invalid QR code format"); }
  };

  const presentCount = history.filter((r) => r.status === "present").length;
  const absentCount = history.filter((r) => r.status === "absent").length;
  const totalClasses = history.length;
  const attendanceRate = totalClasses > 0 ? (presentCount / totalClasses) * 100 : 0;

  const courseGroups = useMemo(() => {
    const groups: Record<string, { courseCode: string; courseName: string; records: AttendanceRecord[] }> = {};
    history.forEach((r) => {
      if (!groups[r.courseCode]) {
        groups[r.courseCode] = { courseCode: r.courseCode, courseName: r.courseName, records: [] };
      }
      groups[r.courseCode].records.push(r);
    });
    return Object.values(groups);
  }, [history]);

  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">Student Portal</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Sharjah Education Academy</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-5 sm:py-6 space-y-5 sm:space-y-6 max-w-3xl">
        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <Card className="border-none p-3 sm:p-5 shadow-sm text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-primary/5 rounded-lg" />
            <div className="relative">
              <TrendingUp className="h-4 w-4 text-primary mx-auto mb-1.5 sm:mb-2" />
              <p className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground mb-0.5">Attendance</p>
              <p className="text-2xl sm:text-4xl font-bold text-primary">{attendanceRate.toFixed(0)}%</p>
            </div>
          </Card>
          <Card className="border-none p-3 sm:p-5 shadow-sm text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-success/5 rounded-lg" />
            <div className="relative">
              <CheckCircle className="h-4 w-4 text-success mx-auto mb-1.5 sm:mb-2" />
              <p className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground mb-0.5">Present</p>
              <p className="text-2xl sm:text-4xl font-bold text-success">{presentCount}</p>
            </div>
          </Card>
          <Card className="border-none p-3 sm:p-5 shadow-sm text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-muted/50 rounded-lg" />
            <div className="relative">
              <Calendar className="h-4 w-4 text-muted-foreground mx-auto mb-1.5 sm:mb-2" />
              <p className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground mb-0.5">Total</p>
              <p className="text-2xl sm:text-4xl font-bold text-foreground">{totalClasses}</p>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="scan" className="w-full">
          <TabsList className="w-full h-11">
            <TabsTrigger value="scan" className="flex-1 gap-2 text-sm">
              <QrCode className="h-4 w-4" /> Scan
            </TabsTrigger>
            <TabsTrigger value="attendance" className="flex-1 gap-2 text-sm">
              <BarChart3 className="h-4 w-4" /> Attendance
            </TabsTrigger>
          </TabsList>

          {/* ── Scan Tab ── */}
          <TabsContent value="scan" className="space-y-4 mt-4">
            <Card className="border-none p-5 sm:p-6 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <QrCode className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-card-foreground">Mark Your Attendance</h2>
              </div>
              <p className="mb-5 text-sm text-muted-foreground">
                Scan the QR code displayed by your instructor
              </p>
              <div className="rounded-xl border-2 border-dashed border-primary/20 bg-primary/5 p-6 sm:p-10 text-center">
                <div className="mx-auto mb-4 h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <QrCode className="h-10 w-10 sm:h-12 sm:w-12 text-primary" />
                </div>
                <p className="mb-5 text-sm text-muted-foreground">
                  Camera access for QR scanning will be available in mobile app
                </p>
                <Button onClick={handleScanQR} size="lg" className="bg-gradient-primary shadow-medium px-8">
                  Scan QR Code
                </Button>
              </div>
              <div className="mt-5 rounded-lg bg-primary/5 p-3.5">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  <strong className="text-foreground">Tip:</strong> Make sure to scan the QR code
                  within 30 seconds when your instructor displays it.
                </p>
              </div>
            </Card>

            {/* Recent attendance */}
            {history.length > 0 && (
              <Card className="border-none p-5 sm:p-6 shadow-sm">
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">Recent Attendance</h3>
                <div className="space-y-2">
                  {history.slice(0, 5).map((record) => (
                    <div key={record.id} className="flex items-center justify-between rounded-lg border bg-card p-3 sm:p-3.5">
                      <div className="flex-1 min-w-0 mr-3">
                        <span className="font-medium text-sm text-card-foreground line-clamp-1">{record.courseName}</span>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground mt-0.5">
                          <span>{record.date}</span>
                          <span>{record.time}</span>
                        </div>
                      </div>
                      <StatusBadge status={record.status} />
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </TabsContent>

          {/* ── Attendance Tab ── */}
          <TabsContent value="attendance" className="mt-4">
            <div className="space-y-3">
              {courseGroups.map((group) => {
                const attended = group.records.filter((r) => r.status === "present").length;
                const missed = group.records.filter((r) => r.status === "absent").length;
                const total = group.records.length;
                const rate = total > 0 ? (attended / total) * 100 : 0;
                const isOpen = expandedCourse === group.courseCode;

                return (
                  <Collapsible
                    key={group.courseCode}
                    open={isOpen}
                    onOpenChange={() => setExpandedCourse(isOpen ? null : group.courseCode)}
                  >
                    <Card className={`border shadow-sm overflow-hidden transition-shadow ${isOpen ? "shadow-md ring-1 ring-primary/10" : ""}`}>
                      <CollapsibleTrigger className="w-full p-4 sm:p-5 flex items-start sm:items-center justify-between hover:bg-muted/30 transition-colors gap-3">
                        <div className="flex-1 text-left min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1.5">
                            <span className="text-[10px] sm:text-xs font-mono bg-primary/10 text-primary px-2 py-0.5 rounded shrink-0">{group.courseCode}</span>
                            <span className="text-sm sm:text-base font-semibold text-card-foreground line-clamp-1">{group.courseName}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-muted-foreground mt-1">
                            <span className="text-success font-medium">{attended} attended</span>
                            <span className="text-destructive font-medium">{missed} missed</span>
                            <span>{total} total</span>
                          </div>
                          <Progress value={rate} className="mt-3 h-2 sm:h-2.5" />
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 shrink-0 pt-1 sm:pt-0">
                          <span className="text-base sm:text-xl font-bold text-primary">{rate.toFixed(0)}%</span>
                          {isOpen
                            ? <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                            : <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                          }
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="space-y-1.5 px-4 sm:px-5 pb-4 sm:pb-5 pt-2 border-t">
                          {group.records.map((record) => (
                            <div key={record.id} className="flex items-center justify-between rounded-lg border bg-muted/30 p-3 sm:p-3.5 text-sm">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-4 text-muted-foreground">
                                <span className="text-xs sm:text-sm">{record.date}</span>
                                <span className="text-xs sm:text-sm">{record.time}</span>
                              </div>
                              <StatusBadge status={record.status} />
                            </div>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StudentPortal;
