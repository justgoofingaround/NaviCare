from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class InsuranceAgent(models.Model):
    """Extended user profile for insurance agents"""
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    agent_id = models.CharField(max_length=50, unique=True)
    license_number = models.CharField(max_length=100)
    agency_name = models.CharField(max_length=200)
    phone_number = models.CharField(max_length=20)
    email = models.EmailField()
    specialties = models.JSONField(default=list)  # List of insurance specialties
    certification_level = models.CharField(
        max_length=50,
        choices=[
            ('BASIC', 'Basic Certification'),
            ('INTERMEDIATE', 'Intermediate Certification'),
            ('ADVANCED', 'Advanced Certification'),
            ('MASTER', 'Master Agent'),
        ],
        default='BASIC'
    )
    active_since = models.DateField(default=timezone.now)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Agent {self.agent_id} - {self.user.get_full_name()}"

    class Meta:
        db_table = 'insurance_agents'


class InsuranceCarrier(models.Model):
    """Insurance companies/carriers"""
    name = models.CharField(max_length=200, unique=True)
    code = models.CharField(max_length=10, unique=True)
    type = models.CharField(
        max_length=50,
        choices=[
            ('HEALTH', 'Health Insurance'),
            ('DENTAL', 'Dental Insurance'),
            ('VISION', 'Vision Insurance'),
            ('LIFE', 'Life Insurance'),
            ('DISABILITY', 'Disability Insurance'),
        ]
    )
    contact_phone = models.CharField(max_length=20, blank=True)
    website = models.URLField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.code})"

    class Meta:
        db_table = 'insurance_carriers'


class InsurancePlan(models.Model):
    """Insurance plans that agents can sell"""
    carrier = models.ForeignKey(InsuranceCarrier, on_delete=models.CASCADE, related_name='plans')
    plan_name = models.CharField(max_length=200)
    plan_code = models.CharField(max_length=50)
    plan_type = models.CharField(
        max_length=50,
        choices=[
            ('PPO', 'Preferred Provider Organization'),
            ('HMO', 'Health Maintenance Organization'),
            ('EPO', 'Exclusive Provider Organization'),
            ('POS', 'Point of Service'),
            ('HDHP', 'High Deductible Health Plan'),
        ]
    )
    tier = models.CharField(
        max_length=50,
        choices=[
            ('BRONZE', 'Bronze'),
            ('SILVER', 'Silver'),
            ('GOLD', 'Gold'),
            ('PLATINUM', 'Platinum'),
        ]
    )
    
    # Financial details
    monthly_premium = models.DecimalField(max_digits=10, decimal_places=2)
    annual_deductible = models.DecimalField(max_digits=10, decimal_places=2)
    max_out_of_pocket = models.DecimalField(max_digits=10, decimal_places=2)
    coinsurance_percentage = models.IntegerField(default=20)  # After deductible
    
    # Copays
    pcp_copay = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    specialist_copay = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    urgent_care_copay = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    er_copay = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    
    # Plan rules
    requires_referrals = models.BooleanField(default=False)
    out_of_network_coverage = models.BooleanField(default=False)
    
    # Agent commission
    commission_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    effective_date = models.DateField()
    expiration_date = models.DateField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.carrier.name} - {self.plan_name}"

    class Meta:
        db_table = 'insurance_plans'
        unique_together = ['carrier', 'plan_code']


class Client(models.Model):
    """Clients managed by insurance agents"""
    agent = models.ForeignKey(InsuranceAgent, on_delete=models.CASCADE, related_name='clients')
    
    # Personal information
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    date_of_birth = models.DateField()
    ssn = models.CharField(max_length=11, blank=True)  # Format: XXX-XX-XXXX
    email = models.EmailField()
    phone_number = models.CharField(max_length=20)
    
    # Address
    address_line1 = models.CharField(max_length=200)
    address_line2 = models.CharField(max_length=200, blank=True)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=50)
    zip_code = models.CharField(max_length=10)
    
    # Client status
    status = models.CharField(
        max_length=50,
        choices=[
            ('PROSPECT', 'Prospect'),
            ('ACTIVE', 'Active Client'),
            ('LAPSED', 'Lapsed'),
            ('CANCELLED', 'Cancelled'),
        ],
        default='PROSPECT'
    )
    
    # Important dates
    first_contact_date = models.DateField(default=timezone.now)
    last_contact_date = models.DateField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    class Meta:
        db_table = 'clients'


