// ===== PATIENT JOURNEY - MOCK DATA =====
console.log('Dashboard JavaScript file loaded successfully');

const MOCK_DATA = {
    // Patient's insurance information
    insurance: {
        patientName: "Patient",
        plan: "NYU Insurance",
        inNetwork: true,
        primaryCareCopay: 10, // $10 co-pay as specified
        coverageDetails: {
            primaryCare: "100% covered after $10 copay",
            telehealth: "100% covered, $0 copay",
            prescriptions: "Generic: $8, Brand: $25"
        }
    },
    
    // 5 nearby doctors with telehealth option
    doctors: [
        {
            id: 1,
            name: "Dr. Sarah Johnson",
            specialty: "Family Medicine",
            rating: 4.9,
            availability: "Available NOW - Telehealth",
            type: "telehealth",
            nextSlot: "Today 2:30 PM",
            location: "Online Consultation",
            distance: "Virtual"
        },
        {
            id: 2,
            name: "Dr. Michael Chen",
            specialty: "Internal Medicine", 
            rating: 4.8,
            availability: "Available Today 4:00 PM",
            type: "in-person",
            nextSlot: "Today 4:00 PM",
            location: "Downtown Medical Center",
            distance: "2.3 miles"
        },
        {
            id: 3,
            name: "Dr. Emily Rodriguez",
            specialty: "Family Medicine",
            rating: 4.7,
            availability: "Available Tomorrow 9:00 AM",
            type: "both",
            nextSlot: "Tomorrow 9:00 AM",
            location: "Community Health Clinic",
            distance: "1.8 miles"
        },
        {
            id: 4,
            name: "Dr. James Wilson",
            specialty: "Urgent Care",
            rating: 4.6,
            availability: "Available Today 6:00 PM",
            type: "in-person",
            nextSlot: "Today 6:00 PM", 
            location: "Urgent Care Center",
            distance: "3.1 miles"
        },
        {
            id: 5,
            name: "Dr. Lisa Park",
            specialty: "Telemedicine",
            rating: 4.8,
            availability: "Available NOW - Telehealth",
            type: "telehealth",
            nextSlot: "Today 2:45 PM",
            location: "Online Consultation",
            distance: "Virtual"
        }
    ],
    
    // Prescription and pharmacy data
    prescription: {
        medication: "Amoxicillin 500mg",
        dosage: "Take 1 capsule 3 times daily for 7 days",
        prescribedBy: "Dr. Sarah Johnson"
    },
    
    pharmacies: [
        {
            name: "Walgreens",
            price: 8, // $8 as specified
            location: "Main Street",
            distance: "0.8 miles",
            inStock: true,
            pickupTime: "Ready in 30 minutes"
        },
        {
            name: "CVS Pharmacy", 
            price: 12,
            location: "Oak Avenue",
            distance: "1.2 miles",
            inStock: true,
            pickupTime: "Ready in 45 minutes"
        },
        {
            name: "Rite Aid",
            price: 15,
            location: "Elm Street", 
            distance: "2.1 miles",
            inStock: true,
            pickupTime: "Ready in 1 hour"
        }
    ],
    
    // Final care plan
    carePlan: {
        appointment: {
            doctor: "Dr. Sarah Johnson",
            type: "Telehealth Consultation",
            date: "Today",
            time: "2:30 PM",
            duration: "15 minutes"
        },
        prescription: {
            medication: "Amoxicillin 500mg",
            instructions: "Take 1 capsule 3 times daily with food for 7 days",
            pharmacy: "Walgreens - Main Street",
            cost: "$8.00",
            pickupTime: "Ready in 30 minutes"
        },
        reminders: [
            "Join telehealth appointment at 2:30 PM today",
            "Pick up prescription at Walgreens within 2 hours", 
            "Take medication as prescribed for full 7 days",
            "Schedule follow-up if symptoms persist after 3 days"
        ]
    }
};

// Simple utility functions
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// ===== PATIENT JOURNEY WORKFLOW (Updated Architecture) =====
class PatientWorkflow {
    constructor() {
        this.notification = new SimpleNotification();
        this.currentStep = 0;
        this.selectedDoctor = null;
        this.selectedPharmacy = null;
        this.symptomData = null;
        this.agentResults = {
            insurance: null,
            doctor: null,
            pharmacy: null
        };
    }

