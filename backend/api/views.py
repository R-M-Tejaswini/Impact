from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from django.utils import timezone
from datetime import datetime, timedelta
from django.db import models
import logging

logger = logging.getLogger(__name__)

# Import all models
from .models import WorkEntry, Blocker, Skill, AISummary, GitHubIntegration, Company, Project, CalendarEvent
from .serializers import WorkEntrySerializer, BlockerSerializer, SkillSerializer, AISummarySerializer, CompanySerializer, ProjectSerializer, CalendarEventSerializer
from .services.gemini_ai import GeminiAIService

class WorkEntryViewSet(viewsets.ModelViewSet):
    queryset = WorkEntry.objects.all().order_by('-created_at')  # ✅ Order by newest first
    serializer_class = WorkEntrySerializer
    
    @action(detail=False, methods=['get'])
    def weekly(self, request):
        """Get work entries from the past week"""
        week_ago = timezone.now() - timedelta(days=7)
        entries = self.queryset.filter(created_at__gte=week_ago).order_by('-created_at')
        serializer = self.get_serializer(entries, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get statistics about work entries"""
        week_ago = timezone.now() - timedelta(days=7)
        entries = self.queryset.filter(created_at__gte=week_ago)
        
        total_hours = sum(e.hours_spent for e in entries)
        entry_count = entries.count()
        
        # Group by type
        type_breakdown = {}
        for entry in entries:
            type_key = entry.entry_type or 'other'
            type_breakdown[type_key] = type_breakdown.get(type_key, 0) + entry.hours_spent
        
        return Response({
            'total_hours': total_hours,
            'entry_count': entry_count,
            'type_breakdown': type_breakdown,
        })


class BlockerViewSet(viewsets.ModelViewSet):
    queryset = Blocker.objects.all().order_by('-created_at')
    serializer_class = BlockerSerializer
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get active blockers only"""
        active = self.queryset.filter(status='active').order_by('-created_at')
        serializer = self.get_serializer(active, many=True)
        return Response(serializer.data)


class SkillViewSet(viewsets.ModelViewSet):
    queryset = Skill.objects.all().order_by('-confidence_level')  # ✅ Order by confidence
    serializer_class = SkillSerializer


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all().order_by('-start_date')  # ✅ Order by newest
    serializer_class = ProjectSerializer
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get active projects"""
        active = self.queryset.filter(status__in=['planning', 'in_progress']).order_by('-start_date')
        serializer = self.get_serializer(active, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def completed(self, request):
        """Get completed projects"""
        completed = self.queryset.filter(status='completed').order_by('-actual_end_date')
        serializer = self.get_serializer(completed, many=True)
        return Response(serializer.data)


class CalendarEventViewSet(viewsets.ModelViewSet):
    queryset = CalendarEvent.objects.all().order_by('start_time')
    serializer_class = CalendarEventSerializer
    
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Get upcoming events"""
        now = timezone.now()
        upcoming = self.queryset.filter(start_time__gte=now).order_by('start_time')
        serializer = self.get_serializer(upcoming, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def week(self, request):
        """Get events for this week"""
        now = timezone.now()
        week_start = now - timedelta(days=now.weekday())
        week_end = week_start + timedelta(days=7)
        week_events = self.queryset.filter(
            start_time__gte=week_start,
            start_time__lt=week_end
        ).order_by('start_time')
        serializer = self.get_serializer(week_events, many=True)
        return Response(serializer.data)


class CompanyViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get active company"""
        active = self.queryset.filter(is_active=True).first()
        if active:
            serializer = self.get_serializer(active)
            return Response(serializer.data)
        return Response(None)


# AI & Analytics Endpoints
@api_view(['GET'])
def analytics_overview(request):
    """Get comprehensive analytics overview"""
    try:
        month_ago = timezone.now() - timedelta(days=30)
        
        # Work distribution
        entries = WorkEntry.objects.filter(created_at__gte=month_ago)
        type_breakdown = {}
        for entry in entries:
            key = entry.entry_type or 'other'
            type_breakdown[key] = type_breakdown.get(key, 0) + (entry.hours_spent or 0)
        
        # Project stats
        active_projects = Project.objects.filter(status__in=['planning', 'in_progress']).count()
        completed_projects = Project.objects.filter(status='completed').count()
        
        # Skill stats
        total_skills = Skill.objects.count()
        skills_agg = Skill.objects.aggregate(avg_confidence=models.Avg('confidence_level'))
        avg_confidence = skills_agg['avg_confidence'] or 0
        
        return Response({
            'work_distribution': type_breakdown,
            'active_projects': active_projects,
            'completed_projects': completed_projects,
            'total_skills': total_skills,
            'avg_skill_confidence': round(float(avg_confidence), 1),
            'total_hours_month': sum(type_breakdown.values()),
        })
        
    except Exception as e:
        logger.error(f"Error in analytics overview: {str(e)}", exc_info=True)
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def generate_weekly_summary(request):
    """Generate AI-powered weekly summary"""
    try:
        week_ago = timezone.now() - timedelta(days=7)
        entries = WorkEntry.objects.filter(created_at__gte=week_ago).order_by('-created_at')
        blockers = Blocker.objects.filter(created_at__gte=week_ago)
        
        entries_data = WorkEntrySerializer(entries, many=True).data
        blockers_data = BlockerSerializer(blockers, many=True).data
        
        ai_service = GeminiAIService()
        summary = ai_service.generate_weekly_summary(entries_data, blockers_data)
        
        ai_summary = AISummary.objects.create(
            week_start=week_ago.date(),
            summary_json=summary
        )
        
        return Response({
            'summary': summary,
            'id': ai_summary.id
        })
        
    except Exception as e:
        logger.error(f"Error generating summary: {str(e)}", exc_info=True)
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
def generate_one_on_one_prep(request):
    """Generate 1-on-1 preparation talking points"""
    try:
        # Get recent work
        month_ago = timezone.now() - timedelta(days=30)
        entries = WorkEntry.objects.filter(created_at__gte=month_ago).order_by('-created_at')[:20]
        
        # Get active blockers
        blockers = Blocker.objects.filter(status='active')
        
        # Get all skills
        skills = Skill.objects.all().order_by('-confidence_level')
        
        entries_data = WorkEntrySerializer(entries, many=True).data
        blockers_data = BlockerSerializer(blockers, many=True).data
        skills_data = SkillSerializer(skills, many=True).data
        
        ai_service = GeminiAIService()
        prep = ai_service.generate_one_on_one_prep(entries_data, blockers_data, skills_data)
        
        return Response(prep)
        
    except Exception as e:
        logger.error(f"Error generating 1-on-1 prep: {str(e)}", exc_info=True)
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
def extract_skills(request):
    """Extract skills from work entries"""
    try:
        entries = WorkEntry.objects.all().order_by('-created_at')[:30]
        entries_data = WorkEntrySerializer(entries, many=True).data
        
        ai_service = GeminiAIService()
        extracted_skills = ai_service.extract_skills_from_entries(entries_data)
        
        # Save extracted skills
        for skill_name in extracted_skills:
            skill, created = Skill.objects.get_or_create(
                skill_name=skill_name,
                defaults={'confidence_level': 3}
            )
        
        # Return all skills
        all_skills = Skill.objects.all().order_by('-confidence_level')
        serializer = SkillSerializer(all_skills, many=True)
        return Response(serializer.data)
        
    except Exception as e:
        logger.error(f"Error extracting skills: {str(e)}", exc_info=True)
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
def analyze_skill_gaps(request):
    """Analyze skill gaps"""
    try:
        company = Company.objects.filter(is_active=True).first()
        company_tech_stack = company.tech_stack if company else []
        
        skills = Skill.objects.all()
        skills_data = SkillSerializer(skills, many=True).data
        
        month_ago = timezone.now() - timedelta(days=30)
        entries = WorkEntry.objects.filter(created_at__gte=month_ago)
        entries_data = WorkEntrySerializer(entries, many=True).data
        
        ai_service = GeminiAIService()
        analysis = ai_service.analyze_skill_gaps(skills_data, company_tech_stack, entries_data)
        
        return Response(analysis)
        
    except Exception as e:
        logger.error(f"Error in gap analysis: {str(e)}", exc_info=True)
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def list_summaries(request):
    """Get all previous summaries"""
    try:
        summaries = AISummary.objects.all().order_by('-created_at')
        serializer = AISummarySerializer(summaries, many=True)
        return Response(serializer.data)
    except Exception as e:
        logger.error(f"Error listing summaries: {str(e)}", exc_info=True)
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )