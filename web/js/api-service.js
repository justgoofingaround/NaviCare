/**
 * API Service for NaviCare Backend Integration
 * Handles all communication with the Django backend API
 */

class APIService {
    constructor() {
        this.baseURL = 'http://localhost:8001/api';  // Django backend for insurance data only
        this.timeout = 10000; // 10 seconds
    }

    /**
     * Generic fetch wrapper with error handling
     */
    async fetchWithTimeout(url, options = {}) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                throw new Error('Request timeout');
            }
            throw error;
        }
    }

    /**
     * Health check endpoint
     */
    async healthCheck() {
        try {
            console.log('🏥 Performing health check...');
            const response = await this.fetchWithTimeout(`${this.baseURL}/health/`);
            console.log('✅ Health check successful:', response);
            return response && response.status === 'healthy';
        } catch (error) {
            console.warn('❌ Backend health check failed:', error.message);
            return false;
        }
    }

    /**
     * Get all insurance plans
     */
    async getInsurancePlans() {
        try {
            console.log('🏥 Fetching insurance plans...');
            const response = await this.fetchWithTimeout(`${this.baseURL}/plans/`);
            console.log('📋 Raw API response:', response);
            // Django API returns paginated data: { results: [...], count: X, next: null, previous: null }
            const plans = response.results || response;  // Handle both paginated and direct array responses
            console.log('✅ Processed plans:', plans ? plans.length : 0, 'plans');
            return plans;
        } catch (error) {
            console.error('❌ Error fetching insurance plans:', error);
            // Show popup notification
            this.showDemoDataNotification();
            // Fallback to mock data
            return this.getMockInsurancePlans();
        }
    }

    /**
     * Get specific insurance plan
     */
    async getInsurancePlan(planId) {
        try {
            const response = await this.fetchWithTimeout(`${this.baseURL}/plans/${planId}/`);
            return response;
        } catch (error) {
            console.error('Error fetching insurance plan:', error);
            this.showDemoDataNotification();
            return this.getMockInsurancePlan();
        }
    }

    /**
     * Get insurance quote
     */
    async getInsuranceQuote(quoteData) {
        try {
            const response = await this.fetchWithTimeout(`${this.baseURL}/quote/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(quoteData)
            });
            return response;
        } catch (error) {
            console.error('Error getting insurance quote:', error);
            this.showDemoDataNotification();
            return this.getMockQuote();
        }
    }

    /**
     * Get clients (for agent dashboard)
     */
    async getClients() {
        try {
            const response = await this.fetchWithTimeout(`${this.baseURL}/clients/`);
            return response;
        } catch (error) {
            console.error('Error fetching clients:', error);
            this.showDemoDataNotification();
            return this.getMockClients();
        }
    }

    /**
     * Get agent dashboard data
     */
    async getAgentDashboard(agentId = 1) {
        try {
            const response = await this.fetchWithTimeout(`${this.baseURL}/agents/${agentId}/dashboard/`);
            return response;
        } catch (error) {
            console.error('Error fetching agent dashboard:', error);
            this.showDemoDataNotification();
            return this.getMockAgentDashboard();
        }
    }

    /**
     * Show demo data notification
     */
    showDemoDataNotification() {
        // Create notification if it doesn't exist
        if (!document.getElementById('demo-data-notification')) {
            const notification = document.createElement('div');
            notification.id = 'demo-data-notification';
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #ff6b6b;
                color: white;
                padding: 15px 20px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 10000;
                max-width: 300px;
                font-family: Arial, sans-serif;
            `;
            notification.innerHTML = `
                <div style="font-weight: bold; margin-bottom: 5px;">Using demo data - backend may be unavailable</div>
                <div style="font-size: 14px;">Check console for details</div>
                <button onclick="this.parentElement.remove()" style="
                    position: absolute;
                    top: 5px;
                    right: 10px;
                    background: none;
                    border: none;
                    color: white;
                    font-size: 18px;
                    cursor: pointer;
                ">&times;</button>
            `;
            document.body.appendChild(notification);

            // Auto-remove after 5 seconds
            setTimeout(() => {
                if (document.getElementById('demo-data-notification')) {
                    notification.remove();
                }
            }, 5000);
        }
    }

    // Mock data methods for fallback
    getMockInsurancePlans() {
        return [
            {
                id: 1,
                name: 'BCBS Premium PPO',
                carrier: 'Blue Cross Blue Shield',
                plan_type: 'PPO',
                tier: 'Gold',
                monthly_premium: 350.00,
                deductible: 1000.00,
                out_of_pocket_max: 5000.00,
                copay_primary_care: 25.00,
                copay_specialist: 50.00
            },
            {
                id: 2,
                name: 'Aetna HMO Select',
                carrier: 'Aetna',
                plan_type: 'HMO',
                tier: 'Silver',
                monthly_premium: 280.00,
                deductible: 1500.00,
                out_of_pocket_max: 6000.00,
                copay_primary_care: 20.00,
                copay_specialist: 40.00
            }
        ];
    }

    getMockInsurancePlan() {
        return {
            id: 1,
            name: 'BCBS Premium PPO',
            carrier: 'Blue Cross Blue Shield',
            plan_type: 'PPO',
            tier: 'Gold',
            monthly_premium: 350.00,
            deductible: 1000.00,
            out_of_pocket_max: 5000.00,
            copay_primary_care: 25.00,
            copay_specialist: 50.00,
            coverage_details: 'Comprehensive coverage with nationwide network'
        };
    }

    getMockQuote() {
        return {
            monthly_premium: 325.50,
            annual_premium: 3906.00,
            plan_recommendations: [
                { name: 'BCBS Premium PPO', monthly_premium: 350.00 },
                { name: 'Aetna HMO Select', monthly_premium: 280.00 }
            ]
        };
    }

    getMockClients() {
        return [
            {
                id: 1,
                name: 'John Smith',
                email: 'john.smith@email.com',
                status: 'Active',
                policy_number: 'POL-001'
            },
            {
                id: 2,
                name: 'Sarah Johnson',
                email: 'sarah.j@email.com',
                status: 'Prospect',
                policy_number: null
            }
        ];
    }

    getMockAgentDashboard() {
        return {
            agent_name: 'Demo Agent',
            total_clients: 15,
            active_policies: 12,
            monthly_commission: 4250.00,
            recent_activities: [
                { action: 'New policy application', client: 'John Doe', timestamp: '2 hours ago' },
                { action: 'Policy renewal', client: 'Jane Smith', timestamp: '1 day ago' }
            ]
        };
    }
}

// Create global instance
window.APIService = new APIService();

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APIService;
}