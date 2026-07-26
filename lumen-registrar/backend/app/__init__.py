"""Application factory for Lumen Registrar API."""
from __future__ import annotations

import os

from flask import Flask, jsonify
from flask_cors import CORS

from .models import db
from .blueprints.students import students_bp
from .blueprints.grades import grades_bp
from .blueprints.courses import courses_bp
from .blueprints.stats import stats_bp
from .blueprints.degree_audit import degree_audit_bp
from .blueprints.at_risk import at_risk_bp
from .errors import ApiError


def create_app(database_uri: str | None = None) -> Flask:
    app = Flask(__name__)

    default_db = "sqlite:///" + os.path.join(
        os.path.abspath(os.path.dirname(os.path.dirname(__file__))), "lumen.db"
    )
    app.config["SQLALCHEMY_DATABASE_URI"] = database_uri or default_db
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["JSON_SORT_KEYS"] = False

    db.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    app.register_blueprint(students_bp)
    app.register_blueprint(grades_bp)
    app.register_blueprint(courses_bp)
    app.register_blueprint(stats_bp)
    app.register_blueprint(degree_audit_bp)
    app.register_blueprint(at_risk_bp)

    @app.errorhandler(ApiError)
    def handle_api_error(err: ApiError):
        return jsonify({"data": None, "error": err.to_dict(), "meta": None}), err.status

    @app.errorhandler(404)
    def handle_404(_err):
        return (
            jsonify(
                {
                    "data": None,
                    "error": {"message": "Resource not found.", "code": "not_found"},
                    "meta": None,
                }
            ),
            404,
        )

    @app.errorhandler(405)
    def handle_405(_err):
        return (
            jsonify(
                {
                    "data": None,
                    "error": {"message": "Method not allowed.", "code": "method_not_allowed"},
                    "meta": None,
                }
            ),
            405,
        )

    @app.errorhandler(Exception)
    def handle_unexpected(err: Exception):
        if isinstance(err, ApiError):
            raise err
        app.logger.exception("Unhandled error: %s", err)
        return (
            jsonify(
                {
                    "data": None,
                    "error": {"message": "An unexpected server error occurred.", "code": "internal_error"},
                    "meta": None,
                }
            ),
            500,
        )

    @app.get("/api/health")
    def health():
        return jsonify({"data": {"status": "ok"}, "error": None, "meta": None})

    with app.app_context():
        db.create_all()

    return app
