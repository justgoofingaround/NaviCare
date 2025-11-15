from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.db.models import Q, Sum, Count
from django.utils import timezone
from datetime import timedelta
from .models import (
    InsuranceAgent, InsuranceCarrier, InsurancePlan, Client,
    PolicyApplication, AgentCommission, AgentActivity
)
from .serializers import (
    InsuranceAgentSerializer, InsuranceCarrierSerializer, InsurancePlanSerializer,
    ClientSerializer, PolicyApplicationSerializer, AgentCommissionSerializer,
    AgentActivitySerializer, ClientSummarySerializer, ApplicationSummarySerializer,
    CommissionSummarySerializer
)


# Health check endpoint
@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def health_check(view):
    return Response({
        'status': 'healthy',
        'message': 'NaviCare Insurance Agent Backend API is running',
        'timestamp': timezone.now()
    })


# Agent Management Views
class AgentListCreateView(generics.ListCreateAPIView):
    queryset = InsuranceAgent.objects.filter(is_active=True)
    serializer_class = InsuranceAgentSerializer
    permission_classes = [permissions.AllowAny]  # Configure authentication as needed


class AgentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = InsuranceAgent.objects.all()
    serializer_class = InsuranceAgentSerializer
    permission_classes = [permissions.AllowAny]


# Insurance Carriers Views
class CarrierListView(generics.ListAPIView):
    queryset = InsuranceCarrier.objects.filter(is_active=True)
    serializer_class = InsuranceCarrierSerializer
    permission_classes = [permissions.AllowAny]


# Insurance Plans Views
class PlanListView(generics.ListAPIView):
    serializer_class = InsurancePlanSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = InsurancePlan.objects.filter(is_active=True).order_by('carrier__name', 'plan_name')
        carrier_id = self.request.query_params.get('carrier')
        plan_type = self.request.query_params.get('type')
        tier = self.request.query_params.get('tier')

        if carrier_id:
            queryset = queryset.filter(carrier_id=carrier_id)
        if plan_type:
            queryset = queryset.filter(plan_type=plan_type)
        if tier:
            queryset = queryset.filter(tier=tier)

        return queryset.select_related('carrier')


class PlanDetailView(generics.RetrieveAPIView):
    queryset = InsurancePlan.objects.filter(is_active=True)
    serializer_class = InsurancePlanSerializer
    permission_classes = [permissions.AllowAny]


# Client Management Views
class ClientListCreateView(generics.ListCreateAPIView):
    serializer_class = ClientSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        agent_id = self.request.query_params.get('agent')
        status_filter = self.request.query_params.get('status')
        search = self.request.query_params.get('search')

        queryset = Client.objects.all()

        if agent_id:
            queryset = queryset.filter(agent_id=agent_id)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if search:
            queryset = queryset.filter(
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(email__icontains=search)
            )

        return queryset.select_related('agent__user')


class ClientDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer
    permission_classes = [permissions.AllowAny]


# Policy Application Views
class ApplicationListCreateView(generics.ListCreateAPIView):
    serializer_class = PolicyApplicationSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        agent_id = self.request.query_params.get('agent')
        client_id = self.request.query_params.get('client')
        status_filter = self.request.query_params.get('status')

        queryset = PolicyApplication.objects.all()

        if agent_id:
            queryset = queryset.filter(agent_id=agent_id)
        if client_id:
            queryset = queryset.filter(client_id=client_id)
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        return queryset.select_related('agent__user', 'client', 'plan__carrier')


class ApplicationDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = PolicyApplication.objects.all()
    serializer_class = PolicyApplicationSerializer
    permission_classes = [permissions.AllowAny]


# Commission Views
class CommissionListView(generics.ListAPIView):
    serializer_class = AgentCommissionSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        agent_id = self.request.query_params.get('agent')
        pay_period = self.request.query_params.get('period')
        status_filter = self.request.query_params.get('status')

        queryset = AgentCommission.objects.all()

        if agent_id:
            queryset = queryset.filter(agent_id=agent_id)
        if pay_period:
            queryset = queryset.filter(pay_period=pay_period)
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        return queryset.select_related('agent__user', 'application__client')


# Activity Views
class ActivityListCreateView(generics.ListCreateAPIView):
    serializer_class = AgentActivitySerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        agent_id = self.request.query_params.get('agent')
        client_id = self.request.query_params.get('client')
        activity_type = self.request.query_params.get('type')

        queryset = AgentActivity.objects.all()

        if agent_id:
            queryset = queryset.filter(agent_id=agent_id)
        if client_id:
            queryset = queryset.filter(client_id=client_id)
        if activity_type:
            queryset = queryset.filter(activity_type=activity_type)

        return queryset.select_related('agent__user', 'client')


