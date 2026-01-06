#!/bin/sh
set -e
echo '⏳ Очікуємо PostgreSQL...';
until nc -z $POSTGRES_HOST $POSTGRES_PORT; do
echo 'Postgres ще не готовий...';
  sleep 1;
done;
echo '✅ PostgreSQL доступний!';

python manage.py migrate --noinput
python manage.py collectstatic --noinput

exec "$@"