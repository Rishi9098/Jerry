"""At-Risk Early Warning & Intervention backend blueprint."""
from __future__ import annotations

from flask import Blueprint, jsonify

from ..models import Student, db

at_risk_bp = Blueprint("at_risk", __name__, url_prefix="/api/at-risk")


def _envelope(data, status=200):
    return jsonify({"data": data, "error": None, "meta": None}), status


def evaluate_risk(student: Student) -> dict | None:
    gpa_val = student.gpa()
    failing_grades = [g for g in student.grades if g.letter in ("D+", "D", "D-", "F")]
    
    reasons = []
    recommended_actions = []
    severity = "Low"

    if failing_grades:
        f_count = len([g for g in failing_grades if g.letter == "F"])
        d_count = len(failing_grades) - f_count
        if f_count > 0:
            reasons.append(f"{f_count} Failing (F) Grade(s)")
            severity = "High"
            recommended_actions.append("Mandatory Course Retake & Tutoring")
        if d_count > 0:
            reasons.append(f"{d_count} Deficient (D) Grade(s)")
            if severity != "High":
                severity = "Medium"
            recommended_actions.append("Subject Academic Counseling")

    if gpa_val is not None and gpa_val < 2.30:
        reasons.append(f"Low Cumulative GPA ({gpa_val:.2f})")
        if gpa_val < 2.0:
            severity = "High"
            recommended_actions.append("Formal Academic Warning Notice")
        elif severity == "Low":
            severity = "Medium"
        recommended_actions.append("Advisor Progress Monitoring")

    if not student.grades:
        reasons.append("No Recorded Course Grades")
        if severity == "Low":
            severity = "Medium"
        recommended_actions.append("Verify Midterm Enrollment & Attendance")

    if not reasons:
        return None

    # Deduplicate actions
    dedup_actions = list(dict.fromkeys(recommended_actions))

    return {
        "studentId": student.id,
        "studentName": student.name,
        "email": student.email,
        "phone": student.phone,
        "courseCode": student.course.code if student.course else "GEN",
        "courseName": student.course.name if student.course else "General Studies",
        "enrollmentYear": student.enrollment_year,
        "gpa": gpa_val,
        "academicStanding": student.academic_standing,
        "riskSeverity": severity,
        "riskReasons": reasons,
        "recommendedActions": dedup_actions,
        "failingGradeCount": len(failing_grades),
        "totalGrades": len(student.grades),
    }


@at_risk_bp.get("")
def list_at_risk():
    students = Student.query.filter(Student.archived.is_(False)).all()
    flagged = []
    for s in students:
        risk = evaluate_risk(s)
        if risk:
            flagged.append(risk)

    # Sort by High severity first, then by lowest GPA
    severity_rank = {"High": 0, "Medium": 1, "Low": 2}
    flagged.sort(key=lambda x: (severity_rank.get(x["riskSeverity"], 3), x["gpa"] or 0.0))

    high_count = len([x for x in flagged if x["riskSeverity"] == "High"])
    med_count = len([x for x in flagged if x["riskSeverity"] == "Medium"])
    low_count = len([x for x in flagged if x["riskSeverity"] == "Low"])

    return _envelope({
        "totalFlagged": len(flagged),
        "totalStudentsEvaluated": len(students),
        "severityBreakdown": {
            "High": high_count,
            "Medium": med_count,
            "Low": low_count,
        },
        "flaggedStudents": flagged,
    })
