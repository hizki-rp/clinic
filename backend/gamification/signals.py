from django.db.models.signals import post_save, m2m_changed
from django.contrib.auth.signals import user_logged_in
from django.dispatch import receiver
from django.contrib.auth.models import User
# from universities.models import UserDashboard  # Disabled - universities app removed
from .models import Achievement, UserAchievement, UserProfile

@receiver(post_save, sender=User)
def create_user_game_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.get_or_create(user=instance)

@receiver(user_logged_in)
def check_login_achievements(sender, user, request, **kwargs):
    # Award first login achievement
    award_achievement(user, 'first_login')
    
    # Update user activity for streak tracking
    profile, _ = UserProfile.objects.get_or_create(user=user)
    from django.utils import timezone
    profile.last_activity = timezone.now()
    profile.save()

@receiver(post_save, sender=User)
def check_profile_achievements(sender, instance, **kwargs):
    # Profile completion achievement
    if instance.first_name and instance.last_name and instance.email:
        award_achievement(instance, 'profile_complete')

# UserDashboard-related signals disabled - universities app removed
# @receiver(post_save, sender=UserDashboard)
# @receiver(m2m_changed, sender=UserDashboard.favorites.through)
# @receiver(m2m_changed, sender=UserDashboard.applied.through)
# @receiver(m2m_changed, sender=UserDashboard.accepted.through)
# @receiver(m2m_changed, sender=UserDashboard.visa_approved.through)

def award_achievement(user, achievement_name):
    try:
        achievement = Achievement.objects.get(name=achievement_name)
        user_achievement, created = UserAchievement.objects.get_or_create(
            user=user, 
            achievement=achievement
        )
        if created:
            profile, _ = UserProfile.objects.get_or_create(user=user)
            profile.add_points(achievement.points)
            print(f"🎉 Achievement unlocked: {user.username} earned '{achievement.name}' (+{achievement.points} points)")
    except Exception as e:
        print(f"Error awarding achievement {achievement_name}: {e}")
        pass