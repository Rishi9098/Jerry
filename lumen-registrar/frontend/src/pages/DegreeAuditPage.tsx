import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Chip } from "../components/ui/Chip";
import { Button } from "../components/ui/Button";
import { TextInput } from "../components/ui/Field";
import "../features/dashboard/dashboard.css";
import "../features/students/students-list.css";

interface DegreeAuditItem {
  studentId: number;
  studentName: string;
  email: string;
  courseCode: string;
  courseName: string;
  enrollmentYear: number;
  gpa: number;
  academicStanding: string;
  creditsEarned: number;
  targetCredits: number;
  creditsRemaining: number;
  completionPercentage: number;
  graduationEligibility: string;
  badgeColor: string;
  gradeCount: number;
}

interface SummaryData {
  summary: Record<string, number>;
  totalStudents: number;
  audits: DegreeAuditItem[];
}

export const DegreeAuditPage: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/degree-audit/summary")
      .then((res) => res.json())
      .then((res) => {
        if (res.data) {
          setData(res.data);
        } else {
          setError(res.error?.message || "Failed to load degree audits.");
        }
      })
      .catch(() => setError("Network error"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="page-enter" style={{ padding: "var(--space-6)", textAlign: "center" }}>
        <p className="section-label">Running automated degree completion audits...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="page-enter" style={{ padding: "var(--space-6)", textAlign: "center", color: "var(--color-danger)" }}>
        Error loading degree audit engine: {error}
      </div>
    );
  }

  const filteredAudits = data.audits.filter((item) => {
    const matchesFilter =
      filterStatus === "ALL" || item.graduationEligibility === filterStatus;
    const matchesSearch =
      item.studentName.toLowerCase().includes(search.toLowerCase()) ||
      item.courseCode.toLowerCase().includes(search.toLowerCase()) ||
      String(item.studentId).includes(search);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="page-enter">
      <header className="page-head">
        <div className="page-head__titles">
          <span className="page-head__eyebrow">Academic Audit</span>
          <h1 className="page-title">Degree Audit & Graduation Eligibility</h1>
          <p className="page-head__desc">
            Real-time evaluation of student degree progress, credit targets (120 cr), and graduation readiness.
          </p>
        </div>
        <div className="page-head__actions">
          <Button variant="secondary" onClick={() => navigate("/students")}>
            View Student Roster
          </Button>
        </div>
      </header>

      {/* KPI Metric Cards */}
      <section className="metric-row">
        <div
          className={`metric-card metric-card--link ${filterStatus === "ALL" ? "is-active" : ""}`}
          onClick={() => setFilterStatus("ALL")}
        >
          <span className="metric-card__label">Total Audited</span>
          <span className="metric-card__value tnum">{data.totalStudents}</span>
        </div>

        <div
          className={`metric-card metric-card--link ${filterStatus === "Graduation Ready" ? "is-active" : ""}`}
          onClick={() => setFilterStatus("Graduation Ready")}
        >
          <span className="metric-card__label">Graduation Ready</span>
          <span className="metric-card__value tnum">{data.summary["Graduation Ready"] || 0}</span>
        </div>

        <div
          className={`metric-card metric-card--link ${filterStatus === "On Track" ? "is-active" : ""}`}
          onClick={() => setFilterStatus("On Track")}
        >
          <span className="metric-card__label">On Track</span>
          <span className="metric-card__value tnum">{data.summary["On Track"] || 0}</span>
        </div>

        <div
          className={`metric-card metric-card--link ${filterStatus === "Credit Shortfall" ? "is-active" : ""}`}
          onClick={() => setFilterStatus("Credit Shortfall")}
        >
          <span className="metric-card__label">Credit Deficit</span>
          <span className="metric-card__value tnum">{data.summary["Credit Shortfall"] || 0}</span>
        </div>
      </section>

      {/* Filter Toolbar */}
      <div className="students-toolbar">
        <div className="students-search" style={{ flex: 1, maxWidth: 360 }}>
          <TextInput
            placeholder="Search student, ID, or course code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="section-label" style={{ alignSelf: "center" }}>
          Showing {filteredAudits.length} of {data.totalStudents} audits
        </div>
      </div>

      {/* Audit Table */}
      <section className="panel">
        <div className="panel__head">
          <h2 className="panel__title">Degree Completion Ledger</h2>
          {filterStatus !== "ALL" && (
            <Button variant="ghost" size="sm" onClick={() => setFilterStatus("ALL")}>
              Reset filter
            </Button>
          )}
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th className="data-table__th">Student</th>
                <th className="data-table__th">Degree Program</th>
                <th className="data-table__th num">GPA</th>
                <th className="data-table__th num">Credits Earned</th>
                <th className="data-table__th">Progress toward 120 cr</th>
                <th className="data-table__th">Eligibility Status</th>
                <th className="data-table__th text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredAudits.length === 0 ? (
                <tr>
                  <td colSpan={7} className="data-table__td" style={{ textAlign: "center", padding: "var(--space-6)" }}>
                    No degree audit records match the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredAudits.map((item) => (
                  <tr key={item.studentId} className="data-table__tr">
                    <td className="data-table__td">
                      <Link to={`/students/${item.studentId}`} className="student-name-link font-semibold">
                        {item.studentName}
                      </Link>
                      <div className="tnum detail-muted" style={{ fontSize: "var(--text-caption)" }}>
                        LUM-{String(item.studentId).padStart(5, "0")}
                      </div>
                    </td>
                    <td className="data-table__td">
                      <span className="detail-code mr-2">{item.courseCode}</span>
                      {item.courseName}
                    </td>
                    <td className="data-table__td num font-bold tnum">
                      {item.gpa.toFixed(2)}
                    </td>
                    <td className="data-table__td num tnum">
                      <strong>{item.creditsEarned}</strong> / {item.targetCredits} cr
                    </td>
                    <td className="data-table__td" style={{ minWidth: 180 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div className="audit-progress-bar">
                          <div
                            className="audit-progress-fill"
                            style={{
                              width: `${item.completionPercentage}%`,
                              background:
                                item.completionPercentage >= 100
                                  ? "var(--color-success)"
                                  : item.completionPercentage >= 50
                                  ? "var(--color-primary)"
                                  : "var(--color-warning)",
                            }}
                          />
                        </div>
                        <span className="tnum" style={{ fontSize: "var(--text-caption)", fontWeight: 600 }}>
                          {item.completionPercentage}%
                        </span>
                      </div>
                    </td>
                    <td className="data-table__td">
                      <Chip
                        tone={
                          item.graduationEligibility === "Graduation Ready"
                            ? "success"
                            : item.graduationEligibility === "Credit Shortfall"
                            ? "warning"
                            : item.graduationEligibility === "GPA Deficit"
                            ? "danger"
                            : "info"
                        }
                      >
                        {item.graduationEligibility}
                      </Chip>
                    </td>
                    <td className="data-table__td text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate(`/students/${item.studentId}`)}
                      >
                        View profile
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
