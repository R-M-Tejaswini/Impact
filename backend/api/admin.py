from django.contrib import admin
from .models import WorkEntry, Blocker, Skill, AISummary

@admin.register(WorkEntry)
class WorkEntryAdmin(admin.ModelAdmin):
    list_display = ['title', 'entry_type', 'hours_spent', 'created_at']
    list_filter = ['entry_type', 'source', 'created_at']
    search_fields = ['title', 'description']

@admin.register(Blocker)
class BlockerAdmin(admin.ModelAdmin):
    list_display = ['title', 'waiting_on', 'hours_lost', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['title', 'waiting_on']

@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ['skill_name', 'confidence_level', 'times_mentioned', 'last_used']
    list_filter = ['confidence_level']
    search_fields = ['skill_name']

@admin.register(AISummary)
class AISummaryAdmin(admin.ModelAdmin):
    list_display = ['week_start', 'created_at']
    list_filter = ['week_start']