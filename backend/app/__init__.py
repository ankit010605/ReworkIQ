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
    from app.models import ReworkEntry
    from app.routes import rework_bp

    @app.route("/api/health")
    def health():
        return {
            "status": "success",
            "message": "ReworkIQ Backend Running"
        }
    app.register_blueprint(rework_bp)
    return app