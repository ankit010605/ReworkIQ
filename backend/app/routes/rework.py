from datetime import datetime

from flask import Blueprint, jsonify, request

from app.services.rework_service import (
    create_rework,
    delete_rework,
    get_all_reworks,
    get_rework_by_id,
    update_rework,
)

rework_bp = Blueprint(
    "rework",
    __name__,
)


@rework_bp.route("/api/rework", methods=["GET"])
def get_reworks():

    reworks = get_all_reworks()

    return jsonify(
        [item.to_dict() for item in reworks]
    )


@rework_bp.route("/api/rework", methods=["POST"])
def add_rework():

    data = request.get_json()

    required_fields = [
        "mark_no",
        "project_name",
        "contractor",
        "reason",
        "rework_date",
    ]

    for field in required_fields:

        if field not in data:

            return (
                jsonify(
                    {
                        "error": f"{field} is required"
                    }
                ),
                400,
            )

    data["rework_date"] = datetime.strptime(
        data["rework_date"],
        "%Y-%m-%d",
    ).date()

    rework = create_rework(data)

    return (
        jsonify(rework.to_dict()),
        201,
    )


@rework_bp.route("/api/rework/<int:rework_id>", methods=["PUT"])
def edit_rework(rework_id):

    rework = get_rework_by_id(rework_id)

    if not rework:
        return jsonify({"error": "Record not found"}), 404

    data = request.get_json()

    data["rework_date"] = datetime.strptime(
        data["rework_date"],
        "%Y-%m-%d",
    ).date()

    updated = update_rework(rework, data)

    return jsonify(updated.to_dict())


@rework_bp.route("/api/rework/<int:rework_id>", methods=["DELETE"])
def remove_rework(rework_id):

    rework = get_rework_by_id(rework_id)

    if not rework:
        return jsonify({"error": "Record not found"}), 404

    delete_rework(rework)

    return jsonify(
        {
            "message": "Rework deleted successfully"
        }
    )


@rework_bp.route("/api/stats", methods=["GET"])
def stats():

    reworks = get_all_reworks()

    total = len(reworks)

    contractor_counts = {}
    reason_counts = {}
    monthly_counts = {}
    for item in reworks:
        contractor_counts[item.contractor] = (
            contractor_counts.get(item.contractor, 0) + 1
        )

        reason_counts[item.reason] = (
            reason_counts.get(item.reason, 0) + 1
        )
        month = item.rework_date.strftime("%B")

        monthly_counts[month] = (
                monthly_counts.get(month, 0) + 1
)

    # Top Contractor
    if contractor_counts:
        top_contractor = max(
            contractor_counts,
            key=contractor_counts.get
        )

        top_contractor_data = {
            "name": top_contractor,
            "count": contractor_counts[top_contractor],
        }
    else:
        top_contractor_data = None

    # Most Common Reason
    if reason_counts:
        common_reason = max(
            reason_counts,
            key=reason_counts.get
        )

        common_reason_data = {
            "reason": common_reason,
            "count": reason_counts[common_reason],
        }
    else:
        common_reason_data = None

    # Latest Entry
    if reworks:
        latest = max(
            reworks,
            key=lambda x: x.created_at
        )

        latest_entry = latest.to_dict()
    else:
        latest_entry = None

    return jsonify(
        {
            "total_reworks": total,
            "contractor_counts": contractor_counts,
            "reason_counts": reason_counts,
            "monthly_counts": monthly_counts,
            "top_contractor": top_contractor_data,
            "most_common_reason": common_reason_data,
            "latest_entry": latest_entry,
        }
    )