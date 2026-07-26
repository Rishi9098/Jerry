import React from "react";
import type { Student, Grade } from "../lib/types";

interface OfficialTranscriptModalProps {
  student: Student;
  onClose: () => void;
}

export const OfficialTranscriptModal: React.FC<OfficialTranscriptModalProps> = ({
  student,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const gradesList: Grade[] = student.grades || [];

  const totalCredits = gradesList.reduce((sum: number, g: Grade) => sum + g.credits, 0);
  const totalPoints = gradesList.reduce(
    (sum: number, g: Grade) => sum + (g.gradePoints || 0) * g.credits,
    0
  );
  const calculatedGpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "N/A";

  // Group grades by term
  const termGrades = gradesList.reduce<Record<string, Grade[]>>((acc, g: Grade) => {
    acc[g.term] = acc[g.term] || [];
    acc[g.term].push(g);
    return acc;
  }, {});

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Modal Actions Bar (hidden on print) */}
        <div className="modal-header print-hide">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span className="modal-header__badge">Official Record</span>
            <h2 className="modal-header__title">Academic Transcript Preview</h2>
          </div>
          <div className="modal-header__actions">
            <button
              onClick={handlePrint}
              style={{
                background: "var(--color-primary)",
                color: "#fff",
                padding: "6px 14px",
                borderRadius: "var(--radius-sm)",
                fontSize: "var(--text-body)",
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
              }}
            >
              Print / Save as PDF
            </button>
            <button
              onClick={onClose}
              style={{
                background: "transparent",
                color: "rgba(255,255,255,0.7)",
                border: "none",
                fontSize: "18px",
                cursor: "pointer",
                padding: "4px 8px",
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Printable Transcript Document */}
        <div className="transcript-doc">
          {/* Header & Crest */}
          <div className="transcript-header">
            <div>
              <div className="transcript-sub" style={{ textTransform: "uppercase", fontWeight: 700, color: "var(--color-primary)" }}>
                Office of the Registrar
              </div>
              <h1 className="transcript-institution">Lumen University</h1>
              <p className="transcript-sub">
                100 University Heights, Academic Center • Official Record of Academic Standing
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <span className="transcript-badge">Official Transcript</span>
              <div className="transcript-sub" style={{ marginTop: "4px" }}>
                Issue Date: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </div>
            </div>
          </div>

          {/* Student Profile Info Grid */}
          <div className="transcript-grid">
            <div>
              <div className="transcript-field__label">Student Name</div>
              <div className="transcript-field__value">{student.name}</div>
            </div>
            <div>
              <div className="transcript-field__label">Student ID</div>
              <div className="transcript-field__value tnum">LUM-{String(student.id).padStart(5, "0")}</div>
            </div>
            <div>
              <div className="transcript-field__label">Degree Program</div>
              <div className="transcript-field__value">{student.courseName || "General Studies"}</div>
            </div>
            <div>
              <div className="transcript-field__label">Enrollment Cohort</div>
              <div className="transcript-field__value tnum">{student.enrollmentYear}</div>
            </div>
          </div>

          {/* Academic Standing Banner */}
          <div className="transcript-standing-banner">
            <div>
              <strong>Academic Standing:</strong>{" "}
              <span style={{ color: "var(--color-primary)", fontWeight: 700 }}>
                {student.academicStanding || "Good Standing"}
              </span>
            </div>
            <div style={{ display: "flex", gap: "16px" }}>
              <span>Cumulative GPA: <strong className="tnum">{calculatedGpa}</strong></span>
              <span>Total Earned Credits: <strong className="tnum">{totalCredits}</strong></span>
            </div>
          </div>

          {/* Term-by-Term Course & Grade Ledger */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {Object.keys(termGrades).length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px", color: "var(--color-ink-muted)" }}>
                No course records on file for this student.
              </div>
            ) : (
              Object.entries(termGrades).map(([term, termGradesList]: [string, Grade[]]) => {
                const termCreds = termGradesList.reduce((s: number, g: Grade) => s + g.credits, 0);
                const termPts = termGradesList.reduce((s: number, g: Grade) => s + (g.gradePoints || 0) * g.credits, 0);
                const termGpa = termCreds > 0 ? (termPts / termCreds).toFixed(2) : "0.00";

                return (
                  <div key={term} style={{ border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
                    <div style={{ background: "var(--color-canvas)", padding: "8px 12px", display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--color-border)", fontSize: "var(--text-cell)", fontWeight: 600 }}>
                      <span>Term: {term}</span>
                      <span>Term GPA: <strong className="tnum">{termGpa}</strong> | Credits: {termCreds}</span>
                    </div>
                    <table className="transcript-table">
                      <thead>
                        <tr>
                          <th>Subject / Course Name</th>
                          <th style={{ textAlign: "center" }}>Credits</th>
                          <th style={{ textAlign: "center" }}>Grade</th>
                          <th style={{ textAlign: "right" }}>Grade Points</th>
                        </tr>
                      </thead>
                      <tbody>
                        {termGradesList.map((g: Grade) => (
                          <tr key={g.id}>
                            <td style={{ fontWeight: 600 }}>{g.subject}</td>
                            <td style={{ textAlign: "center" }} className="tnum">{g.credits}</td>
                            <td style={{ textAlign: "center" }}>
                              <span style={{ fontFamily: "monospace", fontWeight: 700, padding: "2px 6px", background: "var(--color-canvas)", border: "1px solid var(--color-border)", borderRadius: "4px" }}>
                                {g.letter}
                              </span>
                            </td>
                            <td style={{ textAlign: "right" }} className="tnum">{(g.gradePoints || 0).toFixed(1)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })
            )}
          </div>

          {/* Transcript Summary & Signature Seal Footer */}
          <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "24px", marginTop: "32px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px", alignItems: "end" }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: "11px", letterSpacing: "0.05em", color: "var(--color-ink-muted)", marginBottom: "4px" }}>RECORD AUTHENTICATION</div>
              <p style={{ fontSize: "11px", color: "var(--color-ink-secondary)", lineHeight: 1.5, margin: 0 }}>
                This official transcript is issued by Lumen University Office of the Registrar.
                Any alteration or forgery of this document invalidates its authenticity.
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: "18px", color: "var(--color-primary)", borderBottom: "1px solid var(--color-border)", paddingBottom: "4px", display: "inline-block", minWidth: "180px" }}>
                Eleanor Vance
              </div>
              <div style={{ fontSize: "11px", color: "var(--color-ink-secondary)", marginTop: "4px" }}>
                <strong>Dr. Eleanor Vance</strong><br />
                University Registrar & Vice Dean of Academic Records
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
