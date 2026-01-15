import os

from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application

from backend.middleware import JwtAuthMiddlewareStack
from chat import routing as chat_routing

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")

application = ProtocolTypeRouter(
    {
        "http": get_asgi_application(),
        "websocket": JwtAuthMiddlewareStack(
            URLRouter(chat_routing.websocket_urlpatterns)
        ),
    }
)
