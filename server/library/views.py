from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from clients.models import Client

from .models import (
    ExerciseLibrary, WorkoutTemplate, WorkoutExercise,
    Program, ProgramWeek, ProgramDay,
    ClientWorkoutAssignment, ClientProgramAssignment
)
from .serializers import (
    ExerciseLibrarySerializer, ExerciseLibraryCreateSerializer,
    WorkoutTemplateSerializer, WorkoutTemplateCreateSerializer,
    WorkoutExerciseSerializer, WorkoutExerciseCreateSerializer,
    ProgramSerializer, ProgramCreateSerializer,
    ProgramWeekSerializer, ProgramDaySerializer,
    ClientWorkoutAssignmentSerializer, ClientWorkoutAssignmentCreateSerializer,
    ClientProgramAssignmentSerializer, ClientProgramAssignmentCreateSerializer
)


class ExerciseLibraryViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Exercise Library CRUD

    Endpoints:
    - GET    /api/library/exercises/       - List exercises (global + trainer's)
    - POST   /api/library/exercises/       - Create custom exercise
    - GET    /api/library/exercises/{id}/  - Get exercise details
    - PATCH  /api/library/exercises/{id}/  - Update exercise
    - DELETE /api/library/exercises/{id}/  - Delete exercise
    """

    permission_classes = [IsAuthenticated]
    serializer_class = ExerciseLibrarySerializer

    def get_queryset(self):
        """Get global exercises + trainer's custom exercises"""
        return ExerciseLibrary.objects.filter(
            Q(is_global=True) | Q(trainer=self.request.user)
        ).select_related('trainer')

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ExerciseLibraryCreateSerializer
        return ExerciseLibrarySerializer

    def list(self, request):
        """
        List exercises with filtering

        Query params:
        - modality: Filter by modality
        - muscle_group: Filter by muscle group
        - category: Filter by category
        - search: Search by name
        """
        exercises = self.get_queryset()

        # Filters
        modality = request.query_params.get('modality')
        if modality:
            exercises = exercises.filter(modality=modality)

        muscle_group = request.query_params.get('muscle_group')
        if muscle_group:
            exercises = exercises.filter(muscle_groups__contains=[muscle_group])

        category = request.query_params.get('category')
        if category:
            exercises = exercises.filter(category=category)

        search = request.query_params.get('search')
        if search:
            exercises = exercises.filter(
                Q(name__icontains=search) | Q(description__icontains=search)
            )

        # Pagination
        page = self.paginate_queryset(exercises)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(exercises, many=True)
        return Response(serializer.data)

    def create(self, request):
        """Create custom exercise for trainer"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        exercise = ExerciseLibrary.objects.create(
            trainer=request.user,
            is_global=False,
            **serializer.validated_data
        )

        return Response(
            ExerciseLibrarySerializer(exercise).data,
            status=status.HTTP_201_CREATED
        )

    def update(self, request, pk=None):
        """Update exercise (only trainer's custom exercises)"""
        try:
            exercise = ExerciseLibrary.objects.get(pk=pk, trainer=request.user)
        except ExerciseLibrary.DoesNotExist:
            return Response(
                {'error': 'Exercise not found or you do not have permission'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = self.get_serializer(exercise, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(ExerciseLibrarySerializer(exercise).data)

    def destroy(self, request, pk=None):
        """Delete exercise (only trainer's custom exercises)"""
        try:
            exercise = ExerciseLibrary.objects.get(pk=pk, trainer=request.user)
        except ExerciseLibrary.DoesNotExist:
            return Response(
                {'error': 'Exercise not found or you do not have permission'},
                status=status.HTTP_404_NOT_FOUND
            )

        exercise.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class WorkoutTemplateViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Workout Template CRUD

    Endpoints:
    - GET    /api/library/workouts/       - List workout templates
    - POST   /api/library/workouts/       - Create workout template
    - GET    /api/library/workouts/{id}/  - Get workout details
    - PATCH  /api/library/workouts/{id}/  - Update workout
    - DELETE /api/library/workouts/{id}/  - Delete workout
    - POST   /api/library/workouts/{id}/add_exercise/  - Add exercise to workout
    - DELETE /api/library/workouts/{id}/remove_exercise/{exercise_id}/  - Remove exercise
    """

    permission_classes = [IsAuthenticated]
    serializer_class = WorkoutTemplateSerializer

    def get_queryset(self):
        """Get trainer's workout templates"""
        return WorkoutTemplate.objects.filter(
            trainer=self.request.user
        ).prefetch_related('workout_exercises__exercise')

    def get_serializer_class(self):
        if self.action == 'create':
            return WorkoutTemplateCreateSerializer
        return WorkoutTemplateSerializer

    def create(self, request):
        """Create workout template"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        workout = serializer.save(trainer=request.user)

        return Response(
            WorkoutTemplateSerializer(workout).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['post'])
    def add_exercise(self, request, pk=None):
        """
        Add exercise to workout template

        POST /api/library/workouts/{id}/add_exercise/
        Body: {
            "exercise": 1,
            "order": 1,
            "sets": 3,
            "reps": 10,
            "rest_period_seconds": 90
        }
        """
        try:
            workout = self.get_queryset().get(pk=pk)
        except WorkoutTemplate.DoesNotExist:
            return Response(
                {'error': 'Workout not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = WorkoutExerciseCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        workout_exercise = WorkoutExercise.objects.create(
            workout_template=workout,
            **serializer.validated_data
        )

        return Response(
            WorkoutExerciseSerializer(workout_exercise).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['delete'], url_path='remove_exercise/(?P<exercise_id>[^/.]+)')
    def remove_exercise(self, request, pk=None, exercise_id=None):
        """Remove exercise from workout template"""
        try:
            workout = self.get_queryset().get(pk=pk)
            workout_exercise = workout.workout_exercises.get(id=exercise_id)
        except (WorkoutTemplate.DoesNotExist, WorkoutExercise.DoesNotExist):
            return Response(
                {'error': 'Workout or exercise not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        workout_exercise.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ProgramViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Program CRUD

    Endpoints:
    - GET    /api/library/programs/       - List programs
    - POST   /api/library/programs/       - Create program
    - GET    /api/library/programs/{id}/  - Get program details
    - PATCH  /api/library/programs/{id}/  - Update program
    - DELETE /api/library/programs/{id}/  - Delete program
    - POST   /api/library/programs/{id}/add_week/  - Add week to program
    - POST   /api/library/programs/{id}/weeks/{week_id}/add_day/  - Add day to week
    """

    permission_classes = [IsAuthenticated]
    serializer_class = ProgramSerializer

    def get_queryset(self):
        """Get trainer's programs"""
        return Program.objects.filter(
            trainer=self.request.user
        ).prefetch_related('weeks__days__workout_template')

    def get_serializer_class(self):
        if self.action == 'create':
            return ProgramCreateSerializer
        return ProgramSerializer

    def create(self, request):
        """Create program"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        program = serializer.save(trainer=request.user)

        return Response(
            ProgramSerializer(program).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['post'])
    def add_week(self, request, pk=None):
        """
        Add week to program

        POST /api/library/programs/{id}/add_week/
        Body: {
            "week_number": 1,
            "title": "Foundation Week",
            "description": "Focus on form"
        }
        """
        try:
            program = self.get_queryset().get(pk=pk)
        except Program.DoesNotExist:
            return Response(
                {'error': 'Program not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = ProgramWeekSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        week = ProgramWeek.objects.create(
            program=program,
            **serializer.validated_data
        )

        return Response(
            ProgramWeekSerializer(week).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['post'], url_path='weeks/(?P<week_id>[^/.]+)/add_day')
    def add_day(self, request, pk=None, week_id=None):
        """
        Add day to program week

        POST /api/library/programs/{id}/weeks/{week_id}/add_day/
        Body: {
            "day_number": 1,
            "day_of_week": "monday",
            "workout_template_id": 5,
            "title": "Upper Body",
            "is_rest_day": false
        }
        """
        try:
            program = self.get_queryset().get(pk=pk)
            week = program.weeks.get(id=week_id)
        except (Program.DoesNotExist, ProgramWeek.DoesNotExist):
            return Response(
                {'error': 'Program or week not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = ProgramDaySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        day = ProgramDay.objects.create(
            week=week,
            **serializer.validated_data
        )

        return Response(
            ProgramDaySerializer(day).data,
            status=status.HTTP_201_CREATED
        )


class ClientWorkoutAssignmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Client Workout Assignments

    Endpoints:
    - GET    /api/library/client-workout-assignments/       - List assignments
    - POST   /api/library/client-workout-assignments/       - Create assignment
    - PATCH  /api/library/client-workout-assignments/{id}/  - Update assignment
    - DELETE /api/library/client-workout-assignments/{id}/  - Delete assignment
    - POST   /api/library/client-workout-assignments/{id}/mark_complete/  - Mark complete
    """

    permission_classes = [IsAuthenticated]
    serializer_class = ClientWorkoutAssignmentSerializer

    def get_queryset(self):
        """Get trainer's client workout assignments"""
        return ClientWorkoutAssignment.objects.filter(
            trainer=self.request.user
        ).select_related('client', 'workout_template')

    def get_serializer_class(self):
        if self.action == 'create':
            return ClientWorkoutAssignmentCreateSerializer
        return ClientWorkoutAssignmentSerializer

    def list(self, request):
        """
        List assignments with filtering

        Query params:
        - client: Filter by client ID
        - date_from: Filter from date
        - date_to: Filter to date
        - status: Filter by status
        """
        assignments = self.get_queryset()

        # Filters
        client_id = request.query_params.get('client')
        if client_id:
            assignments = assignments.filter(client_id=client_id)

        date_from = request.query_params.get('date_from')
        if date_from:
            assignments = assignments.filter(assigned_date__gte=date_from)

        date_to = request.query_params.get('date_to')
        if date_to:
            assignments = assignments.filter(assigned_date__lte=date_to)

        status_filter = request.query_params.get('status')
        if status_filter:
            assignments = assignments.filter(status=status_filter)

        # Pagination
        page = self.paginate_queryset(assignments)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(assignments, many=True)
        return Response(serializer.data)

    def create(self, request):
        """Create workout assignment"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Verify client belongs to trainer
        client_id = serializer.validated_data['client'].id
        try:
            client = Client.objects.get(id=client_id, trainer=request.user)
        except Client.DoesNotExist:
            return Response(
                {'error': 'Client not found or does not belong to you'},
                status=status.HTTP_404_NOT_FOUND
            )

        assignment = ClientWorkoutAssignment.objects.create(
            trainer=request.user,
            **serializer.validated_data
        )

        return Response(
            ClientWorkoutAssignmentSerializer(assignment).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['post'])
    def mark_complete(self, request, pk=None):
        """Mark workout assignment as complete"""
        try:
            assignment = self.get_queryset().get(pk=pk)
        except ClientWorkoutAssignment.DoesNotExist:
            return Response(
                {'error': 'Assignment not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        from django.utils import timezone
        assignment.status = 'completed'
        assignment.completed = True
        assignment.completed_at = timezone.now()
        assignment.save()

        return Response(ClientWorkoutAssignmentSerializer(assignment).data)


class ClientProgramAssignmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Client Program Assignments

    Endpoints:
    - GET    /api/library/client-program-assignments/       - List assignments
    - POST   /api/library/client-program-assignments/       - Create assignment
    - PATCH  /api/library/client-program-assignments/{id}/  - Update assignment
    - DELETE /api/library/client-program-assignments/{id}/  - Delete assignment
    """

    permission_classes = [IsAuthenticated]
    serializer_class = ClientProgramAssignmentSerializer

    def get_queryset(self):
        """Get trainer's client program assignments"""
        return ClientProgramAssignment.objects.filter(
            trainer=self.request.user
        ).select_related('client', 'program')

    def get_serializer_class(self):
        if self.action == 'create':
            return ClientProgramAssignmentCreateSerializer
        return ClientProgramAssignmentSerializer

    def list(self, request):
        """
        List assignments with filtering

        Query params:
        - client: Filter by client ID
        - status: Filter by status
        """
        assignments = self.get_queryset()

        # Filters
        client_id = request.query_params.get('client')
        if client_id:
            assignments = assignments.filter(client_id=client_id)

        status_filter = request.query_params.get('status')
        if status_filter:
            assignments = assignments.filter(status=status_filter)

        # Pagination
        page = self.paginate_queryset(assignments)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(assignments, many=True)
        return Response(serializer.data)

    def create(self, request):
        """Create program assignment"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Verify client belongs to trainer
        client_id = serializer.validated_data['client'].id
        try:
            client = Client.objects.get(id=client_id, trainer=request.user)
        except Client.DoesNotExist:
            return Response(
                {'error': 'Client not found or does not belong to you'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check for conflicting active programs
        existing_active = ClientProgramAssignment.objects.filter(
            client=client,
            status='active'
        ).exists()

        if existing_active:
            return Response(
                {'error': 'Client already has an active program'},
                status=status.HTTP_400_BAD_REQUEST
            )

        assignment = ClientProgramAssignment.objects.create(
            trainer=request.user,
            **serializer.validated_data
        )

        return Response(
            ClientProgramAssignmentSerializer(assignment).data,
            status=status.HTTP_201_CREATED
        )