    async startJourney(symptomData) {
        console.log('startJourney called with:', symptomData);
        this.symptomData = symptomData;
        
        // Show loading state - try multiple selectors to find the button
        const submitBtn = $('.btn-modern.btn-primary-modern') || $('#symptomForm .btn-modern') || $('.btn-modern');
        console.log('Submit button found:', submitBtn);
        
        if (submitBtn) {
            submitBtn.classList.add('loading');
            console.log('Added loading class to button');
        }
        
        setTimeout(async () => {
            if (submitBtn) {
                submitBtn.classList.remove('loading');
                console.log('Removed loading class from button');
            }
            
            this.notification.show('Symptoms recorded! Patient Agent is analyzing your case...', 'success');
            console.log('Starting patient agent...');
            
            // Update progress - Step 1: Patient Input completed
            this.updateProgress(1);
            
            // Start with Patient Agent
            await this.runPatientAgent();
        }, 2000);
    }

    async runPatientAgent() {
        // Step 2: Patient Agent processing
        this.updateProgress(2);
        
        // Update Patient Agent UI
        this.updateAgentUI('patient', 'processing', 'Analyzing symptoms...');
        
        this.notification.show('Patient Agent: Analyzing your symptoms and distributing tasks to specialist agents...', 'info');
        
        await this.delay(2500);
        
        // Complete Patient Agent
        this.updateAgentUI('patient', 'completed', 'Analysis complete');
        
        // Show Patient Agent results
        this.showPatientAgentResults();
        
        this.notification.show('Patient Agent: Distributing your case to Insurance, Doctor, and Pharmacy agents simultaneously...', 'success');
        
        // Wait then distribute to specialist agents
        setTimeout(() => this.distributeToAgents(), 2000);
    }

    async distributeToAgents() {
        // Step 3: Specialist Agents working
        this.updateProgress(3);
        
        // Activate specialist agents UI
        this.updateAgentUI('insurance', 'processing', 'Checking coverage...');
        this.updateAgentUI('doctor', 'processing', 'Finding doctors...');
        this.updateAgentUI('pharmacy', 'processing', 'Searching prices...');
        
        // Run all three agents in parallel as per flowchart
        this.notification.show('🔄 Specialist agents are working on your case...', 'info');
        
        // Start all three agents simultaneously
        const agentPromises = [
            this.runInsuranceAgent(),
            this.runDoctorAgent(), 
            this.runPharmacyAgent()
        ];
        
        // Wait for all agents to complete
        await Promise.all(agentPromises);
        
        // Move to coordinator
        setTimeout(() => this.runCoordinator(), 1000);
    }

    // Helper method to update agent UI
    updateAgentUI(agentType, status, statusText) {
        const card = $(`.agent-card-modern[data-agent="${agentType}"]`);
        if (!card) return;

        const statusElement = card.querySelector('.agent-status-modern');
        const badge = card.querySelector('.status-badge');
        const progressFill = card.querySelector('.progress-fill');

        if (statusElement) statusElement.textContent = statusText;

        switch (status) {
            case 'processing':
                if (badge) {
                    badge.className = 'status-badge processing';
                    badge.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                }
                if (progressFill) progressFill.style.width = '50%';
                break;
            case 'completed':
                if (badge) {
                    badge.className = 'status-badge completed';
                    badge.innerHTML = '<i class="fas fa-check"></i>';
                }
                if (progressFill) progressFill.style.width = '100%';
                break;
            case 'waiting':
                if (badge) {
                    badge.className = 'status-badge waiting';
                    badge.innerHTML = '<i class="fas fa-clock"></i>';
                }
                if (progressFill) progressFill.style.width = '0%';
                break;
        }
    }

    async runInsuranceAgent() {
        await this.delay(2000);
        
        this.agentResults.insurance = MOCK_DATA.insurance;
        this.updateAgentUI('insurance', 'completed', `✅ $${MOCK_DATA.insurance.primaryCareCopay} co-pay confirmed`);
        this.notification.show(`Insurance Agent: ✅ Primary care covered with $${MOCK_DATA.insurance.primaryCareCopay} co-pay`, 'success');
        
        // Show Insurance Agent results
        this.showInsuranceResults();
    }

    async runDoctorAgent() {
        await this.delay(2500);
        
        this.agentResults.doctor = MOCK_DATA.doctors;
        this.updateAgentUI('doctor', 'completed', '✅ Found 5 qualified doctors');
        this.notification.show('Doctor Agent: ✅ Found 5 qualified doctors nearby', 'success');
        
        // Show Doctor Agent results
        this.showDoctorResults();
    }

