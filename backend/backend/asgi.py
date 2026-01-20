"""
ASGI config for backend project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/asgi/
"""

import os

import django
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application

# Налаштування Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

# Імпортуємо після django.setup(), щоб уникнути проблем з налаштуваннями
from channels.auth import AuthMiddlewareStack
from chat.middleware import JwtAuthMiddleware  # ← ваш кастомний middleware
from chat.routing import websocket_urlpatterns  # ← ваші websocket-шляхи

# Основний ASGI-роутер
application = ProtocolTypeRouter({
    # Звичайні HTTP-запити обробляє Django
    "http": get_asgi_application(),

    # WebSocket-запити обробляються через наш стек middleware
    "websocket": JwtAuthMiddleware(
        URLRouter(
            websocket_urlpatterns
        )
    ),
})
