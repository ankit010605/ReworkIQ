from app import db
from datetime import datetime

class EmailRecipient(db.Model):
    __tablename__ = "email_recipients"

    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(db.String(100), nullable=False)

    designation = db.Column(db.String(100), nullable=False)

    department = db.Column(db.String(100))

    email = db.Column(db.String(255), unique=True, nullable=False)

    active = db.Column(db.Boolean, default=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "designation": self.designation,
            "department": self.department,
            "email": self.email,
            "active": self.active
        }