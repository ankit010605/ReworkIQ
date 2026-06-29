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
        mark_no=data["mark_no"],
        project_name=data["project_name"],
        contractor=data["contractor"],
        reason=data["reason"],
        rework_date=data["rework_date"],
    )

    db.session.add(rework)
    db.session.commit()

    return rework


def update_rework(rework, data):
    rework.mark_no = data["mark_no"]
    rework.project_name = data["project_name"]
    rework.contractor = data["contractor"]
    rework.reason = data["reason"]
    rework.rework_date = data["rework_date"]

    db.session.commit()

    return rework


def delete_rework(rework):
    db.session.delete(rework)
    db.session.commit()