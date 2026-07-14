import os
from datetime import datetime, timedelta

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas as pdfcanvas
from reportlab.platypus import (
    BaseDocTemplate,
    PageTemplate,
    Frame,
    NextPageTemplate,
    PageBreak,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    HRFlowable,
    KeepTogether,
)
from reportlab.graphics.shapes import Drawing
from reportlab.graphics.charts.barcharts import VerticalBarChart

# =========================================================
# BRAND / DESIGN TOKENS
# =========================================================

NAVY = colors.HexColor("#0F172A")       # primary / headers
NAVY_SOFT = colors.HexColor("#1E293B")  # secondary surfaces
ACCENT = colors.HexColor("#2563EB")     # blue accent
ACCENT_LIGHT = colors.HexColor("#EFF6FF")
SUCCESS = colors.HexColor("#16A34A")
DANGER = colors.HexColor("#DC2626")
WARNING = colors.HexColor("#D97706")
TEXT_MUTED = colors.HexColor("#64748B")
BORDER = colors.HexColor("#E2E8F0")
ROW_ALT = colors.HexColor("#F8FAFC")
WHITE = colors.white

PAGE_W, PAGE_H = A4
MARGIN = 18 * mm

COMPANY_NAME = "JSPL — SSD Plant, Punjipathra"
DOC_TITLE = "REWORKIQ"
DOC_SUBTITLE = "Weekly Rework Management Report"
CONFIDENTIALITY = "CONFIDENTIAL — Internal Use Only"


# =========================================================
# STYLES
# =========================================================

def build_styles():
    base = getSampleStyleSheet()

    styles = {
        "CoverTitle": ParagraphStyle(
            "CoverTitle", parent=base["Title"],
            fontName="Helvetica-Bold", fontSize=34, leading=38,
            textColor=WHITE, alignment=TA_LEFT, spaceAfter=6,
        ),
        "CoverSubtitle": ParagraphStyle(
            "CoverSubtitle", parent=base["Normal"],
            fontName="Helvetica", fontSize=14, leading=18,
            textColor=colors.HexColor("#CBD5E1"), alignment=TA_LEFT,
        ),
        "CoverMeta": ParagraphStyle(
            "CoverMeta", parent=base["Normal"],
            fontName="Helvetica", fontSize=10.5, leading=15,
            textColor=colors.HexColor("#E2E8F0"), alignment=TA_LEFT,
        ),
        "SectionHeading": ParagraphStyle(
            "SectionHeading", parent=base["Heading2"],
            fontName="Helvetica-Bold", fontSize=13.5, leading=16,
            textColor=NAVY, spaceBefore=4, spaceAfter=8,
        ),
        "SubHeading": ParagraphStyle(
            "SubHeading", parent=base["Heading3"],
            fontName="Helvetica-Bold", fontSize=10.5, leading=13,
            textColor=NAVY_SOFT, spaceAfter=4,
        ),
        "Body": ParagraphStyle(
            "Body", parent=base["BodyText"],
            fontName="Helvetica", fontSize=9.5, leading=14,
            textColor=colors.HexColor("#1E293B"),
        ),
        "KPILabel": ParagraphStyle(
            "KPILabel", parent=base["Normal"],
            fontName="Helvetica", fontSize=8, leading=10,
            textColor=TEXT_MUTED, alignment=TA_LEFT,
        ),
        "KPIValue": ParagraphStyle(
            "KPIValue", parent=base["Normal"],
            fontName="Helvetica-Bold", fontSize=20, leading=22,
            textColor=NAVY, alignment=TA_LEFT,
        ),
        "KPITrend": ParagraphStyle(
            "KPITrend", parent=base["Normal"],
            fontName="Helvetica-Bold", fontSize=8.5, leading=11,
            alignment=TA_LEFT,
        ),
        "TableHeader": ParagraphStyle(
            "TableHeader", parent=base["Normal"],
            fontName="Helvetica-Bold", fontSize=9, leading=11,
            textColor=WHITE,
        ),
        "TableCell": ParagraphStyle(
            "TableCell", parent=base["Normal"],
            fontName="Helvetica", fontSize=9, leading=12,
            textColor=colors.HexColor("#1E293B"),
        ),
        "TableCellBold": ParagraphStyle(
            "TableCellBold", parent=base["Normal"],
            fontName="Helvetica-Bold", fontSize=9, leading=12,
            textColor=NAVY,
        ),
        "InsightBody": ParagraphStyle(
            "InsightBody", parent=base["BodyText"],
            fontName="Helvetica", fontSize=9.5, leading=14.5,
            textColor=colors.HexColor("#1E293B"),
        ),
        "FootNote": ParagraphStyle(
            "FootNote", parent=base["Normal"],
            fontName="Helvetica-Oblique", fontSize=8, leading=10,
            textColor=TEXT_MUTED,
        ),
    }
    return styles


