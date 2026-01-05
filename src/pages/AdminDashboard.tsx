import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft, 
  Users, 
  BookOpen, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
  Bell,
  History,
  Shield,
  ChevronRight,
  GraduationCap,
  MapPin,
  BarChart3,
  FileText,
  Settings
} from "lucide-react";
import { format, subDays } from "date-fns";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface Student {
  id: string;
  name: string;
  email: string;
  totalClasses: number;
  attendedClasses: number;
  excusedClasses: number;
  attendanceRate: number;
  lowAttendanceFlag: boolean;
  courses: { id: string; name: string; rate: number }[];
}

interface AuditEntry {
  id: string;
  timestamp: Date;
  action: "override" | "bulk_update" | "excuse";
  performedBy: string;
  performedByRole: "faculty" | "admin";
  studentName: string;
  courseName: string;
  sessionDate: Date;
  previousStatus: string;
  newStatus: string;
  reason: string;
}

interface Course {
  id: string;
  name: string;
  faculty: string;
  totalStudents: number;
  averageAttendance: number;
  sessionsCount: number;
}

// Mock data
const MOCK_STUDENTS: Student[] = [
  { id: "S001", name: "Abdulla Ahmed Hasan", email: "abdulla.hasan@sea.edu", totalClasses: 45, attendedClasses: 42, excusedClasses: 2, attendanceRate: 97.8, lowAttendanceFlag: false, courses: [{ id: "CS101", name: "Intro to Programming", rate: 100 }, { id: "CS201", name: "Data Structures", rate: 95 }] },
  { id: "S002", name: "Saed Nasser Saeed", email: "saed.saeed@sea.edu", totalClasses: 45, attendedClasses: 38, excusedClasses: 3, attendanceRate: 91.1, lowAttendanceFlag: false, courses: [{ id: "CS101", name: "Intro to Programming", rate: 88 }, { id: "CS301", name: "Web Development", rate: 94 }] },
  { id: "S003", name: "Salem Ali Salem", email: "salem.salem@sea.edu", totalClasses: 45, attendedClasses: 30, excusedClasses: 5, attendanceRate: 77.8, lowAttendanceFlag: true, courses: [{ id: "CS101", name: "Intro to Programming", rate: 72 }, { id: "CS201", name: "Data Structures", rate: 83 }] },
  { id: "S004", name: "Saif Abdulla Salem", email: "saif.salem@sea.edu", totalClasses: 45, attendedClasses: 44, excusedClasses: 1, attendanceRate: 100, lowAttendanceFlag: false, courses: [{ id: "CS201", name: "Data Structures", rate: 100 }, { id: "CS301", name: "Web Development", rate: 100 }] },
  { id: "S005", name: "Mohammed Ahmed Moosa", email: "mohammed.moosa@sea.edu", totalClasses: 45, attendedClasses: 28, excusedClasses: 2, attendanceRate: 66.7, lowAttendanceFlag: true, courses: [{ id: "CS101", name: "Intro to Programming", rate: 60 }, { id: "CS201", name: "Data Structures", rate: 73 }] },
  { id: "S006", name: "Abdulla Sarhan Mohammed", email: "abdulla.mohammed@sea.edu", totalClasses: 45, attendedClasses: 43, excusedClasses: 2, attendanceRate: 100, lowAttendanceFlag: false, courses: [{ id: "CS301", name: "Web Development", rate: 98 }] },
  { id: "S007", name: "Yousef Saeed Bakhit", email: "yousef.bakhit@sea.edu", totalClasses: 45, attendedClasses: 35, excusedClasses: 4, attendanceRate: 86.7, lowAttendanceFlag: false, courses: [{ id: "CS101", name: "Intro to Programming", rate: 85 }, { id: "CS301", name: "Web Development", rate: 88 }] },
  { id: "S008", name: "Saoud Abdulrahman Saeed", email: "saoud.saeed@sea.edu", totalClasses: 45, attendedClasses: 26, excusedClasses: 1, attendanceRate: 60, lowAttendanceFlag: true, courses: [{ id: "CS201", name: "Data Structures", rate: 55 }, { id: "CS301", name: "Web Development", rate: 65 }] },
];

