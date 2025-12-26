from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'work-entries', views.WorkEntryViewSet, basename='workentry')
router.register(r'blockers', views.BlockerViewSet, basename='blocker')
router.register(r'skills', views.SkillViewSet, basename='skill')

urlpatterns = [
    path('', include(router.urls)),
    path('ai/weekly-summary/', views.generate_weekly_summary, name='weekly-summary'),
    path('ai/one-on-one-prep/', views.generate_one_on_one_prep, name='one-on-one-prep'),
    path('ai/extract-skills/', views.extract_skills, name='extract-skills'),
    # GitHub Integration
    path('github/connect/', views.connect_github, name='github-connect'),
    path('github/status/', views.github_status, name='github-status'),
    path('github/sync/', views.sync_github, name='github-sync'),
]