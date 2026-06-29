from datetime import datetime

from app.extensions import db


class ReworkEntry(db.Model):
    __tablename__ = "rework_entries"

    id = db.Column(db.Integer, primary_key=True)

    mark_no = db.Column(db.String(100), nullable=False)

    project_name = db.Column(db.String(150), nullable=False)

    contractor = db.Column(db.String(100), nullable=False)

    reason = db.Column(db.String(150), nullable=False)

    rework_date = db.Column(db.Date, nullable=False)

    created_at = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow,
    )

    def to_dict(self):
        return {
            "id": self.id,
            "mark_no": self.mark_no,
            "project_name": self.project_name,
            "contractor": self.contractor,
            "reason": self.reason,
            "rework_date": self.rework_date.isoformat(),
            "created_at": self.created_at.isoformat(),
        }