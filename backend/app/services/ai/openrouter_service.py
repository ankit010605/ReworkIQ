import logging

import requests
from flask import current_app

logger = logging.getLogger(__name__)

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
DEFAULT_MODEL = "openai/gpt-4o-mini"
REQUEST_TIMEOUT = 60
MAX_LISTED_ITEMS = 10


# =========================================================
# PROMPT FORMATTING HELPERS
# =========================================================

def _format_counts(counts: dict, limit: int = MAX_LISTED_ITEMS) -> str:
    """Renders a name->count dict as readable 'Name: N' lines, sorted, capped."""
    if not counts:
        return "No records."

    items = sorted(counts.items(), key=lambda kv: kv[1], reverse=True)
    lines = [f"{name}: {count}" for name, count in items[:limit]]
    remaining = len(items) - limit
    if remaining > 0:
        lines.append(f"...and {remaining} more")
    return "\n".join(lines)


def _format_leader(entry) -> str:
    """Formats a top_contractor / top_defect entry (dict or None) for the prompt."""
    if not entry:
        return "None"
    return f"{entry['name']} ({entry['count']} reworks, {entry['share_pct']}% of total)"


def _format_trend(statistics: dict) -> str:
    """Formats week-over-week context if it was computed upstream."""
    previous_total = statistics.get("previous_week_total")
    trend_pct = statistics.get("trend_pct")

    if previous_total is None:
        return "Not available."
    if trend_pct is None:
        return f"Previous week: {previous_total} reworks."

    direction = "increase" if trend_pct > 0 else "decrease" if trend_pct < 0 else "no change"
    return f"Previous week: {previous_total} reworks ({abs(trend_pct)}% {direction})."


def _build_prompt(statistics: dict) -> str:
    return f"""You are a Senior Quality Assurance Manager in a structural steel fabrication company.

Analyze the weekly rework performance and prepare a professional report.

Data:

Reporting Period:
Last 7 Days

Total Reworks:
{statistics.get("total_reworks", 0)}

Week-over-Week Trend:
{_format_trend(statistics)}

Plant Summary:
{_format_counts(statistics.get("plant_counts", {}))}

Contractor Summary:
{_format_counts(statistics.get("contractor_counts", {}))}

Defect Summary:
{_format_counts(statistics.get("defect_counts", {}))}

Top Contractor:
{_format_leader(statistics.get("top_contractor"))}

Top Defect:
{_format_leader(statistics.get("top_defect"))}

Prepare the report in the following format:

EXECUTIVE SUMMARY

KEY OBSERVATIONS

ROOT CAUSE ANALYSIS

RECOMMENDATIONS

MANAGEMENT ACTION ITEMS

Important Rules:

Do not use markdown.

Do not use **

Do not use #

Return plain text only.

Keep headings in CAPITAL LETTERS.

Maximum 200 words."""


# =========================================================
# FALLBACK (used whenever the AI call can't be completed)
# =========================================================

def _fallback_recommendation(statistics: dict) -> str:
    """A deterministic, templated summary so a flaky AI provider never blocks
    the weekly report from generating. Not a replacement for AI insight —
    just enough substance to keep the report useful."""
    total = statistics.get("total_reworks", 0)
    top_contractor = _format_leader(statistics.get("top_contractor"))
    top_defect = _format_leader(statistics.get("top_defect"))
    trend = _format_trend(statistics)

    return (
        "EXECUTIVE SUMMARY\n"
        f"{total} rework instances were logged in the last 7 days. {trend}\n\n"
        "KEY OBSERVATIONS\n"
        f"Leading contractor by rework volume: {top_contractor}. "
        f"Leading defect type: {top_defect}.\n\n"
        "ROOT CAUSE ANALYSIS\n"
        "Automated analysis was unavailable for this report. Recommend manual "
        "review of the plant, contractor, and defect breakdown tables above.\n\n"
        "RECOMMENDATIONS\n"
        "Review the top contractor and defect type against recent WPS/PQR "
        "compliance and NDT rejection records.\n\n"
        "MANAGEMENT ACTION ITEMS\n"
        "Confirm AI insight service availability before next reporting cycle."
    )


