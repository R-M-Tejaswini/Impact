from rest_framework import serializers
from .models import WorkEntry, Blocker, Skill, AISummary

class WorkEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkEntry
        fields = ['id', 'title', 'description', 'hours_spent', 'entry_type', 'tags', 'learning_notes', 'source', 'created_at']
    
    def validate_hours_spent(self, value):
        if value < 0:
            raise serializers.ValidationError("Hours spent must be positive")
        return value


class BlockerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Blocker
        fields = '__all__'
        read_only_fields = ['created_at']


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