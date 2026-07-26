"""SQLAlchemy models for Lumen Registrar."""
from __future__ import annotations

from datetime import date, datetime

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


# Letter grade -> 4.0 scale grade points (registrar standard).
GRADE_POINTS: dict[str, float] = {
    "A+": 4.0, "A": 4.0, "A-": 3.7,
    "B+": 3.3, "B": 3.0, "B-": 2.7,
    "C+": 2.3, "C": 2.0, "C-": 1.7,
    "D+": 1.3, "D": 1.0, "D-": 0.7,
    "F": 0.0,
}


def score_to_letter(score: float) -> str:
    if score >= 97: return "A+"
    if score >= 93: return "A"
    if score >= 90: return "A-"
    if score >= 87: return "B+"
    if score >= 83: return "B"
    if score >= 80: return "B-"
    if score >= 77: return "C+"
    if score >= 73: return "C"
    if score >= 70: return "C-"
    if score >= 67: return "D+"
    if score >= 63: return "D"
    if score >= 60: return "D-"
    return "F"


class Course(db.Model):
    __tablename__ = "courses"

    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(16), unique=True, nullable=False)
    name = db.Column(db.String(160), nullable=False)
    department = db.Column(db.String(120))

    students = db.relationship("Student", back_populates="course")

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "code": self.code,
            "name": self.name,
            "department": self.department,
            "studentCount": len([s for s in self.students if not s.archived]),
        }


class Student(db.Model):
    __tablename__ = "students"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(160), nullable=False)
    email = db.Column(db.String(160), unique=True, nullable=False)
    phone = db.Column(db.String(40))
    dob = db.Column(db.Date, nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey("courses.id"), nullable=False)
    enrollment_year = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(24), default="active", nullable=False)
    archived = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    course = db.relationship("Course", back_populates="students")
    grades = db.relationship("Grade", back_populates="student", cascade="all, delete-orphan")

    @property
    def age(self) -> int | None:
        if not self.dob:
            return None
        today = date.today()
        return today.year - self.dob.year - ((today.month, today.day) < (self.dob.month, self.dob.day))

    def gpa(self) -> float | None:
        return compute_gpa(self.grades)

    @property
    def academic_standing(self) -> str:
        gpa_val = self.gpa()
        if gpa_val is None:
            return "Unevaluated"
        if gpa_val >= 3.80:
            return "High Honors"
        elif gpa_val >= 3.50:
            return "Dean's List"
        elif gpa_val >= 2.00:
            return "Good Standing"
        elif gpa_val >= 1.50:
            return "Academic Warning"
        else:
            return "Academic Probation"

    def to_dict(self, include_grades: bool = False) -> dict:
        data = {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "dob": self.dob.isoformat() if self.dob else None,
            "age": self.age,
            "courseId": self.course_id,
            "courseName": self.course.name if self.course else None,
            "courseCode": self.course.code if self.course else None,
            "enrollmentYear": self.enrollment_year,
            "status": self.status,
            "archived": self.archived,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "gpa": self.gpa(),
            "academicStanding": self.academic_standing,
            "gradeCount": len(self.grades),
        }
        if include_grades:
            data["grades"] = [g.to_dict() for g in self.grades]
        return data


class Grade(db.Model):
    __tablename__ = "grades"

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey("students.id"), nullable=False)
    subject = db.Column(db.String(160), nullable=False)
    term = db.Column(db.String(40), nullable=False)
    score = db.Column(db.Float, nullable=False)
    letter = db.Column(db.String(4), nullable=False)
    credits = db.Column(db.Float, default=3.0, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    student = db.relationship("Student", back_populates="grades")

    @property
    def grade_points(self) -> float:
        return GRADE_POINTS.get(self.letter, 0.0)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "studentId": self.student_id,
            "subject": self.subject,
            "term": self.term,
            "score": self.score,
            "letter": self.letter,
            "credits": self.credits,
            "gradePoints": self.grade_points,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }


def compute_gpa(grades: list[Grade]) -> float | None:
    total_credits = sum(g.credits for g in grades)
    if total_credits <= 0:
        return None
    weighted = sum(GRADE_POINTS.get(g.letter, 0.0) * g.credits for g in grades)
    return round(weighted / total_credits, 2)
