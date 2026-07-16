import base64

import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException

from flask import current_app


def send_email(subject, body, pdf_path, recipients):

    configuration = sib_api_v3_sdk.Configuration()

    configuration.api_key["api-key"] = "INVALID_KEY"

    api_instance = sib_api_v3_sdk.TransactionalEmailsApi(
        sib_api_v3_sdk.ApiClient(configuration)
    )

    sender = {
        "name": "ReworkIQ",
        "email": current_app.config["BREVO_SENDER_EMAIL"]
    }

    receiver = []

    for employee in recipients:

        receiver.append(
            {
                "email": employee.email,
                "name": employee.employee_name
            }
        )

    with open(pdf_path, "rb") as pdf:

        encoded_pdf = base64.b64encode(
            pdf.read()
        ).decode("utf-8")

    attachment = [
        {
            "name": "Weekly_Rework_Report.pdf",
            "content": encoded_pdf
        }
    ]

    email = sib_api_v3_sdk.SendSmtpEmail(

        sender=sender,

        to=receiver,

        subject=subject,

        text_content=body,

        attachment=attachment

    )

    try:

        api_instance.send_transac_email(email)

        print("=" * 60)
        print("Weekly Report Email Sent Successfully")
        print("Recipients")

        for employee in recipients:

            print(
                employee.employee_name,
                "-",
                employee.email
            )

        print("=" * 60)

    except ApiException as e:

        print("=" * 60)
        print("Failed to Send Email")
        print(e)
        print("=" * 60)