from rest_framework import serializers
from .models import WorkEntry, Blocker, Skill, AISummary, Company, Project, CalendarEvent

class WorkEntrySerializer(serializers.ModelSerializer):
    project_title = serializers.CharField(source='project.title', read_only=True)
    
    class Meta:
        model = WorkEntry
        fields = ['id', 'title', 'description', 'hours_spent', 'entry_type', 'tags', 
                  'learning_notes', 'source', 'created_at', 'project', 'project_title']
    
    def validate_hours_spent(self, value):
        if value < 0:
            raise serializers.ValidationError("Hours spent must be positive")
        return value


class BlockerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Blocker
        fields = ['id', 'title', 'blocking_reason', 'waiting_on', 'hours_lost', 'status', 'created_at', 'resolved_at']
        read_only_fields = ['created_at', 'resolved_at', 'hours_lost']


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = '__all__'
        read_only_fields = ['last_used']


class AISummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = AISummary
        fields = '__all__'
        read_only_fields = ['created_at']


class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = '__all__'


class ProjectSerializer(serializers.ModelSerializer):
    work_entries_count = serializers.SerializerMethodField()
    company_name = serializers.CharField(source='company.name', read_only=True)
    
    class Meta:
        model = Project
        fields = '__all__'
    
    def get_work_entries_count(self, obj):
        return obj.workentry_set.count()


class CalendarEventSerializer(serializers.ModelSerializer):
    project_title = serializers.CharField(source='project.title', read_only=True)
    
    class Meta:
        model = CalendarEvent
        fields = '__all__'