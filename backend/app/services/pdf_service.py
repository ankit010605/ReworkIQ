import os
from io import BytesIO
from datetime import datetime
import tempfile

import matplotlib
matplotlib.use("Agg")

import matplotlib.pyplot as plt

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    Image,
    PageBreak,
    Flowable,
)

from app.services.ai_service import generate_ai_report


# =====================================================
# BRAND PALETTE
# =====================================================

PRIMARY = colors.HexColor("#0F4C81")      # deep corporate blue
PRIMARY_DARK = colors.HexColor("#0A3660")
ACCENT = colors.HexColor("#2E86DE")       # brighter accent blue
SECONDARY = colors.HexColor("#1F2937")    # near-black text
LIGHT = colors.HexColor("#F1F5F9")        # card / row background
LIGHT_BLUE = colors.HexColor("#E8F1FB")   # insight box background
BORDER = colors.HexColor("#D7DEE7")
GREY = colors.HexColor("#6B7280")
WHITE = colors.white

COMPANY_NAME = "JINDAL STEEL"
DIVISION_NAME = "Structural Steel Division"
REPORT_TITLE = "REWO Rework Analytics Report"

CHART_PALETTE = ["#0F4C81", "#2E86DE", "#54A0FF", "#8395A7", "#48DBFB", "#1B9CFC"]


# =====================================================
# STYLES
# =====================================================

styles = getSampleStyleSheet()

TITLE = ParagraphStyle(
    "TITLE", parent=styles["Heading1"], alignment=TA_CENTER,
    fontName="Helvetica-Bold", fontSize=26, leading=32, textColor=PRIMARY,
)

SUBTITLE = ParagraphStyle(
    "SUBTITLE", parent=styles["Heading2"], alignment=TA_CENTER,
    fontName="Helvetica", fontSize=13, textColor=SECONDARY,
)

SECTION = ParagraphStyle(
    "SECTION", parent=styles["Heading2"], fontName="Helvetica-Bold",
    fontSize=16, textColor=PRIMARY_DARK, spaceAfter=4, spaceBefore=2,
)

SECTION_RULE_GAP = 10

SUBHEAD = ParagraphStyle(
    "SUBHEAD", parent=styles["Heading3"], fontName="Helvetica-Bold",
    fontSize=11.5, textColor=SECONDARY, spaceBefore=6, spaceAfter=6,
)

BODY = ParagraphStyle(
    "BODY", parent=styles["BodyText"], fontName="Helvetica",
    fontSize=10, leading=15, textColor=SECONDARY,
)

BULLET = ParagraphStyle(
    "BULLET", parent=styles["BodyText"], fontName="Helvetica",
    fontSize=9.7, leftIndent=14, leading=15.5, textColor=SECONDARY,
    spaceAfter=4,
)

INSIGHT_HEAD = ParagraphStyle(
    "INSIGHT_HEAD", parent=styles["Heading4"], fontName="Helvetica-Bold",
    fontSize=11.5, textColor=PRIMARY_DARK, spaceAfter=4,
)

COVER_LABEL = ParagraphStyle(
    "COVER_LABEL", parent=styles["BodyText"], fontName="Helvetica",
    fontSize=10, textColor=GREY,
)

COVER_VALUE = ParagraphStyle(
    "COVER_VALUE", parent=styles["BodyText"], fontName="Helvetica-Bold",
    fontSize=12, textColor=SECONDARY,
)


# =====================================================
# PAGE GEOMETRY
# =====================================================

PAGE_W = 8.27 * inch
PAGE_H = 11.69 * inch
MARGIN = 0.6 * inch
HEADER_H = 0.95 * inch
FOOTER_H = 0.55 * inch


# =====================================================
# HEADER / FOOTER (drawn on every page)
# =====================================================

