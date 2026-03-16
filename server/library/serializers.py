from rest_framework import serializers
from .models import (
    ExerciseLibrary, WorkoutTemplate, WorkoutExercise,
    Program, ProgramWeek, ProgramDay,
    ClientWorkoutAssignment, ClientProgramAssignment
)


class ExerciseLibrarySerializer(serializers.ModelSerializer):
    """Full exercise details"""
    modality_display = serializers.CharField(source='get_modality_display', read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    trainer_name = serializers.CharField(source='trainer.username', read_only=True, allow_null=True)

    class Meta:
        model = ExerciseLibrary
        fields = [
            'id', 'trainer', 'trainer_name', 'name', 'description',
            'video_url', 'image_url', 'is_global', 'modality', 'modality_display',
            'muscle_groups', 'category', 'category_display',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'trainer', 'is_global', 'created_at', 'updated_at']


class ExerciseLibraryCreateSerializer(serializers.ModelSerializer):
    """Create/update exercise"""
    class Meta:
        model = ExerciseLibrary
        fields = [
            'name', 'description', 'video_url', 'image_url',
            'modality', 'muscle_groups', 'category'
        ]


class WorkoutExerciseSerializer(serializers.ModelSerializer):
    """Workout exercise with full exercise details"""
    exercise = ExerciseLibrarySerializer(read_only=True)
    exercise_id = serializers.PrimaryKeyRelatedField(
        queryset=ExerciseLibrary.objects.all(),
        source='exercise',
        write_only=True
    )

    class Meta:
        model = WorkoutExercise
        fields = [
            'id', 'exercise', 'exercise_id', 'order', 'sets', 'reps',
            'weight', 'duration_seconds', 'rest_period_seconds', 'notes'
        ]


class WorkoutExerciseCreateSerializer(serializers.ModelSerializer):
    """Create workout exercise"""
    class Meta:
        model = WorkoutExercise
        fields = [
            'exercise', 'order', 'sets', 'reps', 'weight',
            'duration_seconds', 'rest_period_seconds', 'notes'
        ]


class WorkoutTemplateSerializer(serializers.ModelSerializer):
    """Full workout template with exercises"""
    workout_exercises = WorkoutExerciseSerializer(many=True, read_only=True)
    difficulty_level_display = serializers.CharField(source='get_difficulty_level_display', read_only=True)
    trainer_name = serializers.CharField(source='trainer.username', read_only=True)
    exercise_count = serializers.SerializerMethodField()

    class Meta:
        model = WorkoutTemplate
        fields = [
            'id', 'trainer', 'trainer_name', 'name', 'description',
            'duration_minutes', 'difficulty_level', 'difficulty_level_display',
            'workout_exercises', 'exercise_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'trainer', 'created_at', 'updated_at']

    def get_exercise_count(self, obj):
        return obj.workout_exercises.count()


class WorkoutTemplateCreateSerializer(serializers.ModelSerializer):
    """Create workout template"""
    exercises = WorkoutExerciseCreateSerializer(many=True, write_only=True, required=False)

    class Meta:
        model = WorkoutTemplate
        fields = [
            'name', 'description', 'duration_minutes',
            'difficulty_level', 'exercises'
        ]

    def create(self, validated_data):
        exercises_data = validated_data.pop('exercises', [])
        workout = WorkoutTemplate.objects.create(**validated_data)

        # Create workout exercises
        for exercise_data in exercises_data:
            WorkoutExercise.objects.create(
                workout_template=workout,
                **exercise_data
            )

        return workout


class ProgramDaySerializer(serializers.ModelSerializer):
    """Program day with workout details"""
    workout_template = WorkoutTemplateSerializer(read_only=True)
    workout_template_id = serializers.PrimaryKeyRelatedField(
        queryset=WorkoutTemplate.objects.all(),
        source='workout_template',
        write_only=True,
        allow_null=True,
        required=False
    )
    day_of_week_display = serializers.CharField(source='get_day_of_week_display', read_only=True)

    class Meta:
        model = ProgramDay
        fields = [
            'id', 'day_number', 'day_of_week', 'day_of_week_display',
            'title', 'workout_template', 'workout_template_id',
            'notes', 'is_rest_day'
        ]


class ProgramWeekSerializer(serializers.ModelSerializer):
    """Program week with days"""
    days = ProgramDaySerializer(many=True, read_only=True)

    class Meta:
        model = ProgramWeek
        fields = ['id', 'week_number', 'title', 'description', 'days']


class ProgramSerializer(serializers.ModelSerializer):
    """Full program with weeks and days"""
    weeks = ProgramWeekSerializer(many=True, read_only=True)
    duration_display = serializers.CharField(source='get_duration_display', read_only=True)
    modality_display = serializers.CharField(source='get_modality_display', read_only=True)
    experience_level_display = serializers.CharField(source='get_experience_level_display', read_only=True)
    trainer_name = serializers.CharField(source='trainer.username', read_only=True)
    total_weeks = serializers.ReadOnlyField()

    class Meta:
        model = Program
        fields = [
            'id', 'trainer', 'trainer_name', 'name', 'description',
            'duration', 'duration_display', 'modality', 'modality_display',
            'experience_level', 'experience_level_display',
            'goals', 'requirements', 'weeks', 'total_weeks',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'trainer', 'created_at', 'updated_at']


class ProgramCreateSerializer(serializers.ModelSerializer):
    """Create program"""
    class Meta:
        model = Program
        fields = [
            'name', 'description', 'duration', 'modality',
            'experience_level', 'goals', 'requirements'
        ]


class ClientWorkoutAssignmentSerializer(serializers.ModelSerializer):
    """Client workout assignment with details"""
    client_name = serializers.SerializerMethodField()
    workout_template = WorkoutTemplateSerializer(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = ClientWorkoutAssignment
        fields = [
            'id', 'client', 'client_name', 'trainer',
            'workout_template', 'assigned_date', 'notes',
            'status', 'status_display', 'completed', 'completed_at',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'trainer', 'completed_at', 'created_at', 'updated_at']

    def get_client_name(self, obj):
        return f"{obj.client.first_name} {obj.client.last_name}"


class ClientWorkoutAssignmentCreateSerializer(serializers.ModelSerializer):
    """Create workout assignment"""
    class Meta:
        model = ClientWorkoutAssignment
        fields = [
            'client', 'workout_template', 'assigned_date', 'notes'
        ]


class ClientProgramAssignmentSerializer(serializers.ModelSerializer):
    """Client program assignment with details"""
    client_name = serializers.SerializerMethodField()
    program = ProgramSerializer(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    progress_percentage = serializers.ReadOnlyField()

    class Meta:
        model = ClientProgramAssignment
        fields = [
            'id', 'client', 'client_name', 'trainer', 'program',
            'start_date', 'end_date', 'status', 'status_display',
            'current_week', 'current_day', 'completed_workouts',
            'total_workouts', 'progress_percentage',
            'created_at', 'updated_at', 'completed_at'
        ]
        read_only_fields = [
            'id', 'trainer', 'end_date', 'created_at',
            'updated_at', 'completed_at'
        ]

    def get_client_name(self, obj):
        return f"{obj.client.first_name} {obj.client.last_name}"


class ClientProgramAssignmentCreateSerializer(serializers.ModelSerializer):
    """Create program assignment"""
    class Meta:
        model = ClientProgramAssignment
        fields = ['client', 'program', 'start_date']
