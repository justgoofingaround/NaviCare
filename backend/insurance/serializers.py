from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    InsuranceAgent, InsuranceCarrier, InsurancePlan, Client,
    PolicyApplication, AgentCommission, AgentActivity
)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']


class InsuranceAgentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = InsuranceAgent
        fields = [
            'id', 'user', 'agent_id', 'license_number', 'agency_name',
            'phone_number', 'email', 'specialties', 'certification_level',
            'active_since', 'is_active', 'full_name'
        ]

    def get_full_name(self, obj):
        return obj.user.get_full_name()


class InsuranceCarrierSerializer(serializers.ModelSerializer):
    class Meta:
        model = InsuranceCarrier
        fields = [
            'id', 'name', 'code', 'type', 'contact_phone',
            'website', 'is_active'
        ]


class InsurancePlanSerializer(serializers.ModelSerializer):
    carrier = InsuranceCarrierSerializer(read_only=True)
    carrier_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = InsurancePlan
        fields = [
            'id', 'carrier', 'carrier_id', 'plan_name', 'plan_code', 'plan_type',
            'tier', 'monthly_premium', 'annual_deductible', 'max_out_of_pocket',
            'coinsurance_percentage', 'pcp_copay', 'specialist_copay',
            'urgent_care_copay', 'er_copay', 'requires_referrals',
            'out_of_network_coverage', 'commission_percentage',
            'effective_date', 'expiration_date', 'is_active'
        ]


class ClientSerializer(serializers.ModelSerializer):
    agent = InsuranceAgentSerializer(read_only=True)
    agent_id = serializers.IntegerField(write_only=True)
    full_name = serializers.ReadOnlyField()

    class Meta:
        model = Client
        fields = [
            'id', 'agent', 'agent_id', 'first_name', 'last_name', 'full_name',
            'date_of_birth', 'email', 'phone_number', 'address_line1',
            'address_line2', 'city', 'state', 'zip_code', 'status',
            'first_contact_date', 'last_contact_date'
        ]


class PolicyApplicationSerializer(serializers.ModelSerializer):
    agent = InsuranceAgentSerializer(read_only=True)
    client = ClientSerializer(read_only=True)
    plan = InsurancePlanSerializer(read_only=True)
    agent_id = serializers.IntegerField(write_only=True)
    client_id = serializers.IntegerField(write_only=True)
    plan_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = PolicyApplication
        fields = [
            'id', 'agent', 'client', 'plan', 'agent_id', 'client_id', 'plan_id',
            'application_number', 'application_date', 'requested_effective_date',
            'status', 'monthly_premium', 'commission_amount', 'notes',
            'submitted_at', 'approved_at', 'declined_reason'
        ]


class AgentCommissionSerializer(serializers.ModelSerializer):
    agent = InsuranceAgentSerializer(read_only=True)
    application = PolicyApplicationSerializer(read_only=True)

    class Meta:
        model = AgentCommission
        fields = [
            'id', 'agent', 'application', 'commission_type', 'amount',
            'percentage', 'pay_period', 'status', 'paid_date', 'notes'
        ]


class AgentActivitySerializer(serializers.ModelSerializer):
    agent = InsuranceAgentSerializer(read_only=True)
    client = ClientSerializer(read_only=True)
    agent_id = serializers.IntegerField(write_only=True)
    client_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = AgentActivity
        fields = [
            'id', 'agent', 'client', 'agent_id', 'client_id', 'activity_type',
            'subject', 'description', 'outcome', 'next_action',
            'scheduled_follow_up', 'created_at'
        ]


# Simplified serializers for dashboard/summary views
class ClientSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = ['id', 'first_name', 'last_name', 'status', 'last_contact_date']


class ApplicationSummarySerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client.full_name', read_only=True)
    plan_name = serializers.CharField(source='plan.plan_name', read_only=True)

    class Meta:
        model = PolicyApplication
        fields = [
            'id', 'application_number', 'client_name', 'plan_name',
            'status', 'application_date', 'monthly_premium'
        ]


class CommissionSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = AgentCommission
        fields = [
            'id', 'commission_type', 'amount', 'pay_period', 'status'
        ]