# =========================================================
# HELPERS
# =========================================================

def _fmt(n):
    try:
        return f"{int(n):,}"
    except (TypeError, ValueError):
        return str(n)


def compute_trend(current, previous):
    """Returns (label, color) describing current vs previous week."""
    if previous in (None, "", 0) and previous != 0:
        return "No prior data", TEXT_MUTED
    try:
        current = float(current)
        previous = float(previous)
    except (TypeError, ValueError):
        return "No prior data", TEXT_MUTED

    if previous == 0:
        return ("New activity" if current > 0 else "No change"), TEXT_MUTED

    delta = current - previous
    pct = (delta / previous) * 100

    # For rework counts, a decrease is good (SUCCESS), an increase is bad (DANGER).
    if abs(pct) < 1:
        return "Flat vs last week", TEXT_MUTED
    if delta > 0:
        return f"\u25B2 {pct:.0f}% vs last week", DANGER
    return f"\u25BC {abs(pct):.0f}% vs last week", SUCCESS


def kpi_card(label, value, trend_text=None, trend_color=TEXT_MUTED, styles=None, width=0):
    """Builds a single KPI card as a bordered mini-table."""
    rows = [
        [Paragraph(label.upper(), styles["KPILabel"])],
        [Paragraph(_fmt(value), styles["KPIValue"])],
    ]
    if trend_text:
        rows.append([Paragraph(trend_text, ParagraphStyle(
            "trend", parent=styles["KPITrend"], textColor=trend_color))])

    t = Table(rows, colWidths=[width])
    t.setStyle(TableStyle([
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, 0), 10),
        ("BOTTOMPADDING", (0, -1), (-1, -1), 10),
        ("TOPPADDING", (0, 1), (-1, 1), 2),
        ("BOTTOMPADDING", (0, 1), (-1, 1), 2),
        ("BOX", (0, 0), (-1, -1), 1, BORDER),
        ("LINEABOVE", (0, 0), (-1, 0), 3, ACCENT),
        ("BACKGROUND", (0, 0), (-1, -1), WHITE),
    ]))
    return t


def build_kpi_row(statistics, styles, content_width):
    gap = 6
    n = 4
    card_w = (content_width - gap * (n - 1)) / n

    total = statistics.get("total_reworks", 0)
    prev_total = statistics.get("previous_week_total")
    trend_text, trend_color = compute_trend(total, prev_total)

    cards = [
        kpi_card("Total Reworks", total, trend_text, trend_color, styles, card_w),
        kpi_card("Plants Covered", statistics.get("plants_covered", 0),
                  styles=styles, width=card_w),
        kpi_card("Contractors Involved", statistics.get("contractors", 0),
                  styles=styles, width=card_w),
        kpi_card("Defect Types", statistics.get("defect_types", 0),
                  styles=styles, width=card_w),
    ]

    spacer_cell = Spacer(gap, 1)
    row = []
    for i, c in enumerate(cards):
        row.append(c)
        if i != len(cards) - 1:
            row.append(spacer_cell)

    col_widths = []
    for i in range(len(cards)):
        col_widths.append(card_w)
        if i != len(cards) - 1:
            col_widths.append(gap)

    wrapper = Table([row], colWidths=col_widths)
    wrapper.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
    ]))
    return wrapper


def section_heading(text, styles):
    return KeepTogether([
        Paragraph(text, styles["SectionHeading"]),
        HRFlowable(width="100%", thickness=1, color=BORDER, spaceAfter=8),
    ])


