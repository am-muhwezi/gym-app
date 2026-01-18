"""
Booking Views
Handles booking CRUD operations and scheduling
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Q, Count
from datetime import timedelta, datetime

from .models import Booking, Schedule, RecurringBooking
from clients.models import Client
from .serializers import (
    BookingSerializer, BookingListSerializer, BookingCreateSerializer, BookingUpdateSerializer,
    ScheduleSerializer, ScheduleCreateSerializer,
    RecurringBookingSerializer, RecurringBookingCreateSerializer
)


class BookingViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Booking CRUD operations

    Endpoints:
    - GET    /api/bookings/              - List all bookings for trainer
    - POST   /api/bookings/              - Create new booking
    - GET    /api/bookings/{id}/         - Get single booking
    - PATCH  /api/bookings/{id}/         - Update booking
    - DELETE /api/bookings/{id}/         - Delete booking
    - GET    /api/bookings/upcoming/     - Get upcoming bookings
    - GET    /api/bookings/today/        - Get today's bookings
    - POST   /api/bookings/{id}/complete/    - Mark booking as completed
    - POST   /api/bookings/{id}/cancel/      - Cancel booking
    - GET    /api/bookings/statistics/   - Get booking statistics
    """

    permission_classes = [IsAuthenticated]
    serializer_class = BookingSerializer

    def get_queryset(self):
        """Get bookings for authenticated trainer only"""
        return Booking.objects.filter(
            trainer=self.request.user
        ).select_related('client', 'trainer')

    def get_serializer_class(self):
        """Use different serializers based on action"""
        if self.action == 'list':
            return BookingListSerializer
        elif self.action == 'create':
            return BookingCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return BookingUpdateSerializer
        return BookingSerializer

    def list(self, request):
        """
        List bookings with filtering options and pagination

        Query params:
        - status: Filter by status (scheduled, confirmed, completed, cancelled)
        - client: Filter by client ID
        - date_from: Filter bookings from this date
        - date_to: Filter bookings to this date
        - upcoming: Show only upcoming bookings (true/false)
        - page: Page number
        - page_size: Items per page
        """
        bookings = self.get_queryset()

        # Filter by status
        booking_status = request.query_params.get('status')
        if booking_status:
            bookings = bookings.filter(status=booking_status)

        # Filter by client
        client_id = request.query_params.get('client')
        if client_id:
            bookings = bookings.filter(client_id=client_id)

        # Filter upcoming bookings
        if request.query_params.get('upcoming') == 'true':
            today = timezone.now().date()
            bookings = bookings.filter(
                session_date__gte=today,
                status__in=['scheduled', 'confirmed']
            )

        # Filter by date range
        date_from = request.query_params.get('date_from')
        if date_from:
            bookings = bookings.filter(session_date__gte=date_from)

        date_to = request.query_params.get('date_to')
        if date_to:
            bookings = bookings.filter(session_date__lte=date_to)

        # Order by date and time
        bookings = bookings.order_by('-session_date', '-start_time')

        # Use pagination
        page = self.paginate_queryset(bookings)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(bookings, many=True)
        return Response(serializer.data)

    def create(self, request):
        """Create new booking"""
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

        # Create booking
        booking = Booking.objects.create(
            trainer=request.user,
            **serializer.validated_data
        )

        return Response(
            BookingSerializer(booking).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Get upcoming bookings"""
        today = timezone.now().date()
        bookings = self.get_queryset().filter(
            session_date__gte=today,
            status__in=['scheduled', 'confirmed']
        ).order_by('session_date', 'start_time')

        # Use pagination
        page = self.paginate_queryset(bookings)
        if page is not None:
            serializer = BookingListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = BookingListSerializer(bookings, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def today(self, request):
        """Get today's bookings with pagination"""
        today = timezone.now().date()
        bookings = self.get_queryset().filter(
            session_date=today
        ).order_by('start_time')

        # Use pagination
        page = self.paginate_queryset(bookings)
        if page is not None:
            serializer = BookingListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = BookingListSerializer(bookings, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """
        Mark booking as completed

        POST /api/bookings/{id}/complete/
        Body: {
            "session_summary": "Great session, client made good progress",
            "client_rating": 5
        }
        """
        try:
            booking = self.get_queryset().get(pk=pk)
        except Booking.DoesNotExist:
            return Response(
                {'error': 'Booking not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        summary = request.data.get('session_summary', '')
        booking.mark_completed(summary=summary)

        # Update rating if provided
        if 'client_rating' in request.data:
            booking.client_rating = request.data['client_rating']
            booking.save()

        return Response({
            'message': 'Booking marked as completed',
            'booking': BookingSerializer(booking).data
        })

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """
        Cancel booking

        POST /api/bookings/{id}/cancel/
        Body: {
            "reason": "Client requested reschedule"
        }
        """
        try:
            booking = self.get_queryset().get(pk=pk)
        except Booking.DoesNotExist:
            return Response(
                {'error': 'Booking not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        reason = request.data.get('reason', '')
        booking.cancel(reason=reason)

        return Response({
            'message': 'Booking cancelled',
            'booking': BookingSerializer(booking).data
        })

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """
        Get booking statistics for trainer

        GET /api/bookings/statistics/
        """
        bookings = self.get_queryset()
        today = timezone.now().date()

        stats = {
            'total_bookings': bookings.count(),
            'upcoming_bookings': bookings.filter(
                session_date__gte=today,
                status__in=['scheduled', 'confirmed']
            ).count(),
            'completed_bookings': bookings.filter(status='completed').count(),
            'cancelled_bookings': bookings.filter(status='cancelled').count(),
            'todays_bookings': bookings.filter(session_date=today).count(),
        }

        # This week's statistics
        week_start = today - timedelta(days=today.weekday())
        week_end = week_start + timedelta(days=6)
        this_week_bookings = bookings.filter(
            session_date__gte=week_start,
            session_date__lte=week_end
        )
        stats['this_week_bookings'] = this_week_bookings.count()
        stats['this_week_completed'] = this_week_bookings.filter(status='completed').count()

        # This month's statistics
        first_day_of_month = today.replace(day=1)
        this_month_bookings = bookings.filter(session_date__gte=first_day_of_month)
        stats['this_month_bookings'] = this_month_bookings.count()
        stats['this_month_completed'] = this_month_bookings.filter(status='completed').count()

        return Response(stats)


class ScheduleViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Schedule CRUD operations

    Endpoints:
    - GET    /api/schedules/             - List trainer's schedule
    - POST   /api/schedules/             - Create schedule slot
    - PATCH  /api/schedules/{id}/        - Update schedule slot
    - DELETE /api/schedules/{id}/        - Delete schedule slot
    """

    permission_classes = [IsAuthenticated]
    serializer_class = ScheduleSerializer

    def get_queryset(self):
        """Get schedules for authenticated trainer only"""
        return Schedule.objects.filter(trainer=self.request.user)

    def get_serializer_class(self):
        """Use different serializers based on action"""
        if self.action in ['create', 'update', 'partial_update']:
            return ScheduleCreateSerializer
        return ScheduleSerializer

    def create(self, request):
        """Create new schedule slot"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        schedule = Schedule.objects.create(
            trainer=request.user,
            **serializer.validated_data
        )

        return Response(
            ScheduleSerializer(schedule).data,
            status=status.HTTP_201_CREATED
        )


class RecurringBookingViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Recurring Booking CRUD operations

    Endpoints:
    - GET    /api/recurring-bookings/              - List recurring bookings
    - POST   /api/recurring-bookings/              - Create recurring booking
    - PATCH  /api/recurring-bookings/{id}/         - Update recurring booking
    - DELETE /api/recurring-bookings/{id}/         - Delete recurring booking
    """

    permission_classes = [IsAuthenticated]
    serializer_class = RecurringBookingSerializer

    def get_queryset(self):
        """Get recurring bookings for authenticated trainer only"""
        return RecurringBooking.objects.filter(
            trainer=self.request.user
        ).select_related('client')

    def get_serializer_class(self):
        """Use different serializers based on action"""
        if self.action in ['create', 'update', 'partial_update']:
            return RecurringBookingCreateSerializer
        return RecurringBookingSerializer

    def create(self, request):
        """Create new recurring booking"""
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

        # Create recurring booking
        recurring_booking = RecurringBooking.objects.create(
            trainer=request.user,
            **serializer.validated_data
        )

        return Response(
            RecurringBookingSerializer(recurring_booking).data,
            status=status.HTTP_201_CREATED
        )