FROM node:20-bookworm-slim AS frontend-builder

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
ARG REACT_APP_API_URL=
RUN printf "NODE_ENV=production\nREACT_APP_API_URL=%s\n" "$REACT_APP_API_URL" > .env \
    && npm run build


FROM python:3.11-slim-bookworm AS web

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    TMP_DIR=/app/tmp \
    POSTGRES_HOST=db \
    POSTGRES_PORT=5432

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        build-essential \
        gcc \
        g++ \
        ghostscript \
        libffi-dev \
        libjpeg-dev \
        libpq-dev \
        libxml2-dev \
        libxslt1-dev \
        poppler-utils \
        qpdf \
        tesseract-ocr \
        zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
RUN python -m pip install --upgrade pip \
    && pip install -r requirements.txt

COPY . ./
COPY --from=frontend-builder /app/frontend/static ./frontend/static
COPY --from=frontend-builder /app/frontend/webpack-stats.json ./frontend/webpack-stats.json

RUN mkdir -p /app/logs /app/media /app/static /app/tmp

EXPOSE 8000

ENTRYPOINT ["/app/scripts/docker-entrypoint.sh"]
CMD ["sh", "-c", "gunicorn lawcrawl.wsgi:application --bind 0.0.0.0:${PORT:-8000} --workers ${WEB_CONCURRENCY:-3} --timeout ${GUNICORN_TIMEOUT:-120}"]
