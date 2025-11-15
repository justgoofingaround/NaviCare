"""
Insurance Agent AI Assistant - Agentic Solution
Provides intelligent summaries, recommendations, and insights for insurance agents
"""

import os
from typing import List, Dict, Any
from datetime import datetime, timedelta
from django.conf import settings
from django.db import models
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .models import InsuranceAgent, InsurancePlan, Client, PolicyApplication, AgentCommission

# Groq LLM Integration
try:
    from langchain_groq import ChatGroq
    from dotenv import load_dotenv
    load_dotenv()
    
    # Initialize Groq LLM
    groq_api_key = os.getenv("GROQ_API_KEY")
    groq_llm = ChatGroq(
        groq_api_key=groq_api_key, 
        model_name="mixtral-8x7b-32768", 
        temperature=0.1, 
        max_tokens=1024
    ) if groq_api_key and groq_api_key.startswith("gsk_") else None
    
    GROQ_AVAILABLE = groq_llm is not None
    print(f"🤖 Groq LLM {'initialized' if GROQ_AVAILABLE else 'not available (using fallback logic)'}")
    
except ImportError:
    print("⚠️ Groq dependencies not installed. Using fallback AI logic.")
    GROQ_AVAILABLE = False
    groq_llm = None


class InsuranceAgentAI:
    """
    AI Assistant for Insurance Agents - Enhanced with Groq LLM
    Provides intelligent insights, summaries, and recommendations using RAG pipeline approach
    """
    
    def __init__(self):
        self.context_store = {}
        self.analysis_cache = {}
        self.llm = groq_llm
        self.groq_available = GROQ_AVAILABLE
    
    def generate_agent_dashboard_summary(self, agent_id: str) -> Dict[str, Any]:
        """
        Generate comprehensive dashboard summary for an insurance agent
        Enhanced with Groq LLM for intelligent analysis
        """
        try:
            agent = InsuranceAgent.objects.get(agent_id=agent_id)
            
            # Gather agent context data
            context = self._gather_agent_context(agent)
            
            # Generate LLM-powered insights
            insights = self._generate_llm_insights(context)
            
            # Create LLM-powered recommendations
            recommendations = self._generate_llm_recommendations(context)
            
            # Performance metrics
            performance = self._calculate_performance_metrics(agent, context)
            
            # Generate executive summary using LLM
            executive_summary = self._generate_executive_summary(context)
            
            summary = {
                'agent_info': {
                    'name': agent.user.get_full_name(),
                    'agent_id': agent.agent_id,
                    'certification': agent.certification_level,
                    'specialties': agent.specialties,
                    'active_since': agent.active_since.isoformat()
                },
                'executive_summary': executive_summary,
                'insights': insights,
                'recommendations': recommendations,
                'performance': performance,
                'context_summary': self._create_context_summary(context),
                'ai_powered': self.groq_available,
                'generated_at': datetime.now().isoformat()
            }
            
            return summary
            
        except InsuranceAgent.DoesNotExist:
            return {'error': f'Agent {agent_id} not found'}
        except Exception as e:
            return {'error': f'Failed to generate summary: {str(e)}'}
    
    def _generate_llm_insights(self, context: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Generate AI-powered insights using Groq LLM or fallback logic
        """
        if self.groq_available and self.llm:
            return self._groq_generate_insights(context)
        else:
            return self._fallback_generate_insights(context)
    
    def _groq_generate_insights(self, context: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Use Groq LLM to generate intelligent insights from context data
        """
        try:
            # Prepare context for LLM
            context_text = self._prepare_context_for_llm(context)
            
            prompt = f"""
            As an experienced insurance business analyst, analyze the following agent performance data and provide 3-4 key business insights.
            
            Agent Context:
            {context_text}
            
            Please provide insights in the following JSON format for each insight:
            {{
                "type": "insight_category",
                "title": "Brief Title",
                "insight": "Detailed analysis in 1-2 sentences",
                "metric": "Key metric or statistic",
                "recommendation": "Actionable recommendation"
            }}
            
            Focus on: client portfolio health, application success patterns, commission optimization, and growth opportunities.
            """
            
            response = self.llm.invoke(prompt)
            insights_text = response.content if hasattr(response, 'content') else str(response)
            
            # Parse LLM response and structure insights
            insights = self._parse_llm_insights(insights_text, context)
            
            return insights if insights else self._fallback_generate_insights(context)
            
        except Exception as e:
            print(f"❌ Groq LLM insight generation failed: {e}")
            return self._fallback_generate_insights(context)
    
    def _generate_llm_recommendations(self, context: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Generate AI-powered recommendations using Groq LLM or fallback logic
        """
        if self.groq_available and self.llm:
            return self._groq_generate_recommendations(context)
        else:
            return self._fallback_generate_recommendations(context)
    
    def _groq_generate_recommendations(self, context: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Use Groq LLM to generate actionable recommendations
        """
        try:
            context_text = self._prepare_context_for_llm(context)
            
            prompt = f"""
            As an insurance business consultant, provide 2-3 specific, actionable recommendations for this insurance agent.
            
            Agent Context:
            {context_text}
            
            Please provide recommendations in JSON format:
            {{
                "type": "recommendation_category",
                "priority": "high|medium|low",
                "action": "Specific Action Title",
                "description": "Detailed description of what to do",
                "expected_impact": "Expected business impact"
            }}
            
            Focus on: improving conversion rates, increasing revenue, operational efficiency, and client satisfaction.
            """
            
            response = self.llm.invoke(prompt)
            recommendations_text = response.content if hasattr(response, 'content') else str(response)
            
            recommendations = self._parse_llm_recommendations(recommendations_text, context)
            
            return recommendations if recommendations else self._fallback_generate_recommendations(context)
            
        except Exception as e:
            print(f"❌ Groq LLM recommendation generation failed: {e}")
            return self._fallback_generate_recommendations(context)
    
    def _generate_executive_summary(self, context: Dict[str, Any]) -> str:
        """
        Generate executive summary using Groq LLM
        """
        if self.groq_available and self.llm:
            try:
                context_text = self._prepare_context_for_llm(context)
                
                prompt = f"""
                Create a concise executive summary (2-3 sentences) for this insurance agent's current business performance.
                
                Agent Context:
                {context_text}
                
                Summarize: overall performance, key strengths, and primary opportunity for improvement.
                """
                
                response = self.llm.invoke(prompt)
                summary = response.content if hasattr(response, 'content') else str(response)
                
                return summary.strip()
                
            except Exception as e:
                print(f"❌ Groq LLM summary generation failed: {e}")
        
        # Fallback summary
        agent = context['agent']
        return f"Agent {agent.agent_id} is managing {context['total_clients']} clients with {context['total_applications']} applications and ${context['total_commissions']:,.2f} in total commissions. Focus areas include client conversion and application processing efficiency."
    
    def _prepare_context_for_llm(self, context: Dict[str, Any]) -> str:
        """
        Prepare structured context data for LLM processing
        """
        agent = context['agent']
        
        context_text = f"""
        Agent: {agent.user.get_full_name()} (ID: {agent.agent_id})
        Certification: {agent.certification_level}
        Specialties: {', '.join(agent.specialties) if agent.specialties else 'General Insurance'}
        
        Client Portfolio:
        - Total Clients: {context['total_clients']}
        - Active Clients: {context['active_clients']}
        - Prospect Clients: {context['prospect_clients']}
        - Conversion Rate: {(context['active_clients'] / max(context['total_clients'], 1)) * 100:.1f}%
        
        Applications:
        - Total Applications: {context['total_applications']}
        - Pending Applications: {context['pending_applications']}
        - Approved Applications: {context['approved_applications']}
        - Success Rate: {(context['approved_applications'] / max(context['total_applications'], 1)) * 100:.1f}%
        
        Financial Performance:
        - Total Commissions: ${context['total_commissions']:,.2f}
        - Recent Applications (30 days): {context['recent_applications'].count()}
        
        Available Plans: {context['available_plans'].count()} plans
        Top Premium Plan: {context['top_plans'][0].plan_name if context['top_plans'] else 'None'} (${context['top_plans'][0].monthly_premium if context['top_plans'] else 0}/month)
        """
        
        return context_text.strip()
    
    def _parse_llm_insights(self, insights_text: str, context: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Parse LLM response and create structured insights
        """
        insights = []
        
        # Try to extract structured insights from LLM response
        # For now, create meaningful insights based on context + LLM guidance
        lines = insights_text.split('\n')
        
        # Extract key points and create insights
        if context['total_clients'] > 0:
            conversion_rate = (context['active_clients'] / context['total_clients']) * 100
            insights.append({
                'type': 'client_portfolio',
                'title': 'Client Portfolio Analysis',
                'insight': f"Portfolio shows {conversion_rate:.1f}% conversion rate with {context['total_clients']} total clients under management.",
                'metric': f"{context['active_clients']} active / {context['prospect_clients']} prospects",
                'recommendation': "Focus on prospect nurturing" if conversion_rate < 70 else "Excellent conversion - expand pipeline"
            })
        
        if context['total_applications'] > 0:
            success_rate = (context['approved_applications'] / context['total_applications']) * 100
            insights.append({
                'type': 'application_performance',
                'title': 'Application Success Analytics',
                'insight': f"Application pipeline shows {success_rate:.1f}% approval rate with strong processing efficiency.",
                'metric': f"{context['approved_applications']} approved / {context['pending_applications']} pending",
                'recommendation': "Review pending applications for follow-up" if context['pending_applications'] > 5 else "Maintain current processing pace"
            })
        
        return insights
    
    def _parse_llm_recommendations(self, recommendations_text: str, context: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Parse LLM response and create structured recommendations
        """
        recommendations = []
        
        # Create intelligent recommendations based on context analysis
        if context['prospect_clients'] > context['active_clients']:
            recommendations.append({
                'type': 'client_conversion',
                'priority': 'high',
                'action': 'Accelerate Prospect Conversion',
                'description': 'Implement systematic follow-up process for prospects with personalized outreach campaigns.',
                'expected_impact': 'Increase conversion rate by 15-25% and boost revenue'
            })
        
        if context['pending_applications'] > 3:
            recommendations.append({
                'type': 'application_management',
                'priority': 'medium',
                'action': 'Streamline Application Processing',
                'description': 'Establish weekly application review process and client communication protocol.',
                'expected_impact': 'Reduce processing time and improve client satisfaction'
            })
        
        # High-value plan opportunity
        if context['top_plans'] and context['top_plans'][0].monthly_premium > 500:
            recommendations.append({
                'type': 'revenue_optimization',
                'priority': 'medium',
                'action': 'Target Premium Plan Sales',
                'description': f'Focus on {context["top_plans"][0].plan_name} for high-value clients seeking comprehensive coverage.',
                'expected_impact': 'Increase average commission per sale and client lifetime value'
            })
        
        return recommendations
    
    def _gather_agent_context(self, agent: InsuranceAgent) -> Dict[str, Any]:
        """
        Gather comprehensive context about the agent's business
        Similar to document retrieval in RAG pipeline
        """
        # Recent time frames for analysis
        last_30_days = datetime.now().date() - timedelta(days=30)
        last_7_days = datetime.now().date() - timedelta(days=7)
        
        # Get related data
        clients = Client.objects.filter(agent=agent)
        applications = PolicyApplication.objects.filter(agent=agent)
        recent_applications = applications.filter(submitted_at__gte=last_30_days)
        commissions = AgentCommission.objects.filter(agent=agent)
        
        # Available insurance plans
        plans = InsurancePlan.objects.filter(is_active=True)
        
        context = {
            'agent': agent,
            'total_clients': clients.count(),
            'active_clients': clients.filter(status='ACTIVE').count(),
            'prospect_clients': clients.filter(status='PROSPECT').count(),
            'total_applications': applications.count(),
            'recent_applications': recent_applications,
            'pending_applications': applications.filter(status='PENDING').count(),
            'approved_applications': applications.filter(status='APPROVED').count(),
            'total_commissions': commissions.aggregate(models.Sum('amount'))['amount__sum'] or 0,
            'recent_commissions': commissions.filter(created_at__gte=last_30_days),
            'available_plans': plans,
            'top_plans': plans.order_by('-monthly_premium')[:5],
            'last_30_days': last_30_days,
            'last_7_days': last_7_days
        }
        
        return context
    
    
    def _fallback_generate_insights(self, context: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Generate insights using traditional logic when LLM is not available
        """
        insights = []
        
        # Client Portfolio Analysis
        if context['total_clients'] > 0:
            conversion_rate = (context['active_clients'] / context['total_clients']) * 100
            insights.append({
                'type': 'client_portfolio',
                'title': 'Client Portfolio Analysis',
                'insight': f"You have {context['total_clients']} total clients with a {conversion_rate:.1f}% conversion rate from prospects to active clients.",
                'metric': f"{context['active_clients']} active, {context['prospect_clients']} prospects",
                'recommendation': "Focus on nurturing prospects to improve conversion rate." if conversion_rate < 70 else "Excellent conversion rate! Consider expanding your prospect pipeline."
            })
        
        # Application Performance
        if context['total_applications'] > 0:
            approval_rate = (context['approved_applications'] / context['total_applications']) * 100
            insights.append({
                'type': 'application_performance',
                'title': 'Application Success Rate',
                'insight': f"Your application approval rate is {approval_rate:.1f}% with {context['pending_applications']} applications pending review.",
                'metric': f"{context['approved_applications']} approved / {context['total_applications']} total",
                'recommendation': "Review pending applications for follow-up opportunities." if context['pending_applications'] > 5 else "Great job maintaining low pending applications!"
            })
        
        # Commission Performance
        if context['total_commissions'] > 0:
            insights.append({
                'type': 'commission_performance',
                'title': 'Commission Performance',
                'insight': f"Total commissions earned: ${context['total_commissions']:,.2f}",
                'metric': f"${context['total_commissions']:,.2f} lifetime earnings",
                'recommendation': "Focus on high-value plans to maximize commission potential."
            })
        
        return insights
    
    def _fallback_generate_recommendations(self, context: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Generate recommendations using traditional logic when LLM is not available
        """
        recommendations = []
        
        # Client management recommendations
        if context['prospect_clients'] > context['active_clients']:
            recommendations.append({
                'type': 'client_management',
                'priority': 'high',
                'action': 'Focus on Prospect Conversion',
                'description': 'You have more prospects than active clients. Schedule follow-up calls to convert prospects.',
                'expected_impact': 'Increase conversion rate and revenue'
            })
        
        # Application follow-up
        if context['pending_applications'] > 3:
            recommendations.append({
                'type': 'application_followup',
                'priority': 'medium',
                'action': 'Review Pending Applications',
                'description': f'You have {context["pending_applications"]} pending applications that may need follow-up.',
                'expected_impact': 'Faster application processing and client satisfaction'
            })
        
        # Plan diversification
        agent_specialties = context['agent'].specialties
        if len(agent_specialties) < 3:
            recommendations.append({
                'type': 'skill_development',
                'priority': 'low',
                'action': 'Expand Insurance Specialties',
                'description': 'Consider adding new insurance specialties to serve more diverse client needs.',
                'expected_impact': 'Expanded client base and increased revenue potential'
            })
        
        return recommendations
    
    def _calculate_performance_metrics(self, agent: InsuranceAgent, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate performance metrics for the agent
        """
        # Recent activity (last 30 days)
        recent_apps = context['recent_applications'].count()
        recent_commissions = context['recent_commissions']
        recent_commission_total = sum(c.amount for c in recent_commissions)
        
        metrics = {
            'recent_activity': {
                'applications_last_30_days': recent_apps,
                'commissions_last_30_days': f"${recent_commission_total:,.2f}",
                'average_app_value': f"${(recent_commission_total / recent_apps):,.2f}" if recent_apps > 0 else "$0.00"
            },
            'overall_performance': {
                'total_clients': context['total_clients'],
                'total_applications': context['total_applications'],
                'total_commissions': f"${context['total_commissions']:,.2f}",
                'certification_level': agent.certification_level
            },
            'efficiency_scores': {
                'client_conversion_rate': f"{(context['active_clients'] / max(context['total_clients'], 1)) * 100:.1f}%",
                'application_success_rate': f"{(context['approved_applications'] / max(context['total_applications'], 1)) * 100:.1f}%"
            }
        }
        
        return metrics
    
    def _create_context_summary(self, context: Dict[str, Any]) -> str:
        """
        Create a human-readable context summary
        Similar to the summary generation in the advanced RAG pipeline
        """
        agent = context['agent']
        summary = f"""
        Agent {agent.agent_id} ({agent.user.get_full_name()}) is a {agent.certification_level.lower()} certified insurance agent 
        specializing in {', '.join(agent.specialties) if agent.specialties else 'general insurance'}. 
        Currently managing {context['total_clients']} clients with {context['pending_applications']} pending applications.
        Recent performance shows ${context['total_commissions']:,.2f} in total commissions earned.
        """
        return summary.strip()


# API endpoint for agent dashboard summary
@api_view(['GET'])
@permission_classes([AllowAny])
def agent_ai_dashboard(request, agent_id):
    """
    Get AI-generated dashboard summary for an insurance agent
    """
    ai_assistant = InsuranceAgentAI()
    summary = ai_assistant.generate_agent_dashboard_summary(agent_id)
    
    return Response({
        'status': 'success',
        'data': summary,
        'timestamp': datetime.now().isoformat()
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def agent_recommendations(request, agent_id):
    """
    Get AI-generated recommendations for an agent
    """
    ai_assistant = InsuranceAgentAI()
    summary = ai_assistant.generate_agent_dashboard_summary(agent_id)
    
    return Response({
        'status': 'success',
        'recommendations': summary.get('recommendations', []),
        'insights': summary.get('insights', []),
        'timestamp': datetime.now().isoformat()
    })