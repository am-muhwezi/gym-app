from django.urls import path
from . import views
urlpatterns = [
    path('', views.HelloAnalyticsView.as_view(), name='hello-analytics'),
]