    async runPharmacyAgent() {
        await this.delay(3000);
        
        this.agentResults.pharmacy = MOCK_DATA.pharmacies;
        this.updateAgentUI('pharmacy', 'completed', '✅ Found best medication prices');
        this.notification.show('Pharmacy Agent: ✅ Found best medication prices in your area', 'success');
        
        // Show Pharmacy Agent results
        this.showPharmacyResults();
    }

    showDoctorSelection() {
        // Create doctor selection UI
        const agentsSection = $('.agents-section-modern');
        if (agentsSection) {
            const doctorSelectionHTML = `
                <div class="doctor-selection-container" style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 15px; margin: 20px 0;">
                    <h3 style="color: white; margin-bottom: 20px;">🩺 Doctor Agent Results - Select Your Preferred Doctor</h3>
                    <div class="doctors-grid">
                        ${MOCK_DATA.doctors.map((doctor, index) => `
                            <div class="doctor-card" data-doctor-id="${doctor.id}" onclick="workflow.selectDoctor(${doctor.id})" 
                                 style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 10px; margin: 10px 0; cursor: pointer; border: 2px solid transparent; transition: all 0.3s ease;">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <div>
                                        <h4 style="color: white; margin: 0;">${doctor.name}</h4>
                                        <p style="color: #e0e0e0; margin: 5px 0;">${doctor.specialty}</p>
                                        <p style="color: #4fc3f7; margin: 5px 0; font-weight: bold;">${doctor.availability}</p>
                                        <p style="color: #e0e0e0; margin: 0; font-size: 0.9em;">${doctor.location}</p>
                                    </div>
                                    <div style="text-align: center;">
                                        <div style="color: #ffd700; font-size: 1.2em;">⭐ ${doctor.rating}</div>
                                        ${doctor.type === 'telehealth' ? '<div style="color: #4fc3f7; font-size: 0.8em; margin-top: 5px;">📱 Telehealth</div>' : ''}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
            
            agentsSection.insertAdjacentHTML('beforeend', doctorSelectionHTML);
        }
    }

    selectDoctor(doctorId) {
        this.selectedDoctor = MOCK_DATA.doctors.find(d => d.id === doctorId);
        
        // Highlight selected doctor
        $$('.doctor-card').forEach(card => {
            card.style.border = '2px solid transparent';
        });
        $(`.doctor-card[data-doctor-id="${doctorId}"]`).style.border = '2px solid #4fc3f7';
        
        this.notification.show(`Selected: ${this.selectedDoctor.name} - ${this.selectedDoctor.availability}`, 'success');
        
        // Show prescription info (no appointment booking)
        setTimeout(() => this.handlePrescription(), 2000);
    }

    async handlePrescription() {
        this.notification.show(`${this.selectedDoctor.name}: Based on your symptoms (${this.symptomData.symptoms}), I recommend ${MOCK_DATA.prescription.medication}. Prescription sent to pharmacies.`, 'info');
        
        await this.delay(2000);
        
        // Show pharmacy selection
        setTimeout(() => this.showPharmacySelection(), 1000);
    }

    showPharmacySelection() {
        const agentsSection = $('.agents-section-modern');
        if (agentsSection) {
            const pharmacyHTML = `
                <div class="pharmacy-selection-container" style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 15px; margin: 20px 0;">
                    <h3 style="color: white; margin-bottom: 20px;">💊 Pharmacy Agent Results - ${MOCK_DATA.prescription.medication} Prices</h3>
                    <div class="pharmacy-grid">
                        ${MOCK_DATA.pharmacies.map((pharmacy, index) => `
                            <div class="pharmacy-card ${index === 0 ? 'recommended' : ''}" data-pharmacy="${pharmacy.name}" 
                                 onclick="workflow.selectPharmacy('${pharmacy.name}')"
                                 style="background: ${index === 0 ? 'rgba(79, 195, 247, 0.2)' : 'rgba(255,255,255,0.1)'}; 
                                        padding: 15px; border-radius: 10px; margin: 10px 0; cursor: pointer; 
                                        border: ${index === 0 ? '2px solid #4fc3f7' : '2px solid transparent'}; 
                                        transition: all 0.3s ease;">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <div>
                                        <h4 style="color: white; margin: 0;">${pharmacy.name} ${index === 0 ? '⭐ BEST PRICE' : ''}</h4>
                                        <p style="color: #e0e0e0; margin: 5px 0;">${pharmacy.location} (${pharmacy.distance})</p>
                                        <p style="color: #4fc3f7; margin: 0;">${pharmacy.pickupTime}</p>
                                    </div>
                                    <div style="text-align: center;">
                                        <div style="color: ${index === 0 ? '#4fc3f7' : 'white'}; font-size: 1.5em; font-weight: bold;">$${pharmacy.price}</div>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
            
            agentsSection.insertAdjacentHTML('beforeend', pharmacyHTML);
        }
        
        // Auto-select Walgreens (cheapest option)
        setTimeout(() => this.selectPharmacy('Walgreens'), 3000);
    }

