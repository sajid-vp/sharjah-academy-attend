import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, QrCode, CheckCircle, Clock, Calendar, BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

// Student info (mock - would come from auth)
const STUDENT_INFO = {
  name: "Khadija Abdulla Mohammed Obaid Alteneiji",
  ssn: "SSN100935",
};

interface CourseAttendance {
  courseId: string;
  courseCode: string;
  courseName: string;
  totalSessions: number;
  present: number;
  absent: number;
  upcoming: number;
  sessions: {
    date: string;
    time: string;
    status: "present" | "absent" | "upcoming";
    location: string;
  }[];
}

const MOCK_COURSE_ATTENDANCE: CourseAttendance[] = [
  {
    courseId: "EDEL9101E-01",
    courseCode: "EDEL 9101E",
    courseName: "Discovering & Defining a School Leadership Problem of Practice",
    totalSessions: 15,
    present: 8,
    absent: 1,
    upcoming: 6,
    sessions: [
      { date: "2026-01-06", time: "5:00 PM - 7:00 PM", status: "present", location: "Virtual Room 04" },
      { date: "2026-02-01", time: "5:00 PM - 7:00 PM", status: "present", location: "Virtual Room 04" },
      { date: "2026-02-08", time: "5:00 PM - 7:00 PM", status: "present", location: "Virtual Room 04" },
      { date: "2026-02-15", time: "5:00 PM - 7:00 PM", status: "absent", location: "Virtual Room 04" },
      { date: "2026-02-22", time: "5:00 PM - 7:00 PM", status: "present", location: "Virtual Room 04" },
      { date: "2026-03-01", time: "5:00 PM - 7:00 PM", status: "present", location: "Virtual Room 04" },
      { date: "2026-03-06", time: "5:00 PM - 7:00 PM", status: "present", location: "Virtual Room 04" },
      { date: "2026-03-13", time: "5:00 PM - 7:00 PM", status: "present", location: "Virtual Room 04" },
      { date: "2026-03-20", time: "5:00 PM - 7:00 PM", status: "present", location: "Virtual Room 04" },
      { date: "2026-03-27", time: "5:00 PM - 7:00 PM", status: "upcoming", location: "Virtual Room 04" },
      { date: "2026-04-03", time: "5:00 PM - 7:00 PM", status: "upcoming", location: "Virtual Room 04" },
      { date: "2026-04-10", time: "5:00 PM - 7:00 PM", status: "upcoming", location: "Virtual Room 04" },
      { date: "2026-04-17", time: "5:00 PM - 7:00 PM", status: "upcoming", location: "Virtual Room 04" },
      { date: "2026-04-24", time: "5:00 PM - 7:00 PM", status: "upcoming", location: "Virtual Room 04" },
      { date: "2026-05-08", time: "5:00 PM - 7:00 PM", status: "upcoming", location: "Virtual Room 04" },
    ],
  },
  {
    courseId: "EDEL9101A-01",
    courseCode: "EDEL 9101A",
    courseName: "اكتشاف وتحديد مشاكل ممارسة القيادة المدرسية",
    totalSessions: 16,
    present: 9,
    absent: 0,
    upcoming: 7,
    sessions: [
      { date: "2026-01-06", time: "5:00 PM - 7:00 PM", status: "present", location: "Virtual Room 01" },
      { date: "2026-01-30", time: "8:00 AM - 10:00 AM", status: "present", location: "Classroom 01" },
      { date: "2026-02-01", time: "5:00 PM - 7:00 PM", status: "present", location: "Virtual Room 01" },
      { date: "2026-02-08", time: "5:00 PM - 7:00 PM", status: "present", location: "Virtual Room 01" },
      { date: "2026-02-22", time: "5:00 PM - 7:00 PM", status: "present", location: "Virtual Room 01" },
      { date: "2026-02-29", time: "5:00 PM - 7:00 PM", status: "present", location: "Virtual Room 01" },
      { date: "2026-03-06", time: "5:00 PM - 7:00 PM", status: "present", location: "Virtual Room 01" },
      { date: "2026-03-13", time: "5:00 PM - 7:00 PM", status: "present", location: "Virtual Room 01" },
      { date: "2026-03-20", time: "5:00 PM - 7:00 PM", status: "present", location: "Virtual Room 01" },
      { date: "2026-03-27", time: "5:00 PM - 7:00 PM", status: "upcoming", location: "Virtual Room 01" },
      { date: "2026-04-03", time: "5:00 PM - 7:00 PM", status: "upcoming", location: "Virtual Room 01" },
      { date: "2026-04-08", time: "8:00 AM - 10:00 AM", status: "upcoming", location: "Classroom 01" },
      { date: "2026-04-10", time: "5:00 PM - 7:00 PM", status: "upcoming", location: "Virtual Room 01" },
      { date: "2026-04-17", time: "5:00 PM - 7:00 PM", status: "upcoming", location: "Virtual Room 01" },
      { date: "2026-04-24", time: "5:00 PM - 7:00 PM", status: "upcoming", location: "Virtual Room 01" },
      { date: "2026-05-08", time: "5:00 PM - 7:00 PM", status: "upcoming", location: "Virtual Room 01" },
    ],
  },
];

