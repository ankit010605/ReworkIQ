from datetime import datetime

from flask import Blueprint, jsonify, request
import pandas as pd

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
    # ===========================
# CONTRACTOR ANALYTICS
# ===========================
@rework_bp.route(
    "/api/analytics/contractor/<string:contractor>",
    methods=["GET"],
)
def contractor_analytics(contractor):

    reworks = get_all_reworks()

    contractor_records = [
        item
        for item in reworks
        if item.contractor == contractor
    ]

    if not contractor_records:

        return (
            jsonify(
                {
                    "error": "Contractor not found"
                }
            ),
            404,
        )

    defect_counts = {}

    for item in contractor_records:

        defect_counts[item.defect_code] = (
            defect_counts.get(item.defect_code, 0) + 1
        )

    most_common_defect = max(
        defect_counts,
        key=defect_counts.get,
    )

    latest = max(
        contractor_records,
        key=lambda x: x.inspection_date,
    )

    return jsonify(
        {
            "contractor": contractor,
            "total_reworks": len(contractor_records),
            "most_common_defect": most_common_defect,
            "last_inspection": latest.inspection_date.strftime(
                "%Y-%m-%d"
            ),
            "defects": defect_counts,
        }
    )



# ===========================
# PLANT ANALYTICS
# ===========================

# ===========================
# PLANT ANALYTICS
# ===========================

@rework_bp.route(
    "/api/analytics/plant/<string:plant>",
    methods=["GET"],
)
def plant_analytics(plant):

    reworks = get_all_reworks()

    plant_records = [
        item
        for item in reworks
        if item.plant == plant
    ]

    if not plant_records:

        return (
            jsonify(
                {
                    "error": "Plant not found"
                }
            ),
            404,
        )

    defect_counts = {}
    contractor_counts = {}

    for item in plant_records:

     # Defect Count
      defect_counts[item.defect_code] = (
        defect_counts.get(item.defect_code, 0) + 1
    )

     # Contractor Count
      contractor_counts[item.contractor] = (
        contractor_counts.get(item.contractor, 0) + 1
    )

    most_common_defect = max(
        defect_counts,
        key=defect_counts.get,
    )

    top_contractor = max(
        contractor_counts,
        key=contractor_counts.get,
    )

    latest = max(
        plant_records,
        key=lambda x: x.inspection_date,
    )

    return jsonify(
        {
            "plant": plant,
            "total_reworks": len(plant_records),
            "top_contractor": top_contractor,
            "most_common_defect": most_common_defect,
            "last_inspection": latest.inspection_date.strftime(
                "%Y-%m-%d"
            ),
            "defects": defect_counts,
            "contractors": contractor_counts,
        }
    )


# ===========================
# IMPORT EXCEL
# ===========================
@rework_bp.route("/api/rework/import", methods=["POST"])
def import_excel():

    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    try:

        df = pd.read_excel(file)

        required_columns = [
            "Plant",
            "Contractor",
            "Mark No",
            "Defect Code",
            "Remarks",
            "Inspection Date",
        ]

        missing = [
            c for c in required_columns
            if c not in df.columns
        ]

        if missing:
            return jsonify({
                "error": "Missing columns",
                "missing": missing
            }), 400

        imported = 0
        skipped = 0
        errors = []

        for index, row in df.iterrows():

            try:

                plant = str(row["Plant"]).strip()
                contractor = str(row["Contractor"]).strip()
                mark_no = str(row["Mark No"]).strip()
                defect = str(row["Defect Code"]).strip()
                remarks = str(row["Remarks"]).strip()

                date = row["Inspection Date"]

                if pd.isna(date):
                    raise Exception("Inspection Date missing")

                if isinstance(date, str):
                    date = datetime.strptime(
                        date,
                        "%Y-%m-%d"
                    ).date()
                else:
                    date = date.date()

                create_rework({
                    "plant": plant,
                    "contractor": contractor,
                    "mark_no": mark_no,
                    "defect_code": defect,
                    "remarks": remarks,
                    "inspection_date": date,
                })

                imported += 1

            except Exception as e:

                skipped += 1

                errors.append({
                    "row": index + 2,
                    "error": str(e)
                })

        return jsonify({

            "message": "Import Completed",

            "imported": imported,

            "skipped": skipped,

            "errors": errors

        })

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500