    selectPharmacy(pharmacyName) {
        this.selectedPharmacy = MOCK_DATA.pharmacies.find(p => p.name === pharmacyName);
        
        this.notification.show(`Selected: ${pharmacyName} - $${this.selectedPharmacy.price} (${this.selectedPharmacy.pickupTime})`, 'success');
        
        // All agents completed, move to coordinator
        setTimeout(() => this.runCoordinator(), 2000);
    }

    async runCoordinator() {
        // Step 4: Coordinator Agent
        this.updateProgress(4);
        
        // Update Coordinator Agent UI
        this.updateAgentUI('coordinator', 'processing', 'Compiling care plan...');
        
        this.notification.show('Coordinator Agent: Compiling all agent results into your personalized care plan...', 'info');
        
        await this.delay(2500);
        
        // Complete Coordinator Agent
        this.updateAgentUI('coordinator', 'completed', '✅ Care plan ready');
        
        // Update coordinator card with results
        this.showCoordinatorResults();
        
        this.notification.show('Coordinator Agent: ✅ Your complete care plan is ready!', 'success');
        
        // Show final care plan
        setTimeout(() => this.showFinalCarePlan(), 2000);
    }

    // Show Coordinator Agent Results - Update existing card
    showCoordinatorResults() {
        console.log('Showing Coordinator Agent Results');
        const agentCard = document.querySelector('[data-agent="coordinator"]');
        if (agentCard) {
            // Update status and progress
            agentCard.querySelector('.agent-status-modern').textContent = 'Care Plan Complete';
            agentCard.querySelector('.status-badge').className = 'status-badge completed';
            agentCard.querySelector('.status-badge i').className = 'fas fa-check';
            agentCard.querySelector('.progress-fill').style.width = '100%';
            
            // Update content within the card
            const content = agentCard.querySelector('.agent-content-modern');
            content.innerHTML = `
                <div class="agent-result">
                    <h5 style="color: #ea580c; margin-bottom: 10px; font-size: 0.9em;">📋 Complete Care Plan</h5>
                    <div style="background: rgba(234, 88, 12, 0.1); padding: 12px; border-radius: 8px; font-size: 0.85em;">
                        <div style="margin-bottom: 6px;"><strong>Doctor:</strong> ${MOCK_DATA.doctors[0].name}</div>
                        <div style="margin-bottom: 6px;"><strong>Pharmacy:</strong> ${MOCK_DATA.pharmacies[0].name}</div>
                        <div style="margin-bottom: 6px;"><strong>Total Cost:</strong> $${MOCK_DATA.insurance.primaryCareCopay + MOCK_DATA.pharmacies[0].price}</div>
                        <div style="color: #ea580c; font-weight: 500; font-size: 0.8em; margin-top: 8px;">✓ All specialists coordinated</div>
                    </div>
                </div>
            `;
        }
    }

    // Show Patient Agent Results - Update existing card
    showPatientAgentResults() {
        console.log('Showing Patient Agent Results');
        const agentCard = document.querySelector('[data-agent="patient"]');
        if (agentCard) {
            // Update status and progress
            agentCard.querySelector('.agent-status-modern').textContent = 'Analysis Complete';
            agentCard.querySelector('.status-badge').className = 'status-badge completed';
            agentCard.querySelector('.status-badge i').className = 'fas fa-check';
            agentCard.querySelector('.progress-fill').style.width = '100%';
            
            // Update content within the card
            const content = agentCard.querySelector('.agent-content-modern');
            content.innerHTML = `
                <div class="agent-result">
                    <h5 style="color: #2563eb; margin-bottom: 10px; font-size: 0.9em;">📋 Analysis Complete</h5>
                    <div style="background: rgba(37, 99, 235, 0.1); padding: 12px; border-radius: 8px; font-size: 0.85em;">
                        <div style="margin-bottom: 6px;"><strong>Symptoms:</strong> ${this.symptomData.symptoms}</div>
                        <div style="margin-bottom: 6px;"><strong>Severity:</strong> ${this.symptomData.severity || 'Not specified'}</div>
                        <div style="margin-bottom: 8px;"><strong>Duration:</strong> ${this.symptomData.duration || 'Not specified'}</div>
                        <div style="color: #2563eb; font-weight: 500;">✓ Distributing to specialist agents...</div>
                    </div>
                </div>
            `;
        }
    }