# Dashboard/Analytics Views
@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def agent_dashboard(request, agent_id):
    """Get dashboard data for a specific agent"""
    try:
        agent = InsuranceAgent.objects.get(id=agent_id)
        
        # Get date ranges
        today = timezone.now().date()
        this_month_start = today.replace(day=1)
        last_month_start = (this_month_start - timedelta(days=1)).replace(day=1)
        
        # Client statistics
        total_clients = Client.objects.filter(agent=agent).count()
        active_clients = Client.objects.filter(agent=agent, status='ACTIVE').count()
        prospects = Client.objects.filter(agent=agent, status='PROSPECT').count()
        
        # Application statistics
        applications_this_month = PolicyApplication.objects.filter(
            agent=agent,
            application_date__gte=this_month_start
        ).count()
        
        pending_applications = PolicyApplication.objects.filter(
            agent=agent,
            status__in=['SUBMITTED', 'UNDER_REVIEW']
        ).count()
        
        approved_applications = PolicyApplication.objects.filter(
            agent=agent,
            status='APPROVED',
            application_date__gte=this_month_start
        ).count()
        
        # Commission statistics
        total_commissions = AgentCommission.objects.filter(
            agent=agent,
            status='PAID'
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        pending_commissions = AgentCommission.objects.filter(
            agent=agent,
            status__in=['PENDING', 'CALCULATED']
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        # Recent activities
        recent_activities = AgentActivity.objects.filter(
            agent=agent
        ).order_by('-created_at')[:10]
        
        # Recent clients
        recent_clients = Client.objects.filter(
            agent=agent
        ).order_by('-created_at')[:5]
        
        # Recent applications
        recent_applications = PolicyApplication.objects.filter(
            agent=agent
        ).order_by('-created_at')[:5]
        
        dashboard_data = {
            'agent': InsuranceAgentSerializer(agent).data,
            'statistics': {
                'clients': {
                    'total': total_clients,
                    'active': active_clients,
                    'prospects': prospects
                },
                'applications': {
                    'this_month': applications_this_month,
                    'pending': pending_applications,
                    'approved_this_month': approved_applications
                },
                'commissions': {
                    'total_earned': float(total_commissions),
                    'pending': float(pending_commissions)
                }
            },
            'recent_activities': AgentActivitySerializer(recent_activities, many=True).data,
            'recent_clients': ClientSummarySerializer(recent_clients, many=True).data,
            'recent_applications': ApplicationSummarySerializer(recent_applications, many=True).data
        }
        
        return Response(dashboard_data)
        
    except InsuranceAgent.DoesNotExist:
        return Response(
            {'error': 'Agent not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def commission_summary(request, agent_id):
    """Get commission summary for an agent"""
    try:
        agent = InsuranceAgent.objects.get(id=agent_id)
        
        # Get commission data by pay period
        commissions = AgentCommission.objects.filter(
            agent=agent
        ).values('pay_period', 'status').annotate(
            total_amount=Sum('amount'),
            commission_count=Count('id')
        ).order_by('-pay_period')
        
        return Response({
            'agent': InsuranceAgentSerializer(agent).data,
            'commission_periods': commissions
        })
        
    except InsuranceAgent.DoesNotExist:
        return Response(
            {'error': 'Agent not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def calculate_quote(request):
    """Calculate insurance quote for a client"""
    plan_id = request.data.get('plan_id')
    client_age = request.data.get('client_age')
    coverage_amount = request.data.get('coverage_amount', 100000)
    
    try:
        plan = InsurancePlan.objects.get(id=plan_id)
        
        # Simple quote calculation (in real application, this would be more complex)
        base_premium = float(plan.monthly_premium)
        
        # Age factor
        if client_age < 30:
            age_factor = 0.8
        elif client_age < 50:
            age_factor = 1.0
        else:
            age_factor = 1.2
            
        quoted_premium = base_premium * age_factor
        
        quote_data = {
            'plan': InsurancePlanSerializer(plan).data,
            'quoted_premium': round(quoted_premium, 2),
            'annual_premium': round(quoted_premium * 12, 2),
            'commission_estimate': round(quoted_premium * 12 * float(plan.commission_percentage) / 100, 2),
            'quote_valid_until': (timezone.now() + timedelta(days=30)).date(),
            'factors_applied': {
                'age_factor': age_factor,
                'base_premium': base_premium
            }
        }
        
        return Response(quote_data)
        
    except InsurancePlan.DoesNotExist:
        return Response(
            {'error': 'Insurance plan not found'},
            status=status.HTTP_404_NOT_FOUND
        )