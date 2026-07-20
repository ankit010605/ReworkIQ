from flask import Flask
import os

from app.config import Config
from app.extensions import db, migrate, cors


def create_app():
    app = Flask(__name__)

    # =====================================================
    # Load Configuration
    # =====================================================

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
    # Scheduler
    # =====================================================

    from app.scheduler.weekly_report_scheduler import start_scheduler

    print("=" * 60)
    print("APP DEBUG :", app.debug)
    print("WERKZEUG_RUN_MAIN :", os.environ.get("WERKZEUG_RUN_MAIN"))
    print("RENDER :", os.environ.get("RENDER"))
    print("RENDER_SERVICE_NAME :", os.environ.get("RENDER_SERVICE_NAME"))
    print("=" * 60)

    # Local Flask Development
    if app.debug:
        if os.environ.get("WERKZEUG_RUN_MAIN") == "true":
            print("Starting Scheduler (Local)...")
            start_scheduler(app)

    # Production (Gunicorn / Render)
    else:
        print("Starting Scheduler (Production)...")
        start_scheduler(app)

    return app