# =========================================================
# MAIN ENTRY POINT
# =========================================================

def generate_ai_recommendation(statistics: dict, model: str = DEFAULT_MODEL,
                                timeout: int = REQUEST_TIMEOUT) -> str:
    """Calls the LLM for a QA-manager-style weekly summary.

    Never raises: on any config, network, or malformed-response failure,
    logs the problem and returns a deterministic fallback summary instead,
    so a single flaky API call can't block the weekly report from generating.
    """
    api_key = current_app.config.get("OPENROUTER_API_KEY")
    if not api_key:
        logger.error("OPENROUTER_API_KEY is not configured; using fallback recommendation.")
        return _fallback_recommendation(statistics)

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": model,
        "messages": [{"role": "user", "content": _build_prompt(statistics)}],
    }

    try:
        response = requests.post(
            OPENROUTER_URL,
            headers=headers,
            json=payload,
            timeout=timeout,
        )
        response.raise_for_status()
        result = response.json()

    except requests.exceptions.Timeout:
        logger.error("AI recommendation request timed out after %ss.", timeout)
        return _fallback_recommendation(statistics)

    except requests.exceptions.HTTPError as exc:
        logger.error("AI recommendation request failed (HTTP %s): %s",
                     getattr(exc.response, "status_code", "?"), exc)
        return _fallback_recommendation(statistics)

    except requests.exceptions.RequestException as exc:
        logger.error("AI recommendation request failed: %s", exc)
        return _fallback_recommendation(statistics)

    except ValueError as exc:  # response.json() failed to parse
        logger.error("AI recommendation returned invalid JSON: %s", exc)
        return _fallback_recommendation(statistics)

    if "error" in result:
        logger.error("AI provider returned an error payload: %s", result["error"])
        return _fallback_recommendation(statistics)

    choices = result.get("choices") or []
    if not choices or "message" not in choices[0] or not choices[0]["message"].get("content"):
        logger.error("AI recommendation response missing expected content: %s", result)
        return _fallback_recommendation(statistics)

    return choices[0]["message"]["content"].strip()


# =========================================================
# MANUAL TEST (no live API calls — exercises formatting + failure paths)
# =========================================================

if __name__ == "__main__":
    from unittest.mock import patch, MagicMock

    dummy_statistics = {
        "total_reworks": 47,
        "previous_week_total": 61,
        "trend_pct": -23.0,
        "plant_counts": {"SMS-II": 19, "SSD Bay-1": 14, "SSD Bay-2": 9, "Rolling Mill": 5},
        "contractor_counts": {"Corimpex Welding Co.": 15, "Shree Fabricators": 11},
        "defect_counts": {"Porosity": 16, "Undercut": 10},
        "top_contractor": {"name": "Corimpex Welding Co.", "count": 15, "share_pct": 31.9},
        "top_defect": {"name": "Porosity", "count": 16, "share_pct": 34.0},
    }

    print("--- Prompt preview ---")
    print(_build_prompt(dummy_statistics))

    print("\n--- Fallback (simulated network failure) ---")

    class FakeApp:
        config = {"OPENROUTER_API_KEY": "test-key"}

    with patch("__main__.current_app", FakeApp()):
        with patch("__main__.requests.post", side_effect=requests.exceptions.ConnectionError("boom")):
            print(generate_ai_recommendation(dummy_statistics))

    print("\n--- Success path (mocked response) ---")
    fake_response = MagicMock()
    fake_response.json.return_value = {
        "choices": [{"message": {"content": "EXECUTIVE SUMMARY\nAll good.\n"}}]
    }
    fake_response.raise_for_status.return_value = None

    with patch("__main__.current_app", FakeApp()):
        with patch("__main__.requests.post", return_value=fake_response):
            print(generate_ai_recommendation(dummy_statistics))

    print("\n--- Missing API key ---")

    class FakeAppNoKey:
        config = {}

    with patch("__main__.current_app", FakeAppNoKey()):
        print(generate_ai_recommendation(dummy_statistics))