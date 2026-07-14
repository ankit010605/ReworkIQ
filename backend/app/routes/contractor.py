from flask import Blueprint, request, jsonify
from app import db
from app.models.contractor import Contractor

contractor_bp = Blueprint("contractor", __name__)


# ==========================================================
# GET ALL CONTRACTORS
# ==========================================================

@contractor_bp.route("/", methods=["GET"])
def get_contractors():

    contractors = Contractor.query.order_by(
        Contractor.contractor_name.asc()
    ).all()

    return jsonify([
        contractor.to_dict()
        for contractor in contractors
    ]), 200


# ==========================================================
# ADD NEW CONTRACTOR
# ==========================================================

@contractor_bp.route("/", methods=["POST"])
def add_contractor():

    data = request.get_json()

    contractor_name = (
        data.get("contractor_name", "")
        .strip()
    )

    if contractor_name == "":
        return jsonify({
            "error": "Contractor name is required"
        }), 400

    existing = Contractor.query.filter_by(
        contractor_name=contractor_name
    ).first()

    if existing:
        return jsonify({
            "error": "Contractor already exists"
        }), 400

    contractor = Contractor(
        contractor_name=contractor_name
    )

    db.session.add(contractor)
    db.session.commit()

    return jsonify({
        "message": "Contractor added successfully",
        "contractor": contractor.to_dict()
    }), 201