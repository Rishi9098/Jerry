"""Student resource endpoints."""
from __future__ import annotations

from flask import Blueprint, jsonify, request
from sqlalchemy import asc, desc, or_

from ..errors import ApiError, field_error
from ..models import Course, Student, db
from ..validation import validate_student

students_bp = Blueprint("students", __name__, url_prefix="/api/students")

SORT_COLUMNS = {
    "name": Student.name,
    "id": Student.id,
    "enrollmentYear": Student.enrollment_year,
    "status": Student.status,
    "createdAt": Student.created_at,
}
MAX_PAGE_SIZE = 100


def _envelope(data, meta=None, status=200):
    return jsonify({"data": data, "error": None, "meta": meta}), status


def _course_ids() -> set[int]:
    return {c.id for c in Course.query.all()}


def _get_student_or_404(student_id: int) -> Student:
    student = db.session.get(Student, student_id)
    if student is None:
        raise ApiError("Student not found.", status=404, code="not_found")
    return student


@students_bp.get("")
def list_students():
    search = (request.args.get("search") or "").strip()
    course = request.args.get("course", type=int)
    year = request.args.get("year", type=int)
    include_archived = request.args.get("includeArchived") == "true"
    sort = request.args.get("sort", "name")
    direction = request.args.get("dir", "asc")
    page = max(request.args.get("page", 1, type=int), 1)
    page_size = min(max(request.args.get("pageSize", 10, type=int), 1), MAX_PAGE_SIZE)

    query = Student.query
    if not include_archived:
        query = query.filter(Student.archived.is_(False))
    if search:
        like = f"%{search}%"
        conds = [Student.name.ilike(like), Student.email.ilike(like)]
        if search.isdigit():
            conds.append(Student.id == int(search))
        query = query.filter(or_(*conds))
    if course:
        query = query.filter(Student.course_id == course)
    if year:
        query = query.filter(Student.enrollment_year == year)

    column = SORT_COLUMNS.get(sort, Student.name)
    order = desc(column) if direction == "desc" else asc(column)
    query = query.order_by(order, asc(Student.id))

    total = query.count()
    rows = query.offset((page - 1) * page_size).limit(page_size).all()

    meta = {
        "total": total,
        "page": page,
        "pageSize": page_size,
        "totalPages": max((total + page_size - 1) // page_size, 1),
    }
    return _envelope([s.to_dict() for s in rows], meta)


@students_bp.post("")
def create_student():
    payload = request.get_json(silent=True) or {}
    clean = validate_student(payload, _course_ids())

    existing = Student.query.filter(Student.email == clean["email"]).first()
    if existing:
        raise field_error({"email": "A student with this email already exists."})

    student = Student(**clean)
    db.session.add(student)
    db.session.commit()
    return _envelope(student.to_dict(include_grades=True), status=201)


@students_bp.get("/<int:student_id>")
def get_student(student_id: int):
    student = _get_student_or_404(student_id)
    return _envelope(student.to_dict(include_grades=True))


@students_bp.put("/<int:student_id>")
def update_student(student_id: int):
    student = _get_student_or_404(student_id)
    payload = request.get_json(silent=True) or {}
    clean = validate_student(payload, _course_ids())

    dup = Student.query.filter(
        Student.email == clean["email"], Student.id != student.id
    ).first()
    if dup:
        raise field_error({"email": "Another student already uses this email."})

    for key, value in clean.items():
        setattr(student, key, value)
    db.session.commit()
    return _envelope(student.to_dict(include_grades=True))


@students_bp.delete("/<int:student_id>")
def delete_student(student_id: int):
    student = _get_student_or_404(student_id)
    mode = request.args.get("mode", "archive")
    if mode == "hard":
        db.session.delete(student)
        db.session.commit()
        return _envelope({"id": student_id, "deleted": True})
    student.archived = True
    student.status = "archived"
    db.session.commit()
    return _envelope(student.to_dict())


@students_bp.post("/<int:student_id>/restore")
def restore_student(student_id: int):
    student = _get_student_or_404(student_id)
    student.archived = False
    student.status = "active"
    db.session.commit()
    return _envelope(student.to_dict())


@students_bp.post("/evaluate-standings")
def evaluate_standings():
    students = Student.query.filter(Student.archived.is_(False)).all()
    counts = {
        "High Honors": 0,
        "Dean's List": 0,
        "Good Standing": 0,
        "Academic Warning": 0,
        "Academic Probation": 0,
        "Unevaluated": 0,
    }
    evaluations = []
    for s in students:
        standing = s.academic_standing
        counts[standing] = counts.get(standing, 0) + 1
        evaluations.append({
            "id": s.id,
            "name": s.name,
            "gpa": s.gpa(),
            "standing": standing,
        })
    return _envelope({
        "summary": counts,
        "totalEvaluated": len(students),
        "evaluations": evaluations,
    })


@students_bp.get("/<int:student_id>/letter")
def generate_official_letter(student_id: int):
    from datetime import date
    student = _get_student_or_404(student_id)
    standing = student.academic_standing
    gpa = student.gpa() or 0.0

    today_str = date.today().strftime("%B %d, %Y")
    
    if standing in ["High Honors", "Dean's List"]:
        letter_type = "Commendation"
        subject = f"Official Notice of Academic Distinction: {standing}"
        body = (
            f"On behalf of the Office of the Registrar and the Academic Council, we are pleased to inform you "
            f"that based on your outstanding cumulative Grade Point Average of {gpa:.2f}, you have been named "
            f"to the {standing} for the current academic session. "
            f"Your commitment to academic excellence reflects the highest standards of our university community."
        )
    elif standing in ["Academic Warning", "Academic Probation"]:
        letter_type = "Notice"
        subject = f"Official Administrative Notice: {standing}"
        body = (
            f"This letter serves as official notification that your current cumulative Grade Point Average is {gpa:.2f}, "
            f"placing your academic record under {standing}. "
            f"The university is dedicated to supporting your success. You are required to schedule an academic counseling "
            f"session with your advisor to establish an academic recovery plan."
        )
    else:
        letter_type = "Status Update"
        subject = "Official Standing Verification"
        body = (
            f"This document certifies that {student.name} is currently in {standing} with a cumulative "
            f"Grade Point Average of {gpa:.2f} in the {student.course.name if student.course else 'Degree'} program."
        )

    letter_data = {
        "institution": "Lumen University",
        "office": "Office of the University Registrar",
        "date": today_str,
        "recipient": {
            "name": student.name,
            "id": student.id,
            "email": student.email,
            "program": student.course.name if student.course else "General Studies",
            "enrollmentYear": student.enrollment_year,
        },
        "academicStanding": standing,
        "gpa": gpa,
        "letterType": letter_type,
        "subject": subject,
        "body": body,
        "signatory": {
            "name": "Dr. Eleanor Vance",
            "title": "University Registrar & Vice Dean of Academic Records",
        }
    }
    return _envelope(letter_data)