    // Show Insurance Agent Results - Update existing card
    showInsuranceResults() {
        console.log('Showing Insurance Agent Results');
        const agentCard = document.querySelector('[data-agent="insurance"]');
        if (agentCard) {
            // Update status and progress
            agentCard.querySelector('.agent-status-modern').textContent = 'Coverage Verified';
            agentCard.querySelector('.status-badge').className = 'status-badge completed';
            agentCard.querySelector('.status-badge i').className = 'fas fa-check';
            agentCard.querySelector('.progress-fill').style.width = '100%';
            
            // Update content within the card
            const content = agentCard.querySelector('.agent-content-modern');
            content.innerHTML = `
                <div class="agent-result">
                    <h5 style="color: #059669; margin-bottom: 10px; font-size: 0.9em;">🛡️ Coverage Verified</h5>
                    <div style="background: rgba(5, 150, 105, 0.1); padding: 12px; border-radius: 8px; font-size: 0.85em;">
                        <div style="margin-bottom: 6px;"><strong>Plan:</strong> ${MOCK_DATA.insurance.plan}</div>
                        <div style="margin-bottom: 6px;"><strong>Status:</strong> ${MOCK_DATA.insurance.inNetwork ? 'In-Network ✅' : 'Out-of-Network ❌'}</div>
                        <div style="margin-bottom: 6px;"><strong>Primary Care Co-pay:</strong> $${MOCK_DATA.insurance.primaryCareCopay}</div>
                        <div style="color: #059669; font-weight: 500; font-size: 0.8em;">✓ ${MOCK_DATA.insurance.coverageDetails.primaryCare}</div>
                    </div>
                </div>
            `;
        }
    }

    // Show Doctor Agent Results - Update existing card
    showDoctorResults() {
        console.log('Showing Doctor Agent Results');
        const agentCard = document.querySelector('[data-agent="doctor"]');
        if (agentCard) {
            // Update status and progress
            agentCard.querySelector('.agent-status-modern').textContent = 'Doctors Found';
            agentCard.querySelector('.status-badge').className = 'status-badge completed';
            agentCard.querySelector('.status-badge i').className = 'fas fa-check';
            agentCard.querySelector('.progress-fill').style.width = '100%';
            
            // Update content within the card
            const content = agentCard.querySelector('.agent-content-modern');
            const doctorsList = MOCK_DATA.doctors.map((doctor, index) => 
                `<div style="margin-bottom: 6px; padding: 6px; background: rgba(220, 38, 38, 0.1); border-radius: 4px; font-size: 0.75em;">
                    <div style="font-weight: 600; color: #dc2626;">${doctor.name} ${index === 0 ? '⭐' : ''}</div>
                    <div style="color: #6b7280; font-size: 0.9em;">${doctor.specialty} • ${doctor.rating}</div>
                    <div style="color: #059669; font-size: 0.85em;">${doctor.availability}</div>
                    <div style="color: #6b7280; font-size: 0.8em;">${doctor.distance}</div>
                </div>`
            ).join('');
            
            content.innerHTML = `
                <div class="agent-result">
                    <h5 style="color: #dc2626; margin-bottom: 10px; font-size: 0.9em;">🩺 Available Doctors (${MOCK_DATA.doctors.length})</h5>
                    <div style="background: rgba(220, 38, 38, 0.1); padding: 12px; border-radius: 8px; max-height: 200px; overflow-y: auto;">
                        ${doctorsList}
                    </div>
                </div>
            `;
        }
    }

