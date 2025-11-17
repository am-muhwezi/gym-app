"""
Analytics Views
Provides real-time analytics and business insights for trainers
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Sum, Count, Avg, Q
from datetime import timedelta, date

from clients.models import Client
from payments.models import Payment


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_analytics(request):
    """
    Get comprehensive dashboard analytics for trainer

    GET /api/analytics/dashboard/
    Query params:
    - period: 'week', 'month', 'year' (default: 'month')
    """
    trainer = request.user
    period = request.query_params.get('period', 'month')
    today = timezone.now().date()

    # Calculate date range based on period
    if period == 'week':
        start_date = today - timedelta(days=7)
    elif period == 'year':
        start_date = today - timedelta(days=365)
    else:  # month
        start_date = today - timedelta(days=30)

    # Client metrics
    all_clients = Client.objects.filter(trainer=trainer)
    active_clients = all_clients.filter(status='active')

    client_metrics = {
        'total_clients': all_clients.count(),
        'active_clients': active_clients.count(),
        'inactive_clients': all_clients.filter(status='inactive').count(),
        'new_clients_this_period': all_clients.filter(created_at__date__gte=start_date).count(),
    }

    # Payment/Revenue metrics
    all_payments = Payment.objects.filter(client__trainer=trainer)
    period_payments = all_payments.filter(created_at__date__gte=start_date)
    completed_payments = period_payments.filter(payment_status='completed')

    revenue_metrics = {
        'total_revenue': completed_payments.aggregate(total=Sum('amount'))['total'] or 0,
        'completed_payments': completed_payments.count(),
        'pending_payments': period_payments.filter(payment_status='pending').count(),
        'pending_amount': period_payments.filter(payment_status='pending').aggregate(total=Sum('amount'))['total'] or 0,
        'overdue_payments': all_payments.filter(
            payment_status='pending',
            due_date__lt=today
        ).count(),
        'overdue_amount': all_payments.filter(
            payment_status='pending',
            due_date__lt=today
        ).aggregate(total=Sum('amount'))['total'] or 0,
    }

    # Booking metrics (if bookings app is available)
    try:
        from bookings.models import Booking
        all_bookings = Booking.objects.filter(trainer=trainer)
        period_bookings = all_bookings.filter(session_date__gte=start_date)

        booking_metrics = {
            'total_sessions': period_bookings.count(),
            'completed_sessions': period_bookings.filter(status='completed').count(),
            'upcoming_sessions': all_bookings.filter(
                session_date__gte=today,
                status__in=['scheduled', 'confirmed']
            ).count(),
            'cancelled_sessions': period_bookings.filter(status='cancelled').count(),
            'average_rating': period_bookings.filter(
                client_rating__isnull=False
            ).aggregate(avg=Avg('client_rating'))['avg'] or 0,
        }
    except:
        booking_metrics = {
            'total_sessions': 0,
            'completed_sessions': 0,
            'upcoming_sessions': 0,
            'cancelled_sessions': 0,
            'average_rating': 0,
        }

    # Goal metrics
    try:
        from clients.models import Goal
        all_goals = Goal.objects.filter(client__trainer=trainer)
        period_goals = all_goals.filter(created_at__date__gte=start_date)

        goal_metrics = {
            'total_goals': all_goals.count(),
            'active_goals': all_goals.filter(status='active').count(),
            'completed_goals': period_goals.filter(status='completed').count(),
            'completion_rate': (period_goals.filter(status='completed').count() / period_goals.count() * 100)
                               if period_goals.count() > 0 else 0,
        }
    except:
        goal_metrics = {
            'total_goals': 0,
            'active_goals': 0,
            'completed_goals': 0,
            'completion_rate': 0,
        }

    return Response({
        'period': period,
        'start_date': start_date,
        'end_date': today,
        'clients': client_metrics,
        'revenue': revenue_metrics,
        'bookings': booking_metrics,
        'goals': goal_metrics,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def revenue_trends(request):
    """
    Get revenue trends over time

    GET /api/analytics/revenue-trends/
    Query params:
    - period: 'daily', 'weekly', 'monthly' (default: 'monthly')
    - months: Number of months to include (default: 6)
    """
    trainer = request.user
    period_type = request.query_params.get('period', 'monthly')
    months_back = int(request.query_params.get('months', 6))

    today = timezone.now().date()
    start_date = today - timedelta(days=months_back * 30)

    payments = Payment.objects.filter(
        client__trainer=trainer,
        payment_status='completed',
        payment_date__gte=start_date
    ).order_by('payment_date')

    # Group by period
    trends = []
    if period_type == 'monthly':
        # Group by month
        for i in range(months_back):
            month_start = today.replace(day=1) - timedelta(days=i*30)
            month_end = (month_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)

            month_payments = payments.filter(
                payment_date__gte=month_start,
                payment_date__lte=month_end
            )

            trends.append({
                'period': month_start.strftime('%Y-%m'),
                'revenue': month_payments.aggregate(total=Sum('amount'))['total'] or 0,
                'count': month_payments.count(),
            })

    trends.reverse()  # Show oldest to newest
    return Response({'trends': trends})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def client_retention(request):
    """
    Get client retention metrics

    GET /api/analytics/client-retention/
    """
    trainer = request.user
    today = timezone.now().date()

    clients = Client.objects.filter(trainer=trainer)

    # Calculate retention metrics
    retention_data = {
        'total_clients': clients.count(),
        'active_clients': clients.filter(status='active').count(),
        'inactive_clients': clients.filter(status='inactive').count(),
        'retention_rate': 0,
    }

    if clients.count() > 0:
        retention_data['retention_rate'] = (retention_data['active_clients'] / clients.count()) * 100

    # Client lifetime analysis
    client_lifetime = []
    for client in clients[:20]:  # Limit to 20 for performance
        days_active = (today - client.created_at.date()).days
        total_paid = Payment.objects.filter(
            client=client,
            payment_status='completed'
        ).aggregate(total=Sum('amount'))['total'] or 0

        client_lifetime.append({
            'client_name': client.full_name,
            'days_active': days_active,
            'total_revenue': float(total_paid),
            'status': client.status,
        })

    retention_data['client_lifetime'] = client_lifetime

    return Response(retention_data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def performance_metrics(request):
    """
    Get trainer performance metrics

    GET /api/analytics/performance/
    """
    trainer = request.user
    today = timezone.now().date()
    this_month_start = today.replace(day=1)
    last_month_start = (this_month_start - timedelta(days=1)).replace(day=1)

    # This month metrics
    this_month_revenue = Payment.objects.filter(
        client__trainer=trainer,
        payment_status='completed',
        payment_date__gte=this_month_start
    ).aggregate(total=Sum('amount'))['total'] or 0

    this_month_clients = Client.objects.filter(
        trainer=trainer,
        created_at__date__gte=this_month_start
    ).count()

    # Last month metrics
    last_month_revenue = Payment.objects.filter(
        client__trainer=trainer,
        payment_status='completed',
        payment_date__gte=last_month_start,
        payment_date__lt=this_month_start
    ).aggregate(total=Sum('amount'))['total'] or 0

    last_month_clients = Client.objects.filter(
        trainer=trainer,
        created_at__date__gte=last_month_start,
        created_at__date__lt=this_month_start
    ).count()

    # Calculate growth
    revenue_growth = 0
    if last_month_revenue > 0:
        revenue_growth = ((this_month_revenue - last_month_revenue) / last_month_revenue) * 100

    client_growth = 0
    if last_month_clients > 0:
        client_growth = ((this_month_clients - last_month_clients) / last_month_clients) * 100

    return Response({
        'this_month': {
            'revenue': float(this_month_revenue),
            'new_clients': this_month_clients,
        },
        'last_month': {
            'revenue': float(last_month_revenue),
            'new_clients': last_month_clients,
        },
        'growth': {
            'revenue_growth_percentage': round(revenue_growth, 2),
            'client_growth_percentage': round(client_growth, 2),
        }
    })
