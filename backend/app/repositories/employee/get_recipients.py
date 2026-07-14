from app.models import Employee


def get_all_recipients():

    employees = Employee.query.order_by(
        Employee.designation.asc()
    ).all()

    return employees