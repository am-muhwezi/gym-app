from django.test import TestCase
from django.contrib.auth import get_user_model
from .models import ExerciseLibrary, WorkoutTemplate, Program

User = get_user_model()


class ExerciseLibraryTestCase(TestCase):
    """Tests for ExerciseLibrary model"""

    def setUp(self):
        self.user = User.objects.create_user(
            username='trainer@test.com',
            email='trainer@test.com',
            password='testpass123'
        )

    def test_create_global_exercise(self):
        """Test creating a global exercise"""
        exercise = ExerciseLibrary.objects.create(
            name='Test Exercise',
            is_global=True,
            modality='strength',
            category='strength',
            muscle_groups=['chest', 'triceps']
        )
        self.assertTrue(exercise.is_global)
        self.assertIsNone(exercise.trainer)

    def test_create_custom_exercise(self):
        """Test creating a trainer-specific exercise"""
        exercise = ExerciseLibrary.objects.create(
            trainer=self.user,
            name='Custom Exercise',
            is_global=False,
            modality='strength',
            category='bodyweight'
        )
        self.assertFalse(exercise.is_global)
        self.assertEqual(exercise.trainer, self.user)


# TODO: Add more tests for WorkoutTemplate, Program, etc.
