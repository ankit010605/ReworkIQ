from datetime import datetime, timedelta

from apscheduler.schedulers.background import BackgroundScheduler

from app.models import ReworkEntry
from app.repositories.employee.get_recipients import get_all_recipients
from app.services.email.brevo_service import send_email
from app.services.email.email_template import build_weekly_email
from app.services.reports.pdf_report import generate_weekly_pdf
from app.services.reports.report_statistics import calculate_statistics
from app.services.ai.openrouter_service import generate_ai_recommendation


def test_job(app):

    with app.app_context():
        print("\n" + "=" * 70)
        print("Starting Weekly Rework Report Job")
        print(f"Time : {datetime.now()}")
        print("=" * 70)

        # =====================================================
        # DATE RANGE
        # =====================================================

        
        end_date = datetime.now().date() - timedelta(days=1)
        start_date = end_date - timedelta(days=6)

        # =====================================================
        # FETCH WEEKLY REWORK DATA
        # =====================================================

        weekly_data = ReworkEntry.query.filter(
            ReworkEntry.inspection_date >= start_date,
            ReworkEntry.inspection_date <= end_date
        ).all()

        # =====================================================
        # CALCULATE STATISTICS
        # =====================================================

        statistics = calculate_statistics(weekly_data)
        ai_text = generate_ai_recommendation(statistics)

        print()
        print("AI Recommendation")
        print(ai_text)
        print()
        

        # =====================================================
        # GENERATE PDF
        # =====================================================

        pdf_path = generate_weekly_pdf(
        weekly_data,
        statistics,
        ai_text
)

        # =====================================================
        # FETCH EMAIL RECIPIENTS
        # =====================================================

        recipients = get_all_recipients()

        # =====================================================
        # BUILD EMAIL
        # =====================================================

        subject, body = build_weekly_email(statistics)

        # =====================================================
        # CONSOLE LOG
        # =====================================================

        print("\n" + "=" * 60)
        print("WEEKLY REWORK REPORT")
        print("=" * 60)

        print(f"Reporting Period : {start_date} to {end_date}")
        print(f"Total Reworks    : {statistics['total_reworks']}")
        print(f"Plant Summary    : {statistics['plant_counts']}")
        print(f"Contractors      : {statistics['contractor_counts']}")
        print(f"Defects          : {statistics['defect_counts']}")
        print(f"Top Defect       : {statistics['top_defect']}")
        print(f"Top Contractor   : {statistics['top_contractor']}")

        print("\nRecipients")

        for employee in recipients:
            print(
                f"{employee.employee_name} "
                f"({employee.designation}) "
                f"- {employee.email}"
            )

        print(f"\nPDF Generated : {pdf_path}")

        # =====================================================
        # SEND EMAIL
        # =====================================================

        send_email(
            subject=subject,
            body=body,
            pdf_path=pdf_path,
            recipients=recipients
        )

        print("=" * 60)


def start_scheduler(app):

    scheduler = BackgroundScheduler()


    # Development Schedule

    scheduler.add_job(
        test_job,
        trigger="interval",
        minutes=1,
        args=[app]
    )
#     scheduler.add_job(
#       test_job,
#       trigger="cron",
#       day_of_week="mon",
#       hour=8,
#       minute=0,
#       args=[app]
# )

    scheduler.start()

    return scheduler