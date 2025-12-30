from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'work-entries', views.WorkEntryViewSet, basename='workentry')
router.register(r'blockers', views.BlockerViewSet, basename='blocker')
router.register(r'skills', views.SkillViewSet, basename='skill')
router.register(r'projects', views.ProjectViewSet, basename='project')
router.register(r'calendar', views.CalendarEventViewSet, basename='calendarevent')
router.register(r'companies', views.CompanyViewSet, basename='company')

urlpatterns = [
    path('', include(router.urls)),
    # AI endpoints
    path('ai/weekly-summary/', views.generate_weekly_summary, name='weekly-summary'),
    path('ai/summaries/', views.list_summaries, name='list-summaries'),
    path('ai/one-on-one-prep/', views.generate_one_on_one_prep, name='one-on-one-prep'),
    path('ai/extract-skills/', views.extract_skills, name='extract-skills'),
    path('ai/gap-analysis/', views.analyze_skill_gaps, name='gap-analysis'),
    # Analytics endpoints
    path('analytics/overview/', views.analytics_overview, name='analytics-overview'),
    # GitHub Integration (commented out until implemented)
    # path('github/connect/', views.connect_github, name='github-connect'),
    # path('github/status/', views.github_status, name='github-status'),
    # path('github/sync/', views.sync_github, name='github-sync'),
]