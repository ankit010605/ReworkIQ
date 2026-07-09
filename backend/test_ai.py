from app.services.ai_service import generate_ai_report

sample = {

    "total_reworks":28,

    "top_contractor":{
        "name":"Aanjana",
        "count":10
    },

    "top_plant":{
        "name":"Plant 1",
        "count":13
    },

    "top_defect":{
        "code":"Fit-up Issue",
        "count":9
    }

}

print(generate_ai_report(sample))