    // Show Pharmacy Agent Results - Update existing card
    showPharmacyResults() {
        console.log('Showing Pharmacy Agent Results');
        const agentCard = document.querySelector('[data-agent="pharmacy"]');
        if (agentCard) {
            // Update status and progress
            agentCard.querySelector('.agent-status-modern').textContent = 'Pharmacies Found';
            agentCard.querySelector('.status-badge').className = 'status-badge completed';
            agentCard.querySelector('.status-badge i').className = 'fas fa-check';
            agentCard.querySelector('.progress-fill').style.width = '100%';
            
            // Update content within the card
            const content = agentCard.querySelector('.agent-content-modern');
            const pharmacyList = MOCK_DATA.pharmacies.map((pharmacy, index) => 
                `<div style="margin-bottom: 6px; padding: 6px; background: rgba(124, 58, 237, 0.1); border-radius: 4px; font-size: 0.75em;">
                    <div style="font-weight: 600; color: #7c3aed;">${pharmacy.name} ${index === 0 ? '⭐ BEST PRICE' : ''}</div>
                    <div style="color: #6b7280; font-size: 0.9em;">${pharmacy.location} • ${pharmacy.distance}</div>
                    <div style="color: #059669; font-size: 0.85em;">$${pharmacy.price} • ${pharmacy.pickupTime}</div>
                </div>`
            ).join('');
            
            content.innerHTML = `
                <div class="agent-result">
                    <h5 style="color: #7c3aed; margin-bottom: 10px; font-size: 0.9em;">💊 Available Pharmacies (${MOCK_DATA.pharmacies.length})</h5>
                    <div style="background: rgba(124, 58, 237, 0.1); padding: 12px; border-radius: 8px; max-height: 200px; overflow-y: auto;">
                        ${pharmacyList}
                    </div>
                </div>
            `;
        }
    }

    showFinalCarePlan() {
        const container = $('.container');
        const userName = localStorage.getItem('userName') || 'Patient';
        
        if (container) {
            const carePlanHTML = `
                <div class="final-care-plan" style="background: rgba(255,255,255,0.1); padding: 30px; border-radius: 20px; margin: 30px 0; backdrop-filter: blur(10px);">
                    <h2 style="color: white; text-align: center; margin-bottom: 30px;">🏥 ${userName}'s Complete Care Plan</h2>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
                        <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 15px;">
                            <h3 style="color: #4fc3f7; margin-bottom: 15px;">🩺 Doctor Recommendation</h3>
                            <p style="color: white; margin: 5px 0;"><strong>Doctor:</strong> ${this.selectedDoctor.name}</p>
                            <p style="color: white; margin: 5px 0;"><strong>Specialty:</strong> ${this.selectedDoctor.specialty}</p>
                            <p style="color: white; margin: 5px 0;"><strong>Type:</strong> ${this.selectedDoctor.type === 'telehealth' ? 'Telehealth Available' : 'In-Person Visit'}</p>
                            <p style="color: white; margin: 5px 0;"><strong>Contact:</strong> Call to schedule consultation</p>
                        </div>
                        
                        <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 15px;">
                            <h3 style="color: #4fc3f7; margin-bottom: 15px;">💊 Prescription & Pharmacy</h3>
                            <p style="color: white; margin: 5px 0;"><strong>Medication:</strong> ${MOCK_DATA.prescription.medication}</p>
                            <p style="color: white; margin: 5px 0;"><strong>Instructions:</strong> ${MOCK_DATA.prescription.dosage}</p>
                            <p style="color: white; margin: 5px 0;"><strong>Pharmacy:</strong> ${this.selectedPharmacy.name}</p>
                            <p style="color: white; margin: 5px 0;"><strong>Cost:</strong> $${this.selectedPharmacy.price}</p>
                            <p style="color: white; margin: 5px 0;"><strong>Pickup:</strong> ${this.selectedPharmacy.pickupTime}</p>
                        </div>
                        
                        <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 15px;">
                            <h3 style="color: #4fc3f7; margin-bottom: 15px;">💰 Insurance Coverage</h3>
                            <p style="color: white; margin: 5px 0;"><strong>Plan:</strong> ${MOCK_DATA.insurance.plan}</p>
                            <p style="color: white; margin: 5px 0;"><strong>Doctor Visit:</strong> $${MOCK_DATA.insurance.primaryCareCopay} co-pay</p>
                            <p style="color: white; margin: 5px 0;"><strong>Prescription:</strong> Covered under plan</p>
                            <p style="color: white; margin: 5px 0;"><strong>Total Est. Cost:</strong> $${MOCK_DATA.insurance.primaryCareCopay + this.selectedPharmacy.price}</p>
                        </div>
                    </div>
                    
                    <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 15px; margin-top: 20px;">
                        <h3 style="color: #4fc3f7; margin-bottom: 15px;">📋 Next Steps</h3>
                        <ul style="color: white; padding-left: 20px;">
                            <li>Contact ${this.selectedDoctor.name} to schedule consultation</li>
                            <li>Pick up prescription at ${this.selectedPharmacy.name} (${this.selectedPharmacy.location})</li>
                            <li>Take medication as prescribed for full course</li>
                            <li>Monitor symptoms and follow up if needed</li>
                        </ul>
                    </div>
                    
                    <div style="text-align: center; margin-top: 30px;">
                        <button onclick="window.print()" style="background: #4fc3f7; color: white; border: none; padding: 15px 30px; border-radius: 10px; cursor: pointer; font-size: 1.1em; margin: 0 10px;">
                            📄 Print Care Plan
                        </button>
                        <button onclick="workflow.sendReminders()" style="background: #00a693; color: white; border: none; padding: 15px 30px; border-radius: 10px; cursor: pointer; font-size: 1.1em; margin: 0 10px;">
                            📱 Send Plan to Phone
                        </button>
                    </div>
                </div>
            `;
            
            container.insertAdjacentHTML('beforeend', carePlanHTML);
            
            // Scroll to care plan
            $('.final-care-plan').scrollIntoView({ behavior: 'smooth' });
        }
    }

