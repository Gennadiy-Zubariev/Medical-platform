# Medical Platform

Веб-платформа для запису пацієнтів до лікарів: реєстрація з перевіркою за офіційними реєстрами (ліцензія лікаря / страховий поліс пацієнта), запис на прийом, медичні картки, чат між лікарем і пацієнтом у реальному часі.

## Стек технологій

**Backend:** Django 5 / Django REST Framework, JWT-авторизація (SimpleJWT), Channels (WebSocket-чат) на Redis, Celery, PostgreSQL, MinIO (S3-сумісне сховище файлів).

**Frontend:** React 19 + Vite, React Router, MUI (Material UI), Axios.

**Інфраструктура:** Docker Compose, Nginx (reverse proxy + TLS + Basic Auth для адмінки), Gunicorn/Uvicorn (ASGI).

## Структура проєкту

```
backend/            Django-проєкт (API)
  accounts/          користувачі, профілі лікарів/пацієнтів, реєстрація
  appointments/       записи на прийом
  medical/            медичні картки та записи
  registry/           офіційні реєстри ліцензій лікарів і страхових полісів
  chat/                WebSocket-чат лікар↔пацієнт
frontend/            React SPA (Vite)
nginx/               конфіг nginx, TLS-сертифікат, .htpasswd для /admin/
docker-compose.yml   опис усіх сервісів
.env                 змінні оточення для docker compose
```

## Передумови

- Docker + Docker Compose
- Node.js 20+ та npm (для фронтенда в dev-режимі)

## Запуск бекенду (Docker)

Backend, база даних, Redis, MinIO та Nginx піднімаються через Docker Compose.

1. Створити зовнішні Docker-volume (один раз, якщо їх ще немає):

   ```bash
   docker volume create medical_platform_postgres_data
   docker volume create medical_platform_static_data
   docker volume create medical_platform_minio_data
   ```

2. Перевірити `.env` у корені проєкту (за потреби скоригувати значення) — там задаються `SECRET_KEY`, дані Postgres, MinIO тощо.

3. Підняти всі сервіси:

   ```bash
   docker compose up -d --build
   ```

   При старті контейнера `web` автоматично застосовуються Django-міграції та збирається статика (`entrypoint.sh`).

4. Перевірити, що все піднялось:

   ```bash
   docker compose ps
   ```

   Мають бути `up`: `web`, `project_db`, `redis`, `minio`, `minio_init`, `nginx`.

Бекенд стає доступний **через Nginx**: `https://localhost/` (сертифікат самопідписаний — браузер попередить про це, потрібно підтвердити виняток "Перейти на localhost").

- API: `https://localhost/api/...`
- Django admin: `https://localhost/admin/` — перед формою логіну Django стоїть ще Basic Auth від nginx (`nginx/.htpasswd`)
- WebSocket-чат: `wss://localhost/ws/...`
- MinIO (файли): `https://localhost/minio/...`

Сирий бекенд-контейнер (`web`, порт 8000) назовні не проброшений — доступ лише через nginx.

### Створення суперюзера

```bash
docker compose exec web python manage.py createsuperuser
```

### Наповнення бази демоданими

Для локальної розробки та скріншотів є management-команда, яка створює офіційні реєстри ліцензій/страхових полісів, демо-лікарів, демо-пацієнтів, записи на прийом і медичні картки:

```bash
docker compose exec web python manage.py seed_demo
```

Опційно можна вказати кількість:

```bash
docker compose exec web python manage.py seed_demo --doctors 10 --patients 20 --registry-size 500
```

Команда ідемпотентна — її можна безпечно запускати повторно.

Створені демо-акаунти:
- Лікарі: `doctor1` … `doctorN`
- Пацієнти: `patient1` … `patientN`
- Пароль для всіх демо-акаунтів: `Demo12345!`

### Корисні команди

```bash
docker compose logs -f web        # логи бекенду
docker compose exec web python manage.py <команда>   # будь-яка Django-команда
docker compose down                # зупинити всі сервіси (дані у volume зберігаються)
```

## Запуск фронтенду (dev-режим)

Фронтенд запускається окремо через Vite dev server, який проксує запити `/api`, `/ws`, `/static` на nginx (`https://localhost`, див. `frontend/vite.config.js`) — тобто бекенд (крок вище) має бути піднятий.

```bash
cd frontend
npm install
npm run dev
```

Відкрити `http://localhost:5173`.

### Продакшн-збірка фронтенду

У продакшн-режимі фронтенд не запускається окремо — він збирається у статичні файли й обслуговується самим nginx (див. `nginx/Dockerfile`, багатоступеневий білд `node:20-alpine` → `nginx:alpine`). Це відбувається автоматично під час `docker compose up --build` (сервіс `nginx`).

## Типовий сценарій першого запуску

```bash
# 1. Створити зовнішні volume
docker volume create medical_platform_postgres_data
docker volume create medical_platform_static_data
docker volume create medical_platform_minio_data

# 2. Підняти бекенд-стек
docker compose up -d --build

# 3. Створити адміністратора
docker compose exec web python manage.py createsuperuser

# 4. Наповнити базу демоданими
docker compose exec web python manage.py seed_demo

# 5. Запустити фронтенд
cd frontend && npm install && npm run dev
```

## Примітки

- Реєстрація лікаря/пацієнта на сайті вимагає, щоб вказаний номер ліцензії (`LIC-XXXXXX`) чи страхового поліса (`INS-XXXXXX`) вже існував в офіційному реєстрі (`registry` app) — саме тому демо-дані містять 1000 попередньо створених записів реєстру.
- Образи MinIO тягнуться з `quay.io/minio/minio` та `quay.io/minio/mc` (публічні образи на Docker Hub більше недоступні).
