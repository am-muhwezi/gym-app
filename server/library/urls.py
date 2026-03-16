from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'exercises', views.ExerciseLibraryViewSet, basename='exercise')
router.register(r'workouts', views.WorkoutTemplateViewSet, basename='workout')
router.register(r'programs', views.ProgramViewSet, basename='program')
router.register(r'client-workout-assignments', views.ClientWorkoutAssignmentViewSet, basename='client-workout-assignment')
router.register(r'client-program-assignments', views.ClientProgramAssignmentViewSet, basename='client-program-assignment')

urlpatterns = [
    path('', include(router.urls)),
]
