from django.urls import path, include
from rest_framework.routers import DefaultRouter
from backend.medical.views import MedicalCardViewSet, MedicalRecordViewSet

router = DefaultRouter()
router.register(r'cards', MedicalCardViewSet)
router.register(r'records', MedicalRecordViewSet)

urlpatterns = [
    path('', include(router.urls))
]