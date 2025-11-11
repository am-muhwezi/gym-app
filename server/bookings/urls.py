from django.urls import path
from . import views

urlpatterns = [
    path('', views.HelloBookingView.as_view(), name='hello-bookings'),
]