from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
# from universities.models import UserDashboard  # Disabled - universities app removed
from gamification.models import Achievement, UserAchievement, UserProfile

class Command(BaseCommand):
    help = 'Award achievements to existing users based on their current data'

    def handle(self, *args, **options):
        self.stdout.write(
            self.style.WARNING(
                'Command disabled: universities app has been removed from this healthcare project'
            )
        )
        return

    def award_achievement(self, user, achievement_name):
        try:
            achievement = Achievement.objects.get(name=achievement_name)
            user_achievement, created = UserAchievement.objects.get_or_create(
                user=user, 
                achievement=achievement
            )
            if created:
                profile, _ = UserProfile.objects.get_or_create(user=user)
                profile.add_points(achievement.points)
                return True
        except Achievement.DoesNotExist:
            pass
        return False