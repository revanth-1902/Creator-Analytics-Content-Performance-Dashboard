# FastAPI Backend Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Prevent Python from writing pyc files and buffer outputs
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies for psycopg2 and build tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install python packages
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code into /app/backend
COPY . /app/backend

EXPOSE 8000

# Set PYTHONPATH to /app so `backend.app` imports resolve properly
ENV PYTHONPATH=/app

# Run FastAPI app with Uvicorn server (dynamic PORT for Render)
CMD ["sh", "-c", "uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