def build_ranked_table(data_dict, styles, content_width, value_label="Count",
                        max_rows=None, highlight_top=True):
    """Sorted, zebra-striped table with a share-of-total column and totals row."""
    if not data_dict:
        return Paragraph("No records for this period.", styles["Body"])

    items = sorted(data_dict.items(), key=lambda kv: kv[1], reverse=True)
    if max_rows:
        shown = items[:max_rows]
        remainder = items[max_rows:]
    else:
        shown, remainder = items, []

    total = sum(v for _, v in items)

    header = [
        Paragraph("#", styles["TableHeader"]),
        Paragraph("Name", styles["TableHeader"]),
        Paragraph(value_label, styles["TableHeader"]),
        Paragraph("Share", styles["TableHeader"]),
    ]
    rows = [header]

    for i, (name, value) in enumerate(shown, start=1):
        share = f"{(value / total * 100):.1f}%" if total else "0.0%"
        cell_style = styles["TableCellBold"] if (highlight_top and i == 1) else styles["TableCell"]
        rows.append([
            Paragraph(str(i), styles["TableCell"]),
            Paragraph(str(name), cell_style),
            Paragraph(_fmt(value), cell_style),
            Paragraph(share, styles["TableCell"]),
        ])

    if remainder:
        other_total = sum(v for _, v in remainder)
        rows.append([
            Paragraph("—", styles["TableCell"]),
            Paragraph(f"Other ({len(remainder)} items)", styles["TableCell"]),
            Paragraph(_fmt(other_total), styles["TableCell"]),
            Paragraph(f"{(other_total / total * 100):.1f}%" if total else "0.0%", styles["TableCell"]),
        ])

    rows.append([
        "",
        Paragraph("TOTAL", styles["TableCellBold"]),
        Paragraph(_fmt(total), styles["TableCellBold"]),
        Paragraph("100.0%", styles["TableCellBold"]),
    ])

    col_widths = [
        content_width * 0.07,
        content_width * 0.56,
        content_width * 0.20,
        content_width * 0.17,
    ]

    t = Table(rows, colWidths=col_widths, repeatRows=1)
    style = [
        ("BACKGROUND", (0, 0), (-1, 0), NAVY),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("TOPPADDING", (0, 0), (-1, 0), 7),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 7),
        ("ALIGN", (0, 0), (0, -1), "CENTER"),
        ("ALIGN", (2, 0), (-1, -1), "RIGHT"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 1), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 1), (-1, -1), 5),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("LINEBELOW", (0, 0), (-1, -2), 0.5, BORDER),
        ("LINEABOVE", (0, -1), (-1, -1), 1, NAVY),
        ("BACKGROUND", (0, -1), (-1, -1), ACCENT_LIGHT),
    ]
    for i in range(1, len(rows) - 1):
        if i % 2 == 0:
            style.append(("BACKGROUND", (0, i), (-1, i), ROW_ALT))
    t.setStyle(TableStyle(style))
    return t


def build_bar_chart(data_dict, content_width, max_items=6):
    """Horizontal-feel vertical bar chart for the top N items."""
    if not data_dict:
        return None
    items = sorted(data_dict.items(), key=lambda kv: kv[1], reverse=True)[:max_items]
    labels = [str(k)[:14] for k, _ in items]
    values = [v for _, v in items]

    drawing = Drawing(content_width, 130)
    chart = VerticalBarChart()
    chart.x = 30
    chart.y = 20
    chart.height = 95
    chart.width = content_width - 50
    chart.data = [values]
    chart.categoryAxis.categoryNames = labels
    chart.categoryAxis.labels.fontName = "Helvetica"
    chart.categoryAxis.labels.fontSize = 7
    chart.categoryAxis.labels.angle = 0
    chart.categoryAxis.labels.dy = -10
    chart.valueAxis.labels.fontName = "Helvetica"
    chart.valueAxis.labels.fontSize = 7
    chart.valueAxis.valueMin = 0
    chart.bars[0].fillColor = ACCENT
    chart.barWidth = 8
    chart.groupSpacing = 12
    chart.strokeColor = None
    drawing.add(chart)
    return drawing