def _draw_header_footer(canvas, doc):
    canvas.saveState()

    # ---- Header band ----
    canvas.setFillColor(PRIMARY)
    canvas.rect(0, PAGE_H - HEADER_H, PAGE_W, HEADER_H, fill=1, stroke=0)

    # thin accent underline
    canvas.setFillColor(ACCENT)
    canvas.rect(0, PAGE_H - HEADER_H - 0.03 * inch, PAGE_W, 0.03 * inch, fill=1, stroke=0)

    # Company / brand mark (left)
    canvas.setFillColor(WHITE)
    canvas.setFont("Helvetica-Bold", 14)
    canvas.drawString(MARGIN, PAGE_H - 0.42 * inch, COMPANY_NAME)
    canvas.setFont("Helvetica", 8.5)
    canvas.setFillColor(colors.HexColor("#CFE0F2"))
    canvas.drawString(MARGIN, PAGE_H - 0.58 * inch, DIVISION_NAME)

    # Report name (right)
    canvas.setFillColor(WHITE)
    canvas.setFont("Helvetica-Bold", 10.5)
    canvas.drawRightString(PAGE_W - MARGIN, PAGE_H - 0.42 * inch, "ReworkIQ Analytics")
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(colors.HexColor("#CFE0F2"))
    canvas.drawRightString(
        PAGE_W - MARGIN, PAGE_H - 0.58 * inch,
        datetime.now().strftime("%d %B %Y"),
    )

    # ---- Footer ----
    canvas.setStrokeColor(BORDER)
    canvas.setLineWidth(0.6)
    canvas.line(MARGIN, FOOTER_H, PAGE_W - MARGIN, FOOTER_H)

    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(GREY)
    canvas.drawString(MARGIN, FOOTER_H - 0.22 * inch, "Confidential Internal Quality Report")

    canvas.drawCentredString(
        PAGE_W / 2, FOOTER_H - 0.22 * inch,
        "Generated automatically by ReworkIQ AI Analytics Engine",
    )

    canvas.drawRightString(
        PAGE_W - MARGIN, FOOTER_H - 0.22 * inch,
        f"Page {canvas.getPageNumber()}",
    )

    canvas.restoreState()


# =====================================================
# KPI CARD FLOWABLE
# =====================================================

class KPICard(Flowable):
    """A single rounded-rect KPI card with a big value and small label."""

    def __init__(self, label, value, width=1.62 * inch, height=0.95 * inch,
                 bg=PRIMARY, value_color=WHITE, label_color=colors.HexColor("#CFE0F2")):
        Flowable.__init__(self)
        self.label = label
        self.value = str(value)
        self.width = width
        self.height = height
        self.bg = bg
        self.value_color = value_color
        self.label_color = label_color

    def wrap(self, availWidth, availHeight):
        return self.width, self.height

    def draw(self):
        c = self.canv
        c.saveState()
        c.setFillColor(self.bg)
        c.roundRect(0, 0, self.width, self.height, 7, fill=1, stroke=0)

        c.setFillColor(self.value_color)
        c.setFont("Helvetica-Bold", 18)
        c.drawCentredString(self.width / 2, self.height * 0.48, self.value)

        c.setFillColor(self.label_color)
        c.setFont("Helvetica", 8)
        c.drawCentredString(self.width / 2, self.height * 0.18, self.label.upper())
        c.restoreState()


def kpi_row(cards, gap=0.14 * inch):
    """Lay a list of KPICard flowables out in a single centered row."""
    cell_widths = [c.width for c in cards]
    total_gap = gap * (len(cards) - 1)
    table_width = sum(cell_widths) + total_gap
    left_pad = (PAGE_W - 2 * MARGIN - table_width) / 2

    row = [cards]
    col_widths = cell_widths
    t = Table(row, colWidths=col_widths, hAlign="CENTER")
    t.setStyle(TableStyle([
        ("LEFTPADDING", (0, 0), (-1, -1), gap / 2),
        ("RIGHTPADDING", (0, 0), (-1, -1), gap / 2),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))
    return t


# =====================================================
# GENERIC DATA TABLE (for top-3 breakdowns)
# =====================================================

def styled_table(data, col_widths=(4.4 * inch, 2.0 * inch)):
    table = Table(data, colWidths=list(col_widths))
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), PRIMARY),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 9.5),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 8),
        ("TOPPADDING", (0, 0), (-1, 0), 8),
        ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
        ("FONTSIZE", (0, 1), (-1, -1), 9.5),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, LIGHT]),
        ("LINEBELOW", (0, 0), (-1, -1), 0.5, BORDER),
        ("ALIGN", (1, 0), (-1, -1), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 1), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 1), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
    ]))
    return table


