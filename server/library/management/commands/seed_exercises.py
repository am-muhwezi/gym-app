from django.core.management.base import BaseCommand
from library.models import ExerciseLibrary


class Command(BaseCommand):
    help = 'Seed global exercise library with common exercises'

    def handle(self, *args, **kwargs):
        exercises = [
            # Strength - Upper Body
            {
                'name': 'Barbell Bench Press',
                'modality': 'strength',
                'muscle_groups': ['chest', 'triceps', 'shoulders'],
                'category': 'strength',
                'description': 'Lie on bench, lower bar to chest, press up. Classic upper body builder.'
            },
            {
                'name': 'Dumbbell Shoulder Press',
                'modality': 'strength',
                'muscle_groups': ['shoulders', 'triceps'],
                'category': 'strength',
                'description': 'Press dumbbells overhead from shoulder level. Great for shoulder development.'
            },
            {
                'name': 'Barbell Row',
                'modality': 'strength',
                'muscle_groups': ['back', 'biceps'],
                'category': 'strength',
                'description': 'Bend forward, pull bar to lower chest. Fundamental back exercise.'
            },
            {
                'name': 'Pull-ups',
                'modality': 'strength',
                'muscle_groups': ['back', 'biceps'],
                'category': 'bodyweight',
                'description': 'Hang from bar, pull chin over bar. Classic bodyweight strength move.'
            },
            {
                'name': 'Dips',
                'modality': 'strength',
                'muscle_groups': ['chest', 'triceps', 'shoulders'],
                'category': 'bodyweight',
                'description': 'Lower body between parallel bars, press back up. Great for upper body.'
            },
            {
                'name': 'Incline Dumbbell Press',
                'modality': 'strength',
                'muscle_groups': ['chest', 'shoulders', 'triceps'],
                'category': 'strength',
                'description': 'Press dumbbells on incline bench. Targets upper chest.'
            },
            {
                'name': 'Lat Pulldown',
                'modality': 'strength',
                'muscle_groups': ['back', 'biceps'],
                'category': 'strength',
                'description': 'Pull bar down to chest while seated. Great for back width.'
            },

            # Strength - Lower Body
            {
                'name': 'Barbell Back Squat',
                'modality': 'strength',
                'muscle_groups': ['quads', 'glutes', 'hamstrings'],
                'category': 'strength',
                'description': 'Squat with bar on upper back. The king of leg exercises.'
            },
            {
                'name': 'Deadlift',
                'modality': 'weightlifting',
                'muscle_groups': ['back', 'glutes', 'hamstrings'],
                'category': 'strength',
                'description': 'Lift bar from ground to hip level. Ultimate full-body strength builder.'
            },
            {
                'name': 'Romanian Deadlift',
                'modality': 'strength',
                'muscle_groups': ['hamstrings', 'glutes', 'lower_back'],
                'category': 'strength',
                'description': 'Hip hinge movement with slight knee bend. Excellent for hamstrings.'
            },
            {
                'name': 'Leg Press',
                'modality': 'strength',
                'muscle_groups': ['quads', 'glutes'],
                'category': 'strength',
                'description': 'Press platform with feet. Safe machine-based leg builder.'
            },
            {
                'name': 'Walking Lunges',
                'modality': 'strength',
                'muscle_groups': ['quads', 'glutes', 'hamstrings'],
                'category': 'bodyweight',
                'description': 'Step forward into lunge, alternate legs. Great functional movement.'
            },
            {
                'name': 'Bulgarian Split Squat',
                'modality': 'strength',
                'muscle_groups': ['quads', 'glutes'],
                'category': 'strength',
                'description': 'Rear foot elevated single leg squat. Challenging unilateral exercise.'
            },
            {
                'name': 'Leg Curl',
                'modality': 'strength',
                'muscle_groups': ['hamstrings'],
                'category': 'strength',
                'description': 'Curl weight with legs while prone or seated. Isolates hamstrings.'
            },
            {
                'name': 'Leg Extension',
                'modality': 'strength',
                'muscle_groups': ['quads'],
                'category': 'strength',
                'description': 'Extend legs against resistance. Quad isolation exercise.'
            },

            # Cardio
            {
                'name': 'Treadmill Running',
                'modality': 'cardio',
                'muscle_groups': ['quads', 'hamstrings', 'calves'],
                'category': 'timed',
                'description': 'Steady state or interval running on treadmill.'
            },
            {
                'name': 'Rowing Machine',
                'modality': 'cardio',
                'muscle_groups': ['back', 'quads', 'hamstrings'],
                'category': 'timed',
                'description': 'Full body cardio movement on rowing ergometer.'
            },
            {
                'name': 'Assault Bike',
                'modality': 'cardio',
                'muscle_groups': ['quads', 'shoulders'],
                'category': 'timed',
                'description': 'High intensity bike with moving handles. Brutal cardio.'
            },
            {
                'name': 'Jump Rope',
                'modality': 'cardio',
                'muscle_groups': ['calves', 'shoulders'],
                'category': 'timed',
                'description': 'Continuous rope jumping. Classic cardio conditioning.'
            },
            {
                'name': 'Elliptical',
                'modality': 'cardio',
                'muscle_groups': ['quads', 'hamstrings'],
                'category': 'timed',
                'description': 'Low-impact cardio machine. Joint-friendly option.'
            },
            {
                'name': 'Stair Climber',
                'modality': 'cardio',
                'muscle_groups': ['quads', 'glutes', 'calves'],
                'category': 'timed',
                'description': 'Simulates stair climbing. Great for lower body cardio.'
            },

            # Conditioning/Power
            {
                'name': 'Burpees',
                'modality': 'conditioning',
                'muscle_groups': ['chest', 'quads', 'abs'],
                'category': 'bodyweight',
                'description': 'Squat, plank, push-up, jump. Full body conditioning classic.'
            },
            {
                'name': 'Box Jumps',
                'modality': 'power',
                'muscle_groups': ['quads', 'glutes', 'calves'],
                'category': 'bodyweight',
                'description': 'Jump onto elevated box. Develops explosive power.'
            },
            {
                'name': 'Kettlebell Swings',
                'modality': 'conditioning',
                'muscle_groups': ['glutes', 'hamstrings', 'shoulders'],
                'category': 'strength',
                'description': 'Hip hinge swing kettlebell to shoulder height. Dynamic full body move.'
            },
            {
                'name': 'Battle Ropes',
                'modality': 'conditioning',
                'muscle_groups': ['shoulders', 'back', 'abs'],
                'category': 'timed',
                'description': 'Create waves with heavy ropes. Intense shoulder and cardio work.'
            },
            {
                'name': 'Thrusters',
                'modality': 'conditioning',
                'muscle_groups': ['quads', 'shoulders'],
                'category': 'strength',
                'description': 'Front squat to overhead press. Demanding full body exercise.'
            },
            {
                'name': 'Wall Balls',
                'modality': 'conditioning',
                'muscle_groups': ['quads', 'shoulders'],
                'category': 'strength',
                'description': 'Squat and throw medicine ball to target. CrossFit staple.'
            },
            {
                'name': 'Broad Jumps',
                'modality': 'power',
                'muscle_groups': ['quads', 'glutes', 'calves'],
                'category': 'bodyweight',
                'description': 'Jump forward for distance. Tests explosive power.'
            },
            {
                'name': 'Tuck Jumps',
                'modality': 'power',
                'muscle_groups': ['quads', 'abs'],
                'category': 'bodyweight',
                'description': 'Jump and bring knees to chest. Explosive plyometric.'
            },
            {
                'name': 'Farmer\'s Carry',
                'modality': 'conditioning',
                'muscle_groups': ['forearms', 'shoulders', 'back'],
                'category': 'timed',
                'description': 'Walk with heavy weights in hands. Grip and core builder.'
            },

            # Core
            {
                'name': 'Plank',
                'modality': 'strength',
                'muscle_groups': ['abs', 'lower_back'],
                'category': 'timed',
                'description': 'Hold straight body position on forearms. Core stability essential.'
            },
            {
                'name': 'Russian Twists',
                'modality': 'strength',
                'muscle_groups': ['abs'],
                'category': 'bodyweight',
                'description': 'Seated rotation with weight. Targets obliques.'
            },
            {
                'name': 'Hanging Leg Raises',
                'modality': 'strength',
                'muscle_groups': ['abs'],
                'category': 'bodyweight',
                'description': 'Hang from bar, raise legs to horizontal. Advanced core exercise.'
            },
            {
                'name': 'Mountain Climbers',
                'modality': 'conditioning',
                'muscle_groups': ['abs', 'shoulders', 'quads'],
                'category': 'timed',
                'description': 'Alternate knee drives in plank position. Dynamic core and cardio.'
            },
            {
                'name': 'Ab Wheel Rollout',
                'modality': 'strength',
                'muscle_groups': ['abs', 'shoulders'],
                'category': 'bodyweight',
                'description': 'Roll wheel forward while maintaining stability. Challenging core move.'
            },

            # Olympic Lifts
            {
                'name': 'Clean and Jerk',
                'modality': 'weightlifting',
                'muscle_groups': ['quads', 'back', 'shoulders'],
                'category': 'strength',
                'description': 'Pull bar from ground to overhead in two motions. Olympic lift.'
            },
            {
                'name': 'Snatch',
                'modality': 'weightlifting',
                'muscle_groups': ['quads', 'back', 'shoulders'],
                'category': 'strength',
                'description': 'One motion ground to overhead. Technical Olympic lift.'
            },
            {
                'name': 'Power Clean',
                'modality': 'power',
                'muscle_groups': ['quads', 'back', 'shoulders'],
                'category': 'strength',
                'description': 'Explosive pull to shoulders. Power development exercise.'
            },
            {
                'name': 'Turkish Get-Up',
                'modality': 'strength',
                'muscle_groups': ['shoulders', 'abs', 'quads'],
                'category': 'strength',
                'description': 'Stand from lying with weight overhead. Complex full body movement.'
            },

            # Bodyweight
            {
                'name': 'Push-ups',
                'modality': 'strength',
                'muscle_groups': ['chest', 'triceps', 'shoulders'],
                'category': 'bodyweight',
                'description': 'Lower chest to ground, press up. Fundamental push exercise.'
            },
            {
                'name': 'Air Squats',
                'modality': 'conditioning',
                'muscle_groups': ['quads', 'glutes'],
                'category': 'bodyweight',
                'description': 'Bodyweight squat. Basic leg movement pattern.'
            },
            {
                'name': 'Sit-ups',
                'modality': 'strength',
                'muscle_groups': ['abs'],
                'category': 'bodyweight',
                'description': 'Traditional ab exercise. Curl torso to knees.'
            },

            # Yoga/Mobility
            {
                'name': 'Downward Dog',
                'modality': 'yoga',
                'muscle_groups': ['back', 'hamstrings', 'shoulders'],
                'category': 'timed',
                'description': 'Inverted V-shape yoga pose. Stretches posterior chain.'
            },
            {
                'name': 'Warrior II',
                'modality': 'yoga',
                'muscle_groups': ['quads', 'glutes'],
                'category': 'timed',
                'description': 'Standing yoga pose with arms extended. Builds leg strength and balance.'
            },
            {
                'name': 'Child\'s Pose',
                'modality': 'cooldown',
                'muscle_groups': ['back'],
                'category': 'timed',
                'description': 'Resting yoga pose. Gentle stretch for back and hips.'
            },
            {
                'name': 'Cat-Cow Stretch',
                'modality': 'mobility',
                'muscle_groups': ['back', 'abs'],
                'category': 'timed',
                'description': 'Spinal flexion and extension on hands and knees. Great for mobility.'
            },
            {
                'name': 'Hip Circles',
                'modality': 'warmup',
                'muscle_groups': ['glutes'],
                'category': 'timed',
                'description': 'Circular hip mobility movement. Warms up hip joint.'
            },

            # Warmup/Cooldown
            {
                'name': 'Dynamic Stretching',
                'modality': 'warmup',
                'muscle_groups': [],
                'category': 'timed',
                'description': 'Active movement through range of motion. Prepares body for exercise.'
            },
            {
                'name': 'Static Stretching',
                'modality': 'cooldown',
                'muscle_groups': [],
                'category': 'timed',
                'description': 'Hold stretches for 20-30 seconds. Post-workout flexibility work.'
            },
            {
                'name': 'Foam Rolling',
                'modality': 'cooldown',
                'muscle_groups': [],
                'category': 'timed',
                'description': 'Self-myofascial release. Recovery tool for sore muscles.'
            },

            # Arms
            {
                'name': 'Bicep Curls',
                'modality': 'strength',
                'muscle_groups': ['biceps'],
                'category': 'strength',
                'description': 'Curl weight from hip to shoulder. Classic bicep builder.'
            },
            {
                'name': 'Tricep Extensions',
                'modality': 'strength',
                'muscle_groups': ['triceps'],
                'category': 'strength',
                'description': 'Extend weight overhead. Isolates triceps.'
            },
            {
                'name': 'Hammer Curls',
                'modality': 'strength',
                'muscle_groups': ['biceps', 'forearms'],
                'category': 'strength',
                'description': 'Neutral grip bicep curl. Also hits forearms.'
            },
            {
                'name': 'Tricep Dips',
                'modality': 'strength',
                'muscle_groups': ['triceps', 'chest'],
                'category': 'bodyweight',
                'description': 'Dips on bench or bars. Great tricep builder.'
            },

            # Accessories
            {
                'name': 'Face Pulls',
                'modality': 'strength',
                'muscle_groups': ['shoulders', 'back'],
                'category': 'strength',
                'description': 'Pull rope to face level. Excellent for rear delts and posture.'
            },
            {
                'name': 'Lateral Raises',
                'modality': 'strength',
                'muscle_groups': ['shoulders'],
                'category': 'strength',
                'description': 'Raise dumbbells to side. Targets medial deltoids.'
            },
            {
                'name': 'Calf Raises',
                'modality': 'strength',
                'muscle_groups': ['calves'],
                'category': 'strength',
                'description': 'Rise onto toes. Builds calf muscles.'
            },
            {
                'name': 'Overhead Squat',
                'modality': 'weightlifting',
                'muscle_groups': ['quads', 'shoulders', 'abs'],
                'category': 'strength',
                'description': 'Squat while holding bar overhead. Tests mobility and stability.'
            },
            {
                'name': 'Front Squat',
                'modality': 'strength',
                'muscle_groups': ['quads', 'glutes', 'abs'],
                'category': 'strength',
                'description': 'Squat with bar on front of shoulders. More quad-dominant.'
            },
        ]

        created_count = 0
        updated_count = 0

        for exercise_data in exercises:
            exercise, created = ExerciseLibrary.objects.get_or_create(
                name=exercise_data['name'],
                is_global=True,
                defaults={
                    'trainer': None,
                    'description': exercise_data['description'],
                    'modality': exercise_data['modality'],
                    'muscle_groups': exercise_data['muscle_groups'],
                    'category': exercise_data['category'],
                }
            )
            if created:
                created_count += 1
            else:
                # Update existing if needed
                updated = False
                if exercise.description != exercise_data['description']:
                    exercise.description = exercise_data['description']
                    updated = True
                if exercise.modality != exercise_data['modality']:
                    exercise.modality = exercise_data['modality']
                    updated = True
                if exercise.category != exercise_data['category']:
                    exercise.category = exercise_data['category']
                    updated = True
                if set(exercise.muscle_groups) != set(exercise_data['muscle_groups']):
                    exercise.muscle_groups = exercise_data['muscle_groups']
                    updated = True

                if updated:
                    exercise.save()
                    updated_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully seeded exercise library: {created_count} created, {updated_count} updated'
            )
        )
