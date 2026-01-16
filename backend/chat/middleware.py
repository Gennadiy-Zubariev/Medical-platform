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
        query = parse_qs(scope.get("query_string", b"").decode())
        token = query.get("token")

        if not token:
            # Спробуємо дістати з headers
            headers = dict(scope.get("headers", []))
            auth_header = headers.get(b"authorization", b"").decode()
            if auth_header.startswith("Bearer "):
                token = [auth_header[7:]]

        if token:
            try:
                user = await get_user_from_token(token[0])
                print("JWT user →", user, user.id)          # ← додаємо
                scope["user"] = user
            except Exception as e:
                print("JWT error →", str(e))                 # ← дуже важливо!
                scope["user"] = AnonymousUser()
        else:
            print("No token in query string!")
            scope["user"] = AnonymousUser()

        return await self.app(scope, receive, send)