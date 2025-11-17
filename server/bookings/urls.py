from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'bookings', views.BookingViewSet, basename='booking')
router.register(r'schedules', views.ScheduleViewSet, basename='schedule')
router.register(r'recurring-bookings', views.RecurringBookingViewSet, basename='recurring-booking')

urlpatterns = [
    path('', include(router.urls)),
]