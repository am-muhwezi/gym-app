from django.urls import path
from . import views

urlpatterns = [
    path('', views.HelloPaymentView.as_view(), name='hello-payments'),
]