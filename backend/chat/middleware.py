from urllib.parse import parse_qs
from django.contrib.auth.models import AnonymousUser
from channels.db import database_sync_to_async
from rest_framework_simplejwt.authentication import JWTAuthentication


@database_sync_to_async
def get_user_from_token(token):
    jwt_auth = JWTAuthentication()
    validated = jwt_auth.get_validated_token(token)
    return jwt_auth.get_user(validated)


class JwtAuthMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        """
        Handles the processing of JWT token from query string or headers, associates the user with the
        scope and forwards the request to the next ASGI application in the chain.

        :param scope: The ASGI scope dictionary.
        :param receive: An awaitable callable that receives event messages.
        :param send: An awaitable callable that sends event messages.
        :return: A coroutine that handles forwarding the modified scope and other arguments to the
                 next ASGI application.
        """
        query = parse_qs(scope.get("query_string", b"").decode())
        token = query.get("token")

        if not token:
            # Try to take token from headers
            headers = dict(scope.get("headers", []))
            auth_header = headers.get(b"authorization", b"").decode()
            if auth_header.startswith("Bearer "):
                token = [auth_header[7:]]

        if token:
            try:
                user = await get_user_from_token(token[0])
                print("JWT user →", user, user.id)  # ← додаємо
                scope["user"] = user
            except Exception as e:
                print("JWT error →", str(e))  # ← дуже важливо!
                scope["user"] = AnonymousUser()
        else:
            print("No token in query string!")
            scope["user"] = AnonymousUser()

        return await self.app(scope, receive, send)
