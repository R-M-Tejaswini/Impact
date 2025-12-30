from django.contrib import admin
from .models import WorkEntry, Blocker, Skill, AISummary, Company, Project, CalendarEvent

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

@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ['name', 'role', 'start_date', 'is_active']
    list_filter = ['is_active', 'start_date']
    search_fields = ['name', 'role']

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['title', 'project_type', 'status', 'start_date', 'total_hours']
    list_filter = ['project_type', 'status', 'start_date']
    search_fields = ['title', 'description']

@admin.register(CalendarEvent)
class CalendarEventAdmin(admin.ModelAdmin):
    list_display = ['title', 'event_type', 'start_time', 'is_completed']
    list_filter = ['event_type', 'is_completed', 'start_time']
    search_fields = ['title']