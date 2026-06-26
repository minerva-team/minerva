"""
Base settings shared across all environments.
Environment-specific values are loaded from the environment (.env in dev).
"""

import os
from pathlib import Path
from datetime import timedelta
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
    "jazzmin",
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
    "corsheaders",
    'django_filters',
]

LOCAL_APPS = [
    "accounts", 
    "hr",
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
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
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'], 
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
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

STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'static'),
]

# ==========================================
# CORS Settings
# ==========================================
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

# --- DRF / Spectacular ------------------------------------------------------


REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'AUTH_HEADER_TYPES': ('Bearer',),
}

SPECTACULAR_SETTINGS = {
    "TITLE": "Minerva API",
    "DESCRIPTION": "API documentation for Minerva Integrated Enterprise System",
    "VERSION": "0.1.0",
    "SERVE_INCLUDE_SCHEMA": False,
}

JAZZMIN_SETTINGS = {
    "site_title": "Minerva Admin",
    "site_header": "Minerva System",
    "site_brand": "Minerva",
    "site_logo": "img/logo.png",  
    "site_logo_classes": "img-circle",
    "site_icon": "img/logo.png",
    "welcome_sign": "System Administration Panel",
    "copyright": "Minerva © 2026",
    "search_model": ["accounts.User"],
    "show_ui_builder": False,
    
    "topmenu_links": [
        {"name": "Home", "url": "admin:index", "permissions": ["auth.view_user"]},
        {"name": "View Site", "url": "/", "new_window": True},
        {"name": "Support", "url": "/support/", "new_window": True},
    ],
    
    "usermenu_links": [
        {"model": "auth.user"}
    ],
    
    "icons": {
        "accounts.user": "fas fa-users",
        "accounts.otpverification": "fas fa-key",
        "auth.Group": "fas fa-users-cog",
        "hr.employee": "fas fa-id-badge",
    },
    
    "default_icon_parents": "fas fa-chevron-circle-right",
    "default_icon_children": "fas fa-circle",
    
    "related_modal_active": False,
    "custom_css": "css/custom_jazzmin.css",
    "custom_js": None,
    "use_google_fonts_cdn": True,
    "show_sidebar": True,
    "navigation_expanded": True,
    "hide_apps": [],
    "hide_models": [],
    "order_with_respect_to": ["accounts", "hr"],
    
    "changeform_format": "horizontal_tabs",
    "changeform_format_overrides": {
        "auth.user": "collapsible",
        "auth.group": "vertical_tabs",
    },
}

JAZZMIN_UI_TWEAKS = {
    "navbar_small_text": False,
    "footer_small_text": False,
    "body_small_text": False,
    "brand_small_text": False,
    "brand_colour": "#512988",
    "accent": "accent-purple",
    "navbar": "#512988",
    "no_navbar_border": False,
    "navbar_fixed": True,
    "layout_boxed": False,
    "footer_fixed": False,
    "sidebar_fixed": True,
    "sidebar": "sidebar-dark-purple",
    "sidebar_nav_small_text": False,
    "sidebar_disable_expand": False,
    "sidebar_nav_child_indent": False,
    "sidebar_nav_compact_style": False,
    "sidebar_nav_legacy_style": False,
    "sidebar_nav_flat_style": False,
    "theme": "darkly",
    "dark_mode_theme": "darkly",
    "button_classes": {
        "primary": "btn-primary",
        "secondary": "btn-secondary",
        "info": "btn-info",
        "warning": "btn-warning",
        "danger": "btn-danger",
        "success": "btn-success"
    },
}
