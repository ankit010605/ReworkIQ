import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")
    SQLALCHEMY_DATABASE_URI = os.getenv(
    "DATABASE_URL",
    "postgresql://neondb_owner:npg_6XtzVCg2AvHx@ep-spring-unit-ato6w6p5-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
)
    BREVO_API_KEY = os.getenv("BREVO_API_KEY")
    BREVO_SENDER_EMAIL = os.getenv("BREVO_SENDER_EMAIL")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")