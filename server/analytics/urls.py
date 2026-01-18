from django.urls import path
from . import views

urlpatterns = [
    path('dashboard/', views.dashboard_analytics, name='dashboard-analytics'),
    path('revenue-trends/', views.revenue_trends, name='revenue-trends'),
    path('client-retention/', views.client_retention, name='client-retention'),
    path('performance/', views.performance_metrics, name='performance-metrics'),
]
