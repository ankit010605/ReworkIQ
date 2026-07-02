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


# ===========================
# GET ALL REWORKS
# ===========================
@rework_bp.route("/api/rework", methods=["GET"])
def get_reworks():

    reworks = get_all_reworks()

    return jsonify(
        [item.to_dict() for item in reworks]
    )


# ===========================
# ADD REWORK
# ===========================
@rework_bp.route("/api/rework", methods=["POST"])
def add_rework():

    data = request.get_json()

    required_fields = [
        "plant",
        "contractor",
        "mark_no",
        "defect_code",
        "inspection_date",
    ]

    for field in required_fields:

        if field not in data or data[field] == "":

            return (
                jsonify(
                    {
                        "error": f"{field} is required"
                    }
                ),
                400,
            )

    data["inspection_date"] = datetime.strptime(
        data["inspection_date"],
        "%Y-%m-%d",
    ).date()

    rework = create_rework(data)

    return (
        jsonify(rework.to_dict()),
        201,
    )


# ===========================
# UPDATE REWORK
# ===========================
@rework_bp.route("/api/rework/<int:rework_id>", methods=["PUT"])
def edit_rework(rework_id):

    rework = get_rework_by_id(rework_id)

    if not rework:
        return jsonify({"error": "Record not found"}), 404

    data = request.get_json()

    data["inspection_date"] = datetime.strptime(
        data["inspection_date"],
        "%Y-%m-%d",
    ).date()

    updated = update_rework(rework, data)

    return jsonify(updated.to_dict())


# ===========================
# DELETE REWORK
# ===========================
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


# ===========================
# DASHBOARD STATISTICS
# ===========================
@rework_bp.route("/api/stats", methods=["GET"])
def stats():

    reworks = get_all_reworks()

    total = len(reworks)

    contractor_counts = {}
    plant_counts = {}
    defect_counts = {}
    monthly_counts = {}

    for item in reworks:

        # Contractor Count
        contractor_counts[item.contractor] = (
            contractor_counts.get(item.contractor, 0) + 1
        )

        # Plant Count
        plant_counts[item.plant] = (
            plant_counts.get(item.plant, 0) + 1
        )

        # Defect Count
        defect_counts[item.defect_code] = (
            defect_counts.get(item.defect_code, 0) + 1
        )

        # Monthly Count
        month = item.inspection_date.strftime("%B")

        monthly_counts[month] = (
            monthly_counts.get(month, 0) + 1
        )

    # -----------------------------
    # Top Contractor
    # -----------------------------
    if contractor_counts:

        top = max(
            contractor_counts,
            key=contractor_counts.get
        )

        top_contractor = {
            "name": top,
            "count": contractor_counts[top],
        }

    else:

        top_contractor = None

    # -----------------------------
    # Top Plant
    # -----------------------------
    if plant_counts:

        top = max(
            plant_counts,
            key=plant_counts.get
        )

        top_plant = {
            "name": top,
            "count": plant_counts[top],
        }

    else:

        top_plant = None

    # -----------------------------
    # Most Common Defect
    # -----------------------------
    if defect_counts:

        top = max(
            defect_counts,
            key=defect_counts.get
        )

        most_common_defect = {
            "defect": top,
            "count": defect_counts[top],
        }

    else:

        most_common_defect = None

    # -----------------------------
    # Latest Entry
    # -----------------------------
    if reworks:

        latest_entry = max(
            reworks,
            key=lambda x: x.created_at
        ).to_dict()

    else:

        latest_entry = None

    return jsonify(
        {
            "total_reworks": total,
            "plant_counts": plant_counts,
            "contractor_counts": contractor_counts,
            "defect_counts": defect_counts,
            "monthly_counts": monthly_counts,
            "top_plant": top_plant,
            "top_contractor": top_contractor,
            "most_common_defect": most_common_defect,
            "latest_entry": latest_entry,
        }
    )