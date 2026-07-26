"""Degree Audit backend blueprint."""
from __future__ import annotations

from flask import Blueprint, jsonify

from ..errors import ApiError
from ..models import Student, db

degree_audit_bp = Blueprint("degree_audit", __name__, url_prefix="/api/degree-audit")

DEGREE_CREDITS_TARGET = 120.0
MIN_GRAD_GPA = 2.00


def _envelope(data, status=200):
    return jsonify({"data": data, "error": None, "meta": None}), status


def audit_student(student: Student) -> dict:
    passing_grades = [g for g in student.grades if g.letter != "F"]
    credits_earned = sum(g.credits for g in passing_grades)
    gpa_val = student.gpa() or 0.0

    percent = min(round((credits_earned / DEGREE_CREDITS_TARGET) * 100.0, 1), 100.0)
    credits_remaining = max(0.0, round(DEGREE_CREDITS_TARGET - credits_earned, 1))

    if credits_earned >= DEGREE_CREDITS_TARGET and gpa_val >= MIN_GRAD_GPA:
        status = "Graduation Ready"
        color = "success"
    elif gpa_val < MIN_GRAD_GPA:
        status = "GPA Deficit"
        color = "danger"
    elif credits_earned < 45.0 and student.enrollment_year <= 2021:
        status = "Credit Shortfall"
        color = "warning"
    else:
        status = "On Track"
        color = "info"

    return {
        "studentId": student.id,
        "studentName": student.name,
        "email": student.email,
        "courseCode": student.course.code if student.course else "GEN",
        "courseName": student.course.name if student.course else "General Studies",
        "enrollmentYear": student.enrollment_year,
        "gpa": gpa_val,
        "academicStanding": student.academic_standing,
        "creditsEarned": credits_earned,
        "targetCredits": DEGREE_CREDITS_TARGET,
        "creditsRemaining": credits_remaining,
        "completionPercentage": percent,
        "graduationEligibility": status,
        "badgeColor": color,
        "gradeCount": len(student.grades),
    }


@degree_audit_bp.get("/summary")
def get_audit_summary():
    students = Student.query.filter(Student.archived.is_(False)).all()
    audits = [audit_student(s) for s in students]

    counts = {
        "Graduation Ready": 0,
        "On Track": 0,
        "Credit Shortfall": 0,
        "GPA Deficit": 0,
    }
    for a in audits:
        st = a["graduationEligibility"]
        counts[st] = counts.get(st, 0) + 1

    return _envelope({
        "summary": counts,
        "totalStudents": len(students),
        "audits": audits,
    })


@degree_audit_bp.get("/student/<int:student_id>")
def get_student_audit(student_id: int):
    student = db.session.get(Student, student_id)
    if not student:
        raise ApiError("Student not found.", status=404, code="not_found")
    return _envelope(audit_student(student))