# =====================================================
# AI INSIGHT BOX
# =====================================================

def insight_box(heading, items, accent=PRIMARY):
    bullets = "<br/>".join(f"&#8226;&nbsp;&nbsp;{i}" for i in items)
    content = Paragraph(f"<b>{heading}</b><br/><br/>{bullets}", BODY)
    box = Table([[content]], colWidths=[6.9 * inch])
    box.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), LIGHT_BLUE),
        ("LINEBEFORE", (0, 0), (0, -1), 4, accent),
        ("TOPPADDING", (0, 0), (-1, -1), 12),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
        ("LEFTPADDING", (0, 0), (-1, -1), 16),
        ("RIGHTPADDING", (0, 0), (-1, -1), 14),
        ("BOX", (0, 0), (-1, -1), 0.5, BORDER),
    ]))
    return box


# =====================================================
# TOP 3 HELPER
# =====================================================

def top_three(dictionary):
    return sorted(dictionary.items(), key=lambda x: x[1], reverse=True)[:3]


# =====================================================
# CHART HELPERS (brand-styled)
# =====================================================

def _new_tempfile():
    return tempfile.NamedTemporaryFile(suffix=".png", delete=False).name


def monthly_chart(monthly_counts):
    months = list(monthly_counts.keys())
    values = list(monthly_counts.values())

    plt.figure(figsize=(6, 2.2))
    plt.plot(months, values, linewidth=2.5, marker="o",
             color=CHART_PALETTE[0], markerfacecolor=CHART_PALETTE[1])
    plt.fill_between(range(len(months)), values, alpha=0.08, color=CHART_PALETTE[0])
    plt.title("Monthly Rework Trend", fontsize=11, color="#1F2937", weight="bold")
    plt.xticks(rotation=30, fontsize=8)
    plt.yticks(fontsize=8)
    plt.grid(axis="y", linestyle="--", alpha=0.3)
    ax = plt.gca()
    for spine in ["top", "right"]:
        ax.spines[spine].set_visible(False)
    plt.tight_layout()

    import gc

    path = _new_tempfile()

    plt.savefig(path, dpi=100)

    plt.clf()
    plt.close('all')
    gc.collect()

    return path
    import os

    print("Saved chart to:", path)
    print("File exists:", os.path.exists(path))

    return path


def plant_chart(plant_counts):
    labels = list(plant_counts.keys())
    values = list(plant_counts.values())

    plt.figure(figsize=(3, 3))
    plt.pie(
        values, labels=labels, autopct="%1.1f%%",
        colors=CHART_PALETTE, textprops={"fontsize": 8},
        wedgeprops={"edgecolor": "white", "linewidth": 1},
    )
    plt.title("Plant Distribution", fontsize=11, color="#1F2937", weight="bold")
    plt.tight_layout()

    path = _new_tempfile()
    plt.savefig(path, dpi=80)
    plt.close()
    return path


def contractor_chart(contractor_counts):
    labels = list(contractor_counts.keys())
    values = list(contractor_counts.values())

    plt.figure(figsize=(3, 3))
    plt.pie(
        values, labels=labels, autopct="%1.1f%%",
        colors=CHART_PALETTE, textprops={"fontsize": 8},
        wedgeprops={"edgecolor": "white", "linewidth": 1},
    )
    plt.title("Contractor Distribution", fontsize=11, color="#1F2937", weight="bold")
    plt.tight_layout()

    import gc

    path = _new_tempfile()

    plt.savefig(path, dpi=100)

    plt.clf()
    plt.close('all')
    gc.collect()
    

    
    return path


def side_by_side(image_path_a, image_path_b, size=3.1 * inch):
    """Place two chart images side by side in a borderless table."""
    img_a = Image(image_path_a, width=size, height=size)
    img_b = Image(image_path_b, width=size, height=size)
    t = Table([[img_a, img_b]], colWidths=[3.35 * inch, 3.35 * inch])
    t.setStyle(TableStyle([
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 4),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
    ]))
    return t