const MOCK_COURSES: Course[] = [
  { id: "CS101", name: "Introduction to Programming", faculty: "Dr. Ahmed Ali", totalStudents: 28, averageAttendance: 87.5, sessionsCount: 24 },
  { id: "CS201", name: "Data Structures", faculty: "Dr. Mohammed Khalid", totalStudents: 25, averageAttendance: 82.3, sessionsCount: 22 },
  { id: "CS301", name: "Web Development", faculty: "Dr. Sara Hassan", totalStudents: 30, averageAttendance: 91.2, sessionsCount: 20 },
];

const MOCK_AUDIT_LOG: AuditEntry[] = [
  { id: "A001", timestamp: new Date(), action: "override", performedBy: "Dr. Ahmed Ali", performedByRole: "faculty", studentName: "Salem Ali Salem", courseName: "Intro to Programming", sessionDate: subDays(new Date(), 1), previousStatus: "absent", newStatus: "excused", reason: "Medical appointment verified" },
  { id: "A002", timestamp: subDays(new Date(), 1), action: "bulk_update", performedBy: "Admin User", performedByRole: "admin", studentName: "Multiple (5 students)", courseName: "Data Structures", sessionDate: subDays(new Date(), 2), previousStatus: "absent", newStatus: "excused", reason: "Field trip approved" },
  { id: "A003", timestamp: subDays(new Date(), 2), action: "excuse", performedBy: "Dr. Mohammed Khalid", performedByRole: "faculty", studentName: "Mohammed Ahmed Moosa", courseName: "Data Structures", sessionDate: subDays(new Date(), 3), previousStatus: "absent", newStatus: "excused", reason: "Family emergency" },
  { id: "A004", timestamp: subDays(new Date(), 3), action: "override", performedBy: "Admin User", performedByRole: "admin", studentName: "Saoud Abdulrahman Saeed", courseName: "Web Development", sessionDate: subDays(new Date(), 4), previousStatus: "pending", newStatus: "present", reason: "QR scan failed, verified presence" },
];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [attendanceThreshold] = useState(75);
  const today = new Date();

  const lowAttendanceStudents = MOCK_STUDENTS.filter(s => s.lowAttendanceFlag);
  const totalStudents = MOCK_STUDENTS.length;
  const totalCourses = MOCK_COURSES.length;
  const overallAttendance = Math.round(MOCK_STUDENTS.reduce((acc, s) => acc + s.attendanceRate, 0) / MOCK_STUDENTS.length);

  const filteredStudents = MOCK_STUDENTS.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExportReport = (type: string) => {
    toast.success(`${type} report exported successfully`);
  };

  const getAttendanceColor = (rate: number) => {
    if (rate >= 90) return "text-success";
    if (rate >= 75) return "text-warning";
    return "text-destructive";
  };

  const getAttendanceBg = (rate: number) => {
    if (rate >= 90) return "bg-success/10";
    if (rate >= 75) return "bg-warning/10";
    return "bg-destructive/10";
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link to="/">
                  <Button variant="ghost" size="icon">
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </Link>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-gradient-hero p-2">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
                    <p className="text-sm text-muted-foreground">Student Services Department</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="relative">
                      <Bell className="h-5 w-5" />
                      {lowAttendanceStudents.length > 0 && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground flex items-center justify-center">
                          {lowAttendanceStudents.length}
                        </span>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{lowAttendanceStudents.length} students below {attendanceThreshold}% attendance</p>
                  </TooltipContent>
                </Tooltip>
                <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span className="font-semibold text-primary">{format(today, "MMMM d, yyyy")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Navigation Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full max-w-3xl grid-cols-5">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="students" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Students
              </TabsTrigger>
              <TabsTrigger value="courses" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Courses
              </TabsTrigger>
              <TabsTrigger value="audit" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                Audit Log
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Reports
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Stats Cards */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="border-none p-4 shadow-soft">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-3">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-card-foreground">{totalStudents}</div>
                      <div className="text-sm text-muted-foreground">Total Students</div>
                    </div>
                  </div>
                </Card>
                <Card className="border-none p-4 shadow-soft">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-secondary/10 p-3">
                      <BookOpen className="h-6 w-6 text-secondary" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-card-foreground">{totalCourses}</div>
                      <div className="text-sm text-muted-foreground">Active Courses</div>
                    </div>
                  </div>
                </Card>
                <Card className="border-none p-4 shadow-soft">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-lg p-3 ${getAttendanceBg(overallAttendance)}`}>
                      <TrendingUp className={`h-6 w-6 ${getAttendanceColor(overallAttendance)}`} />
                    </div>
                    <div>
                      <div className={`text-2xl font-bold ${getAttendanceColor(overallAttendance)}`}>{overallAttendance}%</div>
                      <div className="text-sm text-muted-foreground">Overall Attendance</div>
                    </div>
                  </div>
                </Card>
                <Card className="border-none p-4 shadow-soft">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-destructive/10 p-3">
                      <AlertCircle className="h-6 w-6 text-destructive" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-destructive">{lowAttendanceStudents.length}</div>
                      <div className="text-sm text-muted-foreground">Low Attendance Alerts</div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Low Attendance Alerts */}
              {lowAttendanceStudents.length > 0 && (
                <Card className="border-none p-6 shadow-medium">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="flex items-center gap-2 text-xl font-semibold text-card-foreground">
                      <AlertCircle className="h-5 w-5 text-destructive" />
                      Low Attendance Alerts
                    </h2>
                    <Badge variant="destructive" className="text-xs">
                      Below {attendanceThreshold}%
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    {lowAttendanceStudents.map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between rounded-lg border border-destructive/20 bg-destructive/5 p-4 cursor-pointer hover:bg-destructive/10 transition-colors"
                        onClick={() => setSelectedStudent(student)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-destructive/20 flex items-center justify-center">
                            <GraduationCap className="h-5 w-5 text-destructive" />
                          </div>
                          <div>
                            <p className="font-medium text-card-foreground">{student.name}</p>
                            <p className="text-sm text-muted-foreground">{student.id} • {student.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-lg font-bold text-destructive">{student.attendanceRate}%</p>
                            <p className="text-xs text-muted-foreground">Attendance Rate</p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Recent Overrides */}
              <Card className="border-none p-6 shadow-medium">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="flex items-center gap-2 text-xl font-semibold text-card-foreground">
                    <History className="h-5 w-5 text-primary" />
                    Recent Override Activity
                  </h2>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab("audit")}>
                    View All
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
                <div className="space-y-3">
                  {MOCK_AUDIT_LOG.slice(0, 3).map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-start justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 rounded-full p-1.5 ${
                          entry.performedByRole === "admin" ? "bg-primary/10" : "bg-secondary/10"
                        }`}>
                          {entry.performedByRole === "admin" ? (
                            <Shield className="h-4 w-4 text-primary" />
                          ) : (
                            <Users className="h-4 w-4 text-secondary" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-card-foreground">
                            <span className="font-medium">{entry.performedBy}</span>
                            {" changed "}
                            <span className="font-medium">{entry.studentName}</span>
                            {" from "}
                            <span className="text-muted-foreground">{entry.previousStatus}</span>
                            {" to "}
                            <span className={entry.newStatus === "present" ? "text-success" : entry.newStatus === "excused" ? "text-warning" : "text-destructive"}>
                              {entry.newStatus}
                            </span>
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {entry.courseName} • {format(entry.sessionDate, "MMM d, yyyy")}
                          </p>
                          {entry.reason && (
                            <p className="text-xs text-muted-foreground mt-1 italic">
                              Reason: {entry.reason}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {format(entry.timestamp, "MMM d, HH:mm")}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            {/* Students Tab */}
            <TabsContent value="students" className="space-y-6">
              {/* Search and Filters */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, ID, or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Students</SelectItem>
                      <SelectItem value="low">Low Attendance</SelectItem>
                      <SelectItem value="good">Good Standing</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Students List */}
              <Card className="border-none shadow-medium">
                <div className="divide-y">
                  {filteredStudents.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => setSelectedStudent(student)}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          student.lowAttendanceFlag ? "bg-destructive/10" : "bg-primary/10"
                        }`}>
                          <GraduationCap className={`h-5 w-5 ${
                            student.lowAttendanceFlag ? "text-destructive" : "text-primary"
                          }`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-card-foreground">{student.name}</p>
                            {student.lowAttendanceFlag && (
                              <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                                Low
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{student.id} • {student.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className={`text-lg font-bold ${getAttendanceColor(student.attendanceRate)}`}>
                            {student.attendanceRate}%
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {student.attendedClasses}/{student.totalClasses} classes
                          </p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            {/* Courses Tab */}
            <TabsContent value="courses" className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {MOCK_COURSES.map((course) => (
                  <Card key={course.id} className="border-none p-6 shadow-soft hover:shadow-medium transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-card-foreground">{course.name}</h3>
                        <p className="text-sm text-muted-foreground">{course.id}</p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Sessions</DropdownMenuItem>
                          <DropdownMenuItem>Export Attendance</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Course Settings</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Faculty:</span>
                        <span className="text-card-foreground">{course.faculty}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Students:</span>
                        <span className="text-card-foreground">{course.totalStudents}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Sessions:</span>
                        <span className="text-card-foreground">{course.sessionsCount}</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Avg. Attendance</span>
                        <span className={`text-lg font-bold ${getAttendanceColor(course.averageAttendance)}`}>
                          {course.averageAttendance}%
                        </span>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            course.averageAttendance >= 90 ? "bg-success" :
                            course.averageAttendance >= 75 ? "bg-warning" : "bg-destructive"
                          }`}
                          style={{ width: `${course.averageAttendance}%` }}
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Audit Log Tab */}
            <TabsContent value="audit" className="space-y-6">
              <Card className="border-none p-6 shadow-medium">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="flex items-center gap-2 text-xl font-semibold text-card-foreground">
                    <History className="h-5 w-5 text-primary" />
                    Attendance Override Audit Log
                  </h2>
                  <Button variant="outline" onClick={() => handleExportReport("Audit Log")}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
                <div className="space-y-3">
                  {MOCK_AUDIT_LOG.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-start justify-between rounded-lg border p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 rounded-full p-2 ${
                          entry.performedByRole === "admin" ? "bg-primary/10" : "bg-secondary/10"
                        }`}>
                          {entry.performedByRole === "admin" ? (
                            <Shield className="h-4 w-4 text-primary" />
                          ) : (
                            <Users className="h-4 w-4 text-secondary" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-card-foreground">
                            <span className="font-medium">{entry.performedBy}</span>
                            <Badge variant="outline" className="ml-2 text-[10px]">
                              {entry.performedByRole}
                            </Badge>
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Changed <span className="font-medium text-card-foreground">{entry.studentName}</span>
                            {" in "}
                            <span className="font-medium text-card-foreground">{entry.courseName}</span>
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className={
                              entry.previousStatus === "present" ? "border-success/50 text-success" :
                              entry.previousStatus === "excused" ? "border-warning/50 text-warning" :
                              "border-destructive/50 text-destructive"
                            }>
                              {entry.previousStatus}
                            </Badge>
                            <span className="text-muted-foreground">→</span>
                            <Badge className={
                              entry.newStatus === "present" ? "bg-success text-success-foreground" :
                              entry.newStatus === "excused" ? "bg-warning text-warning-foreground" :
                              "bg-destructive text-destructive-foreground"
                            }>
                              {entry.newStatus}
                            </Badge>
                          </div>
                          {entry.reason && (
                            <p className="text-xs text-muted-foreground mt-2 italic bg-muted/50 rounded px-2 py-1">
                              Reason: {entry.reason}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-card-foreground">
                          {format(entry.timestamp, "MMM d, yyyy")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(entry.timestamp, "HH:mm")}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Session: {format(entry.sessionDate, "MMM d")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            {/* Reports Tab */}
            <TabsContent value="reports" className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="border-none p-6 shadow-soft hover:shadow-medium transition-shadow cursor-pointer" onClick={() => handleExportReport("Weekly Attendance Summary")}>
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-primary/10 p-3">
                      <Calendar className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-card-foreground">Weekly Attendance Summary</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Overview of attendance across all courses for the past week
                      </p>
                    </div>
                  </div>
                </Card>
                <Card className="border-none p-6 shadow-soft hover:shadow-medium transition-shadow cursor-pointer" onClick={() => handleExportReport("Low Attendance Report")}>
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-destructive/10 p-3">
                      <AlertCircle className="h-6 w-6 text-destructive" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-card-foreground">Low Attendance Report</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Students below {attendanceThreshold}% attendance threshold
                      </p>
                    </div>
                  </div>
                </Card>
                <Card className="border-none p-6 shadow-soft hover:shadow-medium transition-shadow cursor-pointer" onClick={() => handleExportReport("Course Comparison Report")}>
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-secondary/10 p-3">
                      <BarChart3 className="h-6 w-6 text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-card-foreground">Course Comparison Report</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Compare attendance rates across different courses
                      </p>
                    </div>
                  </div>
                </Card>
                <Card className="border-none p-6 shadow-soft hover:shadow-medium transition-shadow cursor-pointer" onClick={() => handleExportReport("Override Activity Report")}>
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-warning/10 p-3">
                      <History className="h-6 w-6 text-warning" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-card-foreground">Override Activity Report</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Summary of all manual attendance modifications
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Student Detail Dialog */}
        <Dialog open={!!selectedStudent} onOpenChange={(open) => !open && setSelectedStudent(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  selectedStudent?.lowAttendanceFlag ? "bg-destructive/10" : "bg-primary/10"
                }`}>
                  <GraduationCap className={`h-5 w-5 ${
                    selectedStudent?.lowAttendanceFlag ? "text-destructive" : "text-primary"
                  }`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    {selectedStudent?.name}
                    {selectedStudent?.lowAttendanceFlag && (
                      <Badge variant="destructive" className="text-xs">Low Attendance</Badge>
                    )}
                  </div>
                  <p className="text-sm font-normal text-muted-foreground">
                    {selectedStudent?.id} • {selectedStudent?.email}
                  </p>
                </div>
              </DialogTitle>
            </DialogHeader>

            {/* Overall Stats */}
            <div className="grid grid-cols-4 gap-3 py-4 border-b">
              <div className="rounded-lg bg-primary/10 p-3 text-center">
                <div className="text-2xl font-bold text-primary">{selectedStudent?.totalClasses}</div>
                <div className="text-xs text-muted-foreground">Total Classes</div>
              </div>
              <div className="rounded-lg bg-success/10 p-3 text-center">
                <div className="text-2xl font-bold text-success">{selectedStudent?.attendedClasses}</div>
                <div className="text-xs text-muted-foreground">Attended</div>
              </div>
              <div className="rounded-lg bg-warning/10 p-3 text-center">
                <div className="text-2xl font-bold text-warning">{selectedStudent?.excusedClasses}</div>
                <div className="text-xs text-muted-foreground">Excused</div>
              </div>
              <div className={`rounded-lg p-3 text-center ${getAttendanceBg(selectedStudent?.attendanceRate || 0)}`}>
                <div className={`text-2xl font-bold ${getAttendanceColor(selectedStudent?.attendanceRate || 0)}`}>
                  {selectedStudent?.attendanceRate}%
                </div>
                <div className="text-xs text-muted-foreground">Rate</div>
              </div>
            </div>

            {/* Course Breakdown */}
            <div className="flex-1 overflow-y-auto py-4">
              <h4 className="font-medium text-card-foreground mb-3">Course Breakdown</h4>
              <div className="space-y-3">
                {selectedStudent?.courses.map((course) => (
                  <div key={course.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium text-card-foreground">{course.name}</p>
                      <p className="text-xs text-muted-foreground">{course.id}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`text-lg font-bold ${getAttendanceColor(course.rate)}`}>
                        {course.rate}%
                      </div>
                      <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            course.rate >= 90 ? "bg-success" :
                            course.rate >= 75 ? "bg-warning" : "bg-destructive"
                          }`}
                          style={{ width: `${course.rate}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => toast.success("Student report exported")}>
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Button onClick={() => setSelectedStudent(null)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default AdminDashboard;
