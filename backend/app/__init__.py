from flask import Flask
import os

from app.config import Config
from app.extensions import db, migrate, cors


def create_app():
    app = Flask(__name__)

    app.config.from_object(Config)

    # =====================================================
    # Initialize Extensions
    # =====================================================

    db.init_app(app)
    migrate.init_app(app, db)
    cors.init_app(app)

    # =====================================================
    # Import Models
    # =====================================================

    from app.models import (
        ReworkEntry,
        Contractor,
        Employee,
    )

    # =====================================================
    # Register Blueprints
    # =====================================================

    from app.routes import rework_bp
    from app.routes.report import report_bp
    from app.routes.contractor import contractor_bp

    app.register_blueprint(rework_bp)
    app.register_blueprint(report_bp)
    app.register_blueprint(
        contractor_bp,
        url_prefix="/api/contractors"
    )

    # =====================================================
    # Health Check
    # =====================================================

    @app.route("/api/health")
    def health():
        return {
            "status": "success",
            "message": "ReworkIQ Backend Running"
        }

    # =====================================================
    # Start Scheduler
    # =====================================================

    from app.scheduler.weekly_report_scheduler import start_scheduler

    # Local Development (avoid duplicate scheduler)
    if os.environ.get("WERKZEUG_RUN_MAIN") == "true":
        print("Starting scheduler (Local)...")
        start_scheduler(app)

    # Render / Gunicorn Production
    elif os.environ.get("RENDER"):
        print("Starting scheduler (Render)...")
        start_scheduler(app)

    return app