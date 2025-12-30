from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta, datetime
from api.models import Company, Project, WorkEntry, Blocker, Skill, CalendarEvent
import random

class Command(BaseCommand):
    help = 'Populate database with sample data for testing'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting sample data population...'))
        
        # Clear existing data (optional)
        # Company.objects.all().delete()
        # Project.objects.all().delete()
        # WorkEntry.objects.all().delete()
        # Blocker.objects.all().delete()
        # Skill.objects.all().delete()
        # CalendarEvent.objects.all().delete()

        # 1. Create Company/Internship
        company = self._create_company()
        
        # 2. Create Skills
        skills = self._create_skills()
        
        # 3. Create Projects
        projects = self._create_projects(company)
        
        # 4. Create Work Entries
        self._create_work_entries(projects)
        
        # 5. Create Blockers
        self._create_blockers()
        
        # 6. Create Calendar Events
        self._create_calendar_events(projects)
        
        self.stdout.write(self.style.SUCCESS('✅ Sample data populated successfully!'))

    def _create_company(self):
        """Create a sample company/internship"""
        company, created = Company.objects.get_or_create(
            name='TechCorp AI',
            defaults={
                'role': 'Full Stack Engineering Intern',
                'tech_stack': ['React', 'Django', 'PostgreSQL', 'Docker', 'AWS', 'CI/CD'],
                'start_date': timezone.now().date() - timedelta(days=60),
                'end_date': timezone.now().date() + timedelta(days=30),
                'is_active': True,
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'✓ Created company: {company.name}'))
        return company

    def _create_skills(self):
        """Create sample skills"""
        skills_data = [
            {'name': 'React', 'confidence': 7},
            {'name': 'Django', 'confidence': 5},
            {'name': 'PostgreSQL', 'confidence': 6},
            {'name': 'Docker', 'confidence': 4},
            {'name': 'REST APIs', 'confidence': 8},
            {'name': 'JavaScript', 'confidence': 8},
            {'name': 'Python', 'confidence': 6},
            {'name': 'AWS EC2', 'confidence': 3},
            {'name': 'Git/GitHub', 'confidence': 9},
            {'name': 'Testing (Jest)', 'confidence': 5},
            {'name': 'SQL', 'confidence': 6},
            {'name': 'Tailwind CSS', 'confidence': 8},
        ]
        
        skills = []
        for skill_data in skills_data:
            skill, created = Skill.objects.get_or_create(
                skill_name=skill_data['name'],
                defaults={
                    'confidence_level': skill_data['confidence'],
                    'times_mentioned': random.randint(1, 5),
                    'last_used': timezone.now() - timedelta(days=random.randint(0, 7)),
                }
            )
            skills.append(skill)
            if created:
                self.stdout.write(f'  ✓ Created skill: {skill.skill_name}')
        
        return skills

    def _create_projects(self, company):
        """Create sample projects"""
        projects_data = [
            {
                'title': 'E-Commerce Dashboard',
                'description': 'Built a full-stack admin dashboard for managing products, orders, and customer data. Features include real-time analytics, inventory management, and user authentication.',
                'project_type': 'internship',
                'status': 'in_progress',
                'tech_stack': ['React', 'Django', 'PostgreSQL', 'Tailwind CSS'],
                'start_date': timezone.now().date() - timedelta(days=45),
                'target_end_date': timezone.now().date() + timedelta(days=15),
                'repository_url': 'https://github.com/yourname/ecommerce-dashboard',
            },
            {
                'title': 'User Authentication System',
                'description': 'Implemented secure JWT-based authentication with email verification, password reset, and OAuth integration.',
                'project_type': 'internship',
                'status': 'completed',
                'tech_stack': ['Django', 'PostgreSQL', 'JWT'],
                'start_date': timezone.now().date() - timedelta(days=60),
                'target_end_date': timezone.now().date() - timedelta(days=30),
                'actual_end_date': timezone.now().date() - timedelta(days=28),
                'repository_url': 'https://github.com/yourname/auth-system',
            },
            {
                'title': 'Task Management App',
                'description': 'Personal side project - built a collaborative task management app with real-time updates using WebSockets.',
                'project_type': 'side',
                'status': 'in_progress',
                'tech_stack': ['React', 'Node.js', 'MongoDB', 'Socket.io'],
                'start_date': timezone.now().date() - timedelta(days=30),
                'target_end_date': timezone.now().date() + timedelta(days=30),
                'repository_url': 'https://github.com/yourname/task-management',
            },
            {
                'title': 'Docker & Kubernetes Learning',
                'description': 'Learning project to master containerization and orchestration for production deployments.',
                'project_type': 'learning',
                'status': 'in_progress',
                'tech_stack': ['Docker', 'Kubernetes', 'AWS'],
                'start_date': timezone.now().date() - timedelta(days=14),
                'repository_url': 'https://github.com/yourname/docker-kubernetes-learning',
            },
            {
                'title': 'API Performance Optimization',
                'description': 'Optimized slow API endpoints, implemented caching strategies, and improved database query performance.',
                'project_type': 'internship',
                'status': 'completed',
                'tech_stack': ['Django', 'PostgreSQL', 'Redis'],
                'start_date': timezone.now().date() - timedelta(days=35),
                'target_end_date': timezone.now().date() - timedelta(days=10),
                'actual_end_date': timezone.now().date() - timedelta(days=9),
            },
        ]
        
        projects = []
        for proj_data in projects_data:
            proj_data['company'] = company
            project, created = Project.objects.get_or_create(
                title=proj_data['title'],
                defaults=proj_data
            )
            projects.append(project)
            if created:
                self.stdout.write(self.style.SUCCESS(f'✓ Created project: {project.title}'))
        
        return projects

    def _create_work_entries(self, projects):
        """Create sample work entries"""
        # Standalone learning entries (not linked to projects)
        standalone_entries = [
            {
                'title': 'React Hooks Deep Dive',
                'description': 'Studied custom hooks, useContext, useReducer patterns',
                'hours_spent': 3.5,
                'entry_type': 'learning',
                'learning_notes': 'Custom hooks are powerful for code reusability. Implemented useAsync hook for API calls.',
                'tags': ['React', 'JavaScript', 'Hooks'],
            },
            {
                'title': 'SQL Query Optimization',
                'description': 'Learned about indexes, query plans, and N+1 problems',
                'hours_spent': 2.5,
                'entry_type': 'learning',
                'learning_notes': 'Database indexes can dramatically improve performance. Need to practice query optimization more.',
                'tags': ['PostgreSQL', 'Database', 'Performance'],
            },
            {
                'title': 'AWS EC2 Setup & Configuration',
                'description': 'Deployed Django app to AWS EC2 instance',
                'hours_spent': 4.0,
                'entry_type': 'learning',
                'learning_notes': 'Learned about security groups, IAM, and environment variables in production.',
                'tags': ['AWS', 'DevOps', 'Deployment'],
            },
        ]

        # Project-linked entries
        project_entries = [
            # E-Commerce Dashboard entries
            {
                'project': projects[0],
                'title': 'Dashboard Home Page - UI Implementation',
                'description': 'Created responsive dashboard layout with charts and widgets using React and Tailwind CSS',
                'hours_spent': 5.0,
                'entry_type': 'coding',
                'learning_notes': 'Learned about Recharts library for data visualization. Grid layout in Tailwind is very efficient.',
                'tags': ['React', 'Tailwind CSS', 'UI', 'Frontend'],
            },
            {
                'project': projects[0],
                'title': 'Product Management API Endpoints',
                'description': 'Built REST API endpoints for CRUD operations on products',
                'hours_spent': 6.0,
                'entry_type': 'coding',
                'learning_notes': 'Used Django serializers for validation. Implemented pagination and filtering.',
                'tags': ['Django', 'REST API', 'Backend'],
            },
            {
                'project': projects[0],
                'title': 'Database Schema Design',
                'description': 'Designed and created database schema for products, orders, and users',
                'hours_spent': 4.0,
                'entry_type': 'coding',
                'learning_notes': 'Proper indexing on frequently queried fields is crucial.',
                'tags': ['PostgreSQL', 'Database Design'],
            },
            {
                'project': projects[0],
                'title': 'Code Review - Dashboard Components',
                'description': 'Attended code review for dashboard component implementation',
                'hours_spent': 1.5,
                'entry_type': 'review',
                'learning_notes': 'Feedback on prop drilling - should use Context API for deeply nested components.',
                'tags': ['React', 'Code Review', 'Best Practices'],
            },
            {
                'project': projects[0],
                'title': 'Team Standup & Planning',
                'description': 'Daily standup meeting and sprint planning session',
                'hours_spent': 1.0,
                'entry_type': 'meeting',
                'learning_notes': 'Sprint goals: Complete product management feature by end of week.',
                'tags': ['Agile', 'Team'],
            },

            # Auth System (completed project)
            {
                'project': projects[1],
                'title': 'JWT Authentication Implementation',
                'description': 'Implemented JWT token generation and validation',
                'hours_spent': 4.5,
                'entry_type': 'coding',
                'learning_notes': 'Used djangorestframework-simplejwt. Learned about token refresh strategies.',
                'tags': ['Django', 'Security', 'Authentication'],
            },
            {
                'project': projects[1],
                'title': 'Email Verification System',
                'description': 'Built email verification flow with token-based links',
                'hours_spent': 3.0,
                'entry_type': 'coding',
                'learning_notes': 'Used Celery for async email sending to avoid blocking requests.',
                'tags': ['Django', 'Celery', 'Email'],
            },

            # Docker & Kubernetes Learning
            {
                'project': projects[3],
                'title': 'Docker Tutorial & First Container',
                'description': 'Completed Docker fundamentals course and built first containerized app',
                'hours_spent': 3.5,
                'entry_type': 'learning',
                'learning_notes': 'Docker images, layers, and registries. Built Dockerfile for Django app.',
                'tags': ['Docker', 'Containerization', 'DevOps'],
            },
            {
                'project': projects[3],
                'title': 'Docker Compose for Multi-Container Apps',
                'description': 'Set up docker-compose with Django, PostgreSQL, and Redis',
                'hours_spent': 4.0,
                'entry_type': 'coding',
                'learning_notes': 'Environment variables in compose files, networking between containers.',
                'tags': ['Docker', 'Docker Compose', 'Infrastructure'],
            },
        ]

        # Create standalone entries
        for entry_data in standalone_entries:
            entry_data['source'] = 'manual'
            entry_data['created_at'] = timezone.now() - timedelta(days=random.randint(0, 60))
            WorkEntry.objects.get_or_create(
                title=entry_data['title'],
                defaults=entry_data
            )
        
        # Create project-linked entries
        for entry_data in project_entries:
            entry_data['source'] = 'manual'
            # Spread entries across past weeks
            entry_data['created_at'] = timezone.now() - timedelta(days=random.randint(0, 45))
            WorkEntry.objects.get_or_create(
                title=entry_data['title'],
                created_at=entry_data['created_at'],
                defaults=entry_data
            )

        self.stdout.write(self.style.SUCCESS(f'✓ Created {len(standalone_entries) + len(project_entries)} work entries'))

    def _create_blockers(self):
        """Create sample blockers"""
        blockers_data = [
            {
                'title': 'Waiting for API Key from DevOps',
                'blocking_reason': 'Cannot test AWS S3 integration without credentials',
                'waiting_on': 'DevOps Team',
                'hours_lost': 2.0,
                'status': 'active',
            },
            {
                'title': 'Database Migration Issue',
                'blocking_reason': 'Pending migration blocking product feature deployment',
                'waiting_on': 'Database Admin Approval',
                'hours_lost': 1.5,
                'status': 'active',
            },
            {
                'title': 'Design System Component Review',
                'blocking_reason': 'Waiting for design team approval on button component variants',
                'waiting_on': 'Design Team',
                'hours_lost': 0.5,
                'status': 'active',
            },
            {
                'title': 'Third-party API Rate Limiting',
                'blocking_reason': 'Hit rate limit on payment gateway API during testing',
                'waiting_on': 'Account Manager to increase limit',
                'hours_lost': 3.0,
                'status': 'resolved',
                'created_at': timezone.now() - timedelta(days=7),
                'resolved_at': timezone.now() - timedelta(days=5),
            },
            {
                'title': 'Node Module Dependency Conflict',
                'blocking_reason': 'Two packages require different versions of a dependency',
                'waiting_on': 'Resolve version conflict',
                'hours_lost': 1.0,
                'status': 'resolved',
                'created_at': timezone.now() - timedelta(days=14),
                'resolved_at': timezone.now() - timedelta(days=13),
            },
        ]
        
        for blocker_data in blockers_data:
            blocker_data['created_at'] = blocker_data.get('created_at', timezone.now() - timedelta(days=random.randint(0, 10)))
            Blocker.objects.get_or_create(
                title=blocker_data['title'],
                defaults=blocker_data
            )
        
        self.stdout.write(self.style.SUCCESS(f'✓ Created {len(blockers_data)} blockers'))

    def _create_calendar_events(self, projects):
        """Create sample calendar events"""
        now = timezone.now()
        
        events_data = [
            # This week
            {
                'title': 'Daily Standup',
                'event_type': 'standup',
                'start_time': now.replace(hour=10, minute=0, second=0, microsecond=0),
                'end_time': now.replace(hour=10, minute=15, second=0, microsecond=0),
                'project': projects[0],
                'is_completed': True,
            },
            {
                'title': 'Sprint Planning',
                'event_type': 'meeting',
                'start_time': now + timedelta(days=1, hours=2),
                'end_time': now + timedelta(days=1, hours=3),
                'project': projects[0],
                'is_completed': False,
            },
            {
                'title': 'Code Review - Dashboard Components',
                'event_type': 'review',
                'start_time': now + timedelta(days=2, hours=14),
                'end_time': now + timedelta(days=2, hours=15),
                'project': projects[0],
                'is_completed': False,
            },
            {
                'title': 'One-on-One with Manager',
                'event_type': 'meeting',
                'start_time': now + timedelta(days=3, hours=10),
                'end_time': now + timedelta(days=3, hours=11),
                'project': None,
                'is_completed': False,
            },
            {
                'title': 'Product Feature Deadline',
                'event_type': 'deadline',
                'start_time': now + timedelta(days=7),
                'end_time': now + timedelta(days=7, hours=1),
                'project': projects[0],
                'is_completed': False,
            },
            {
                'title': 'Architecture Discussion - API Design',
                'event_type': 'meeting',
                'start_time': now + timedelta(days=5, hours=11),
                'end_time': now + timedelta(days=5, hours=12),
                'project': projects[0],
                'is_completed': False,
            },
            {
                'title': 'Docker & Kubernetes Workshop',
                'event_type': 'meeting',
                'start_time': now + timedelta(days=10, hours=9),
                'end_time': now + timedelta(days=10, hours=11),
                'project': projects[3],
                'is_completed': False,
            },
            {
                'title': 'Performance Testing Session',
                'event_type': 'meeting',
                'start_time': now + timedelta(days=6, hours=13),
                'end_time': now + timedelta(days=6, hours=14, minutes=30),
                'project': projects[0],
                'is_completed': False,
            },
        ]
        
        for event_data in events_data:
            CalendarEvent.objects.get_or_create(
                title=event_data['title'],
                start_time=event_data['start_time'],
                defaults=event_data
            )
        
        self.stdout.write(self.style.SUCCESS(f'✓ Created {len(events_data)} calendar events'))