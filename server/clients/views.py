"""
Client Views
Thin controllers that handle HTTP requests and delegate business logic to services
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Client
from .serializers import ClientSerializer, ClientListSerializer, ClientCreateUpdateSerializer
from .services import ClientService


class ClientViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Client CRUD operations

    Endpoints:
    - GET    /api/clients/           - List all clients for authenticated trainer
    - POST   /api/clients/           - Create new client
    - GET    /api/clients/{id}/      - Get single client
    - PATCH  /api/clients/{id}/      - Update client
    - DELETE /api/clients/{id}/      - Delete client
    - POST   /api/clients/{id}/deactivate/ - Deactivate client
    - GET    /api/clients/statistics/ - Get client statistics
    """

    permission_classes = [IsAuthenticated]
    serializer_class = ClientSerializer

    def get_queryset(self):
        """Get clients for authenticated trainer only"""
        return Client.objects.filter(trainer=self.request.user).select_related('trainer')

    def get_serializer_class(self):
        """Use different serializers based on action"""
        if self.action == 'list':
            return ClientListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return ClientCreateUpdateSerializer
        return ClientSerializer

    def list(self, request):
        """
        List clients for authenticated trainer

        Query params:
        - status: Filter by status (active, inactive, suspended)
        - search: Search by name, email, or phone
        """
        status_filter = request.query_params.get('status')
        search_term = request.query_params.get('search')

        clients = self.get_queryset()  # Already filtered by trainer

        if status_filter:
            clients = clients.filter(status=status_filter)

        if search_term:
            from django.db.models import Q
            clients = clients.filter(
                Q(first_name__icontains=search_term) |
                Q(last_name__icontains=search_term) |
                Q(email__icontains=search_term) |
                Q(phone__icontains=search_term)
            )

        serializer = self.get_serializer(clients, many=True)
        return Response(serializer.data)

    def create(self, request):
        """Create new client for authenticated trainer"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Use service to set default membership dates (business logic)
        client_data = ClientService.set_default_membership_dates(
            serializer.validated_data.copy()
        )

        # Create client directly in view (CRUD operation)
        try:
            client = Client.objects.create(
                trainer=request.user,
                **client_data
            )

            # Automatically create a placeholder payment for the new client
            from payments.models import Payment
            from datetime import date, timedelta

            Payment.objects.create(
                client=client,
                amount=0,  # Placeholder amount - trainer will update
                payment_method='mpesa',
                payment_status='pending',
                description='Initial membership payment - Please update amount and due date',
                due_date=date.today() + timedelta(days=7)  # Default to 7 days from now
            )

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Return full client data
        return Response(
            ClientSerializer(client).data,
            status=status.HTTP_201_CREATED
        )

    def retrieve(self, request, pk=None):
        """Get single client with full details"""
        try:
            client = self.get_queryset().get(pk=pk)
        except Client.DoesNotExist:
            return Response(
                {'error': 'Client not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = ClientSerializer(client)
        return Response(serializer.data)

    def update(self, request, pk=None):
        """Full update of client"""
        try:
            client = self.get_queryset().get(pk=pk)
        except Client.DoesNotExist:
            return Response(
                {'error': 'Client not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = self.get_serializer(client, data=request.data)
        serializer.is_valid(raise_exception=True)

        # Update client directly (CRUD operation)
        for field, value in serializer.validated_data.items():
            setattr(client, field, value)
        client.save()

        return Response(ClientSerializer(client).data)

    def partial_update(self, request, pk=None):
        """Partial update of client"""
        try:
            client = self.get_queryset().get(pk=pk)
        except Client.DoesNotExist:
            return Response(
                {'error': 'Client not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = self.get_serializer(client, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        # Update client directly (CRUD operation)
        for field, value in serializer.validated_data.items():
            setattr(client, field, value)
        client.save()

        return Response(ClientSerializer(client).data)

    def destroy(self, request, pk=None):
        """Delete client"""
        try:
            client = self.get_queryset().get(pk=pk)
        except Client.DoesNotExist:
            return Response(
                {'error': 'Client not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        client.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """
        Deactivate a client
        Custom action demonstrating service delegation

        POST /api/clients/{id}/deactivate/
        Body: { "reason": "optional reason" }
        """
        try:
            client = self.get_queryset().get(pk=pk)
        except Client.DoesNotExist:
            return Response(
                {'error': 'Client not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Delegate complex operation to service
        reason = request.data.get('reason')
        ClientService.deactivate_client(client, reason=reason)

        return Response({
            'status': 'client deactivated',
            'client': ClientSerializer(client).data
        })

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """
        Get trainer's client statistics
        Service handles data aggregation

        GET /api/clients/statistics/
        """
        stats = ClientService.get_client_statistics(request.user)
        return Response(stats)

    @action(detail=True, methods=['get'])
    def payments(self, request, pk=None):
        """
        Get client's payment history

        GET /api/clients/{id}/payments/
        """
        try:
            client = self.get_queryset().get(pk=pk)
        except Client.DoesNotExist:
            return Response(
                {'error': 'Client not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        from payments.models import Payment
        from payments.serializers import PaymentListSerializer

        payments = Payment.objects.filter(client=client).order_by('-created_at')
        serializer = PaymentListSerializer(payments, many=True)

        return Response({
            'client': client.full_name,
            'payments': serializer.data
        })

    @action(detail=True, methods=['get', 'post'])
    def goals(self, request, pk=None):
        """
        Get or create client goals

        GET /api/clients/{id}/goals/  - Get all goals for client
        POST /api/clients/{id}/goals/ - Create new goal for client
        Body: {
            "goal_type": "weight_loss",
            "description": "Lose 10kg in 3 months",
            "target_date": "2025-03-01"
        }
        """
        try:
            client = self.get_queryset().get(pk=pk)
        except Client.DoesNotExist:
            return Response(
                {'error': 'Client not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        from .models import Goal
        from .serializers import GoalSerializer, GoalCreateSerializer

        if request.method == 'GET':
            goals = client.goals.all().order_by('-created_at')
            serializer = GoalSerializer(goals, many=True)
            return Response(serializer.data)

        elif request.method == 'POST':
            serializer = GoalCreateSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            goal = Goal.objects.create(
                client=client,
                **serializer.validated_data
            )

            return Response(
                GoalSerializer(goal).data,
                status=status.HTTP_201_CREATED
            )

    @action(detail=True, methods=['patch'])
    def update_goal(self, request, pk=None):
        """
        Update a specific goal

        PATCH /api/clients/{id}/update_goal/
        Body: {
            "goal_id": 1,
            "achieved": true
        }
        """
        try:
            client = self.get_queryset().get(pk=pk)
        except Client.DoesNotExist:
            return Response(
                {'error': 'Client not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        goal_id = request.data.get('goal_id')
        if not goal_id:
            return Response(
                {'error': 'goal_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        from .models import Goal

        try:
            goal = client.goals.get(id=goal_id)
        except Goal.DoesNotExist:
            return Response(
                {'error': 'Goal not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Update goal fields
        allowed_fields = [
            'goal_type', 'title', 'description', 'target_value',
            'current_value', 'target_date', 'status', 'achieved'
        ]
        for field in allowed_fields:
            if field in request.data:
                setattr(goal, field, request.data[field])

        goal.save()

        from .serializers import GoalSerializer
        return Response(GoalSerializer(goal).data)

    @action(detail=True, methods=['get', 'post'])
    def workouts(self, request, pk=None):
        """
        Get or create workout plans for client

        GET /api/clients/{id}/workouts/ - Get all workout plans for client
        POST /api/clients/{id}/workouts/ - Create new workout plan for client
        Body: {
            "name": "Monday - Chest & Triceps",
            "description": "Focus on compound movements"
        }
        """
        try:
            client = self.get_queryset().get(pk=pk)
        except Client.DoesNotExist:
            return Response(
                {'error': 'Client not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        from .models import WorkoutPlan
        from .serializers import WorkoutPlanSerializer, WorkoutPlanCreateSerializer

        if request.method == 'GET':
            plans = client.workout_plans.all().prefetch_related('exercises').order_by('-created_at')
            serializer = WorkoutPlanSerializer(plans, many=True)
            return Response(serializer.data)

        elif request.method == 'POST':
            serializer = WorkoutPlanCreateSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            plan = WorkoutPlan.objects.create(
                client=client,
                **serializer.validated_data
            )

            return Response(
                WorkoutPlanSerializer(plan).data,
                status=status.HTTP_201_CREATED
            )

    @action(detail=True, methods=['post'], url_path='workouts/(?P<plan_id>[^/.]+)/exercises')
    def add_exercise(self, request, pk=None, plan_id=None):
        """
        Add exercise to a workout plan

        POST /api/clients/{id}/workouts/{plan_id}/exercises/
        Body: {
            "name": "Bench Press",
            "description": "Barbell flat bench press",
            "sets": 3,
            "reps": 10,
            "rest_period_seconds": 90
        }
        """
        try:
            client = self.get_queryset().get(pk=pk)
        except Client.DoesNotExist:
            return Response(
                {'error': 'Client not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        from .models import WorkoutPlan, Exercise
        from .serializers import ExerciseSerializer, ExerciseCreateSerializer

        try:
            plan = client.workout_plans.get(id=plan_id)
        except WorkoutPlan.DoesNotExist:
            return Response(
                {'error': 'Workout plan not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = ExerciseCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        exercise = Exercise.objects.create(
            workout_plan=plan,
            **serializer.validated_data
        )

        return Response(
            ExerciseSerializer(exercise).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['delete'], url_path='workouts/(?P<plan_id>[^/.]+)')
    def delete_workout(self, request, pk=None, plan_id=None):
        """
        Delete a workout plan

        DELETE /api/clients/{id}/workouts/{plan_id}/
        """
        try:
            client = self.get_queryset().get(pk=pk)
        except Client.DoesNotExist:
            return Response(
                {'error': 'Client not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        from .models import WorkoutPlan

        try:
            plan = client.workout_plans.get(id=plan_id)
            plan.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except WorkoutPlan.DoesNotExist:
            return Response(
                {'error': 'Workout plan not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['delete'], url_path='workouts/(?P<plan_id>[^/.]+)/exercises/(?P<exercise_id>[^/.]+)')
    def delete_exercise(self, request, pk=None, plan_id=None, exercise_id=None):
        """
        Delete an exercise from a workout plan

        DELETE /api/clients/{id}/workouts/{plan_id}/exercises/{exercise_id}/
        """
        try:
            client = self.get_queryset().get(pk=pk)
        except Client.DoesNotExist:
            return Response(
                {'error': 'Client not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        from .models import WorkoutPlan, Exercise

        try:
            plan = client.workout_plans.get(id=plan_id)
            exercise = plan.exercises.get(id=exercise_id)
            exercise.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except WorkoutPlan.DoesNotExist:
            return Response(
                {'error': 'Workout plan not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exercise.DoesNotExist:
            return Response(
                {'error': 'Exercise not found'},
                status=status.HTTP_404_NOT_FOUND
            )