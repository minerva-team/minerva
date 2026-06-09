"""Development settings."""

from .base import *  # noqa: F401,F403
from .base import BASE_DIR, INSTALLED_APPS, MIDDLEWARE, env_bool  # noqa: F401

DEBUG = True
ALLOWED_HOSTS = ["localhost", "127.0.0.1", "0.0.0.0"]

# Use sqlite locally unless USE_POSTGRES=1 is set.
if not env_bool("USE_POSTGRES", False):
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }

# django-debug-toolbar
INSTALLED_APPS = INSTALLED_APPS + ["debug_toolbar"]
MIDDLEWARE = ["debug_toolbar.middleware.DebugToolbarMiddleware"] + MIDDLEWARE
INTERNAL_IPS = ["127.0.0.1"]

# Schema UI is exposed only in dev.
SPECTACULAR_SERVE_UI = True
