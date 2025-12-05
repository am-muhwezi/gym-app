from django.urls import path
from . import views

urlpatterns = [
    path('', views.HelloAuthView.as_view(), name='hello-auth'),
    path('signup/', views.SignupView.as_view(), name='signup'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('me/', views.MeView.as_view(), name='me'),
    path('password-reset/request/', views.PasswordResetRequestView.as_view(), name='password-reset-request'),
    path('password-reset/confirm/', views.PasswordResetConfirmView.as_view(), name='password-reset-confirm'),

    # Admin Trainer Management
    path('admin/trainers/', views.TrainerListView.as_view(), name='admin-trainer-list'),
    path('admin/trainers/create/', views.TrainerCreateView.as_view(), name='admin-trainer-create'),
    path('admin/trainers/<int:pk>/', views.TrainerDetailView.as_view(), name='admin-trainer-detail'),
    path('admin/trainers/<int:pk>/update/', views.TrainerUpdateView.as_view(), name='admin-trainer-update'),
    path('admin/trainers/<int:pk>/delete/', views.TrainerDeleteView.as_view(), name='admin-trainer-delete'),
    path('admin/trainers/<int:pk>/toggle-active/', views.TrainerToggleActiveView.as_view(), name='admin-trainer-toggle-active'),
    path('admin/trainers/<int:pk>/reset-password/', views.TrainerResetPasswordView.as_view(), name='admin-trainer-reset-password'),

    # Admin Platform Analytics
    path('admin/analytics/', views.AdminAnalyticsView.as_view(), name='admin-analytics'),

    # Terms and Conditions
    path('terms/', views.TermsPageView.as_view(), name='terms-page'),
    path('terms/accept/', views.TermsAcceptanceView.as_view(), name='terms-accept'),
    path('terms/status/', views.TermsAcceptanceStatusView.as_view(), name='terms-status'),
]