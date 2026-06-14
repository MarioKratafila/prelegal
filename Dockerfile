# Stage 1: Build Next.js static export
FROM node:20-slim AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install --ignore-scripts
COPY frontend/ ./
RUN npm run build

# Stage 2: Run FastAPI backend
FROM python:3.12-slim
WORKDIR /app

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /usr/local/bin/

# Copy backend
COPY backend/ ./backend/

# Copy built frontend static files
COPY --from=frontend-builder /app/frontend/out ./frontend/out

# Copy templates
COPY templates/ ./templates/

# Copy .env if present (won't fail if missing)
COPY .env* ./

# Install backend dependencies
WORKDIR /app/backend
RUN uv sync --no-dev

EXPOSE 8000
CMD ["uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
