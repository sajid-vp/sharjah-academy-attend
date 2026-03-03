import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Shield, Download, Search } from "lucide-react";
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

const AdminDashboard = () => {
  const [reportType, setReportType] = useState("student");
  const [ay, setAy] = useState("2025-2026");
  const [semester, setSemester] = useState("Fall");
  const [searchQuery, setSearchQuery] = useState("");
  const [studentFilter, setStudentFilter] = useState("all");
  const [facultyFilter, setFacultyFilter] = useState("all");
  const [sectionFilter, setSectionFilter] = useState("all");

  const students = useMemo(() => [...new Set(MOCK_DATA.map((r) => r.student))], []);
  const faculty = useMemo(() => [...new Set(MOCK_DATA.map((r) => r.instructor))], []);
  const sections = useMemo(() => [...new Set(MOCK_DATA.map((r) => r.courseSection))], []);

  const filteredData = useMemo(() => {
    let data = MOCK_DATA;
    if (studentFilter !== "all") data = data.filter((r) => r.student === studentFilter);
    if (facultyFilter !== "all") data = data.filter((r) => r.instructor === facultyFilter);
    if (sectionFilter !== "all") data = data.filter((r) => r.courseSection === sectionFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      data = data.filter((r) =>
        r.ssn.toLowerCase().includes(q) ||
        r.student.toLowerCase().includes(q) ||
        r.courseCode.toLowerCase().includes(q) ||
        r.courseSection.toLowerCase().includes(q) ||
        r.instructor.toLowerCase().includes(q)
      );
    }
    return data;
  }, [searchQuery, studentFilter, facultyFilter, sectionFilter]);

  const handleExport = () => {
    const headers = ["SSN", "Student", "Course Code", "Course Section", "Instructor", "Total Sessions Scheduled", "Marked", "Not Marked", "Total Present", "Total Absent"];
    const csvRows = [headers.join(",")];
    filteredData.forEach((r) => {
      csvRows.push([r.ssn, `"${r.student}"`, r.courseCode, r.courseSection, `"${r.instructor}"`, r.totalSessions, r.marked, r.notMarked, r.totalPresent, r.totalAbsent].join(","));
    });
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance_report_${ay}_${semester}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report exported as CSV");
  };

  const handleClearFilters = () => {
    setStudentFilter("all");
    setFacultyFilter("all");
    setSectionFilter("all");
    setSearchQuery("");
  };

  const hasFilters = studentFilter !== "all" || facultyFilter !== "all" || sectionFilter !== "all" || searchQuery.trim();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/">
                <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-gradient-hero p-2">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-foreground">Attendance Report</h1>
                  <p className="text-xs text-muted-foreground">Admin</p>
                </div>
              </div>
            </div>
            <Button onClick={handleExport} size="sm" className="gap-2">
              <Download className="h-4 w-4" /> <span className="hidden sm:inline">Export CSV</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b bg-card/50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <Select value={ay} onValueChange={setAy}>
              <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{AY_OPTIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={semester} onValueChange={setSemester}>
              <SelectTrigger className="w-[100px] h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{SEMESTER_OPTIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
            <div className="h-5 w-px bg-border mx-1 hidden sm:block" />
            <Select value={studentFilter} onValueChange={setStudentFilter}>
              <SelectTrigger className="w-[160px] h-8 text-xs"><SelectValue placeholder="All Students" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Students</SelectItem>
                {students.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={facultyFilter} onValueChange={setFacultyFilter}>
              <SelectTrigger className="w-[160px] h-8 text-xs"><SelectValue placeholder="All Faculty" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Faculty</SelectItem>
                {faculty.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={sectionFilter} onValueChange={setSectionFilter}>
              <SelectTrigger className="w-[160px] h-8 text-xs"><SelectValue placeholder="All Sections" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sections</SelectItem>
                {sections.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8 h-8 w-[140px] text-xs" />
            </div>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={handleClearFilters} className="h-8 text-xs text-muted-foreground">
                Clear
              </Button>
            )}
            <span className="text-xs text-muted-foreground ml-auto">{filteredData.length} records</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-xs font-semibold whitespace-nowrap">SSN</TableHead>
              <TableHead className="text-xs font-semibold whitespace-nowrap">Student</TableHead>
              <TableHead className="text-xs font-semibold whitespace-nowrap">Course Code</TableHead>
              <TableHead className="text-xs font-semibold whitespace-nowrap">Course Section</TableHead>
              <TableHead className="text-xs font-semibold whitespace-nowrap">Instructor</TableHead>
              <TableHead className="text-xs font-semibold whitespace-nowrap text-center">Total No. of Sessions Scheduled</TableHead>
              <TableHead className="text-xs font-semibold whitespace-nowrap text-center">Marked</TableHead>
              <TableHead className="text-xs font-semibold whitespace-nowrap text-center">Not Marked</TableHead>
              <TableHead className="text-xs font-semibold whitespace-nowrap text-center">Total Present</TableHead>
              <TableHead className="text-xs font-semibold whitespace-nowrap text-center">Total Absent</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-16 text-muted-foreground">
                  No records found
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((row, i) => (
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
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminDashboard;
