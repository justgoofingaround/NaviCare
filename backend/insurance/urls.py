from django.urls import path
from . import views
from .ai_agent import agent_ai_dashboard, agent_recommendations

urlpatterns = [
    # Health check
    path('health/', views.health_check, name='health_check'),
    
    # Agent management
    path('agents/', views.AgentListCreateView.as_view(), name='agent_list'),
    path('agents/<int:pk>/', views.AgentDetailView.as_view(), name='agent_detail'),
    path('agents/<int:agent_id>/dashboard/', views.agent_dashboard, name='agent_dashboard'),
    path('agents/<int:agent_id>/commissions/', views.commission_summary, name='agent_commissions'),
    
    # AI Agent Assistant - Agentic Solution
    path('agents/<str:agent_id>/ai-dashboard/', agent_ai_dashboard, name='agent_ai_dashboard'),
    path('agents/<str:agent_id>/ai-recommendations/', agent_recommendations, name='agent_ai_recommendations'),
    
    # Insurance carriers
    path('carriers/', views.CarrierListView.as_view(), name='carrier_list'),
    
    # Insurance plans
    path('plans/', views.PlanListView.as_view(), name='plan_list'),
    path('plans/<int:pk>/', views.PlanDetailView.as_view(), name='plan_detail'),
    path('quote/', views.calculate_quote, name='calculate_quote'),
    
    # Client management
    path('clients/', views.ClientListCreateView.as_view(), name='client_list'),
    path('clients/<int:pk>/', views.ClientDetailView.as_view(), name='client_detail'),
    
    # Policy applications
    path('applications/', views.ApplicationListCreateView.as_view(), name='application_list'),
    path('applications/<int:pk>/', views.ApplicationDetailView.as_view(), name='application_detail'),
    
    # Commissions
    path('commissions/', views.CommissionListView.as_view(), name='commission_list'),
    
    # Activities
    path('activities/', views.ActivityListCreateView.as_view(), name='activity_list'),
]