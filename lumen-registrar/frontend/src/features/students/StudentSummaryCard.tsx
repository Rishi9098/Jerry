import type { ReactNode } from "react";
import type { GradeSummary, Student } from "../../lib/types";
import { formatGpa } from "../../lib/grades";
import { GradeChip, StatusChip } from "../../components/ui/Chip";
import { Skeleton } from "../../components/ui/States";

interface StudentSummaryCardProps {
  student?: Student;
  summary?: GradeSummary;
  loading?: boolean;
}

function gpaToLetter(gpa: number): string {
  if (gpa >= 3.7) return "A";
  if (gpa >= 2.7) return "B";
  if (gpa >= 1.7) return "C";
  if (gpa >= 0.7) return "D";
  return "F";
}

function formatDob(dob: string): string {
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return dob;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="detail-row">
      <dt className="detail-row__label">{label}</dt>
      <dd className="detail-row__value">{children}</dd>
    </div>
  );
}

export function StudentSummaryCard({
  student,
  summary,
  loading,
}: StudentSummaryCardProps) {
  if (loading || !student) {
    return (
      <aside className="profile-aside">
        <section className="panel profile-card">
          <div className="profile-card__pad">
            <Skeleton height={18} width="50%" />
            <div style={{ height: 16 }} />
            <Skeleton height={14} />
            <div style={{ height: 10 }} />
            <Skeleton height={14} />
            <div style={{ height: 10 }} />
            <Skeleton height={14} />
          </div>
        </section>
      </aside>
    );
  }

  const gpa = summary?.gpa ?? student.gpa ?? null;

  return (
    <aside className="profile-aside">
      <section className="panel profile-card">
        <div className="profile-stats">
          <div className="profile-stat">
            <span className="profile-stat__label">GPA</span>
            <span className="profile-stat__value tnum">
              {gpa != null && <GradeChip letter={gpaToLetter(gpa)} />}
              {formatGpa(gpa)}
            </span>
          </div>
          <div className="profile-stat">
            <span className="profile-stat__label">Age</span>
            <span className="profile-stat__value tnum">
              {student.age != null ? `${student.age}` : "—"}
            </span>
          </div>
          <div className="profile-stat">
            <span className="profile-stat__label">Grades</span>
            <span className="profile-stat__value tnum">
              {summary?.count ?? student.gradeCount ?? 0}
            </span>
          </div>
        </div>

        <dl className="detail-group">
          <p className="section-label detail-group__head">Identity</p>
          <Row label="Full name">{student.name}</Row>
          <Row label="Date of birth">
            <span className="tnum">{formatDob(student.dob)}</span>
          </Row>
          <Row label="Status">
            <StatusChip status={student.status} />
          </Row>
        </dl>

        <dl className="detail-group">
          <p className="section-label detail-group__head">Contact</p>
          <Row label="Email">
            <a className="detail-link" href={`mailto:${student.email}`}>
              {student.email}
            </a>
          </Row>
          <Row label="Phone">
            {student.phone ? (
              <span className="tnum">{student.phone}</span>
            ) : (
              <span className="detail-muted">Not provided</span>
            )}
          </Row>
        </dl>

        <dl className="detail-group">
          <p className="section-label detail-group__head">Academic Standing & Degree Audit</p>
          <Row label="Standing">
            <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-xs">
              {student.academicStanding || "Good Standing"}
            </span>
          </Row>
          <Row label="Earned Credits">
            <span className="tnum font-bold text-slate-900">
              {summary?.totalCredits ?? 0}
            </span>{" "}
            / 120 cr
          </Row>
          <Row label="Program">
            {student.courseName ?? "—"}
            {student.courseCode && (
              <span className="detail-code">{student.courseCode}</span>
            )}
          </Row>
          <Row label="Enrolled">
            <span className="tnum">{student.enrollmentYear}</span>
          </Row>
          <Row label="On file since">
            <span className="tnum">{formatDob(student.createdAt)}</span>
          </Row>
        </dl>
      </section>
    </aside>
  );
}
