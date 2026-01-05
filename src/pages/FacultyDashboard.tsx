import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { QRCodeSVG } from "qrcode.react";
import { ArrowLeft, QrCode, Users, CheckCircle, XCircle, Clock, Calendar, BookOpen, MapPin, X, GripHorizontal, Maximize2, Minimize2, History, AlertCircle, Download, Filter, MoreHorizontal, CalendarIcon } from "lucide-react";
import { format, subDays, isAfter, isBefore, startOfDay, endOfDay } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Student {
  id: string;
  name: string;
  status: "present" | "absent" | "pending" | "excused";
  isManualOverride?: boolean;
  overrideReason?: string;
}

interface Session {
  id: string;
  courseId: string;
  courseName: string;
  time: string;
  location: string;
  type: "online" | "onsite";
  attendanceStatus: "not-started" | "in-progress" | "completed";
  presentCount: number;
  totalStudents: number;
}

interface PastSession {
  id: string;
  date: Date;
  courseId: string;
  courseName: string;
  time: string;
  location: string;
  type: "online" | "onsite";
  presentCount: number;
  excusedCount: number;
  absentCount: number;
  totalStudents: number;
  students: Student[];
}

const MOCK_COURSES = [
  { id: "CS101", name: "Introduction to Programming", crn: "12345" },
  { id: "CS201", name: "Data Structures", crn: "12346" },
  { id: "CS301", name: "Web Development", crn: "12347" },
];

