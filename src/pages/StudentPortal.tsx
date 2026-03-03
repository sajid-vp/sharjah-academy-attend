import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, QrCode, CheckCircle, Clock, Calendar, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface AttendanceRecord {
  id: string;
  courseName: string;
  date: string;
  time: string;
  status: "present" | "absent";
}

const MOCK_HISTORY: AttendanceRecord[] = [
  { id: "1", courseName: "Introduction to Programming", date: "2025-10-26", time: "10:00 AM", status: "present" },
  { id: "2", courseName: "Data Structures", date: "2025-10-25", time: "2:00 PM", status: "present" },
  { id: "3", courseName: "Web Development", date: "2025-10-24", time: "11:00 AM", status: "present" },
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
              <div className="space-y-2">
                {history.map((record) => (
                  <div key={record.id} className="flex items-center justify-between rounded-lg border bg-card p-4 transition-all hover:shadow-soft">
                    <div className="flex-1">
                      <div className="mb-1 font-medium text-card-foreground">{record.courseName}</div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{record.date}</span>
                        <span>{record.time}</span>
                      </div>
                    </div>
                    {record.status === "present" ? (
                      <div className="flex items-center gap-2 rounded-full bg-success/10 px-3 py-1">
                        <CheckCircle className="h-4 w-4 text-success" />
                        <span className="text-sm font-medium text-success">Present</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 rounded-full bg-destructive/10 px-3 py-1">
                        <Clock className="h-4 w-4 text-destructive" />
                        <span className="text-sm font-medium text-destructive">Absent</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StudentPortal;
