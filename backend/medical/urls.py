from rest_framework.routers import DefaultRouter
from .views import MedicalCardViewSet, MedicalRecordViewSet

router = DefaultRouter()
router.register("cards", MedicalCardViewSet, basename="medical-cards")
router.register("records", MedicalRecordViewSet, basename="medical-records")

urlpatterns = router.urls