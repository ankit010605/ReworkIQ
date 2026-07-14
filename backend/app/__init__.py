from flask import Flask

from app.config import Config
from app.extensions import db, migrate, cors


def create_app():
    app = Flask(__name__)

    app.config.from_object(Config)

    db.init_app(app)
    migrate.init_app(app, db)
    cors.init_app(app)

    # Import models so Flask-Migrate detects them
    from app.models import (
        ReworkEntry,
        Contractor,
        Employee
    )

    from app.routes import rework_bp
    from app.routes.report import report_bp
    # from app.routes.email_routes import email_bp
    from app.routes.contractor import contractor_bp
    from app.scheduler.weekly_report_scheduler import start_scheduler

    @app.route("/api/health")
    def health():
        return {
            "status": "success",
            "message": "ReworkIQ Backend Running"
        }

    app.register_blueprint(rework_bp)
    app.register_blueprint(report_bp)
    # app.register_blueprint(email_bp)

    app.register_blueprint(
        contractor_bp,
        url_prefix="/api/contractors"
    )

    import os

    if os.environ.get("WERKZEUG_RUN_MAIN") == "true":
       start_scheduler(app)

    return app