class PolicyApplication(models.Model):
    """Insurance policy applications submitted by agents"""
    agent = models.ForeignKey(InsuranceAgent, on_delete=models.CASCADE, related_name='applications')
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='applications')
    plan = models.ForeignKey(InsurancePlan, on_delete=models.CASCADE, related_name='applications')
    
    application_number = models.CharField(max_length=100, unique=True)
    application_date = models.DateField(default=timezone.now)
    requested_effective_date = models.DateField()
    
    status = models.CharField(
        max_length=50,
        choices=[
            ('DRAFT', 'Draft'),
            ('SUBMITTED', 'Submitted'),
            ('UNDER_REVIEW', 'Under Review'),
            ('APPROVED', 'Approved'),
            ('DECLINED', 'Declined'),
            ('WITHDRAWN', 'Withdrawn'),
        ],
        default='DRAFT'
    )
    
    # Financial details
    monthly_premium = models.DecimalField(max_digits=10, decimal_places=2)
    commission_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Application details
    notes = models.TextField(blank=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    declined_reason = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"App {self.application_number} - {self.client.full_name}"

    class Meta:
        db_table = 'policy_applications'


class AgentCommission(models.Model):
    """Commission tracking for agents"""
    agent = models.ForeignKey(InsuranceAgent, on_delete=models.CASCADE, related_name='commissions')
    application = models.ForeignKey(PolicyApplication, on_delete=models.CASCADE, related_name='commissions')
    
    commission_type = models.CharField(
        max_length=50,
        choices=[
            ('INITIAL', 'Initial Commission'),
            ('RENEWAL', 'Renewal Commission'),
            ('BONUS', 'Bonus Commission'),
            ('OVERRIDE', 'Override Commission'),
        ]
    )
    
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    percentage = models.DecimalField(max_digits=5, decimal_places=2)
    pay_period = models.CharField(max_length=20)  # e.g., "2024-01", "Q1-2024"
    
    status = models.CharField(
        max_length=50,
        choices=[
            ('PENDING', 'Pending'),
            ('CALCULATED', 'Calculated'),
            ('PAID', 'Paid'),
            ('DISPUTED', 'Disputed'),
        ],
        default='PENDING'
    )
    
    paid_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.agent.agent_id} - ${self.amount} ({self.commission_type})"

    class Meta:
        db_table = 'agent_commissions'


class AgentActivity(models.Model):
    """Activity log for agents"""
    agent = models.ForeignKey(InsuranceAgent, on_delete=models.CASCADE, related_name='activities')
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='activities', null=True, blank=True)
    
    activity_type = models.CharField(
        max_length=50,
        choices=[
            ('CALL', 'Phone Call'),
            ('EMAIL', 'Email'),
            ('MEETING', 'Meeting'),
            ('QUOTE', 'Quote Generated'),
            ('APPLICATION', 'Application Submitted'),
            ('FOLLOW_UP', 'Follow Up'),
            ('POLICY_CHANGE', 'Policy Change'),
            ('CLAIM_ASSISTANCE', 'Claim Assistance'),
        ]
    )
    
    subject = models.CharField(max_length=200)
    description = models.TextField()
    outcome = models.TextField(blank=True)
    next_action = models.TextField(blank=True)
    scheduled_follow_up = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.agent.agent_id} - {self.activity_type} - {self.subject}"

    class Meta:
        db_table = 'agent_activities'
        ordering = ['-created_at']