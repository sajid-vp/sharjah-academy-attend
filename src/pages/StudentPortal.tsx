import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, QrCode, CheckCircle, Clock, Calendar, BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

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
        {/* Mark Attendance - Top */}
        <Card className="mb-8 border-none p-6 shadow-medium">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <QrCode className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-semibold text-card-foreground">Mark Attendance</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Scan the QR code displayed by your instructor
              </p>
            </div>
            <Button className="bg-gradient-primary shadow-medium shrink-0">
              <QrCode className="h-4 w-4 mr-2" />
              Scan QR Code
            </Button>
          </div>
        </Card>

        {/* Overall Stats Cards */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
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
          <Card className="border-none p-4 shadow-medium">
            <p className="text-xs text-muted-foreground">Total Sessions</p>
            <p className="mt-1 text-2xl font-bold text-foreground">
              {MOCK_COURSE_ATTENDANCE.reduce((s, c) => s + c.totalSessions, 0)}
            </p>
          </Card>
        </div>

        {/* Registered Courses */}
        <Card className="border-none p-6 shadow-medium">
          <div className="mb-4 flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold text-card-foreground">Registered Courses</h2>
          </div>

          <div className="divide-y">
            {MOCK_COURSE_ATTENDANCE.map((course) => {
              const completed = course.present + course.absent;
              const rate = completed > 0 ? (course.present / completed) * 100 : 0;
              const isExpanded = expandedCourse === course.courseId;

              return (
                <div key={course.courseId} className="overflow-hidden">
                  <button
                    onClick={() => setExpandedCourse(isExpanded ? null : course.courseId)}
                    className="w-full px-1 py-3 text-left transition-colors hover:bg-muted/30"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-primary shrink-0">{course.courseCode}</span>
                            <span className="text-sm text-card-foreground truncate">{course.courseName}</span>
                          </div>
                          <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                            <span>{course.present}/{completed} attended</span>
                            {course.absent > 0 && (
                              <span className="text-destructive">{course.absent} missed</span>
                            )}
                            <span>{course.upcoming} upcoming</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="flex items-center gap-2 w-28">
                          <Progress value={rate} className="h-1.5 flex-1" />
                          <span className={`text-xs font-bold ${getAttendanceColor(rate)}`}>
                            {rate.toFixed(0)}%
                          </span>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="pb-3 pl-1">
                      <div className="space-y-1 max-h-56 overflow-y-auto">
                        {course.sessions.map((session, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between rounded px-2 py-1.5 text-xs hover:bg-muted/30"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-card-foreground">{session.date}</span>
                              <span className="text-muted-foreground">{session.time}</span>
                            </div>
                            <div className="shrink-0">
                              {session.status === "present" ? (
                                <span className="text-success font-medium">Present</span>
                              ) : session.status === "absent" ? (
                                <span className="text-destructive font-medium">Absent</span>
                              ) : (
                                <span className="text-muted-foreground">Upcoming</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default StudentPortal;
