# ── base stage ──────────────────────────────────────────────────────────────
FROM python:3.12-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    python3-cffi \
    libcairo2 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libgdk-pixbuf2.0-0 \
    libffi-dev \
    shared-mime-info \
    fonts-vazir \
    && rm -rf /var/lib/apt/lists/*

RUN addgroup --system django && adduser --system --ingroup django django

# ── deps stage ──────────────────────────────────────────────────────────────
FROM base AS deps

COPY requirements/ requirements/
RUN pip install --no-cache-dir -r requirements/base.txt

# ── dev stage ───────────────────────────────────────────────────────────────
FROM deps AS dev

RUN pip install --no-cache-dir -r requirements/dev.txt

COPY --chown=django:django . .
USER django

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

# ── prod stage ──────────────────────────────────────────────────────────────
FROM deps AS prod

RUN pip install --no-cache-dir -r requirements/prod.txt

COPY --chown=django:django . .
USER django

CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "4"]