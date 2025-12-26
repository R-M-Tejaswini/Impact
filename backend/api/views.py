from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from django.utils import timezone
from datetime import datetime, timedelta
from .services.github_service import GitHubService
from .models import WorkEntry, Blocker, Skill, AISummary, GitHubIntegration
from .serializers import WorkEntrySerializer, BlockerSerializer, SkillSerializer, AISummarySerializer
from .services.gemini_ai import GeminiAIService
import logging

logger = logging.getLogger(__name__)

class WorkEntryViewSet(viewsets.ModelViewSet):
    queryset = WorkEntry.objects.all()
    serializer_class = WorkEntrySerializer
    
    @action(detail=False, methods=['get'])
    def weekly(self, request):
        """Get work entries from the past week"""
        week_ago = timezone.now() - timedelta(days=7)
        entries = self.queryset.filter(created_at__gte=week_ago)
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
            type_breakdown[entry.entry_type] = type_breakdown.get(entry.entry_type, 0) + entry.hours_spent
        
        return Response({
            'total_hours': total_hours,
            'entry_count': entry_count,
            'type_breakdown': type_breakdown,
        })


class BlockerViewSet(viewsets.ModelViewSet):
    queryset = Blocker.objects.all()
    serializer_class = BlockerSerializer
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get only active blockers"""
        blockers = self.queryset.filter(status='active')
        serializer = self.get_serializer(blockers, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        """Mark a blocker as resolved"""
        blocker = self.get_object()
        blocker.status = 'resolved'
        blocker.save()
        serializer = self.get_serializer(blocker)
        return Response(serializer.data)


class SkillViewSet(viewsets.ModelViewSet):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer


@api_view(['POST'])
def generate_weekly_summary(request):
    """Generate AI-powered weekly summary"""
    try:
        # Get work entries from past week
        week_ago = timezone.now() - timedelta(days=7)
        entries = WorkEntry.objects.filter(created_at__gte=week_ago)
        blockers = Blocker.objects.filter(created_at__gte=week_ago)
        
        # Serialize data
        entries_data = WorkEntrySerializer(entries, many=True).data
        blockers_data = BlockerSerializer(blockers, many=True).data
        
        # Generate summary using Gemini
        ai_service = GeminiAIService()
        summary = ai_service.generate_weekly_summary(entries_data, blockers_data)
        
        # Save summary
        ai_summary = AISummary.objects.create(
            week_start=week_ago.date(),
            summary_json=summary
        )
        
        return Response({
            'summary': summary,
            'id': ai_summary.id
        })
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
def generate_one_on_one_prep(request):
    """Generate 1-on-1 preparation talking points"""
    try:
        week_ago = timezone.now() - timedelta(days=7)
        entries = WorkEntry.objects.filter(created_at__gte=week_ago)
        blockers = Blocker.objects.filter(status='active')
        skills = Skill.objects.all()[:10]
        
        entries_data = WorkEntrySerializer(entries, many=True).data
        blockers_data = BlockerSerializer(blockers, many=True).data
        skills_data = SkillSerializer(skills, many=True).data
        
        logger.info(f"Skills data: {skills_data}")
        
        ai_service = GeminiAIService()
        prep = ai_service.generate_one_on_one_prep(entries_data, blockers_data, skills_data)
        
        return Response(prep)
        
    except Exception as e:
        logger.error(f"Error in generate_one_on_one_prep: {str(e)}", exc_info=True)
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
def extract_skills(request):
    """Extract skills from recent work entries"""
    try:
        # Get entries from past month
        month_ago = timezone.now() - timedelta(days=30)
        entries = WorkEntry.objects.filter(created_at__gte=month_ago)
        entries_data = WorkEntrySerializer(entries, many=True).data
        
        # Extract skills using Gemini
        ai_service = GeminiAIService()
        result = ai_service.extract_skills(entries_data)
        
        # Save/update skills in database
        for skill_data in result.get('skills', []):
            skill, created = Skill.objects.get_or_create(
                skill_name=skill_data['name'],
                defaults={
                    'confidence_level': skill_data['confidence'],
                    'times_mentioned': 1
                }
            )
            if not created:
                skill.confidence_level = max(skill.confidence_level, skill_data['confidence'])
                skill.times_mentioned += 1
                skill.last_used = timezone.now()
                skill.save()
        
        # Return all skills
        skills = Skill.objects.all()
        serializer = SkillSerializer(skills, many=True)
        return Response(serializer.data)
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
def connect_github(request):
    """Save GitHub access token"""
    token = request.data.get('access_token')
    if not token:
        return Response({'error': 'access_token required'}, status=400)
    
    try:
        service = GitHubService(token)
        user = service.get_user()
        
        integration, created = GitHubIntegration.objects.update_or_create(
            defaults={
                'access_token': token,
                'github_username': user['login'],
                'connected_at': timezone.now()
            }
        )
        
        return Response({
            'connected': True,
            'username': user['login']
        })
    except Exception as e:
        return Response({'error': str(e)}, status=400)


@api_view(['GET'])
def github_status(request):
    """Check if GitHub is connected"""
    integration = GitHubIntegration.objects.first()
    if integration:
        return Response({
            'connected': True,
            'username': integration.github_username,
            'last_sync': integration.last_sync
        })
    return Response({'connected': False})


@api_view(['POST'])
def sync_github(request):
    """Sync GitHub commits as work entries"""
    integration = GitHubIntegration.objects.first()
    if not integration:
        return Response({'error': 'GitHub not connected'}, status=400)
    
    try:
        service = GitHubService(integration.access_token)
        commits = service.get_recent_commits()
        pr_stats = service.get_pr_stats()
        
        # Create work entries from commits
        created_count = 0
        for commit in commits:
            # Avoid duplicates
            existing = WorkEntry.objects.filter(
                title__contains=commit['sha'],
                source='github'
            ).exists()
            
            if not existing:
                WorkEntry.objects.create(
                    title=f"[{commit['repo']}] {commit['message'][:100]}",
                    description=f"Commit {commit['sha']} - {commit['url']}",
                    hours_spent=0.5,  # Estimate
                    entry_type='coding',
                    source='github',
                    tags=[commit['repo']]
                )
                created_count += 1
        
        integration.last_sync = timezone.now()
        integration.save()
        
        return Response({
            'commits_imported': created_count,
            'pr_stats': pr_stats
        })
    except Exception as e:
        return Response({'error': str(e)}, status=500)