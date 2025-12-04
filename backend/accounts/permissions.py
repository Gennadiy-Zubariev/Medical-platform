from rest_framework import permissions
from abc import ABC, abstractmethod  # Для абстрактного методу (опціонально, для чіткості)


class AuthenticatedUserPermission(permissions.BasePermission, ABC):
    """
    Базовий клас для дозволів, що вимагають аутентифікації.
    Спадкуйте та реалізуйте has_profile_permission для специфічної логіки.
    """

    @abstractmethod
    def has_profile_permission(self, user):
        """Абстрактний метод для перевірки профілю користувача."""
        pass

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            self.message = 'Доступ дозволено тільки авторизованим користувачам.'
            return False
        return self.has_profile_permission(request.user)


class IsDoctor(AuthenticatedUserPermission):
    """Дозволити доступ, якщо користувач авторизований та має DoctorProfile."""

    message = 'Доступ дозволено тільки лікарям.'

    def has_profile_permission(self, user):
        return user.is_doctor


class IsPatient(AuthenticatedUserPermission):
    """Дозволити доступ, якщо користувач авторизований та має PatientProfile."""

    message = 'Доступ дозволено тільки пацієнтам.'

    def has_profile_permission(self, user):
        return user.is_patient


class IsDoctorOrPatient(AuthenticatedUserPermission):
    """Дозволити доступ, якщо користувач має будь-який профіль (лікар або пацієнт)."""

    message = 'Доступ дозволено тільки зареєстрованим користувачам з профілем.'

    def has_profile_permission(self, user):
        return user.is_doctor or user.is_patient