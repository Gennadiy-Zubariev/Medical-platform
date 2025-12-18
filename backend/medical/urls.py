from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MedicalCardViewSet, MedicalRecordViewSet

router = DefaultRouter()
router.register("medical-cards", MedicalCardViewSet, basename="medical-cards")
router.register("medical-records", MedicalRecordViewSet, basename="medical-records")


urlpatterns = [
    path('', include(router.urls)),
]