import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QRCodeSVG } from "qrcode.react";
import { ArrowLeft, QrCode, Users, CheckCircle, XCircle, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Student {
  id: string;
  name: string;
  status: "present" | "absent" | "pending";
}

const MOCK_COURSES = [
  { id: "CS101", name: "Introduction to Programming", crn: "12345" },
  { id: "CS201", name: "Data Structures", crn: "12346" },
  { id: "CS301", name: "Web Development", crn: "12347" },
];

const MOCK_STUDENTS: Student[] = [
  { id: "S001", name: "Abdulla Ahmed Hasan", status: "pending" },
  { id: "S002", name: "Saed Nasser Saeed", status: "pending" },
  { id: "S003", name: "Salem Ali Salem", status: "pending" },
  { id: "S004", name: "Saif Abdulla Salem", status: "pending" },
  { id: "S005", name: "Mohammed Ahmed Moosa", status: "pending" },
  { id: "S006", name: "Abdulla Sarhan Mohammed", status: "pending" },
  { id: "S007", name: "Yousef Saeed Bakhit", status: "pending" },
  { id: "S008", name: "Saoud Abdulrahman Saeed", status: "pending" },
];

const FacultyDashboard = () => {
  const [selectedCourse, setSelectedCourse] = useState("");
  const [showQR, setShowQR] = useState(false);
  const [qrData, setQrData] = useState("");
  const [timeLeft, setTimeLeft] = useState(30);
  const [students, setStudents] = useState<Student[]>(MOCK_STUDENTS);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showQR && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setShowQR(false);
            setIsActive(false);
            toast.success("Attendance session closed");
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showQR, timeLeft]);

  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        setStudents((prev) =>
          prev.map((student) => {
            if (student.status === "pending" && Math.random() > 0.7) {
              toast.success(`${student.name} marked present`);
              return { ...student, status: "present" as const };
            }
            return student;
          })
        );
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isActive]);

  const handleStartAttendance = () => {
    if (!selectedCourse) {
      toast.error("Please select a course first");
      return;
    }

    const course = MOCK_COURSES.find((c) => c.id === selectedCourse);
    const timestamp = new Date().toISOString();
    const qrContent = JSON.stringify({
      crn: course?.crn,
      courseId: selectedCourse,
      timestamp,
      expiresAt: new Date(Date.now() + 30000).toISOString(),
    });

    setQrData(qrContent);
    setShowQR(true);
    setIsActive(true);
    setTimeLeft(30);
    setStudents(MOCK_STUDENTS.map((s) => ({ ...s, status: "pending" })));
    toast.success("Attendance session started");
  };

  const presentCount = students.filter((s) => s.status === "present").length;
  const absentCount = students.filter((s) => s.status === "absent").length;
  const pendingCount = students.filter((s) => s.status === "pending").length;

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Faculty Dashboard</h1>
                <p className="text-sm text-muted-foreground">Sharjah Education Academy</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card className="mb-8 border-none p-6 shadow-medium">
              <h2 className="mb-4 text-xl font-semibold text-card-foreground">
                Course Selection
              </h2>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger className="sm:w-[300px]">
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOCK_COURSES.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.name} (CRN: {course.crn})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleStartAttendance}
                  disabled={!selectedCourse || isActive}
                  className="bg-gradient-primary shadow-medium"
                >
                  <QrCode className="mr-2 h-5 w-5" />
                  Start Auto Attendance
                </Button>
              </div>
            </Card>

            <Card className="border-none p-6 shadow-medium">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-card-foreground">
                  Live Attendance Status
                </h2>
                {isActive && (
                  <div className="flex items-center gap-2 text-sm text-primary">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                    Session Active
                  </div>
                )}
              </div>

              <div className="mb-6 grid grid-cols-3 gap-4">
                <div className="rounded-lg bg-success/10 p-4 text-center">
                  <CheckCircle className="mx-auto mb-2 h-6 w-6 text-success" />
                  <div className="text-2xl font-bold text-success">{presentCount}</div>
                  <div className="text-sm text-muted-foreground">Present</div>
                </div>
                <div className="rounded-lg bg-muted p-4 text-center">
                  <Clock className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
                  <div className="text-2xl font-bold text-muted-foreground">{pendingCount}</div>
                  <div className="text-sm text-muted-foreground">Pending</div>
                </div>
                <div className="rounded-lg bg-destructive/10 p-4 text-center">
                  <XCircle className="mx-auto mb-2 h-6 w-6 text-destructive" />
                  <div className="text-2xl font-bold text-destructive">{absentCount}</div>
                  <div className="text-sm text-muted-foreground">Absent</div>
                </div>
              </div>

              <div className="space-y-2">
                {students.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between rounded-lg border bg-card p-3 transition-all hover:shadow-soft"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          student.status === "present"
                            ? "bg-success"
                            : student.status === "absent"
                            ? "bg-destructive"
                            : "bg-muted-foreground"
                        }`}
                      />
                      <span className="font-medium text-card-foreground">{student.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {student.status === "present" && (
                        <CheckCircle className="h-5 w-5 text-success" />
                      )}
                      {student.status === "absent" && (
                        <XCircle className="h-5 w-5 text-destructive" />
                      )}
                      {student.status === "pending" && (
                        <Clock className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div>
            <Card className="sticky top-8 border-none p-6 shadow-medium">
              <div className="mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold text-card-foreground">Session Info</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-muted-foreground">Date</div>
                  <div className="font-medium text-card-foreground">
                    {new Date().toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Time</div>
                  <div className="font-medium text-card-foreground">
                    {new Date().toLocaleTimeString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Total Students</div>
                  <div className="font-medium text-card-foreground">{students.length}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Attendance Rate</div>
                  <div className="font-medium text-card-foreground">
                    {((presentCount / students.length) * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Scan QR Code to Mark Attendance</DialogTitle>
            <DialogDescription>
              Students should scan this code within {timeLeft} seconds
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-6 py-6">
            <div className="relative">
              <div className="absolute inset-0 animate-pulse rounded-2xl bg-gradient-primary opacity-20 blur-xl" />
              <div className="relative rounded-2xl bg-white p-6 shadow-large">
                <QRCodeSVG value={qrData} size={256} level="H" />
              </div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-primary">{timeLeft}s</div>
              <div className="text-sm text-muted-foreground">Time remaining</div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FacultyDashboard;
