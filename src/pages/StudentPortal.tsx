import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, QrCode, CheckCircle, Clock, Calendar, ChevronDown, ChevronUp } from "lucide-react";
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
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Student Portal</h1>
              <p className="text-sm text-muted-foreground">Sharjah Education Academy</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="border-none p-4 shadow-sm text-center">
            <p className="text-sm text-muted-foreground mb-1">Attendance</p>
            <p className="text-3xl font-bold text-primary">{attendanceRate.toFixed(0)}%</p>
          </Card>
          <Card className="border-none p-4 shadow-sm text-center">
            <p className="text-sm text-muted-foreground mb-1">Present</p>
            <p className="text-3xl font-bold text-success">{presentCount}</p>
          </Card>
          <Card className="border-none p-4 shadow-sm text-center">
            <p className="text-sm text-muted-foreground mb-1">Total</p>
            <p className="text-3xl font-bold text-foreground">{totalClasses}</p>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="scan" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="scan" className="flex-1 gap-2">
              <QrCode className="h-4 w-4" /> Scan
            </TabsTrigger>
            <TabsTrigger value="history" className="flex-1 gap-2">
              <Calendar className="h-4 w-4" /> History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scan">
            <Card className="border-none p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <QrCode className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-semibold text-card-foreground">Mark Your Attendance</h2>
              </div>
              <p className="mb-6 text-sm text-muted-foreground">
                Scan the QR code displayed by your instructor or enter the code manually
              </p>
              <div className="rounded-lg border-2 border-dashed border-primary/20 bg-primary/5 p-8 text-center">
                <QrCode className="mx-auto mb-4 h-16 w-16 text-primary" />
                <p className="mb-4 text-sm text-muted-foreground">
                  Camera access for QR scanning will be available in mobile app
                </p>
                <Button onClick={handleScanQR} className="bg-gradient-primary shadow-medium">
                  Scan QR Code
                </Button>
              </div>
              <div className="mt-6 rounded-lg bg-primary/5 p-4">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Tip:</strong> Make sure to scan the QR code
                  within 30 seconds when your instructor displays it.
                </p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card className="border-none p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Calendar className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-semibold text-card-foreground">Attendance History</h2>
              </div>
              <div className="divide-y">
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
                      <CollapsibleTrigger className="w-full py-4 flex items-center justify-between hover:bg-muted/50 rounded-lg px-3 transition-colors">
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-mono text-muted-foreground">{group.courseCode}</span>
                            <span className="font-medium text-card-foreground">{group.courseName}</span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="text-success">{attended} attended</span>
                            <span className="text-destructive">{missed} missed</span>
                            <span>{total} total</span>
                          </div>
                          <Progress value={rate} className="mt-2 h-1.5" />
                        </div>
                        <div className="ml-4 flex items-center gap-3">
                          <span className="text-sm font-bold text-primary">{rate.toFixed(0)}%</span>
                          {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="space-y-1 pb-3 pl-3 pr-3">
                          {group.records.map((record) => (
                            <div key={record.id} className="flex items-center justify-between rounded-lg border bg-card p-3 text-sm">
                              <div className="flex items-center gap-4 text-muted-foreground">
                                <span>{record.date}</span>
                                <span>{record.time}</span>
                              </div>
                              {record.status === "present" ? (
                                <div className="flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-0.5">
                                  <CheckCircle className="h-3.5 w-3.5 text-success" />
                                  <span className="text-xs font-medium text-success">Present</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5 rounded-full bg-destructive/10 px-2.5 py-0.5">
                                  <Clock className="h-3.5 w-3.5 text-destructive" />
                                  <span className="text-xs font-medium text-destructive">Absent</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  );
                })}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StudentPortal;
