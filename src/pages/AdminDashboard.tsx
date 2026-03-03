import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Shield, Download, Search, Users, BookOpen, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

interface ReportRow {
  ssn: string;
  student: string;
  courseCode: string;
  courseSection: string;
  instructor: string;
  totalSessions: number;
  marked: number;
  notMarked: number;
  totalPresent: number;
  totalAbsent: number;
}

const MOCK_DATA: ReportRow[] = [
  { ssn: "SSN10011", student: "Abdulla Ahmed Hasan", courseCode: "EDEL 9101E", courseSection: "EDEL 9101E-01", instructor: "Dr. Ahmed Ali", totalSessions: 24, marked: 22, notMarked: 2, totalPresent: 20, totalAbsent: 2 },
  { ssn: "SSN10011", student: "Abdulla Ahmed Hasan", courseCode: "EDEL 9201A", courseSection: "EDEL 9201A-01", instructor: "Dr. Mohammed Khalid", totalSessions: 22, marked: 22, notMarked: 0, totalPresent: 22, totalAbsent: 0 },
  { ssn: "SSN10012", student: "Saed Nasser Saeed", courseCode: "EDEL 9101E", courseSection: "EDEL 9101E-01", instructor: "Dr. Ahmed Ali", totalSessions: 24, marked: 24, notMarked: 0, totalPresent: 21, totalAbsent: 3 },
  { ssn: "SSN10012", student: "Saed Nasser Saeed", courseCode: "CS 3010", courseSection: "CS 3010-01", instructor: "Dr. Sara Hassan", totalSessions: 20, marked: 18, notMarked: 2, totalPresent: 17, totalAbsent: 1 },
  { ssn: "SSN10013", student: "Salem Ali Salem", courseCode: "EDEL 9101E", courseSection: "EDEL 9101E-02", instructor: "Dr. Ahmed Ali", totalSessions: 24, marked: 20, notMarked: 4, totalPresent: 14, totalAbsent: 6 },
  { ssn: "SSN10013", student: "Salem Ali Salem", courseCode: "EDEL 9201A", courseSection: "EDEL 9201A-01", instructor: "Dr. Mohammed Khalid", totalSessions: 22, marked: 22, notMarked: 0, totalPresent: 18, totalAbsent: 4 },
  { ssn: "SSN10014", student: "Saif Abdulla Salem", courseCode: "EDEL 9201A", courseSection: "EDEL 9201A-02", instructor: "Dr. Mohammed Khalid", totalSessions: 22, marked: 22, notMarked: 0, totalPresent: 22, totalAbsent: 0 },
  { ssn: "SSN10014", student: "Saif Abdulla Salem", courseCode: "CS 3010", courseSection: "CS 3010-01", instructor: "Dr. Sara Hassan", totalSessions: 20, marked: 20, notMarked: 0, totalPresent: 20, totalAbsent: 0 },
  { ssn: "SSN10015", student: "Mohammed Ahmed Moosa", courseCode: "EDEL 9101E", courseSection: "EDEL 9101E-01", instructor: "Dr. Ahmed Ali", totalSessions: 24, marked: 22, notMarked: 2, totalPresent: 14, totalAbsent: 8 },
  { ssn: "SSN10015", student: "Mohammed Ahmed Moosa", courseCode: "EDEL 9201A", courseSection: "EDEL 9201A-01", instructor: "Dr. Mohammed Khalid", totalSessions: 22, marked: 20, notMarked: 2, totalPresent: 14, totalAbsent: 6 },
  { ssn: "SSN10016", student: "Abdulla Sarhan Mohammed", courseCode: "CS 3010", courseSection: "CS 3010-02", instructor: "Dr. Sara Hassan", totalSessions: 20, marked: 20, notMarked: 0, totalPresent: 19, totalAbsent: 1 },
  { ssn: "SSN10017", student: "Yousef Saeed Bakhit", courseCode: "EDEL 9101E", courseSection: "EDEL 9101E-02", instructor: "Dr. Ahmed Ali", totalSessions: 24, marked: 23, notMarked: 1, totalPresent: 20, totalAbsent: 3 },
];

const AY_OPTIONS = ["2024-2025", "2025-2026"];
const SEMESTER_OPTIONS = ["Fall", "Spring", "Summer"];

interface AggregatedRow {
  key: string;
  label: string;
  sublabel: string;
  totalSessions: number;
  marked: number;
  notMarked: number;
  totalPresent: number;
  totalAbsent: number;
  rate: number;
  count: number;
}

