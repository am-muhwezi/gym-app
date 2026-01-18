from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create router and register viewsets
router = DefaultRouter()
router.register(r'', views.PaymentViewSet, basename='payment')

urlpatterns = [
    path('mpesa-callback/', views.mpesa_callback, name='mpesa-callback'),
    path('', include(router.urls)),
]