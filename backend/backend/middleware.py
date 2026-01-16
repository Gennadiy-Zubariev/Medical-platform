from urllib.parse import parse_qs

from channels.auth import AuthMiddlewareStack
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from django.db import close_old_connections
from rest_framework_simplejwt.authentication import JWTAuthentication


User = get_user_model()


class JwtAuthMiddleware:
    """
    Custom middleware that authenticates WebSocket connections using JWT.
    """

    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        close_old_connections()
        query_params = parse_qs(scope.get("query_string", b"").decode())
        token = query_params.get("token", [None])[0]
        scope["user"] = await self.get_user(token)
        return await self.inner(scope, receive, send)

    @staticmethod
    async def get_user(token):
        if not token:
            return AnonymousUser()
        jwt_auth = JWTAuthentication()
        try:
            validated = jwt_auth.get_validated_token(token)
            return jwt_auth.get_user(validated)
        except Exception:
            return AnonymousUser()


def JwtAuthMiddlewareStack(inner):
    return JwtAuthMiddleware(AuthMiddlewareStack(inner))