def build_insight_box(ai_text, styles, content_width):
    clean_ai = (ai_text or "No insights generated for this period.").replace("**", "").replace("#", "")
    paragraphs = [p.strip() for p in clean_ai.split("\n") if p.strip()]
    if not paragraphs:
        paragraphs = ["No insights generated for this period."]

    inner = [Paragraph(p, styles["InsightBody"]) for p in paragraphs]
    inner_table_rows = [[content] for content in inner]

    t = Table(inner_table_rows, colWidths=[content_width - 14])
    t.setStyle(TableStyle([
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
    ]))

    wrapper = Table([[t]], colWidths=[content_width])
    wrapper.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), ACCENT_LIGHT),
        ("BOX", (0, 0), (-1, -1), 0.75, BORDER),
        ("LINEBEFORE", (0, 0), (0, 0), 3, ACCENT),
        ("LEFTPADDING", (0, 0), (-1, -1), 14),
        ("RIGHTPADDING", (0, 0), (-1, -1), 14),
        ("TOPPADDING", (0, 0), (-1, -1), 12),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
    ]))
    return wrapper


# =========================================================
# CANVAS: HEADER / FOOTER / PAGE NUMBERING
# =========================================================

class ReportCanvas(pdfcanvas.Canvas):
    """Collects pages so the footer can print 'Page X of Y'."""

    def __init__(self, *args, **kwargs):
        pdfcanvas.Canvas.__init__(self, *args, **kwargs)
        self._saved_states = []

    # def showPage(self):
    #     self._saved_states.append(dict(self.__dict__))
    #     pdfcanvas.Canvas.showPage(self)
    def showPage(self):
        self._saved_states.append(dict(self.__dict__))
        self._startPage()

    # def save(self):
    #     total_pages = len(self._saved_states)
    #     for i, state in enumerate(self._saved_states):
    #         self.__dict__.update(state)
    #         if i > 0:  # page 1 is the cover, no footer/header chrome
    #             self._draw_content_chrome(i + 1, total_pages)
    #         pdfcanvas.Canvas.showPage(self)
    #     pdfcanvas.Canvas.save(self)

    def save(self):

        total_pages = len(self._saved_states)

        for page_num, state in enumerate(self._saved_states, start=1):

           self.__dict__.update(state)

           if page_num > 1:
             self._draw_content_chrome(page_num, total_pages)

           pdfcanvas.Canvas.showPage(self)

        pdfcanvas.Canvas.save(self)
    def _draw_content_chrome(self, page_num, total_pages):
        self.saveState()

        # thin top rule + running head
        self.setStrokeColor(BORDER)
        self.setLineWidth(0.75)
        self.line(MARGIN, PAGE_H - 14 * mm, PAGE_W - MARGIN, PAGE_H - 14 * mm)

        self.setFont("Helvetica-Bold", 8.5)
        self.setFillColor(NAVY)
        self.drawString(MARGIN, PAGE_H - 12 * mm, DOC_TITLE)

        self.setFont("Helvetica", 8)
        self.setFillColor(TEXT_MUTED)
        self.drawRightString(PAGE_W - MARGIN, PAGE_H - 12 * mm, DOC_SUBTITLE)

        # footer
        self.setStrokeColor(BORDER)
        self.line(MARGIN, 14 * mm, PAGE_W - MARGIN, 14 * mm)

        self.setFont("Helvetica", 7.5)
        self.setFillColor(TEXT_MUTED)
        self.drawString(MARGIN, 10 * mm, CONFIDENTIALITY)
        self.drawCentredString(PAGE_W / 2, 10 * mm, COMPANY_NAME)
        self.drawRightString(PAGE_W - MARGIN, 10 * mm, f"Page {page_num - 1} of {total_pages - 1}")

        self.restoreState()


