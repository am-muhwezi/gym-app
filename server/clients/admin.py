from django.contrib import admin
from .models import Client


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    """Admin interface for Client model"""

    list_display = ['full_name', 'email', 'phone', 'trainer', 'status', 'created_at']
    list_filter = ['status', 'gender', 'created_at']
    search_fields = ['first_name', 'last_name', 'email', 'phone']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'created_at'

    fieldsets = (
        ('Basic Information', {
            'fields': ('trainer', 'first_name', 'last_name', 'email', 'phone', 'dob', 'gender')
        }),
        ('Membership', {
            'fields': ('status', 'membership_start_date', 'membership_end_date')
        }),
        ('Additional Information', {
            'fields': ('notes',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
