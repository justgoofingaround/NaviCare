from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils import timezone
from decimal import Decimal
from datetime import date, timedelta
import random

from insurance.models import (
    InsuranceAgent, InsuranceCarrier, InsurancePlan, Client,
    PolicyApplication, AgentCommission, AgentActivity
)


class Command(BaseCommand):
    help = 'Populate database with sample data for insurance agents'

    def handle(self, *args, **options):
        self.stdout.write('Creating sample data for insurance agents...')

        # Create sample users and agents
        self.create_agents()
        
        # Create insurance carriers
        self.create_carriers()
        
        # Create insurance plans
        self.create_plans()
        
        # Create clients for agents
        self.create_clients()
        
        # Create policy applications
        self.create_applications()
        
        # Create commissions
        self.create_commissions()
        
        # Create activities
        self.create_activities()

        self.stdout.write(self.style.SUCCESS('Successfully created sample data!'))

    def create_agents(self):
        agents_data = [
            {
                'username': 'john_agent',
                'first_name': 'John',
                'last_name': 'Smith',
                'email': 'john.smith@navicare.com',
                'agent_id': 'AGT001',
                'license_number': 'LIC12345',
                'agency_name': 'Smith Insurance Solutions',
                'phone': '+1-555-0101',
                'specialties': ['Health Insurance', 'Life Insurance'],
                'certification': 'ADVANCED'
            },
            {
                'username': 'sarah_agent',
                'first_name': 'Sarah',
                'last_name': 'Johnson',
                'email': 'sarah.johnson@navicare.com',
                'agent_id': 'AGT002',
                'license_number': 'LIC67890',
                'agency_name': 'Johnson Family Insurance',
                'phone': '+1-555-0102',
                'specialties': ['Health Insurance', 'Dental Insurance'],
                'certification': 'INTERMEDIATE'
            },
            {
                'username': 'mike_agent',
                'first_name': 'Michael',
                'last_name': 'Brown',
                'email': 'mike.brown@navicare.com',
                'agent_id': 'AGT003',
                'license_number': 'LIC11111',
                'agency_name': 'Brown Insurance Group',
                'phone': '+1-555-0103',
                'specialties': ['Health Insurance', 'Vision Insurance', 'Life Insurance'],
                'certification': 'MASTER'
            }
        ]

        for agent_data in agents_data:
            user, created = User.objects.get_or_create(
                username=agent_data['username'],
                defaults={
                    'first_name': agent_data['first_name'],
                    'last_name': agent_data['last_name'],
                    'email': agent_data['email'],
                }
            )
            
            agent, created = InsuranceAgent.objects.get_or_create(
                user=user,
                agent_id=agent_data['agent_id'],
                defaults={
                    'license_number': agent_data['license_number'],
                    'agency_name': agent_data['agency_name'],
                    'phone_number': agent_data['phone'],
                    'email': agent_data['email'],
                    'specialties': agent_data['specialties'],
                    'certification_level': agent_data['certification'],
                    'active_since': date.today() - timedelta(days=365),
                }
            )
            
            if created:
                self.stdout.write(f'Created agent: {agent.agent_id}')

    def create_carriers(self):
        carriers_data = [
            {'name': 'Blue Cross Blue Shield', 'code': 'BCBS', 'type': 'HEALTH'},
            {'name': 'Aetna', 'code': 'AET', 'type': 'HEALTH'},
            {'name': 'Cigna', 'code': 'CIG', 'type': 'HEALTH'},
            {'name': 'UnitedHealthcare', 'code': 'UHC', 'type': 'HEALTH'},
            {'name': 'Delta Dental', 'code': 'DELTA', 'type': 'DENTAL'},
            {'name': 'VSP Vision Care', 'code': 'VSP', 'type': 'VISION'},
            {'name': 'MetLife', 'code': 'MET', 'type': 'LIFE'},
        ]

        for carrier_data in carriers_data:
            carrier, created = InsuranceCarrier.objects.get_or_create(
                code=carrier_data['code'],
                defaults={
                    'name': carrier_data['name'],
                    'type': carrier_data['type'],
                    'contact_phone': '+1-800-555-0100',
                    'website': f"https://www.{carrier_data['code'].lower()}.com"
                }
            )
            
            if created:
                self.stdout.write(f'Created carrier: {carrier.name}')

    def create_plans(self):
        carriers = InsuranceCarrier.objects.all()
        plan_types = ['PPO', 'HMO', 'EPO', 'HDHP']
        tiers = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM']
        
        for carrier in carriers:
            if carrier.type == 'HEALTH':
                for i, plan_type in enumerate(plan_types):
                    for j, tier in enumerate(tiers):
                        base_premium = 200 + (i * 50) + (j * 75)
                        deductible = 1000 + (i * 500) + (j * 1000)
                        
                        plan, created = InsurancePlan.objects.get_or_create(
                            carrier=carrier,
                            plan_code=f"{carrier.code}_{plan_type}_{tier}",
                            defaults={
                                'plan_name': f"{carrier.name} {plan_type} {tier}",
                                'plan_type': plan_type,
                                'tier': tier,
                                'monthly_premium': Decimal(base_premium),
                                'annual_deductible': Decimal(deductible),
                                'max_out_of_pocket': Decimal(deductible * 3),
                                'coinsurance_percentage': 20 if plan_type != 'HMO' else 0,
                                'pcp_copay': Decimal(25),
                                'specialist_copay': Decimal(50),
                                'urgent_care_copay': Decimal(75),
                                'er_copay': Decimal(300),
                                'requires_referrals': plan_type == 'HMO',
                                'out_of_network_coverage': plan_type in ['PPO', 'POS'],
                                'commission_percentage': Decimal('5.0'),
                                'effective_date': date.today(),
                                'expiration_date': date.today() + timedelta(days=365),
                            }
                        )
                        
                        if created:
                            self.stdout.write(f'Created plan: {plan.plan_name}')

    def create_clients(self):
        agents = InsuranceAgent.objects.all()
        
        clients_data = [
            {'first_name': 'Alice', 'last_name': 'Wilson', 'age': 35, 'status': 'ACTIVE'},
            {'first_name': 'Bob', 'last_name': 'Davis', 'age': 28, 'status': 'ACTIVE'},
            {'first_name': 'Carol', 'last_name': 'Miller', 'age': 42, 'status': 'PROSPECT'},
            {'first_name': 'David', 'last_name': 'Anderson', 'age': 31, 'status': 'ACTIVE'},
            {'first_name': 'Emma', 'last_name': 'Taylor', 'age': 26, 'status': 'PROSPECT'},
            {'first_name': 'Frank', 'last_name': 'Thomas', 'age': 55, 'status': 'ACTIVE'},
            {'first_name': 'Grace', 'last_name': 'White', 'age': 33, 'status': 'ACTIVE'},
            {'first_name': 'Henry', 'last_name': 'Martin', 'age': 29, 'status': 'PROSPECT'},
        ]

        for agent in agents:
            for i, client_data in enumerate(clients_data[:3]):  # 3 clients per agent
                birth_date = date.today() - timedelta(days=client_data['age'] * 365)
                
                client, created = Client.objects.get_or_create(
                    agent=agent,
                    first_name=client_data['first_name'],
                    last_name=client_data['last_name'],
                    defaults={
                        'date_of_birth': birth_date,
                        'email': f"{client_data['first_name'].lower()}.{client_data['last_name'].lower()}@email.com",
                        'phone_number': f"+1-555-{random.randint(1000, 9999)}",
                        'address_line1': f"{random.randint(100, 999)} Main St",
                        'city': 'Anytown',
                        'state': 'CA',
                        'zip_code': '90210',
                        'status': client_data['status'],
                        'first_contact_date': date.today() - timedelta(days=random.randint(30, 365)),
                        'last_contact_date': date.today() - timedelta(days=random.randint(1, 30)),
                    }
                )
                
                if created:
                    self.stdout.write(f'Created client: {client.full_name} for agent {agent.agent_id}')

    def create_applications(self):
        clients = Client.objects.all()
        plans = InsurancePlan.objects.all()
        
        app_number = 1000
        for client in clients:
            if random.choice([True, False]):  # 50% chance of having an application
                plan = random.choice(plans)
                app_number += 1
                
                application, created = PolicyApplication.objects.get_or_create(
                    application_number=f'APP{app_number}',
                    defaults={
                        'agent': client.agent,
                        'client': client,
                        'plan': plan,
                        'application_date': date.today() - timedelta(days=random.randint(1, 60)),
                        'requested_effective_date': date.today() + timedelta(days=30),
                        'status': random.choice(['SUBMITTED', 'APPROVED', 'UNDER_REVIEW']),
                        'monthly_premium': plan.monthly_premium,
                        'commission_amount': plan.monthly_premium * 12 * plan.commission_percentage / 100,
                        'notes': 'Sample application for testing purposes',
                    }
                )
                
                if created:
                    self.stdout.write(f'Created application: {application.application_number}')

    def create_commissions(self):
        applications = PolicyApplication.objects.filter(status='APPROVED')
        
        for application in applications:
            commission, created = AgentCommission.objects.get_or_create(
                agent=application.agent,
                application=application,
                defaults={
                    'commission_type': 'INITIAL',
                    'amount': application.commission_amount,
                    'percentage': application.plan.commission_percentage,
                    'pay_period': '2024-11',
                    'status': random.choice(['CALCULATED', 'PAID']),
                    'paid_date': date.today() if random.choice([True, False]) else None,
                }
            )
            
            if created:
                self.stdout.write(f'Created commission for agent {application.agent.agent_id}')

    def create_activities(self):
        agents = InsuranceAgent.objects.all()
        clients = Client.objects.all()
        
        activity_types = ['CALL', 'EMAIL', 'MEETING', 'QUOTE', 'FOLLOW_UP']
        
        for agent in agents:
            agent_clients = clients.filter(agent=agent)
            
            for _ in range(random.randint(5, 10)):  # 5-10 activities per agent
                client = random.choice(agent_clients) if agent_clients else None
                activity_type = random.choice(activity_types)
                
                activity = AgentActivity.objects.create(
                    agent=agent,
                    client=client,
                    activity_type=activity_type,
                    subject=f"{activity_type.title()} with client",
                    description=f"Sample {activity_type.lower()} activity with {client.full_name if client else 'prospect'}",
                    outcome="Positive response" if random.choice([True, False]) else "Follow-up needed",
                    created_at=timezone.now() - timedelta(days=random.randint(1, 30))
                )
                
        self.stdout.write('Created sample activities')