def section_heading(text):
    """Section title with a colored rule underneath, as its own mini-table."""
    return [
        Paragraph(text, SECTION),
        _hrule(),
        Spacer(1, SECTION_RULE_GAP),
    ]


class _HRule(Flowable):
    def __init__(self, width=None, color=ACCENT, thickness=1.4):
        Flowable.__init__(self)
        self.width = width or (PAGE_W - 2 * MARGIN)
        self.thickness = thickness
        self.color = color

    def wrap(self, availWidth, availHeight):
        return self.width, self.thickness + 2

    def draw(self):
        self.canv.setStrokeColor(self.color)
        self.canv.setLineWidth(self.thickness)
        self.canv.line(0, 0, self.width, 0)


def _hrule():
    return _HRule()


# =====================================================
# CREATE REPORT
# =====================================================

def create_report(stats):

    ai = generate_ai_report(stats)

    buffer = BytesIO()

    doc = SimpleDocTemplate(
        buffer,
        pagesize=(PAGE_W, PAGE_H),
        rightMargin=MARGIN,
        leftMargin=MARGIN,
        topMargin=HEADER_H + 0.25 * inch,
        bottomMargin=FOOTER_H + 0.25 * inch,
        title=REPORT_TITLE,
    )

    story = []

    ####################################################
    # PAGE 1 — COVER
    ####################################################

    story.append(Spacer(1, 0.9 * inch))
    story.append(Paragraph(REPORT_TITLE, TITLE))
    story.append(Spacer(1, 0.12 * inch))
    story.append(Paragraph(f"{COMPANY_NAME.title()} &mdash; {DIVISION_NAME}", SUBTITLE))
    story.append(Spacer(1, 0.5 * inch))

    cover_kpis = kpi_row([
        KPICard("Total Reworks", stats["total_reworks"]),
        KPICard("Top Plant", stats["top_plant"]["name"]),
        KPICard("Top Contractor", stats["top_contractor"]["name"]),
    ])
    story.append(cover_kpis)

    story.append(Spacer(1, 0.5 * inch))

    cover_table = [
        ["Reporting Period", "All Available Records"],
        ["Generated On", datetime.now().strftime("%d %B %Y")],
        ["Generated By", "ReworkIQ Analytics Engine"],
    ]
    story.append(styled_table(cover_table))

    story.append(Spacer(1, 2.6 * inch))
    story.append(Paragraph("<b>Confidential Internal Quality Report</b>", BODY))
    story.append(Paragraph("Generated automatically using ReworkIQ AI Analytics.", BODY))

    story.append(PageBreak())

    ####################################################
    # PAGE 2 — EXECUTIVE DASHBOARD
    ####################################################

    story.extend(section_heading("Executive Dashboard"))

    dashboard_kpis = kpi_row([
        KPICard("Total Reworks", stats["total_reworks"]),
        KPICard("Top Plant", stats["top_plant"]["name"], bg=ACCENT),
        KPICard("Top Contractor", stats["top_contractor"]["name"], bg=PRIMARY_DARK),
        KPICard("Top Defect", stats["most_common_defect"]["code"], bg=ACCENT),
    ], gap=0.16 * inch)
    story.append(dashboard_kpis)

    story.append(Spacer(1, 0.35 * inch))

    # ---- Top 3 breakdown tables, two per row ----
    plants_data = [["Top 3 Plants", "Reworks"]] + [
        [name, count] for name, count in top_three(stats["plant_counts"])
    ]
    contractors_data = [["Top 3 Contractors", "Reworks"]] + [
        [name, count] for name, count in top_three(stats["contractor_counts"])
    ]
    defects_data = [["Top 3 Defects", "Occurrences"]] + [
        [name, count] for name, count in top_three(stats["defect_code_counts"])
    ]

    story.append(Paragraph("Breakdown Highlights", SUBHEAD))

    row1 = Table(
        [[styled_table(plants_data, (2.05 * inch, 1.1 * inch)),
          styled_table(contractors_data, (2.05 * inch, 1.1 * inch))]],
        colWidths=[3.35 * inch, 3.35 * inch],
    )
    row1.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(row1)
    story.append(Spacer(1, 0.25 * inch))
    story.append(styled_table(defects_data, (4.4 * inch, 2.2 * inch)))

    story.append(PageBreak())

    ####################################################
    # PAGE 3 — VISUAL ANALYTICS
    ####################################################

    story.extend(section_heading("Visual Analytics"))

    # if stats.get("monthly_counts"):
    #     monthly_image = monthly_chart(stats["monthly_counts"])
    #     story.append(Paragraph("Monthly Rework Trend", SUBHEAD))
    #     story.append(Image(monthly_image, width=6.7 * inch, height=2.7 * inch))
    #     story.append(Spacer(1, 0.3 * inch))

    # if stats.get("plant_counts") and stats.get("contractor_counts"):
    #     story.append(Paragraph("Plant &amp; Contractor Distribution", SUBHEAD))
    #     plant_image = plant_chart(stats["plant_counts"])
    #     contractor_image = contractor_chart(stats["contractor_counts"])
    #     story.append(side_by_side(plant_image, contractor_image))
    # else:
    #     if stats.get("plant_counts"):
    #         plant_image = plant_chart(stats["plant_counts"])
    #         story.append(Paragraph("Plant Distribution", SUBHEAD))
    #         story.append(Image(plant_image, width=3.2 * inch, height=3.2 * inch))
    #     if stats.get("contractor_counts"):
    #         contractor_image = contractor_chart(stats["contractor_counts"])
    #         story.append(Paragraph("Contractor Distribution", SUBHEAD))
    #         story.append(Image(contractor_image, width=3.2 * inch, height=3.2 * inch))
    

    if stats.get("monthly_counts"):
      monthly_image = monthly_chart(stats["monthly_counts"])

      print("Chart Path:", monthly_image)
      print("Exists:", os.path.exists(monthly_image))

      story.append(Paragraph("Monthly Rework Trend", SUBHEAD))
      story.append(
        Image(
            monthly_image,
            width=6.7*inch,
            height=2.7*inch
        )
    )

    ####################################################
    # PAGE 4 — AI EXECUTIVE ANALYSIS
    ####################################################

    story.extend(section_heading("AI Executive Analysis"))

    story.append(insight_box("Executive Summary", ai["executive_summary"], accent=PRIMARY))
    story.append(Spacer(1, 0.25 * inch))

    story.append(insight_box("Key Observations", ai["observations"], accent=ACCENT))
    story.append(Spacer(1, 0.25 * inch))

    story.append(insight_box("Recommendations", ai["recommendations"], accent=PRIMARY_DARK))
    story.append(PageBreak())

    ####################################################
    # PAGE 5 — DATA APPENDIX
    ####################################################

    story.extend(section_heading("Data Appendix"))

    story.append(Paragraph("Contractor-wise Rework Count", SUBHEAD))

    contractor_table = [["Contractor", "Reworks"]]
    for contractor, count in sorted(
        stats["contractor_counts"].items(),
        key=lambda x: x[1],
        reverse=True,
    ):
        contractor_table.append([contractor, count])

    story.append(styled_table(contractor_table, (4.5 * inch, 2 * inch)))

    story.append(Spacer(1, 0.3 * inch))

    story.append(Paragraph("Plant-wise Rework Count", SUBHEAD))

    plant_table = [["Plant", "Reworks"]]
    for plant, count in sorted(
        stats["plant_counts"].items(),
        key=lambda x: x[1],
        reverse=True,
    ):
        plant_table.append([plant, count])

    story.append(styled_table(plant_table, (4.5 * inch, 2 * inch)))

    ####################################################
    # BUILD
    ####################################################

    import traceback

    try:
      doc.build(
        story,
        onFirstPage=_draw_header_footer,
        onLaterPages=_draw_header_footer,
    )
    except Exception:
       print("========== PDF BUILD ERROR ==========")
       traceback.print_exc()
       print("=====================================")
       raise

    buffer.seek(0)
    return buffer