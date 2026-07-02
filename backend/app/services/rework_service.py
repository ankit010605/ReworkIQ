from app.extensions import db
from app.models import ReworkEntry


def get_all_reworks():
    return ReworkEntry.query.order_by(
        ReworkEntry.created_at.desc()
    ).all()


def get_rework_by_id(rework_id):
    return ReworkEntry.query.get(rework_id)


def create_rework(data):
    rework = ReworkEntry(
        plant=data["plant"],
        contractor=data["contractor"],
        mark_no=data["mark_no"],
        defect_code=data["defect_code"],
        remarks=data.get("remarks"),
        inspection_date=data["inspection_date"],
    )

    db.session.add(rework)
    db.session.commit()

    return rework


def update_rework(rework, data):
    rework.plant = data["plant"]
    rework.contractor = data["contractor"]
    rework.mark_no = data["mark_no"]
    rework.defect_code = data["defect_code"]
    rework.remarks = data.get("remarks")
    rework.inspection_date = data["inspection_date"]

    db.session.commit()

    return rework


def delete_rework(rework):
    db.session.delete(rework)
    db.session.commit()