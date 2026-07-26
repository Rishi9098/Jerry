import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Chip } from "../components/ui/Chip";
import { Button } from "../components/ui/Button";
import "../features/dashboard/dashboard.css";

interface FlaggedStudent {
  studentId: number;
  studentName: string;
  email: string;
  phone: string;
  courseCode: string;
  courseName: string;
  enrollmentYear: number;
  gpa: number | null;
  academicStanding: string;
  riskSeverity: "High" | "Medium" | "Low";
  riskReasons: string[];
  recommendedActions: string[];
  failingGradeCount: number;
  totalGrades: number;
}

interface AtRiskData {
  totalFlagged: number;
  totalStudentsEvaluated: number;
  severityBreakdown: {
    High: number;
    Medium: number;
    Low: number;
  };
  flaggedStudents: FlaggedStudent[];
}

export const AtRiskInterventionsPage: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<AtRiskData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completedInterventions, setCompletedInterventions] = useState<Record<number, boolean>>({});

  useEffect(() => {
    fetch("/api/at-risk")
      .then((res) => res.json())
      .then((res) => {
        if (res.data) {
          setData(res.data);
        } else {
          setError(res.error?.message || "Failed to evaluate risk.");
        }
      })
      .catch(() => setError("Network error"))
      .finally(() => setLoading(false));
  }, []);

  const toggleIntervention = (studentId: number) => {
    setCompletedInterventions((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  if (loading) {
    return (
      <div className="page-enter" style={{ padding: "var(--space-6)", textAlign: "center" }}>
        <p className="section-label">Evaluating early warning & academic risk triggers...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="page-enter" style={{ padding: "var(--space-6)", textAlign: "center", color: "var(--color-danger)" }}>
        Error loading risk evaluation engine: {error}
      </div>
    );
  }

  return (
    <div className="page-enter">
      <header className="page-head">
        <div className="page-head__titles">
          <span className="page-head__eyebrow">Early Warning Engine</span>
          <h1 className="page-title">At-Risk Early Warning & Interventions</h1>
          <p className="page-head__desc">
            Automated detection of academic deficiencies (D/F grades, GPA drop, missing course grades) & advisor action queue.
          </p>
        </div>
        <div className="page-head__actions">
          <Button variant="secondary" onClick={() => navigate("/students")}>
            View Student Roster
          </Button>
        </div>
      </header>

      {/* Severity Cards */}
      <section className="metric-row">
        <div className="metric-card">
          <span className="metric-card__label" style={{ color: "var(--color-danger)" }}>High Risk Severity</span>
          <span className="metric-card__value tnum">{data.severityBreakdown.High}</span>
          <span className="dash-panel__hint">Failing grades (F) or GPA &lt; 2.0</span>
        </div>

        <div className="metric-card">
          <span className="metric-card__label" style={{ color: "var(--color-warning)" }}>Medium Risk Severity</span>
          <span className="metric-card__value tnum">{data.severityBreakdown.Medium}</span>
          <span className="dash-panel__hint">Deficient D grades or GPA &lt; 2.3</span>
        </div>

        <div className="metric-card">
          <span className="metric-card__label">Total Flagged</span>
          <span className="metric-card__value tnum">{data.totalFlagged}</span>
          <span className="dash-panel__hint">Active advisor queue</span>
        </div>

        <div className="metric-card">
          <span className="metric-card__label">Active Roster Evaluated</span>
          <span className="metric-card__value tnum">{data.totalStudentsEvaluated}</span>
          <span className="dash-panel__hint">Automated background scan</span>
        </div>
      </section>

      {/* Intervention Action Queue List */}
      <section className="panel">
        <div className="panel__head">
          <h2 className="panel__title">Advisor Intervention Action Queue</h2>
          <span className="section-label">{data.totalFlagged} cases flagged</span>
        </div>

        {data.flaggedStudents.length === 0 ? (
          <div style={{ padding: "var(--space-6)", textAlign: "center", color: "var(--color-success)" }}>
            ✓ No students currently meet at-risk threshold criteria! All active academic records are healthy.
          </div>
        ) : (
          <div className="dash-grid" style={{ padding: "var(--space-4)", gridTemplateColumns: "repeat(2, 1fr)" }}>
            {data.flaggedStudents.map((item) => {
              const isResolved = completedInterventions[item.studentId];

              return (
                <div
                  key={item.studentId}
                  className={`risk-card ${item.riskSeverity === "High" ? "high-severity" : "medium-severity"}`}
                  style={{
                    opacity: isResolved ? 0.6 : 1,
                    background: isResolved ? "var(--color-surface-sunken)" : "var(--color-surface)",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {/* Header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <Link
                          to={`/students/${item.studentId}`}
                          style={{ fontWeight: 600, fontSize: "var(--text-h3)", color: "var(--color-ink)" }}
                        >
                          {item.studentName}
                        </Link>
                        <div style={{ fontSize: "var(--text-caption)", color: "var(--color-ink-muted)", marginTop: "2px" }}>
                          {item.courseName} • Enrolled {item.enrollmentYear}
                        </div>
                      </div>
                      <Chip tone={item.riskSeverity === "High" ? "danger" : "warning"}>
                        {item.riskSeverity} Risk
                      </Chip>
                    </div>

                    {/* Stats Pill */}
                    <div style={{ background: "var(--color-canvas)", padding: "8px 12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)", fontSize: "var(--text-cell)", display: "flex", gap: "16px" }}>
                      <div>
                        GPA: <strong className="tnum">{item.gpa?.toFixed(2) ?? "N/A"}</strong>
                      </div>
                      <div>
                        Standing: <strong>{item.academicStanding}</strong>
                      </div>
                    </div>

                    {/* Risk Reasons */}
                    <div>
                      <div className="section-label" style={{ marginBottom: "4px" }}>
                        Detected Risk Triggers:
                      </div>
                      <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "var(--text-cell)", color: "var(--color-danger)" }}>
                        {item.riskReasons.map((reason, idx) => (
                          <li key={idx} style={{ marginBottom: "2px" }}>
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Recommended Actions */}
                    <div>
                      <div className="section-label" style={{ marginBottom: "4px" }}>
                        Recommended Interventions:
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        {item.recommendedActions.map((action, idx) => (
                          <div
                            key={idx}
                            style={{
                              background: "var(--color-primary-tint)",
                              border: "1px solid var(--color-primary-tint-strong)",
                              padding: "6px 10px",
                              borderRadius: "var(--radius-sm)",
                              fontSize: "var(--text-cell)",
                              color: "var(--color-ink)",
                            }}
                          >
                            ✓ {action}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "12px", marginTop: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Button
                      variant={isResolved ? "secondary" : "primary"}
                      size="sm"
                      onClick={() => toggleIntervention(item.studentId)}
                    >
                      {isResolved ? "✓ Intervention Scheduled" : "Mark Pending Action"}
                    </Button>
                    <Link
                      to={`/students/${item.studentId}`}
                      style={{ fontSize: "var(--text-caption)", color: "var(--color-primary)", fontWeight: 550 }}
                    >
                      Academic Profile →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
