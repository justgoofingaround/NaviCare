from django.contrib import admin
from .models import (
    InsuranceAgent, InsuranceCarrier, InsurancePlan, Client,
    PolicyApplication, AgentCommission, AgentActivity
)


@admin.register(InsuranceAgent)
class InsuranceAgentAdmin(admin.ModelAdmin):
    list_display = ['agent_id', 'get_full_name', 'agency_name', 'certification_level', 'is_active']
    list_filter = ['certification_level', 'is_active', 'active_since']
    search_fields = ['agent_id', 'user__first_name', 'user__last_name', 'agency_name']
    readonly_fields = ['created_at', 'updated_at']
    
    def get_full_name(self, obj):
        return obj.user.get_full_name()
    get_full_name.short_description = 'Full Name'


@admin.register(InsuranceCarrier)
class InsuranceCarrierAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'type', 'is_active']
    list_filter = ['type', 'is_active']
    search_fields = ['name', 'code']


@admin.register(InsurancePlan)
class InsurancePlanAdmin(admin.ModelAdmin):
    list_display = ['plan_name', 'carrier', 'plan_type', 'tier', 'monthly_premium', 'is_active']
    list_filter = ['carrier', 'plan_type', 'tier', 'is_active']
    search_fields = ['plan_name', 'plan_code', 'carrier__name']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'agent', 'status', 'email', 'phone_number', 'last_contact_date']
    list_filter = ['status', 'agent', 'first_contact_date']
    search_fields = ['first_name', 'last_name', 'email', 'phone_number']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(PolicyApplication)
class PolicyApplicationAdmin(admin.ModelAdmin):
    list_display = ['application_number', 'client', 'agent', 'plan', 'status', 'application_date']
    list_filter = ['status', 'agent', 'application_date']
    search_fields = ['application_number', 'client__first_name', 'client__last_name']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(AgentCommission)
class AgentCommissionAdmin(admin.ModelAdmin):
    list_display = ['agent', 'commission_type', 'amount', 'pay_period', 'status']
    list_filter = ['commission_type', 'status', 'pay_period']
    search_fields = ['agent__agent_id', 'application__application_number']


@admin.register(AgentActivity)
class AgentActivityAdmin(admin.ModelAdmin):
    list_display = ['agent', 'client', 'activity_type', 'subject', 'created_at']
    list_filter = ['activity_type', 'agent', 'created_at']
    search_fields = ['agent__agent_id', 'client__first_name', 'client__last_name', 'subject']