    sendReminders() {
        this.notification.show('📱 Care plan sent to your phone and email!', 'success');
    }

    updateProgress(step) {
        const steps = $$('.step-indicator');
        
        steps.forEach((stepEl, index) => {
            stepEl.classList.remove('active', 'completed');
            
            if (index < step) {
                stepEl.classList.add('completed');
            } else if (index === step - 1) {
                stepEl.classList.add('active');
            }
        });

        // Update progress stats
        const statNumber = $('.stat-number');
        if (statNumber) {
            statNumber.textContent = step;
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Global workflow instance
let workflow;

// Global form submission handler
window.handleFormSubmit = function() {
    console.log('handleFormSubmit called');
    
    const symptoms = $('#symptoms').value.trim();
    const severity = $('#severity').value;
    const duration = $('#duration').value;
    
    console.log('Form data:', { symptoms, severity, duration });

    if (!symptoms) {
        if (window.notification) {
            window.notification.show('Please describe your symptoms', 'warning');
        } else {
            alert('Please describe your symptoms');
        }
        return false;
    }

    // Store symptom data and start workflow
    if (workflow) {
        console.log('Starting workflow with:', { symptoms, severity, duration });
        workflow.startJourney({ symptoms, severity, duration });
    } else {
        console.error('Workflow not initialized yet');
        alert('Workflow not ready. Please wait a moment and try again.');
    }
    
    return false;
};

// Simple notification system
class SimpleNotification {
    constructor() {
        this.notification = $('#notification');
    }

    show(message, type = 'success', duration = 4000) {
        console.log('Notification.show called:', message, type);
        
        if (!this.notification) {
            console.error('Notification element not found');
            return;
        }
        
        const messageEl = this.notification.querySelector('.notification-message');
        if (messageEl) {
            messageEl.textContent = message;
        } else {
            console.error('Notification message element not found');
        }
        
        this.notification.className = `notification ${type} show`;
        console.log('Notification displayed:', message);
        
        setTimeout(() => {
            this.notification.classList.remove('show');
        }, duration);
    }
}

// Initialize the application with error handling
document.addEventListener('DOMContentLoaded', () => {
    console.log('Dashboard DOM loaded, initializing...');
    
    try {
        // Test basic DOM access
        console.log('Testing DOM access...');
        const testElement = document.getElementById('symptomForm');
        console.log('SymptomForm found:', testElement);
        
        // Set user name from login (default to Patient for demo)
        const userName = localStorage.getItem('userName') || 'Patient';
        console.log('Retrieved username from localStorage:', userName);
        
        const userNameElement = $('#userName');
        if (userNameElement) {
            userNameElement.textContent = userName;
            console.log('Set username in UI:', userName);
        } else {
            console.warn('Username element not found in DOM');
        }
        
        // Initialize simple notification system
        window.notification = new SimpleNotification();
        const notification = window.notification;
        
        // Setup character counter for symptom textarea
        const textarea = $('#symptoms');
        const counter = $('.character-count');
        
        if (textarea && counter) {
            textarea.addEventListener('input', function() {
                const current = this.value.length;
                const max = 500;
                counter.textContent = `${current}/${max}`;
                
                if (current > max * 0.9) {
                    counter.style.color = '#ef4444';
                } else if (current > max * 0.75) {
                    counter.style.color = '#f59e0b';
                } else {
                    counter.style.color = '#64748b';
                }
            });
            console.log('Character counter initialized');
        }
        
        // Initialize enhanced workflow for Patient's journey
        workflow = new PatientWorkflow();
        console.log('Workflow initialized:', workflow);
        
// Global function for testing workflow
function testWorkflow() {
    console.log('Testing workflow...');
    if (window.workflow) {
        console.log('Workflow exists:', window.workflow);
        console.log('Calling startJourney...');
        window.workflow.startJourney();
    } else {
        console.error('Workflow not found on window');
    }
}

// Make test function globally available
window.testWorkflow = testWorkflow;        // Setup symptom form submission for Patient's specific case
        const symptomForm = $('#symptomForm');
        console.log('Looking for symptomForm:', symptomForm);
        
        if (symptomForm) {
            symptomForm.addEventListener('submit', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Form submitted!');
                
                const symptoms = $('#symptoms').value.trim();
                const severity = $('#severity').value;
                const duration = $('#duration').value;
                
                console.log('Form data:', { symptoms, severity, duration });

                if (!symptoms) {
                    notification.show('Please describe your symptoms', 'warning');
                    return false;
                }

                // Store symptom data
                workflow.startJourney({ symptoms, severity, duration });
                
                // Prevent any scrolling to top
                window.scrollTo(0, window.scrollY);
                
                return false;
            });
            console.log('Patient workflow form initialized');
        } else {
            console.error('Symptom form not found!');
        }
        
        // Backup: Direct button click handler
        const submitBtn = $('.btn-modern.btn-primary-modern');
        console.log('Looking for submit button:', submitBtn);
        
        if (submitBtn) {
            submitBtn.addEventListener('click', function(e) {
                console.log('Submit button clicked directly!');
                e.preventDefault();
                e.stopPropagation();
                
                // Manually trigger form submission if needed
                const form = $('#symptomForm');
                if (form) {
                    const event = new Event('submit', { bubbles: true, cancelable: true });
                    form.dispatchEvent(event);
                }
                return false;
            });
        }
        
        // Setup logout function
        window.logout = function() {
            localStorage.removeItem('userName');
            window.location.href = 'index.html';
        };
        
        // Show entrance animations
        const elements = ['.hero-section', '.workflow-progress', '.symptom-input-section', '.agents-section-modern'];
        elements.forEach((selector, index) => {
            const element = $(selector);
            if (element) {
                element.style.opacity = '0';
                element.style.transform = 'translateY(30px)';
                
                setTimeout(() => {
                    element.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';
                }, index * 200);
            }
        });
        
        console.log('Dashboard initialization completed successfully!');
        
        // Show welcome notification
        setTimeout(() => {
            notification.show(`Welcome ${userName}! Your healthcare dashboard is ready.`, 'success');
        }, 1000);
        
    } catch (error) {
        console.error('Error initializing dashboard:', error);
        
        // Show error in the page
        const container = $('.container');
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #ef4444;">
                    <h2>Dashboard Loading Error</h2>
                    <p>There was an error loading the dashboard. Please try refreshing the page.</p>
                    <p><strong>Error:</strong> ${error.message}</p>
                    <button onclick="window.location.reload()" style="padding: 10px 20px; background: #0077be; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        Refresh Page
                    </button>
                </div>
            `;
        }
    }
});

// Backup initialization on window load
window.addEventListener('load', () => {
    console.log('Window fully loaded - backup initialization');
    
    // Try to initialize form if it wasn't already done
    const form = document.getElementById('symptomForm');
    if (form && !form.hasAttribute('data-initialized')) {
        console.log('Initializing form on window load...');
        
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Form submitted via backup handler!');
            
            const symptoms = document.getElementById('symptoms').value.trim();
            if (!symptoms) {
                alert('Please describe your symptoms');
                return false;
            }
            
            // Simple workflow start
            if (window.workflow) {
                workflow.startJourney({ 
                    symptoms: symptoms,
                    severity: document.getElementById('severity').value,
                    duration: document.getElementById('duration').value
                });
            } else {
                console.error('Workflow not initialized');
            }
            return false;
        });
        
        form.setAttribute('data-initialized', 'true');
    }
});
