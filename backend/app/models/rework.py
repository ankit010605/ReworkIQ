from datetime import datetime

from app.extensions import db


class ReworkEntry(db.Model):
    __tablename__ = "rework_entries"

    id = db.Column(db.Integer, primary_key=True)

    # Plant
    plant = db.Column(
        db.String(50),
        nullable=False,
    )

    # Contractor
    contractor = db.Column(
        db.String(100),
        nullable=False,
    )

    # Member Mark Number
    mark_no = db.Column(
        db.String(100),
        nullable=False,
    )

    # Defect Code
    defect_code = db.Column(
        db.String(50),
        nullable=False,
    )

    # Optional Remarks
    remarks = db.Column(
        db.Text,
        nullable=True,
    )

    # Date of Inspection
    inspection_date = db.Column(
        db.Date,
        nullable=False,
    )

    # Record Creation Time
    created_at = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow,
    )

    def to_dict(self):
        return {
            "id": self.id,
            "plant": self.plant,
            "contractor": self.contractor,
            "mark_no": self.mark_no,
            "defect_code": self.defect_code,
            "remarks": self.remarks,
            "inspection_date": self.inspection_date.isoformat(),
            "created_at": self.created_at.isoformat(),
        }