const aggregate = (data: ReportRow[], groupBy: string): AggregatedRow[] => {
  const groups: Record<string, AggregatedRow> = {};

  data.forEach((r) => {
    let key: string, label: string, sublabel: string;
    if (groupBy === "student") {
      key = r.ssn;
      label = r.student;
      sublabel = r.ssn;
    } else if (groupBy === "faculty") {
      key = r.instructor;
      label = r.instructor;
      sublabel = [...new Set(data.filter(d => d.instructor === r.instructor).map(d => d.courseCode))].join(", ");
    } else {
      key = r.courseSection;
      label = r.courseSection;
      sublabel = r.instructor;
    }

    if (!groups[key]) {
      groups[key] = { key, label, sublabel, totalSessions: 0, marked: 0, notMarked: 0, totalPresent: 0, totalAbsent: 0, rate: 0, count: 0 };
    }
    const g = groups[key];
    g.totalSessions += r.totalSessions;
    g.marked += r.marked;
    g.notMarked += r.notMarked;
    g.totalPresent += r.totalPresent;
    g.totalAbsent += r.totalAbsent;
    g.count++;
  });

  return Object.values(groups).map((g) => ({
    ...g,
    rate: g.totalSessions > 0 ? Math.round((g.totalPresent / g.totalSessions) * 100) : 0,
  }));
};

