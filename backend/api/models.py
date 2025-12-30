from django.db import models
from django.utils import timezone

class Company(models.Model):
    """Company/Internship profile with tech stack"""
    name = models.CharField(max_length=200)
    tech_stack = models.JSONField(default=list)  # ["React", "Django", "PostgreSQL", "Docker"]
    role = models.CharField(max_length=100, default="Software Engineering Intern")
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        verbose_name_plural = "Companies"
    
    def __str__(self):
        return f"{self.name} - {self.role}"


class Project(models.Model):
    """Internship projects and side projects"""
    PROJECT_TYPES = [
        ('internship', 'Internship Project'),
        ('side', 'Side Project'),
        ('learning', 'Learning Project'),
    ]
    
    STATUS_CHOICES = [
        ('planning', 'Planning'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('on_hold', 'On Hold'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    project_type = models.CharField(max_length=20, choices=PROJECT_TYPES, default='internship')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='planning')
    company = models.ForeignKey(Company, on_delete=models.SET_NULL, null=True, blank=True)
    tech_stack = models.JSONField(default=list)
    start_date = models.DateField()
    target_end_date = models.DateField(null=True, blank=True)
    actual_end_date = models.DateField(null=True, blank=True)
    repository_url = models.URLField(blank=True, null=True)
    total_hours = models.FloatField(default=0)
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        ordering = ['-start_date']
    
    def __str__(self):
        return self.title
    
    def update_total_hours(self):
        """Calculate total hours from linked work entries"""
        self.total_hours = self.workentry_set.aggregate(
            models.Sum('hours_spent')
        )['hours_spent__sum'] or 0
        self.save()


class CalendarEvent(models.Model):
    """Calendar events for meetings, deadlines, etc."""
    EVENT_TYPES = [
        ('meeting', 'Meeting'),
        ('deadline', 'Deadline'),
        ('review', 'Code Review'),
        ('standup', 'Stand-up'),
        ('presentation', 'Presentation'),
        ('other', 'Other'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    event_type = models.CharField(max_length=20, choices=EVENT_TYPES, default='meeting')
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    project = models.ForeignKey(Project, on_delete=models.CASCADE, null=True, blank=True)
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        ordering = ['start_time']
    
    def __str__(self):
        return f"{self.title} - {self.start_time.strftime('%Y-%m-%d %H:%M')}"


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
    project = models.ForeignKey(Project, on_delete=models.SET_NULL, null=True, blank=True)
    
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
    waiting_on = models.CharField(max_length=200)
    hours_lost = models.FloatField(default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    created_at = models.DateTimeField(default=timezone.now)
    resolved_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def save(self, *args, **kwargs):
        # Auto-calculate hours_lost when resolved
        if self.status == 'resolved' and self.resolved_at is None:
            self.resolved_at = timezone.now()
        
        if self.resolved_at and self.created_at:
            # Calculate hours between creation and resolution
            time_diff = self.resolved_at - self.created_at
            self.hours_lost = time_diff.total_seconds() / 3600  # Convert seconds to hours
        
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.title


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