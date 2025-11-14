const MOCK_DOCTORS = [
  { name:"Dr. Alicia Rivera", specialty:"Cardiology", distance:1.2, inNetwork:true, rating:4.8, address:"123 Main St" },
  { name:"Dr. Ben Ahmed", specialty:"Dermatology", distance:3.4, inNetwork:true, rating:4.6, address:"42 Oak Ave" },
  { name:"Dr. Chen Li", specialty:"Neurology", distance:6.1, inNetwork:false, rating:4.4, address:"9 Pine Rd" },
];

const MOCK_COVERAGE = (plan, service)=>({
  plan: plan || "Cigna PPO",
  service: service || "Specialist Visit",
  covered: true, copay: "$25", requiresPA: false, deductibleRemaining: "$350"
});

const MOCK_MED_COVERAGE = (drug)=>({
  name: drug || "Atorvastatin 20mg",
  covered: true, tier: 2, copay: "$10", qtyLimit: "30 tabs / 30 days", priorAuth: false
});


// --- Richer insurance data for presentation ---
function MOCK_COVERAGE_PLUS(plan = "Cigna PPO", service = "Specialist Visit") {
  return {
    // core
    plan, service,
    covered: true,
    copay: "$25",
    requiresPA: false,
    deductibleRemaining: "$350",
    // plan identity
    planType: "PPO",
    tier: "Tier 2 (Preferred)",
    inNetwork: true,
    effectiveDate: "2025-01-01",
    memberId: "ABC123456",
    groupNumber: "G-87421",
    // cost structure
    coinsurance: "20% after deductible",
    oopMax: "$3,000 individual / $6,000 family",
    pcpCopay: "$15",
    specialistCopay: "$25",
    telehealthCopay: "$10",
    erCopay: "$150 (waived if admitted)",
    urgentCareCopay: "$40",
    imagingCost: "20% MRI/CT after deductible",
    labCost: "$0 for standard labs",
    // benefits
    preventiveCareCovered: "100% in-network",
    mentalHealthCopay: "$25 (outpatient)",
    rehabTherapyLimit: "30 visits/year PT/OT combined",
    chiropracticLimit: "12 visits/year",
    // rules
    referralRequired: false,
    outOfNetworkCoverage: "60% of allowed amount after deductible",
    // extras
    notes: [
      "Virtual visits covered via designated telehealth partners.",
      "Prior authorization may apply to advanced imaging.",
      "Brand-name meds may require step therapy."
    ]
  };
}