const MOCK_SESSIONS: Session[] = [
  { id: "S1", courseId: "CS101", courseName: "Introduction to Programming", time: "08:00 - 09:30", location: "Room 101", type: "onsite", attendanceStatus: "completed", presentCount: 24, totalStudents: 28 },
  { id: "S2", courseId: "CS201", courseName: "Data Structures", time: "10:00 - 11:30", location: "Lab 3", type: "onsite", attendanceStatus: "in-progress", presentCount: 18, totalStudents: 25 },
  { id: "S3", courseId: "CS301", courseName: "Web Development", time: "13:00 - 14:30", location: "Online", type: "online", attendanceStatus: "not-started", presentCount: 0, totalStudents: 30 },
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

// Generate mock past sessions
const generatePastSessions = (): PastSession[] => {
  const sessions: PastSession[] = [];
  const today = new Date();
  
  for (let i = 1; i <= 14; i++) {
    const date = subDays(today, i);
    const dayOfWeek = date.getDay();
    
    // Skip weekends
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;
    
    MOCK_COURSES.forEach((course, idx) => {
      const totalStudents = 25 + Math.floor(Math.random() * 10);
      const presentCount = Math.floor(totalStudents * (0.7 + Math.random() * 0.25));
      const excusedCount = Math.floor(Math.random() * 3);
      const absentCount = totalStudents - presentCount - excusedCount;
      
      const students: Student[] = Array.from({ length: totalStudents }, (_, sIdx) => {
        const rand = Math.random();
        let status: Student["status"];
        let isManualOverride = false;
        let overrideReason: string | undefined;
        
        if (rand < 0.75) {
          status = "present";
        } else if (rand < 0.85) {
          status = "excused";
          isManualOverride = true;
          overrideReason = ["Medical appointment", "Family emergency", "Official event"][Math.floor(Math.random() * 3)];
        } else {
          status = "absent";
        }
        
        return {
          id: `S${String(sIdx + 1).padStart(3, "0")}`,
          name: MOCK_STUDENTS[sIdx % MOCK_STUDENTS.length].name,
          status,
          isManualOverride,
          overrideReason,
        };
      });
      
      sessions.push({
        id: `PS-${i}-${idx}`,
        date,
        courseId: course.id,
        courseName: course.name,
        time: ["08:00 - 09:30", "10:00 - 11:30", "13:00 - 14:30"][idx],
        location: ["Room 101", "Lab 3", "Online"][idx],
        type: idx === 2 ? "online" : "onsite",
        presentCount,
        excusedCount,
        absentCount,
        totalStudents,
        students,
      });
    });
  }
  
  return sessions.sort((a, b) => b.date.getTime() - a.date.getTime());
};

const MOCK_PAST_SESSIONS = generatePastSessions();

const FacultyDashboard = () => {
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [qrData, setQrData] = useState("");
  const [timeLeft, setTimeLeft] = useState(30);
  const [students, setStudents] = useState<Student[]>(MOCK_STUDENTS);
  const [isActive, setIsActive] = useState(false);
  const [sessions] = useState<Session[]>(MOCK_SESSIONS);
  const [activeTab, setActiveTab] = useState("today");
  const [courseFilter, setCourseFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [selectedPastSession, setSelectedPastSession] = useState<PastSession | null>(null);
  const today = new Date();

  // Draggable dialog state
  const [dialogPosition, setDialogPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const dialogStartPos = useRef({ x: 0, y: 0 });
  const [isQRMaximized, setIsQRMaximized] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    dialogStartPos.current = { ...dialogPosition };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartPos.current.x;
    const deltaY = e.clientY - dragStartPos.current.y;
    setDialogPosition({
      x: dialogStartPos.current.x + deltaX,
      y: dialogStartPos.current.y + deltaY,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

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

  // Handle ESC key to close maximized QR view
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isQRMaximized) {
        setIsQRMaximized(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isQRMaximized]);

  const handleStartAttendance = (session: Session) => {
    const course = MOCK_COURSES.find((c) => c.id === session.courseId);
    const timestamp = new Date().toISOString();
    const qrContent = JSON.stringify({
      crn: course?.crn,
      courseId: session.courseId,
      sessionId: session.id,
      timestamp,
      expiresAt: new Date(Date.now() + 30000).toISOString(),
    });

    setSelectedSession(session);
    setQrData(qrContent);
    setShowQR(true);
    setIsActive(true);
    setTimeLeft(30);
    setStudents(MOCK_STUDENTS.map((s) => ({ ...s, status: "pending" })));
    toast.success(`Attendance started for ${session.courseName}`);
  };

  const handleOverrideAttendance = (studentId: string, newStatus: Student["status"], reason?: string) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.id === studentId
          ? { ...student, status: newStatus, isManualOverride: true, overrideReason: reason }
          : student
      )
    );
    const student = students.find((s) => s.id === studentId);
    toast.success(`${student?.name} marked as ${newStatus}${reason ? ` (${reason})` : ""}`);
  };

  const handleExportSession = (session: PastSession) => {
    const csvContent = [
      ["Student ID", "Name", "Status", "Override", "Reason"].join(","),
      ...session.students.map((s) =>
        [s.id, s.name, s.status, s.isManualOverride ? "Yes" : "No", s.overrideReason || ""].join(",")
      ),
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-${session.courseName}-${format(session.date, "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Attendance exported successfully");
  };

  const presentCount = students.filter((s) => s.status === "present").length;
  const absentCount = students.filter((s) => s.status === "absent").length;
  const pendingCount = students.filter((s) => s.status === "pending").length;
  const excusedCount = students.filter((s) => s.status === "excused").length;

  const completedSessions = sessions.filter(s => s.attendanceStatus === "completed").length;
  const inProgressSessions = sessions.filter(s => s.attendanceStatus === "in-progress").length;
  const notStartedSessions = sessions.filter(s => s.attendanceStatus === "not-started").length;

  const filteredPastSessions = MOCK_PAST_SESSIONS.filter(s => {
    const matchesCourse = courseFilter === "all" || s.courseId === courseFilter;
    const matchesDateFrom = !dateFrom || !isBefore(s.date, startOfDay(dateFrom));
    const matchesDateTo = !dateTo || !isAfter(s.date, endOfDay(dateTo));
    return matchesCourse && matchesDateFrom && matchesDateTo;
  });

  const clearDateFilters = () => {
    setDateFrom(undefined);
    setDateTo(undefined);
  };

  const getStatusBadge = (status: Student["status"], isManualOverride?: boolean) => {
    const badges = {
      present: (
        <span className="flex items-center gap-1 text-xs font-medium text-success bg-success/10 px-2 py-1 rounded-full">
          <CheckCircle className="h-3.5 w-3.5" />
          Present
          {isManualOverride && <span className="ml-1 text-[10px] opacity-70">•M</span>}
        </span>
      ),
      absent: (
        <span className="flex items-center gap-1 text-xs font-medium text-destructive bg-destructive/10 px-2 py-1 rounded-full">
          <XCircle className="h-3.5 w-3.5" />
          Absent
          {isManualOverride && <span className="ml-1 text-[10px] opacity-70">•M</span>}
        </span>
      ),
      excused: (
        <span className="flex items-center gap-1 text-xs font-medium text-warning bg-warning/10 px-2 py-1 rounded-full">
          <AlertCircle className="h-3.5 w-3.5" />
          Excused
          {isManualOverride && <span className="ml-1 text-[10px] opacity-70">•M</span>}
        </span>
      ),
      pending: (
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          Waiting...
        </span>
      ),
    };
    return badges[status];
  };

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
            <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span className="font-semibold text-primary">{format(today, "EEEE, MMMM d, yyyy")}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Tabs for Today / History */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="today" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Today's Sessions
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Session History
            </TabsTrigger>
          </TabsList>

          {/* Today's Sessions Tab */}
          <TabsContent value="today" className="mt-6">
            {/* Today's Sessions Overview */}
            <div className="mb-8 grid gap-4 sm:grid-cols-3">
              <Card className="border-none p-4 shadow-soft">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-success/10 p-3">
                    <CheckCircle className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-card-foreground">{completedSessions}</div>
                    <div className="text-sm text-muted-foreground">Completed Sessions</div>
                  </div>
                </div>
              </Card>
              <Card className="border-none p-4 shadow-soft">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-card-foreground">{inProgressSessions}</div>
                    <div className="text-sm text-muted-foreground">In Progress</div>
                  </div>
                </div>
              </Card>
              <Card className="border-none p-4 shadow-soft">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-muted p-3">
                    <BookOpen className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-card-foreground">{notStartedSessions}</div>
                    <div className="text-sm text-muted-foreground">Upcoming</div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Today's Sessions List */}
            <Card className="mb-8 border-none p-6 shadow-medium">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-card-foreground">
                <BookOpen className="h-5 w-5 text-primary" />
                Today's Sessions
              </h2>
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex flex-col gap-3 rounded-lg border bg-card p-4 transition-all hover:shadow-soft sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-card-foreground">{session.courseName}</h3>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          session.type === "online" 
                            ? "bg-accent/10 text-accent" 
                            : "bg-primary/10 text-primary"
                        }`}>
                          {session.type === "online" ? "Online" : "On-site"}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {session.time}
                        </span>
                        <span>{session.location}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-medium text-card-foreground">
                          {session.presentCount}/{session.totalStudents} Students
                        </div>
                        <div className={`text-xs font-medium ${
                          session.attendanceStatus === "completed" 
                            ? "text-success" 
                            : session.attendanceStatus === "in-progress"
                            ? "text-primary"
                            : "text-muted-foreground"
                        }`}>
                          {session.attendanceStatus === "completed" && "✓ Completed"}
                          {session.attendanceStatus === "in-progress" && "● In Progress"}
                          {session.attendanceStatus === "not-started" && "○ Not Started"}
                        </div>
                      </div>
                      {session.attendanceStatus !== "completed" && (
                        <Button
                          size="sm"
                          onClick={() => handleStartAttendance(session)}
                          disabled={isActive}
                          className={session.attendanceStatus === "in-progress" ? "bg-primary" : "bg-gradient-primary"}
                        >
                          <QrCode className="mr-1 h-4 w-4" />
                          {session.attendanceStatus === "in-progress" ? "Continue" : "Start"}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Session History Tab */}
          <TabsContent value="history" className="mt-6">
            {/* Filters */}
            <div className="mb-6 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Filter by:</span>
              </div>
              <Select value={courseFilter} onValueChange={setCourseFilter}>
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="All Courses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {MOCK_COURSES.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Date From */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[160px] justify-start text-left font-normal",
                      !dateFrom && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFrom ? format(dateFrom, "MMM d, yyyy") : "From date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
                    disabled={(date) => date > today || (dateTo ? date > dateTo : false)}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>

              {/* Date To */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[160px] justify-start text-left font-normal",
                      !dateTo && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateTo ? format(dateTo, "MMM d, yyyy") : "To date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={dateTo}
                    onSelect={setDateTo}
                    disabled={(date) => date > today || (dateFrom ? date < dateFrom : false)}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>

              {/* Clear Date Filters */}
              {(dateFrom || dateTo) && (
                <Button variant="ghost" size="sm" onClick={clearDateFilters}>
                  <X className="mr-1 h-4 w-4" />
                  Clear dates
                </Button>
              )}
            </div>

            {/* Past Sessions List */}
            <Card className="border-none p-6 shadow-medium">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-card-foreground">
                <History className="h-5 w-5 text-primary" />
                Previous Sessions ({filteredPastSessions.length})
              </h2>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {filteredPastSessions.map((session) => {
                  const attendanceRate = ((session.presentCount + session.excusedCount) / session.totalStudents * 100).toFixed(0);
                  return (
                    <div
                      key={session.id}
                      className="flex flex-col gap-3 rounded-lg border bg-card p-4 transition-all hover:shadow-soft sm:flex-row sm:items-center sm:justify-between cursor-pointer"
                      onClick={() => setSelectedPastSession(session)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-card-foreground">{session.courseName}</h3>
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            session.type === "online" 
                              ? "bg-accent/10 text-accent" 
                              : "bg-primary/10 text-primary"
                          }`}>
                            {session.type === "online" ? "Online" : "On-site"}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {format(session.date, "EEE, MMM d, yyyy")}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {session.time}
                          </span>
                          <span>{session.location}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <TooltipProvider>
                          <div className="flex items-center gap-3 text-sm">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="flex items-center gap-1 text-success cursor-default">
                                  <CheckCircle className="h-4 w-4" />
                                  {session.presentCount}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{session.presentCount} students present</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="flex items-center gap-1 text-warning cursor-default">
                                  <AlertCircle className="h-4 w-4" />
                                  {session.excusedCount}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{session.excusedCount} students excused</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="flex items-center gap-1 text-destructive cursor-default">
                                  <XCircle className="h-4 w-4" />
                                  {session.absentCount}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{session.absentCount} students absent</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className={`text-sm font-semibold cursor-default ${
                              Number(attendanceRate) >= 80 ? "text-success" : 
                              Number(attendanceRate) >= 60 ? "text-warning" : "text-destructive"
                            }`}>
                              {attendanceRate}%
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Attendance rate ({session.presentCount + session.excusedCount}/{session.totalStudents})</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleExportSession(session);
                              }}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Export to CSV</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Full Screen Attendance Dialog */}
      <Dialog open={showQR} onOpenChange={(open) => {
        if (!open) {
          setShowQR(false);
          setIsActive(false);
          setDialogPosition({ x: 0, y: 0 });
        }
      }}>
        <DialogContent 
          className="max-w-6xl max-h-[95vh] p-0 overflow-hidden"
          style={{ 
            transform: `translate(calc(-50% + ${dialogPosition.x}px), calc(-50% + ${dialogPosition.y}px))`,
          }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Header - Draggable */}
          <DialogHeader 
            className="px-6 py-4 border-b bg-muted/30 cursor-move select-none"
            onMouseDown={handleMouseDown}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <GripHorizontal className="h-5 w-5 text-muted-foreground" />
                <DialogTitle className="text-xl font-bold">{selectedSession?.courseName}</DialogTitle>
                <DialogDescription className="flex items-center gap-4 mt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {selectedSession?.time}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {selectedSession?.location}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    selectedSession?.type === "online" 
                      ? "bg-accent/10 text-accent" 
                      : "bg-primary/10 text-primary"
                  }`}>
                    {selectedSession?.type === "online" ? "Online" : "On-site"}
                  </span>
                </DialogDescription>
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-primary bg-primary/10 px-3 py-1.5 rounded-full mr-6">
                <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                Session Active
              </div>
            </div>
          </DialogHeader>

          {/* Main Content */}
          <div className="grid lg:grid-cols-5 gap-0 h-[calc(95vh-140px)]">
            {/* Left Side - QR Code & Timer (2 cols) */}
            <div className="lg:col-span-2 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-r">
              <div className="relative mb-4">
                <div className="absolute inset-0 animate-pulse rounded-2xl bg-gradient-primary opacity-20 blur-xl" />
                <div className="relative rounded-2xl bg-white p-6 shadow-large">
                  <QRCodeSVG value={qrData} size={280} level="H" />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 bg-background/80 hover:bg-background"
                    onClick={() => setIsQRMaximized(true)}
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="text-center">
                <div className="text-6xl font-bold text-primary mb-1">{timeLeft}s</div>
                <div className="text-sm text-muted-foreground">Time remaining</div>
              </div>
              <p className="text-xs text-muted-foreground mt-4 text-center max-w-[200px]">
                Students scan this QR code with their device to mark attendance
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => {
                  setShowQR(false);
                  setIsActive(false);
                  setIsQRMaximized(false);
                  toast.info("Attendance session ended");
                }}
              >
                <X className="mr-2 h-4 w-4" />
                End Session
              </Button>
            </div>

            {/* Right Side - Stats & Students (3 cols) */}
            <div className="lg:col-span-3 flex flex-col overflow-hidden">
              {/* Attendance Summary */}
              <div className="grid grid-cols-4 gap-3 p-4 border-b bg-card">
                <div className="rounded-lg bg-success/10 p-3 text-center">
                  <CheckCircle className="mx-auto mb-1 h-5 w-5 text-success" />
                  <div className="text-2xl font-bold text-success">{presentCount}</div>
                  <div className="text-xs text-muted-foreground">Present</div>
                </div>
                <div className="rounded-lg bg-warning/10 p-3 text-center">
                  <AlertCircle className="mx-auto mb-1 h-5 w-5 text-warning" />
                  <div className="text-2xl font-bold text-warning">{excusedCount}</div>
                  <div className="text-xs text-muted-foreground">Excused</div>
                </div>
                <div className="rounded-lg bg-muted p-3 text-center">
                  <Clock className="mx-auto mb-1 h-5 w-5 text-muted-foreground" />
                  <div className="text-2xl font-bold text-muted-foreground">{pendingCount}</div>
                  <div className="text-xs text-muted-foreground">Pending</div>
                </div>
                <div className="rounded-lg bg-destructive/10 p-3 text-center">
                  <XCircle className="mx-auto mb-1 h-5 w-5 text-destructive" />
                  <div className="text-2xl font-bold text-destructive">{absentCount}</div>
                  <div className="text-xs text-muted-foreground">Absent</div>
                </div>
              </div>

              {/* Students List */}
              <div className="flex-1 overflow-hidden flex flex-col">
                <div className="flex items-center justify-between px-4 py-3 bg-muted/30">
                  <h3 className="font-semibold text-card-foreground flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    Students ({students.length})
                  </h3>
                  <span className="text-sm font-medium text-primary">
                    {((presentCount / students.length) * 100).toFixed(0)}% attendance
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {students.map((student) => (
                    <div
                      key={student.id}
                      className={`flex items-center justify-between rounded-lg border p-3 transition-all ${
                        student.status === "present" 
                          ? "bg-success/5 border-success/20" 
                          : student.status === "excused"
                          ? "bg-warning/5 border-warning/20"
                          : "bg-card hover:shadow-soft"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-2.5 w-2.5 rounded-full ${
                            student.status === "present"
                              ? "bg-success"
                              : student.status === "absent"
                              ? "bg-destructive"
                              : student.status === "excused"
                              ? "bg-warning"
                              : "bg-muted-foreground"
                          }`}
                        />
                        <div>
                          <span className="font-medium text-card-foreground">{student.name}</span>
                          {student.isManualOverride && student.overrideReason && (
                            <p className="text-xs text-muted-foreground">{student.overrideReason}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(student.status, student.isManualOverride)}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem 
                              onClick={() => handleOverrideAttendance(student.id, "present")}
                              className="text-success"
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Mark Present
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleOverrideAttendance(student.id, "excused", "Manual override")}
                              className="text-warning"
                            >
                              <AlertCircle className="mr-2 h-4 w-4" />
                              Mark Excused
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleOverrideAttendance(student.id, "absent")}
                              className="text-destructive"
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Mark Absent
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleOverrideAttendance(student.id, "excused", "Medical appointment")}
                            >
                              Medical Excuse
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleOverrideAttendance(student.id, "excused", "Official event")}
                            >
                              Official Event
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Maximized QR Overlay (must be inside Dialog to receive pointer events) */}
          {isQRMaximized && (
            <div
              className="fixed inset-0 z-[60] flex items-center justify-center bg-background/95 backdrop-blur-sm"
              onClick={() => setIsQRMaximized(false)}
            >
              <div className="flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
                <div className="relative rounded-3xl bg-white p-8 shadow-2xl">
                  <QRCodeSVG value={qrData} size={420} level="H" />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-3 right-3 h-10 w-10 bg-muted/80 hover:bg-muted"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsQRMaximized(false);
                    }}
                  >
                    <Minimize2 className="h-5 w-5" />
                  </Button>
                </div>
                <div className="mt-6 text-center">
                  <div className="text-8xl font-bold text-primary">{timeLeft}s</div>
                  <div className="text-lg text-muted-foreground mt-2">Time remaining</div>
                </div>
                <p className="text-sm text-muted-foreground mt-6 text-center">
                  Press <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">ESC</kbd> or click minimize to return
                </p>
              </div>
            </div>
          )}

        </DialogContent>
      </Dialog>

      {/* Past Session Detail Dialog */}
      <Dialog open={!!selectedPastSession} onOpenChange={(open) => !open && setSelectedPastSession(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedPastSession?.courseName}
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                selectedPastSession?.type === "online" 
                  ? "bg-accent/10 text-accent" 
                  : "bg-primary/10 text-primary"
              }`}>
                {selectedPastSession?.type === "online" ? "Online" : "On-site"}
              </span>
            </DialogTitle>
            <DialogDescription className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {selectedPastSession && format(selectedPastSession.date, "EEEE, MMMM d, yyyy")}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {selectedPastSession?.time}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {selectedPastSession?.location}
              </span>
            </DialogDescription>
          </DialogHeader>

          {/* Stats Summary */}
          <div className="grid grid-cols-4 gap-3 py-4 border-b">
            <div className="rounded-lg bg-success/10 p-3 text-center">
              <div className="text-2xl font-bold text-success">{selectedPastSession?.presentCount}</div>
              <div className="text-xs text-muted-foreground">Present</div>
            </div>
            <div className="rounded-lg bg-warning/10 p-3 text-center">
              <div className="text-2xl font-bold text-warning">{selectedPastSession?.excusedCount}</div>
              <div className="text-xs text-muted-foreground">Excused</div>
            </div>
            <div className="rounded-lg bg-destructive/10 p-3 text-center">
              <div className="text-2xl font-bold text-destructive">{selectedPastSession?.absentCount}</div>
              <div className="text-xs text-muted-foreground">Absent</div>
            </div>
            <div className="rounded-lg bg-muted p-3 text-center">
              <div className="text-2xl font-bold text-muted-foreground">{selectedPastSession?.totalStudents}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
          </div>

          {/* Student List */}
          <div className="flex-1 overflow-y-auto space-y-2 py-4">
            {selectedPastSession?.students.map((student) => (
              <div
                key={student.id}
                className={`flex items-center justify-between rounded-lg border p-3 ${
                  student.status === "present" 
                    ? "bg-success/5 border-success/20" 
                    : student.status === "excused"
                    ? "bg-warning/5 border-warning/20"
                    : "bg-card"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-2.5 w-2.5 rounded-full ${
                      student.status === "present"
                        ? "bg-success"
                        : student.status === "absent"
                        ? "bg-destructive"
                        : student.status === "excused"
                        ? "bg-warning"
                        : "bg-muted-foreground"
                    }`}
                  />
                  <div>
                    <span className="font-medium text-card-foreground">{student.name}</span>
                    {student.isManualOverride && student.overrideReason && (
                      <p className="text-xs text-muted-foreground">{student.overrideReason}</p>
                    )}
                  </div>
                </div>
                {getStatusBadge(student.status, student.isManualOverride)}
              </div>
            ))}
          </div>

          {/* Export Button */}
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={() => selectedPastSession && handleExportSession(selectedPastSession)}>
              <Download className="mr-2 h-4 w-4" />
              Export to CSV
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FacultyDashboard;
