from django.contrib import admin
from .models import Booking, Schedule, RecurringBooking


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ['client', 'trainer', 'session_date', 'start_time', 'status', 'session_type']
    list_filter = ['status', 'session_type', 'session_date']
    search_fields = ['client__first_name', 'client__last_name', 'title']
    date_hierarchy = 'session_date'
    ordering = ['-session_date', '-start_time']


@admin.register(Schedule)
class ScheduleAdmin(admin.ModelAdmin):
    list_display = ['trainer', 'weekday', 'start_time', 'end_time', 'is_available']
    list_filter = ['weekday', 'is_available']
    search_fields = ['trainer__username']
    ordering = ['weekday', 'start_time']


@admin.register(RecurringBooking)
class RecurringBookingAdmin(admin.ModelAdmin):
    list_display = ['client', 'trainer', 'weekday', 'start_time', 'frequency', 'is_active']
    list_filter = ['weekday', 'frequency', 'is_active']
    search_fields = ['client__first_name', 'client__last_name', 'title']
    ordering = ['weekday', 'start_time']