const StudentPortal = () => {
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);

  const totalPresent = MOCK_COURSE_ATTENDANCE.reduce((s, c) => s + c.present, 0);
  const totalAbsent = MOCK_COURSE_ATTENDANCE.reduce((s, c) => s + c.absent, 0);
  const totalCompleted = totalPresent + totalAbsent;
  const overallRate = totalCompleted > 0 ? (totalPresent / totalCompleted) * 100 : 0;

  const getAttendanceColor = (rate: number) => {
    if (rate >= 90) return "text-success";
    if (rate >= 75) return "text-warning";
    return "text-destructive";
  };

  return (
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
              <h1 className="text-2xl font-bold text-foreground">My Attendance</h1>
            </div>
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                {STUDENT_INFO.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Overall Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Card className="border-none p-4 shadow-medium">
            <p className="text-xs text-muted-foreground">Registered Courses</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{MOCK_COURSE_ATTENDANCE.length}</p>
          </Card>
          <Card className="border-none p-4 shadow-medium">
            <p className="text-xs text-muted-foreground">Overall Attendance</p>
            <p className={`mt-1 text-2xl font-bold ${getAttendanceColor(overallRate)}`}>
              {overallRate.toFixed(0)}%
            </p>
          </Card>
          <Card className="border-none p-4 shadow-medium">
            <p className="text-xs text-muted-foreground">Sessions Attended</p>
            <p className="mt-1 text-2xl font-bold text-success">{totalPresent}</p>
          </Card>
          <Card className="border-none p-4 shadow-medium">
            <p className="text-xs text-muted-foreground">Sessions Missed</p>
            <p className="mt-1 text-2xl font-bold text-destructive">{totalAbsent}</p>
          </Card>
        </div>

        {/* Course-wise Attendance */}
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
          <BookOpen className="h-5 w-5 text-primary" />
          Course-wise Attendance
        </h2>

        <div className="space-y-4">
          {MOCK_COURSE_ATTENDANCE.map((course) => {
            const completed = course.present + course.absent;
            const rate = completed > 0 ? (course.present / completed) * 100 : 0;
            const isExpanded = expandedCourse === course.courseId;

            return (
              <Card key={course.courseId} className="border-none shadow-medium overflow-hidden">
                {/* Course Summary Row */}
                <button
                  onClick={() => setExpandedCourse(isExpanded ? null : course.courseId)}
                  className="w-full p-5 text-left transition-colors hover:bg-muted/30"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-xs shrink-0">
                          {course.courseCode}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium text-card-foreground truncate">
                        {course.courseName}
                      </p>
                      {/* Stats row */}
                      <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {course.totalSessions} sessions
                        </span>
                        <span className="flex items-center gap-1">
                          <CheckCircle className="h-3.5 w-3.5 text-success" />
                          {course.present} present
                        </span>
                        {course.absent > 0 && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-destructive" />
                            {course.absent} absent
                          </span>
                        )}
                      </div>
                      {/* Progress bar */}
                      <div className="mt-3 flex items-center gap-3">
                        <Progress value={rate} className="h-2 flex-1" />
                        <span className={`text-sm font-bold ${getAttendanceColor(rate)}`}>
                          {rate.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <div className="pt-1">
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </button>

                {/* Expanded Session History */}
                {isExpanded && (
                  <div className="border-t px-5 pb-4 pt-3">
                    <p className="mb-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Session History
                    </p>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {course.sessions.map((session, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between rounded-lg border bg-card px-4 py-3"
                        >
                          <div className="flex items-center gap-3 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-card-foreground">{session.date}</span>
                            <span className="text-muted-foreground">{session.time}</span>
                            <span className="text-xs text-muted-foreground">• {session.location}</span>
                          </div>
                          {session.status === "present" ? (
                            <Badge className="bg-success/10 text-success border-0 text-xs">Present</Badge>
                          ) : session.status === "absent" ? (
                            <Badge className="bg-destructive/10 text-destructive border-0 text-xs">Absent</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">Upcoming</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* QR Scan Section */}
        <Card className="mt-8 border-none p-6 shadow-medium">
          <div className="flex items-center gap-2 mb-2">
            <QrCode className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-card-foreground">Mark Attendance</h2>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">
            Scan the QR code displayed by your instructor to mark your attendance
          </p>
          <div className="rounded-lg border-2 border-dashed border-primary/20 bg-primary/5 p-8 text-center">
            <QrCode className="mx-auto mb-4 h-12 w-12 text-primary" />
            <Button className="bg-gradient-primary shadow-medium">
              Scan QR Code
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default StudentPortal;
