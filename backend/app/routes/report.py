from flask import Blueprint, send_file

from app.services.rework_service import get_all_reworks
from app.services.pdf_service import create_report

report_bp = Blueprint(
    "report",
    __name__,
)
@report_bp.route("/api/report/test")
def report_test():
    return "REPORT ROUTE WORKING"

@report_bp.route("/api/report/pdf", methods=["GET"])
def generate_report():
    
    print("========== PDF ROUTE HIT ==========")
    reworks = get_all_reworks()
    print("========== REWORKS USED IN PDF ==========")
    print("COUNT:", len(reworks))

    for r in reworks:
      print(
        r.id,
        r.contractor,
        r.plant,
        r.defect_code,
        r.inspection_date
    )

    total = len(reworks)

    contractor_counts = {}
    plant_counts = {}
    defect_counts = {}
    monthly_counts = {}

    for item in reworks:

        contractor_counts[item.contractor] = (
            contractor_counts.get(item.contractor, 0) + 1
        )

        plant_counts[item.plant] = (
            plant_counts.get(item.plant, 0) + 1
        )

        defect_counts[item.defect_code] = (
            defect_counts.get(item.defect_code, 0) + 1
        )

        month = item.inspection_date.strftime("%B")

        monthly_counts[month] = (
            monthly_counts.get(month, 0) + 1
        )

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

        top_contractor = {
            "name": "N/A",
            "count": 0,
        }

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

        top_plant = {
            "name": "N/A",
            "count": 0,
        }

    if defect_counts:

        top = max(
            defect_counts,
            key=defect_counts.get
        )

        most_common_defect = {
            "code": top,
            "count": defect_counts[top],
        }

    else:

        most_common_defect = {
            "code": "N/A",
            "count": 0,
        }

    stats = {

        "total_reworks": total,

        "top_contractor": top_contractor,

        "top_plant": top_plant,

        "most_common_defect": most_common_defect,

        "contractor_counts": contractor_counts,

        "plant_counts": plant_counts,

        "defect_code_counts": defect_counts,

        "monthly_counts": monthly_counts,

    }

    pdf = create_report(stats)

    return send_file(
        pdf,
        mimetype="application/pdf",
        download_name="REWO_Rework_Analytics_Report.pdf",
        as_attachment=True,
    )
@report_bp.route("/test-report")
def test_report():
    return "REPORT ROUTE WORKING"    