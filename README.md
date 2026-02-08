# Medical Platform (Django + React)

A full-stack medical platform where **patients** and **doctors** can authenticate via **JWT**, manage appointments, maintain medical records, and communicate in real time via **WebSockets**.

## Key Features
- **JWT authentication** (access/refresh tokens)
- **Accounts** module (custom user model)
- **Appointments** (booking & management)
- **Medical records** (storage & management)
- **Registry** module
- **Chat** with **WebSockets** (Django Channels + Redis)
- **S3-compatible media storage** via **MinIO**
- **Nginx reverse proxy**:
  - `/api/` → Django API
  - `/ws/` → WebSockets
  - `/` → React SPA
  - `/admin/` protected with **basic auth**
  - HTTP → HTTPS redirect

## Tech Stack
- Backend: **Django**, **Django REST Framework**, **SimpleJWT**, **Channels**
- Frontend: **React** (served as SPA via Nginx)
- DB: **PostgreSQL**
- Cache/Broker: **Redis**
- Media: **MinIO** (S3-compatible) + `django-storages`
- Deployment: **Docker Compose** + **Nginx (SSL)**

## API Endpoints (high-level)
- `POST /api/token/` — obtain JWT tokens
- `POST /api/token/refresh/` — refresh access token
- `GET/POST /api/accounts/...`
- `GET/POST /api/medical/...`
- `GET/POST /api/...` (appointments)
- `GET/POST /api/registry/...`
- `WS /ws/...` (websocket connections)

## Project Services (Docker Compose)
- `web` — Django app
- `project_db` — PostgreSQL 16
- `redis` — Redis 7 (Channels / optional Celery broker)
- `minio` — object storage (S3-compatible)
- `minio_init` — auto-creates bucket + sets anonymous download policy
- `nginx` — reverse proxy + SSL termination

> Note: docker volumes are configured as `external: true` (you may need to create them manually).

## Quick Start (Docker)
1) Create `.env` in the project root (example):
```env
SECRET_KEY=change-me
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

POSTGRES_DB=medical_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

REDIS_URL=redis://redis:6379/0

MINIO_ENDPOINT=minio:9000
MINIO_ACCESS_KEY=minio
MINIO_SECRET_KEY=minio123
MINIO_BUCKET_NAME=medical-media
MINIO_USE_HTTPS=false
MINIO_REGION=us-east-1
MINIO_PUBLIC_URL=
MINIO_ROOT_USER=minio
MINIO_ROOT_PASSWORD=minio123
