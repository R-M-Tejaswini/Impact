from django.db import models
from django.utils import timezone

class WorkEntry(models.Model):
    ENTRY_TYPES = [
        ('coding', 'Coding'),
        ('meeting', 'Meeting'),
        ('learning', 'Learning'),
        ('review', 'Code Review'),
        ('bug_fix', 'Bug Fix'),
        ('documentation', 'Documentation'),
    ]
    
    SOURCE_TYPES = [
        ('manual', 'Manual'),
        ('github', 'GitHub'),
        ('calendar', 'Calendar'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    hours_spent = models.FloatField()
    entry_type = models.CharField(max_length=20, choices=ENTRY_TYPES, default='coding')
    tags = models.JSONField(default=list, blank=True)
    learning_notes = models.TextField(blank=True, null=True)
    source = models.CharField(max_length=20, choices=SOURCE_TYPES, default='manual')
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Work Entries'
    
    def __str__(self):
        return f"{self.title} - {self.hours_spent}hrs"


class Blocker(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('resolved', 'Resolved'),
    ]
    
    title = models.CharField(max_length=200)
    blocking_reason = models.TextField()
    waiting_on = models.CharField(max_length=100)
    hours_lost = models.FloatField(default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    created_at = models.DateTimeField(default=timezone.now)
    resolved_at = models.DateTimeField(blank=True, null=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.status}"


class Skill(models.Model):
    skill_name = models.CharField(max_length=100, unique=True)
    confidence_level = models.IntegerField(default=1)  # 1-5
    last_used = models.DateTimeField(default=timezone.now)
    times_mentioned = models.IntegerField(default=1)
    
    class Meta:
        ordering = ['-confidence_level', '-times_mentioned']
    
    def __str__(self):
        return f"{self.skill_name} (Level {self.confidence_level})"


class AISummary(models.Model):
    week_start = models.DateField()
    summary_json = models.JSONField()
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        ordering = ['-week_start']
        verbose_name_plural = 'AI Summaries'
    
    def __str__(self):
        return f"Summary for week of {self.week_start}"

class GitHubIntegration(models.Model):
    access_token = models.CharField(max_length=255)
    github_username = models.CharField(max_length=100)
    connected_at = models.DateTimeField(default=timezone.now)
    last_sync = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"GitHub: {self.github_username}"