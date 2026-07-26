import React, { useEffect, useState } from "react";

interface LetterData {
  institution: string;
  office: string;
  date: string;
  recipient: {
    name: string;
    id: number;
    email: string;
    program: string;
    enrollmentYear: number;
  };
  academicStanding: string;
  gpa: number;
  letterType: string;
  subject: string;
  body: string;
  signatory: {
    name: string;
    title: string;
  };
}

interface OfficialLetterModalProps {
  studentId: number;
  onClose: () => void;
}

export const OfficialLetterModal: React.FC<OfficialLetterModalProps> = ({
  studentId,
  onClose,
}) => {
  const [letter, setLetter] = useState<LetterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/students/${studentId}/letter`)
      .then((res) => res.json())
      .then((res) => {
        if (res.data) {
          setLetter(res.data);
        } else {
          setError(res.error?.message || "Failed to load letter.");
        }
      })
      .catch(() => setError("Network error"))
      .finally(() => setLoading(false));
  }, [studentId]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "640px" }}>
        {/* Header Bar */}
        <div className="modal-header print-hide">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span className="modal-header__badge" style={{ background: "var(--color-warning)" }}>Official Letter</span>
            <h2 className="modal-header__title">Administrative Standing Letter</h2>
          </div>
          <div className="modal-header__actions">
            <button
              onClick={handlePrint}
              disabled={loading || !letter}
              style={{
                background: "var(--color-warning)",
                color: "#1a2332",
                padding: "6px 14px",
                borderRadius: "var(--radius-sm)",
                fontSize: "var(--text-body)",
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                opacity: loading || !letter ? 0.5 : 1,
              }}
            >
              Print Letter
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

        {/* Letter Body */}
        {loading ? (
          <div style={{ padding: "48px", textAlign: "center", color: "var(--color-ink-muted)" }}>
            Generating letter...
          </div>
        ) : error || !letter ? (
          <div style={{ padding: "48px", textAlign: "center", color: "var(--color-danger)" }}>
            {error || "No data"}
          </div>
        ) : (
          <div className="modal-body" style={{ padding: "36px", fontFamily: "var(--font-display)" }}>
            {/* Letterhead */}
            <div style={{ borderBottom: "2px solid var(--color-ink)", paddingBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", fontFamily: "var(--font-ui)" }}>
              <div>
                <div style={{ fontSize: "22px", fontWeight: 700, fontFamily: "var(--font-display)" }}>{letter.institution}</div>
                <div style={{ fontSize: "11px", color: "var(--color-ink-muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>{letter.office}</div>
              </div>
              <div style={{ fontSize: "12px", color: "var(--color-ink-secondary)", fontFamily: "monospace" }}>
                Date: {letter.date}
              </div>
            </div>

            {/* Recipient */}
            <div style={{ background: "var(--color-canvas)", padding: "16px", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)", margin: "20px 0", fontFamily: "var(--font-ui)", fontSize: "13px" }}>
              <div style={{ fontSize: "11px", color: "var(--color-ink-muted)", fontWeight: 700, textTransform: "uppercase" }}>To Student:</div>
              <div style={{ fontWeight: 700, fontSize: "15px", color: "var(--color-ink)", marginTop: "2px" }}>{letter.recipient.name}</div>
              <div style={{ color: "var(--color-ink-secondary)", marginTop: "2px" }}>
                ID: LUM-{String(letter.recipient.id).padStart(5, "0")} | Program: {letter.recipient.program}
              </div>
              <div style={{ color: "var(--color-ink-secondary)" }}>Email: {letter.recipient.email}</div>
            </div>

            {/* Subject */}
            <div style={{ fontFamily: "var(--font-ui)", fontSize: "15px", fontWeight: 700, color: "var(--color-primary)", borderLeft: "4px solid var(--color-primary)", paddingLeft: "12px", margin: "20px 0" }}>
              {letter.subject}
            </div>

            {/* Body */}
            <div style={{ fontSize: "14px", lineHeight: "1.7", color: "var(--color-ink)" }}>
              <p style={{ marginBottom: "12px" }}>Dear {letter.recipient.name},</p>
              <p style={{ marginBottom: "12px" }}>{letter.body}</p>
              <p style={{ marginBottom: "12px" }}>
                If you have any questions regarding your official record or academic standing, please contact the Office of the Registrar.
              </p>
            </div>

            {/* Signatory */}
            <div style={{ paddingTop: "32px", borderTop: "1px solid var(--color-border)", marginTop: "32px", fontFamily: "var(--font-ui)" }}>
              <div style={{ fontSize: "12px", color: "var(--color-ink-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Sincerely,</div>
              <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: "20px", color: "var(--color-ink)", fontWeight: 600, marginTop: "8px" }}>
                {letter.signatory.name}
              </div>
              <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--color-ink)", marginTop: "4px" }}>
                {letter.signatory.name}
              </div>
              <div style={{ fontSize: "11px", color: "var(--color-ink-secondary)" }}>
                {letter.signatory.title}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
