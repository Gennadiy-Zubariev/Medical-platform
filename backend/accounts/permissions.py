from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsDoctor(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        return user.is_doctor()


class IsPatient(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        return user.is_patient()


class IsOwnerOrReadOnly(BasePermission):
    """
        - SAFE_METHODS (GET/HEAD/OPTIONS) for all.
        - Changes (PUT/PATCH/DELETE) require a match obj.user == request.user.
    """

    def has_object_permission(self, request, view, obj):
        if request.method is SAFE_METHODS:
            return True

        if hasattr(obj, 'user'):
            return obj.user == request.user

        return False


class IsOwnerProfile(BasePermission):
    """
        - SAFE_METHODS (GET/HEAD/OPTIONS) for all.
        - Changes (PUT/PATCH/DELETE) require a match obj.user == request.user.
    """
    def has_object_permission(self, request, view, obj):
        return obj.user == request.user
