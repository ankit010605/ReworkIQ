from app import db
from datetime import datetime


class Contractor(db.Model):
    __tablename__ = "contractors"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    contractor_name = db.Column(
        db.String(100),
        unique=True,
        nullable=False
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    def to_dict(self):
        return {
            "id": self.id,
            "contractor_name": self.contractor_name
        }