import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useStudent,
  useGrades,
  useAddGrade,
  useUpdateGrade,
  useDeleteGrade,
  useDeleteStudent,
} from "../lib/queries";
import { ApiError } from "../lib/api";
import type { Grade, GradeInput } from "../lib/types";
import { useToast } from "../components/feedback/Toast";
import { Button } from "../components/ui/Button";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { EmptyState, ErrorState, Skeleton } from "../components/ui/States";
import { GradeFormModal } from "../features/grades/GradeFormModal";
import { TranscriptTable } from "../features/grades/TranscriptTable";
import { StudentSummaryCard } from "../features/students/StudentSummaryCard";
import "../features/students/student-profile.css";

import { OfficialTranscriptModal } from "../components/OfficialTranscriptModal";
import { OfficialLetterModal } from "../components/OfficialLetterModal";

export function StudentProfilePage() {
  const { id } = useParams();
  const studentId = Number(id);
  const navigate = useNavigate();
  const toast = useToast();

  const { data: student, isLoading, isError, error, refetch } =
    useStudent(studentId);
  const { data: gradeData, isLoading: gradesLoading } = useGrades(studentId);

  const addGrade = useAddGrade(studentId);
  const updateGrade = useUpdateGrade(studentId);
  const deleteGrade = useDeleteGrade(studentId);
  const deleteStudent = useDeleteStudent();

  const [gradeModalOpen, setGradeModalOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Grade | null>(null);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [transcriptModalOpen, setTranscriptModalOpen] = useState(false);
  const [letterModalOpen, setLetterModalOpen] = useState(false);

  const summary = gradeData?.summary;
  const grades = gradeData?.grades ?? [];

  const sortedGrades = useMemo(
    () => [...grades].sort((a, b) => b.term.localeCompare(a.term)),
    [grades],
  );

  if (Number.isNaN(studentId)) {
    navigate("/404", { replace: true });
    return null;
  }

  if (isError) {
    const notFound = error instanceof ApiError && error.status === 404;
    if (notFound) {
      return (
        <div className="page-enter">
          <EmptyState
            title="Student not found"
            message="This student isn’t in the registrar. They may have been removed."
            action={
              <Button variant="primary" size="sm" onClick={() => navigate("/students")}>
                Back to roster
              </Button>
            }
          />
        </div>
      );
    }
    return (
      <div className="page-enter">
        <ErrorState error={error} onRetry={() => refetch()} />
      </div>
    );
  }

  const onSubmitGrade = async (input: GradeInput) => {
    try {
      if (editingGrade) {
        await updateGrade.mutateAsync({ id: editingGrade.id, input });
        toast.success("Grade updated", `${input.subject} saved.`);
      } else {
        await addGrade.mutateAsync(input);
        toast.success("Grade added", `${input.subject} posted to the transcript.`);
      }
      setGradeModalOpen(false);
      setEditingGrade(null);
    } catch (e) {
      toast.error(
        editingGrade ? "Could not update grade" : "Could not add grade",
        e instanceof ApiError ? e.message : undefined,
      );
      throw e;
    }
  };

  const confirmDeleteGrade = async () => {
    if (!pendingDelete) return;
    const subject = pendingDelete.subject;
    setPendingDelete(null);
    try {
      await deleteGrade.mutateAsync(pendingDelete.id);
      toast.success("Grade removed", `${subject} deleted from the transcript.`);
    } catch (e) {
      toast.error("Could not delete grade", e instanceof ApiError ? e.message : undefined);
    }
  };

  const confirmArchive = async () => {
    try {
      await deleteStudent.mutateAsync(studentId);
      setArchiveOpen(false);
      toast.success("Student archived", `${student?.name} moved to the archive.`);
      navigate("/students");
    } catch (e) {
      toast.error("Could not archive student", e instanceof ApiError ? e.message : undefined);
    }
  };

  return (
    <div className="page-enter">
      <header className="page-head profile-head">
        <div className="page-head__titles">
          <span className="page-head__eyebrow">
            Student · #{String(studentId).padStart(4, "0")}
          </span>
          <h1 className="page-title">
            {isLoading ? <Skeleton width={240} height={28} /> : student?.name}
          </h1>
          <p className="page-head__desc">
            {isLoading ? (
              <Skeleton width={300} />
            ) : (
              <>
                {student?.courseName}
                {student?.courseCode ? ` · ${student.courseCode}` : ""}
                {" · "}Enrolled {student?.enrollmentYear}
              </>
            )}
          </p>
        </div>
        <div className="page-head__actions">
          <Button
            variant="secondary"
            onClick={() => setTranscriptModalOpen(true)}
            disabled={isLoading || !student}
          >
            📄 Print Transcript
          </Button>
          <Button
            variant="secondary"
            onClick={() => setLetterModalOpen(true)}
            disabled={isLoading || !student}
          >
            ✉ Standing Letter
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate(`/students/${studentId}/edit`)}
            disabled={isLoading}
          >
            Edit details
          </Button>
          <Button
            variant="ghost"
            onClick={() => setArchiveOpen(true)}
            disabled={isLoading || student?.archived}
          >
            {student?.archived ? "Archived" : "Archive"}
          </Button>
        </div>
      </header>

      <div className="profile-grid">
        <main className="profile-main">
          <section className="panel transcript-panel">
            <div className="panel__head transcript-panel__head">
              <div>
                <h2 className="panel__title">Transcript</h2>
                <p className="transcript-panel__sub">
                  {summary?.count ?? 0} {summary?.count === 1 ? "entry" : "entries"}
                  {summary?.totalCredits
                    ? ` · ${summary.totalCredits} credits`
                    : ""}
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setEditingGrade(null);
                  setGradeModalOpen(true);
                }}
                icon={
                  <svg viewBox="0 0 14 14" width="13" height="13" aria-hidden>
                    <path
                      d="M7 3v8M3 7h8"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                    />
                  </svg>
                }
              >
                Add grade
              </Button>
            </div>

            {gradesLoading ? (
              <div style={{ padding: "var(--space-4)" }}>
                <Skeleton height={18} width="60%" />
                <div style={{ height: 12 }} />
                <Skeleton height={14} />
                <div style={{ height: 8 }} />
                <Skeleton height={14} />
              </div>
            ) : sortedGrades.length === 0 ? (
              <EmptyState
                title="No grades recorded"
                message="This student doesn’t have any grades yet. Post the first entry to start the transcript."
                action={
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setEditingGrade(null);
                      setGradeModalOpen(true);
                    }}
                  >
                    Add first grade
                  </Button>
                }
              />
            ) : (
              <TranscriptTable
                grades={sortedGrades}
                onEdit={(g) => {
                  setEditingGrade(g);
                  setGradeModalOpen(true);
                }}
                onDelete={(g) => setPendingDelete(g)}
              />
            )}
          </section>
        </main>

        <StudentSummaryCard
          student={student}
          summary={summary}
          loading={isLoading}
        />
      </div>

      <GradeFormModal
        open={gradeModalOpen}
        editing={editingGrade}
        onClose={() => {
          setGradeModalOpen(false);
          setEditingGrade(null);
        }}
        onSubmit={onSubmitGrade}
      />

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete grade?"
        message={
          pendingDelete
            ? `Remove ${pendingDelete.subject} (${pendingDelete.term}) from the transcript? The GPA will be recalculated.`
            : ""
        }
        confirmLabel="Delete grade"
        destructive
        onConfirm={confirmDeleteGrade}
        onCancel={() => setPendingDelete(null)}
      />

      <ConfirmDialog
        open={archiveOpen}
        title="Archive student?"
        message={`${student?.name} will be removed from the active roster but kept on file. You can restore them later.`}
        confirmLabel="Archive student"
        destructive
        loading={deleteStudent.isPending}
        onConfirm={confirmArchive}
        onCancel={() => setArchiveOpen(false)}
      />

      {transcriptModalOpen && student && (
        <OfficialTranscriptModal
          student={student}
          onClose={() => setTranscriptModalOpen(false)}
        />
      )}

      {letterModalOpen && (
        <OfficialLetterModal
          studentId={studentId}
          onClose={() => setLetterModalOpen(false)}
        />
      )}
    </div>
  );
}
