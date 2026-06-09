"""
Base settings shared across all environments.
Environment-specific values are loaded from the environment (.env in dev).
"""

import os
from pathlib import Path

from dotenv import load_dotenv

# config/settings/base.py -> parents[2] == backend/
BASE_DIR = Path(__file__).resolve().parents[2]

# Load .env from the backend root if present (no-op in prod containers
# where env vars are injected directly).
load_dotenv(BASE_DIR / ".env")


def env(key: str, default=None, required: bool = False):
    """Small helper to read environment variables."""
    value = os.environ.get(key, default)
    if required and value is None:
        raise RuntimeError(f"Missing required environment variable: {key}")
    return value


def env_bool(key: str, default: bool = False) -> bool:
    return env(key, str(default)).lower() in ("1", "true", "yes", "on")


def env_list(key: str, default: str = "") -> list[str]:
    raw = env(key, default)
    return [item.strip() for item in raw.split(",") if item.strip()]


# --- Core -------------------------------------------------------------------

SECRET_KEY = env("DJANGO_SECRET_KEY", required=True)
DEBUG = False  # overridden per-environment
ALLOWED_HOSTS = env_list("DJANGO_ALLOWED_HOSTS")


# --- Applications -----------------------------------------------------------

DJANGO_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

]

THIRD_PARTY_APPS = [
    "rest_framework",
    "drf_spectacular",
]

LOCAL_APPS = [
    "accounts", 
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"


AUTH_USER_MODEL = "accounts.User"

# --- Database ---------------------------------------------------------------
# Default to Postgres; dev.py may override to sqlite for quick local runs.

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": env("POSTGRES_DB", "minerva"),
        "USER": env("POSTGRES_USER", "minerva"),
        "PASSWORD": env("POSTGRES_PASSWORD", ""),
        "HOST": env("POSTGRES_HOST", "localhost"),
        "PORT": env("POSTGRES_PORT", "5432"),
    }
}


# --- Password validation ----------------------------------------------------

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]


# --- I18N -------------------------------------------------------------------

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True


# --- Static -----------------------------------------------------------------

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"


# --- DRF / Spectacular ------------------------------------------------------

REST_FRAMEWORK = {
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
}

SPECTACULAR_SETTINGS = {
    "TITLE": "Minerva API",
    "DESCRIPTION": "HR & Finance ERP",
    "VERSION": "0.1.0",
    "SERVE_INCLUDE_SCHEMA": False,
}
