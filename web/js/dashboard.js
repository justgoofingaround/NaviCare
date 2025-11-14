// NaviCare Dashboard - AI Agent Workflow System
class PatientWorkflow {
    constructor() {
        this.currentStep = 'input';
        this.symptoms = '';
        this.severity = 'mild';
        this.agents = {
            patient: { name: 'Sarah Chen', status: 'active', progress: 100 },
            insurance: { name: 'InsuranceBot', status: 'standby', progress: 0 },
            doctor: { name: 'Dr. Martinez', status: 'standby', progress: 0 },
            pharmacy: { name: 'PharmBot', status: 'standby', progress: 0 },
            coordinator: { name: 'CareSync', status: 'standby', progress: 0 }
        };
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateProgress();
        this.loadMockData();
        this.showNotification('Welcome to NaviCare! Please describe your symptoms.', 'info');
    }

    bindEvents() {
        // Symptom form submission
        const symptomForm = document.getElementById('symptom-form');
        if (symptomForm) {
            symptomForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.processSymptoms();
            });
        }

        // Agent card interactions
        document.querySelectorAll('.agent-card').forEach(card => {
            card.addEventListener('click', () => {
                const agentType = card.dataset.agent;
                this.showAgentDetails(agentType);
            });
        });

        // Quick action buttons
        document.querySelectorAll('.quick-action').forEach(button => {
            button.addEventListener('click', () => {
                const action = button.dataset.action;
                this.executeQuickAction(action);
            });
        });
    }

    processSymptoms() {
        const symptomsInput = document.getElementById('symptoms');
        const severitySelect = document.getElementById('severity');
        
        if (!symptomsInput || !severitySelect) return;

        this.symptoms = symptomsInput.value.trim();
        this.severity = severitySelect.value;

        if (!this.symptoms) {
            this.showNotification('Please describe your symptoms.', 'warning');
            return;
        }

        this.showNotification('Analyzing symptoms...', 'info');
        this.currentStep = 'processing';
        this.updateProgress();
        
        // Simulate AI processing
        setTimeout(() => {
            this.activateInsuranceAgent();
        }, 2000);
    }

    activateInsuranceAgent() {
        this.agents.insurance.status = 'active';
        this.agents.insurance.progress = 25;
        this.updateAgentCard('insurance');
        this.showNotification('Insurance verification in progress...', 'info');

        // Mock insurance verification
        setTimeout(() => {
            this.agents.insurance.progress = 100;
            this.updateAgentCard('insurance');
            this.showNotification('Insurance verified! Finding available doctors...', 'success');
            this.activateDoctorAgent();
        }, 3000);
    }

    activateDoctorAgent() {
        this.agents.doctor.status = 'active';
        this.agents.doctor.progress = 30;
        this.updateAgentCard('doctor');

        // Mock doctor matching
        setTimeout(() => {
            this.agents.doctor.progress = 75;
            this.updateAgentCard('doctor');
            this.showNotification('Dr. Martinez is available! Scheduling consultation...', 'info');
            
            setTimeout(() => {
                this.agents.doctor.progress = 100;
                this.updateAgentCard('doctor');
                this.showNotification('Consultation scheduled for 2:00 PM today', 'success');
                this.activatePharmacyAgent();
            }, 2000);
        }, 2500);
    }

    activatePharmacyAgent() {
        this.agents.pharmacy.status = 'active';
        this.agents.pharmacy.progress = 20;
        this.updateAgentCard('pharmacy');
        this.showNotification('Checking nearby pharmacies for medication availability...', 'info');

        setTimeout(() => {
            this.agents.pharmacy.progress = 100;
            this.updateAgentCard('pharmacy');
            this.showNotification('Medications available at CVS Pharmacy - 0.5 miles away', 'success');
            this.activateCoordinator();
        }, 2000);
    }

    activateCoordinator() {
        this.agents.coordinator.status = 'active';
        this.agents.coordinator.progress = 50;
        this.updateAgentCard('coordinator');
        this.showNotification('CareSync is coordinating your entire healthcare journey...', 'info');

        setTimeout(() => {
            this.agents.coordinator.progress = 100;
            this.updateAgentCard('coordinator');
            this.currentStep = 'complete';
            this.updateProgress();
            this.showNotification('Your complete healthcare plan is ready! Check your care timeline below.', 'success');
            this.showCareTimeline();
        }, 3000);
    }

    updateAgentCard(agentType) {
        const card = document.querySelector(`[data-agent="${agentType}"]`);
        if (!card) return;

        const agent = this.agents[agentType];
        const statusElement = card.querySelector('.agent-status');
        const progressBar = card.querySelector('.agent-progress-fill');

        if (statusElement) {
            statusElement.textContent = agent.status.charAt(0).toUpperCase() + agent.status.slice(1);
            statusElement.className = `agent-status status-${agent.status}`;
        }

        if (progressBar) {
            progressBar.style.width = `${agent.progress}%`;
        }

        // Add pulse animation for active agents
        if (agent.status === 'active' && agent.progress < 100) {
            card.classList.add('pulse');
        } else {
            card.classList.remove('pulse');
        }

        // Add completed state
        if (agent.progress === 100) {
            card.classList.add('completed');
        }
    }

    updateProgress() {
        const progressBar = document.querySelector('.progress-fill');
        const stepIndicators = document.querySelectorAll('.step');
        
        let progress = 0;
        let completedSteps = 0;

        if (this.currentStep === 'input') progress = 10;
        else if (this.currentStep === 'processing') progress = 25;
        else if (this.currentStep === 'complete') progress = 100;

        // Calculate progress based on agent completion
        const totalAgents = Object.keys(this.agents).length;
        const completedAgents = Object.values(this.agents).filter(agent => agent.progress === 100).length;
        progress = Math.max(progress, (completedAgents / totalAgents) * 100);

        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }

        // Update step indicators
        stepIndicators.forEach((step, index) => {
            if (index <= completedSteps) {
                step.classList.add('completed');
            }
        });
    }

    showAgentDetails(agentType) {
        const agent = this.agents[agentType];
        const details = this.getAgentDetails(agentType);
        
        this.showNotification(
            `${agent.name}: ${details}`,
            'info'
        );
    }

    getAgentDetails(agentType) {
        const details = {
            patient: 'Managing your health profile and preferences. Always active to provide your information to other agents.',
            insurance: 'Verifying coverage, checking benefits, and handling pre-authorizations for your treatment.',
            doctor: 'Finding available specialists, scheduling appointments, and coordinating medical consultations.',
            pharmacy: 'Locating nearby pharmacies, checking medication availability, and managing prescription transfers.',
            coordinator: 'Orchestrating all healthcare activities and ensuring seamless communication between all parties.'
        };
        return details[agentType] || 'Agent information not available.';
    }

    executeQuickAction(action) {
        const actions = {
            'emergency': () => {
                this.showNotification('🚨 Emergency services contacted. Help is on the way!', 'warning');
                window.open('tel:911', '_self');
            },
            'schedule': () => {
                this.showNotification('📅 Opening appointment scheduler...', 'info');
                // In a real app, this would open a scheduling interface
            },
            'pharmacy': () => {
                this.showNotification('💊 Finding nearby pharmacies...', 'info');
                // In a real app, this would show pharmacy locations
            },
            'insurance': () => {
                this.showNotification('🏥 Checking insurance benefits...', 'info');
                // In a real app, this would show insurance details
            }
        };

        if (actions[action]) {
            actions[action]();
        }
    }

    showCareTimeline() {
        const timeline = `
            <div class="care-timeline">
                <h3>Your Care Timeline</h3>
                <div class="timeline-item completed">
                    <div class="timeline-time">Now</div>
                    <div class="timeline-content">Symptoms analyzed and insurance verified</div>
                </div>
                <div class="timeline-item upcoming">
                    <div class="timeline-time">2:00 PM Today</div>
                    <div class="timeline-content">Virtual consultation with Dr. Martinez</div>
                </div>
                <div class="timeline-item upcoming">
                    <div class="timeline-time">3:30 PM Today</div>
                    <div class="timeline-content">Prescription ready at CVS Pharmacy</div>
                </div>
                <div class="timeline-item upcoming">
                    <div class="timeline-time">Tomorrow</div>
                    <div class="timeline-content">Follow-up reminder and medication tracking</div>
                </div>
            </div>
        `;

        const container = document.querySelector('.main-content');
        if (container) {
            const timelineContainer = document.createElement('div');
            timelineContainer.innerHTML = timeline;
            container.appendChild(timelineContainer);
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                ${message}
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        const container = document.querySelector('.notifications-container') || document.body;
        container.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    loadMockData() {
        // Load user profile data
        const userProfile = {
            name: 'Sarah Chen',
            age: 32,
            insurance: 'Blue Cross Blue Shield',
            primaryCare: 'Dr. Johnson',
            allergies: ['Penicillin'],
            conditions: ['Hypertension']
        };

        // Update UI with user data
        const userNameElement = document.querySelector('.user-name');
        if (userNameElement) {
            userNameElement.textContent = userProfile.name;
        }
    }
}

// Initialize the dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is authenticated
    const isAuthenticated = localStorage.getItem('navicare_user') !== null;
    
    if (!isAuthenticated) {
        // Redirect to login if not authenticated
        window.location.href = 'index.html';
        return;
    }

    // Initialize the workflow system
    const workflow = new PatientWorkflow();
    
    // Make workflow available globally for debugging
    window.navicare = { workflow };
    
    // Handle logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('navicare_user');
            window.location.href = 'index.html';
        });
    }
});

// Utility functions
function formatTime(date) {
    return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    }).format(date);
}

function formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(date);
}