def draw_cover(canvas_obj, doc, statistics, start_date, end_date):
    canvas_obj.saveState()

    # full-bleed navy band
    canvas_obj.setFillColor(NAVY)
    canvas_obj.rect(0, PAGE_H - 100 * mm, PAGE_W, 100 * mm, stroke=0, fill=1)

    # accent strip
    canvas_obj.setFillColor(ACCENT)
    canvas_obj.rect(0, PAGE_H - 100 * mm, PAGE_W, 3, stroke=0, fill=1)

    canvas_obj.setFillColor(colors.HexColor("#93C5FD"))
    canvas_obj.setFont("Helvetica-Bold", 9)
    canvas_obj.drawString(MARGIN, PAGE_H - 30 * mm, COMPANY_NAME.upper())

    canvas_obj.setFillColor(WHITE)
    canvas_obj.setFont("Helvetica-Bold", 36)
    canvas_obj.drawString(MARGIN, PAGE_H - 50 * mm, DOC_TITLE)

    canvas_obj.setFont("Helvetica", 15)
    canvas_obj.setFillColor(colors.HexColor("#CBD5E1"))
    canvas_obj.drawString(MARGIN, PAGE_H - 60 * mm, DOC_SUBTITLE)

    canvas_obj.setFont("Helvetica", 10.5)
    canvas_obj.setFillColor(colors.HexColor("#E2E8F0"))
    canvas_obj.drawString(MARGIN, PAGE_H - 80 * mm, f"Reporting Period:  {start_date.strftime('%d %b %Y')}  \u2013  {end_date.strftime('%d %b %Y')}")
    canvas_obj.drawString(MARGIN, PAGE_H - 86 * mm, f"Generated:  {datetime.now().strftime('%d %b %Y, %H:%M')}")

    # cover KPI strip
    total = statistics.get("total_reworks", 0)
    canvas_obj.setFont("Helvetica-Bold", 26)
    canvas_obj.setFillColor(WHITE)
    canvas_obj.drawString(MARGIN, PAGE_H - 96 * mm + 2, "")

    canvas_obj.setFillColor(TEXT_MUTED)
    canvas_obj.setFont("Helvetica-Oblique", 8)
    canvas_obj.drawCentredString(PAGE_W / 2, 12 * mm, CONFIDENTIALITY)
    canvas_obj.drawString(MARGIN, 12 * mm, "Generated automatically by ReworkIQ")
    canvas_obj.drawRightString(PAGE_W - MARGIN, 12 * mm, "Page 1")

    canvas_obj.restoreState()


# =========================================================
# MAIN ENTRY POINT
# =========================================================