const AdminDashboard = () => {
  const [reportType, setReportType] = useState<string>("student");
  const [ay, setAy] = useState("2025-2026");
  const [semester, setSemester] = useState("Fall");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const filteredRaw = useMemo(() => {
    if (!searchQuery.trim()) return MOCK_DATA;
    const q = searchQuery.toLowerCase();
    return MOCK_DATA.filter(
      (r) =>
        r.ssn.toLowerCase().includes(q) ||
        r.student.toLowerCase().includes(q) ||
        r.courseCode.toLowerCase().includes(q) ||
        r.courseSection.toLowerCase().includes(q) ||
        r.instructor.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const aggregated = useMemo(() => aggregate(filteredRaw, reportType), [filteredRaw, reportType]);

  const detailRows = useMemo(() => {
    if (!selectedKey) return [];
    return filteredRaw.filter((r) => {
      if (reportType === "student") return r.ssn === selectedKey;
      if (reportType === "faculty") return r.instructor === selectedKey;
      return r.courseSection === selectedKey;
    });
  }, [selectedKey, filteredRaw, reportType]);

  // Stats
  const totalStudents = new Set(MOCK_DATA.map((r) => r.ssn)).size;
  const totalFaculty = new Set(MOCK_DATA.map((r) => r.instructor)).size;
  const totalSections = new Set(MOCK_DATA.map((r) => r.courseSection)).size;
  const overallPresent = MOCK_DATA.reduce((a, r) => a + r.totalPresent, 0);
  const overallSessions = MOCK_DATA.reduce((a, r) => a + r.totalSessions, 0);
  const overallRate = overallSessions > 0 ? Math.round((overallPresent / overallSessions) * 100) : 0;

  const handleExport = () => {
    const headers = ["SSN", "Student", "Course Code", "Course Section", "Instructor", "Total Sessions", "Marked", "Not Marked", "Total Present", "Total Absent"];
    const csvRows = [headers.join(",")];
    const exportData = selectedKey ? detailRows : filteredRaw;
    exportData.forEach((r) => {
      csvRows.push([r.ssn, `"${r.student}"`, r.courseCode, r.courseSection, `"${r.instructor}"`, r.totalSessions, r.marked, r.notMarked, r.totalPresent, r.totalAbsent].join(","));
    });
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance_${reportType}_${ay}_${semester}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report exported as CSV");
  };

  const getRateColor = (rate: number) => {
    if (rate >= 90) return "text-success";
    if (rate >= 75) return "text-warning";
    return "text-destructive";
  };

  const viewIcon = reportType === "student" ? <GraduationCap className="h-4 w-4" /> : reportType === "faculty" ? <Users className="h-4 w-4" /> : <BookOpen className="h-4 w-4" />;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-gradient-hero p-2">
                <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">Dashboard</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">Attendance Reports</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-5 sm:py-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="border-none p-4 shadow-sm text-center">
            <p className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground mb-0.5">Students</p>
            <p className="text-2xl sm:text-3xl font-bold text-foreground">{totalStudents}</p>
          </Card>
          <Card className="border-none p-4 shadow-sm text-center">
            <p className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground mb-0.5">Faculty</p>
            <p className="text-2xl sm:text-3xl font-bold text-foreground">{totalFaculty}</p>
          </Card>
          <Card className="border-none p-4 shadow-sm text-center">
            <p className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground mb-0.5">Sections</p>
            <p className="text-2xl sm:text-3xl font-bold text-foreground">{totalSections}</p>
          </Card>
          <Card className="border-none p-4 shadow-sm text-center">
            <p className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground mb-0.5">Attendance</p>
            <p className={`text-2xl sm:text-3xl font-bold ${getRateColor(overallRate)}`}>{overallRate}%</p>
          </Card>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-3">
          <Select value={reportType} onValueChange={(v) => { setReportType(v); setSelectedKey(null); }}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="student">Student Wise</SelectItem>
              <SelectItem value="faculty">Faculty Wise</SelectItem>
              <SelectItem value="course-section">Course Section Wise</SelectItem>
            </SelectContent>
          </Select>
          <Select value={ay} onValueChange={setAy}>
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AY_OPTIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={semester} onValueChange={setSemester}>
            <SelectTrigger className="w-[110px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SEMESTER_OPTIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="relative flex-1 min-w-[160px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 h-9" />
          </div>
          <Button onClick={handleExport} size="sm" className="gap-2">
            <Download className="h-4 w-4" /> Export
          </Button>
        </div>

        {/* Aggregated Cards or Detail Table */}
        {!selectedKey ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {aggregated.map((row) => (
                <Card
                  key={row.key}
                  className="border shadow-sm p-4 sm:p-5 cursor-pointer hover:shadow-md hover:ring-1 hover:ring-primary/20 transition-all"
                  onClick={() => setSelectedKey(row.key)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-card-foreground truncate">{row.label}</p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{row.sublabel}</p>
                    </div>
                    <span className={`text-xl font-bold ${getRateColor(row.rate)} shrink-0 ml-3`}>{row.rate}%</span>
                  </div>
                  <Progress value={row.rate} className="h-2 mb-3" />
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-lg bg-muted/50 p-2">
                      <p className="text-xs text-muted-foreground">Sessions</p>
                      <p className="text-sm font-bold text-foreground">{row.totalSessions}</p>
                    </div>
                    <div className="rounded-lg bg-success/10 p-2">
                      <p className="text-xs text-muted-foreground">Present</p>
                      <p className="text-sm font-bold text-success">{row.totalPresent}</p>
                    </div>
                    <div className="rounded-lg bg-destructive/10 p-2">
                      <p className="text-xs text-muted-foreground">Absent</p>
                      <p className="text-sm font-bold text-destructive">{row.totalAbsent}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
        ) : (
          <Card className="border-none shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => setSelectedKey(null)} className="gap-1.5">
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
                <div>
                  <h2 className="text-base font-semibold text-card-foreground">
                    {aggregated.find((a) => a.key === selectedKey)?.label}
                  </h2>
                  <p className="text-xs text-muted-foreground">{detailRows.length} records</p>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="text-xs font-semibold whitespace-nowrap">SSN</TableHead>
                    <TableHead className="text-xs font-semibold whitespace-nowrap">Student</TableHead>
                    <TableHead className="text-xs font-semibold whitespace-nowrap">Course Code</TableHead>
                    <TableHead className="text-xs font-semibold whitespace-nowrap">Course Section</TableHead>
                    <TableHead className="text-xs font-semibold whitespace-nowrap">Instructor</TableHead>
                    <TableHead className="text-xs font-semibold whitespace-nowrap text-center">Total Sessions</TableHead>
                    <TableHead className="text-xs font-semibold whitespace-nowrap text-center">Marked</TableHead>
                    <TableHead className="text-xs font-semibold whitespace-nowrap text-center">Not Marked</TableHead>
                    <TableHead className="text-xs font-semibold whitespace-nowrap text-center">Present</TableHead>
                    <TableHead className="text-xs font-semibold whitespace-nowrap text-center">Absent</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detailRows.map((row, i) => (
                    <TableRow key={`${row.ssn}-${row.courseSection}-${i}`} className="hover:bg-muted/30">
                      <TableCell className="text-xs font-mono text-muted-foreground whitespace-nowrap">{row.ssn}</TableCell>
                      <TableCell className="text-sm font-medium whitespace-nowrap">{row.student}</TableCell>
                      <TableCell className="text-sm whitespace-nowrap">{row.courseCode}</TableCell>
                      <TableCell className="text-sm whitespace-nowrap">{row.courseSection}</TableCell>
                      <TableCell className="text-sm whitespace-nowrap text-muted-foreground">{row.instructor}</TableCell>
                      <TableCell className="text-sm text-center font-medium">{row.totalSessions}</TableCell>
                      <TableCell className="text-sm text-center">{row.marked}</TableCell>
                      <TableCell className="text-sm text-center">
                        <span className={row.notMarked > 0 ? "text-destructive font-medium" : ""}>{row.notMarked}</span>
                      </TableCell>
                      <TableCell className="text-sm text-center">
                        <span className="text-success font-medium">{row.totalPresent}</span>
                      </TableCell>
                      <TableCell className="text-sm text-center">
                        <span className={row.totalAbsent > 0 ? "text-destructive font-medium" : ""}>{row.totalAbsent}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
