from django.contrib import admin
from .models import (
    ExerciseLibrary, WorkoutTemplate, WorkoutExercise,
    Program, ProgramWeek, ProgramDay,
    ClientWorkoutAssignment, ClientProgramAssignment
)


@admin.register(ExerciseLibrary)
class ExerciseLibraryAdmin(admin.ModelAdmin):
    list_display = ['name', 'trainer', 'is_global', 'modality', 'category', 'created_at']
    list_filter = ['is_global', 'modality', 'category', 'created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at', 'updated_at']


class WorkoutExerciseInline(admin.TabularInline):
    model = WorkoutExercise
    extra = 1
    autocomplete_fields = ['exercise']


@admin.register(WorkoutTemplate)
class WorkoutTemplateAdmin(admin.ModelAdmin):
    list_display = ['name', 'trainer', 'difficulty_level', 'duration_minutes', 'created_at']
    list_filter = ['difficulty_level', 'created_at']
    search_fields = ['name', 'description']
    inlines = [WorkoutExerciseInline]
    readonly_fields = ['created_at', 'updated_at']


class ProgramDayInline(admin.TabularInline):
    model = ProgramDay
    extra = 0
    autocomplete_fields = ['workout_template']


class ProgramWeekInline(admin.StackedInline):
    model = ProgramWeek
    extra = 0
    show_change_link = True


@admin.register(Program)
class ProgramAdmin(admin.ModelAdmin):
    list_display = ['name', 'trainer', 'duration', 'modality', 'experience_level', 'created_at']
    list_filter = ['duration', 'modality', 'experience_level', 'created_at']
    search_fields = ['name', 'description']
    inlines = [ProgramWeekInline]
    readonly_fields = ['created_at', 'updated_at']


@admin.register(ProgramWeek)
class ProgramWeekAdmin(admin.ModelAdmin):
    list_display = ['program', 'week_number', 'title']
    list_filter = ['program']
    inlines = [ProgramDayInline]


@admin.register(ClientWorkoutAssignment)
class ClientWorkoutAssignmentAdmin(admin.ModelAdmin):
    list_display = ['client', 'workout_template', 'assigned_date', 'status', 'completed']
    list_filter = ['status', 'completed', 'assigned_date']
    search_fields = ['client__first_name', 'client__last_name']
    readonly_fields = ['created_at', 'updated_at', 'completed_at']
    autocomplete_fields = ['client', 'workout_template']


@admin.register(ClientProgramAssignment)
class ClientProgramAssignmentAdmin(admin.ModelAdmin):
    list_display = ['client', 'program', 'start_date', 'end_date', 'status', 'progress_percentage']
    list_filter = ['status', 'start_date']
    search_fields = ['client__first_name', 'client__last_name']
    readonly_fields = ['created_at', 'updated_at', 'completed_at', 'progress_percentage']
    autocomplete_fields = ['client', 'program']