def generate_weekly_pdf(rework_data, statistics, ai_text):
    os.makedirs("reports", exist_ok=True)
    pdf_path = "reports/weekly_rework_report.pdf"

    end_date = datetime.now().date()
    start_date = end_date - timedelta(days=7)

    styles = build_styles()
    content_width = PAGE_W - 2 * MARGIN

    doc = BaseDocTemplate(
        pdf_path,
        pagesize=A4,
        leftMargin=MARGIN,
        rightMargin=MARGIN,
        topMargin=MARGIN,
        bottomMargin=MARGIN,
        title=f"{DOC_TITLE} Weekly Rework Report",
        author="ReworkIQ",
    )

    cover_frame = Frame(0, 0, PAGE_W, PAGE_H, id="cover", leftPadding=0,
                         rightPadding=0, topPadding=0, bottomPadding=0)
    content_frame = Frame(MARGIN, MARGIN, content_width, PAGE_H - 2 * MARGIN - 6 * mm,
                           id="content", topPadding=6 * mm)

    doc.addPageTemplates([
        PageTemplate(id="Cover", frames=[cover_frame],
                      onPage=lambda c, d: draw_cover(c, d, statistics, start_date, end_date)),
        PageTemplate(id="Content", frames=[content_frame], onPage=lambda c, d: None),
    ])

    story = []

    # ---- Cover page (chrome drawn by draw_cover; frame stays empty) ----
    story.append(Spacer(1, 1))
    story.append(NextPageTemplate("Content"))
    story.append(PageBreak())

    # ---- Executive summary ----
    story.append(section_heading("EXECUTIVE SUMMARY", styles))
    story.append(build_kpi_row(statistics, styles, content_width))
    story.append(Spacer(1, 22))

    # ---- Plant summary ----
    story.append(section_heading("PLANT SUMMARY", styles))
    story.append(build_ranked_table(statistics.get("plant_counts", {}), styles,
                                     content_width, value_label="Reworks"))
    story.append(Spacer(1, 18))

    # ---- Contractor summary ----
    story.append(section_heading("CONTRACTOR SUMMARY", styles))
    story.append(build_ranked_table(statistics.get("contractor_counts", {}), styles,
                                     content_width, value_label="Reworks", max_rows=8))
    story.append(Spacer(1, 18))

    # ---- Defect summary (table + chart) ----
    story.append(section_heading("DEFECT SUMMARY", styles))
    defect_counts = statistics.get("defect_counts", {})
    story.append(build_ranked_table(defect_counts, styles, content_width,
                                     value_label="Occurrences", max_rows=8))
    chart = build_bar_chart(defect_counts, content_width)
    if chart is not None:
        story.append(Spacer(1, 10))
        story.append(Paragraph("Top Defect Types — Visual Distribution", styles["SubHeading"]))
        story.append(chart)
    story.append(Spacer(1, 18))

    # ---- Week-over-week comparison ----
    story.append(section_heading("WEEK-OVER-WEEK COMPARISON", styles))
    prev_total = statistics.get("previous_week_total")
    current_total = statistics.get("total_reworks", 0)
    trend_text, trend_color = compute_trend(current_total, prev_total)
    comp_rows = [
        [Paragraph("Metric", styles["TableHeader"]),
         Paragraph("Previous Week", styles["TableHeader"]),
         Paragraph("Current Week", styles["TableHeader"]),
         Paragraph("Change", styles["TableHeader"])],
        [Paragraph("Total Reworks", styles["TableCell"]),
         Paragraph(_fmt(prev_total) if prev_total is not None else "N/A", styles["TableCell"]),
         Paragraph(_fmt(current_total), styles["TableCellBold"]),
         Paragraph(trend_text, ParagraphStyle("chg", parent=styles["TableCell"], textColor=trend_color,
                                                fontName="Helvetica-Bold"))],
    ]
    comp_table = Table(comp_rows, colWidths=[content_width * 0.30, content_width * 0.23,
                                              content_width * 0.23, content_width * 0.24])
    comp_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), NAVY),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("ALIGN", (1, 0), (-1, -1), "CENTER"),
        ("LINEBELOW", (0, 0), (-1, 0), 0.5, BORDER),
        ("BOX", (0, 0), (-1, -1), 0.75, BORDER),
    ]))
    story.append(comp_table)
    story.append(Spacer(1, 22))

    # ---- AI quality insights ----
    story.append(section_heading("AI QUALITY INSIGHTS", styles))
    story.append(build_insight_box(ai_text, styles, content_width))
    story.append(Spacer(1, 16))

    story.append(HRFlowable(width="100%", thickness=0.5, color=BORDER, spaceAfter=6))
    story.append(Paragraph("Generated automatically by ReworkIQ. Figures are compiled from "
                            "logged rework entries for the reporting period stated on the "
                            "cover page and are subject to correction as records are finalised.",
                            styles["FootNote"]))

    doc.build(story, canvasmaker=ReportCanvas)
    return pdf_path


# =========================================================
# MANUAL TEST
# =========================================================

if __name__ == "__main__":
    dummy_statistics = {
        "total_reworks": 47,
        "previous_week_total": 61,
        "plants_covered": 3,
        "contractors": 6,
        "defect_types": 5,
        "plant_counts": {"SMS-II": 19, "SSD Bay-1": 14, "SSD Bay-2": 9, "Rolling Mill": 5},
        "contractor_counts": {
            "Corimpex Welding Co.": 15, "Shree Fabricators": 11, "Balaji Contractors": 8,
            "Om Engineering Works": 6, "Sai Weld Solutions": 4, "Metro Fab": 2, "Unity Works": 1,
        },
        "defect_counts": {
            "Porosity": 16, "Undercut": 10, "Incomplete Fusion": 8,
            "Slag Inclusion": 7, "Blowhole": 4, "Crack": 2,
        },
    }
    dummy_ai_text = (
        "Rework volume declined 23% week-over-week, driven primarily by reduced porosity "
        "defects at SMS-II following the flux storage corrective action.\n"
        "Corimpex Welding Co. continues to account for the largest single share of rework "
        "(32%); a targeted audit of their SAW parameter compliance is recommended.\n"
        "Undercut defects rose slightly at SSD Bay-2 and should be monitored against welder "
        "travel speed and amperage settings over the coming week."
    )
    path = generate_weekly_pdf({}, dummy_statistics, dummy_ai_text)
    print("Generated:", path)