from app.extensions import db


class Employee(db.Model):

    __tablename__ = "employees"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    employee_name = db.Column(
        db.String(100),
        nullable=False
    )

    designation = db.Column(
        db.String(100),
        nullable=False
    )

    email = db.Column(
        db.String(150),
        nullable=False,
        unique=True
    )

    def to_dict(self):
        return {
            "id": self.id,
            "employee_name": self.employee_name,
            "designation": self.designation,
            "email": self.email
        }