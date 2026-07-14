from collections import Counter
from typing import Iterable, Optional, Any


def _top_entry(counter: Counter, total: int) -> Optional[dict]:
    """Returns the leading entry from a Counter as a clean dict, or None if empty.

    Replaces the old `Counter.most_common(1)` output (a list containing at most
    one (name, count) tuple, or an empty list) with a single, predictable shape
    that templates/PDF code don't need to unpack defensively.
    """
    top = counter.most_common(1)
    if not top:
        return None

    name, count = top[0]
    return {
        "name": name,
        "count": count,
        "share_pct": round((count / total) * 100, 1) if total else 0.0,
    }


def _safe_pct_change(current: int, previous: Optional[int]) -> Optional[float]:
    """Percent change from previous -> current. None when there's no baseline."""
    if previous is None:
        return None
    if previous == 0:
        return None if current == 0 else 100.0
    return round(((current - previous) / previous) * 100, 1)


def calculate_statistics(
    rework_data: Iterable[Any],
    previous_period_data: Optional[Iterable[Any]] = None,
) -> dict:
    """Aggregates rework records into report-ready statistics.

    Args:
        rework_data: Rework records for the current reporting period. Each
            record must expose `.plant`, `.contractor`, and `.defect_code`.
        previous_period_data: Optional rework records for the prior period
            (e.g. last week), used only to compute week-over-week trend.
            Pass None if unavailable — trend fields will simply be omitted.

    Returns:
        A dict of counts, breakdowns, and leaders, safe to call on an empty
        `rework_data` (returns zeros / None rather than raising).
    """
    rework_data = list(rework_data)

    plant_counts: Counter = Counter()
    contractor_counts: Counter = Counter()
    defect_counts: Counter = Counter()

    for item in rework_data:
        # Guard against incomplete records (missing FK, null defect code, etc.)
        # rather than letting one bad row take down the whole report.
        plant = getattr(item, "plant", None) or "Unspecified"
        contractor = getattr(item, "contractor", None) or "Unspecified"
        defect_code = getattr(item, "defect_code", None) or "Unclassified"

        plant_counts[plant] += 1
        contractor_counts[contractor] += 1
        defect_counts[defect_code] += 1

    total_reworks = len(rework_data)

    stats = {
        "total_reworks": total_reworks,
        "plants_covered": len(plant_counts),
        "contractors": len(contractor_counts),
        "defect_types": len(defect_counts),

        "plant_counts": dict(plant_counts),
        "contractor_counts": dict(contractor_counts),
        "defect_counts": dict(defect_counts),

        "top_contractor": _top_entry(contractor_counts, total_reworks),
        "top_defect": _top_entry(defect_counts, total_reworks),
        "top_plant": _top_entry(plant_counts, total_reworks),
    }

    if previous_period_data is not None:
        previous_total = len(list(previous_period_data))
        stats["previous_week_total"] = previous_total
        stats["trend_pct"] = _safe_pct_change(total_reworks, previous_total)

    return stats


# =========================================================
# MANUAL TEST
# =========================================================

if __name__ == "__main__":
    from types import SimpleNamespace

    def _rec(plant, contractor, defect_code):
        return SimpleNamespace(plant=plant, contractor=contractor, defect_code=defect_code)

    current_week = [
        _rec("SMS-II", "Corimpex Welding Co.", "Porosity"),
        _rec("SMS-II", "Corimpex Welding Co.", "Porosity"),
        _rec("SSD Bay-1", "Shree Fabricators", "Undercut"),
        _rec("SSD Bay-2", "Balaji Contractors", "Slag Inclusion"),
        _rec("SMS-II", None, None),  # incomplete record, should not crash
    ]
    previous_week = [_rec("SMS-II", "Corimpex Welding Co.", "Porosity")] * 7

    print("With previous period:")
    print(calculate_statistics(current_week, previous_week))

    print("\nWithout previous period:")
    print(calculate_statistics(current_week))

    print("\nEmpty data set:")
    print(calculate_statistics([]))