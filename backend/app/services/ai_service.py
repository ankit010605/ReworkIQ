import os
import json
import requests
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("OPENROUTER_API_KEY")

MODEL =  "openrouter/free"


def generate_ai_report(stats):

    prompt = f"""
You are a Senior QA/QC Engineer in a Structural Steel Fabrication Plant.

Analyze the following rework analytics.

{json.dumps(stats, indent=2)}

Generate ONLY JSON.

Format:

{{
"executive_summary":[
"...",
"...",
"..."
],

"observations":[
"...",
"...",
"..."
],

"recommendations":[
"...",
"...",
"..."
]
}}

Rules:

- Maximum 3 points in each section.
- Professional industrial language.
- Mention contractors/plants if necessary.
- No markdown.
- JSON only.
"""

    response = requests.post(

        "https://openrouter.ai/api/v1/chat/completions",

        headers={

            "Authorization": f"Bearer {API_KEY}",

            "Content-Type": "application/json",

        },

        json={

            "model": MODEL,

            "messages": [

                {
                    "role": "user",
                    "content": prompt
                }

            ]

        }

    )

    data = response.json()

    if "choices" not in data:
       print("OpenRouter Error:")
       print(data)
       return {
        "executive_summary": ["AI generation failed."],
        "observations": [],
        "recommendations": []
    }

    text = data["choices"][0]["message"]["content"]
    
    print("============== AI RESPONSE ==============")
    print(text)
    print("=========================================")
    try:
     cleaned = text.strip()

     if cleaned.startswith("```json"):
        cleaned = cleaned.replace("```json", "", 1)

     if cleaned.startswith("```"):
        cleaned = cleaned.replace("```", "", 1)

     if cleaned.endswith("```"):
        cleaned = cleaned[:-3]

     cleaned = cleaned.strip()

     return json.loads(cleaned)

    except Exception as e:

     print("========== AI RAW RESPONSE ==========")
     print(text)
     print("=====================================")
     print(e)

     return {
        "executive_summary": [
            "AI report could not be generated."
        ],
        "observations": [
            "OpenRouter returned an invalid JSON response."
        ],
        "recommendations": [
            "Verify the AI model and API response format."
        ]
    }