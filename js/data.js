/* ==========================================================================
   CXPulse Enterprise Mock Data Store
   Realistic, High-Fidelity Data for Hackathon Demonstration (INR Only)
   ========================================================================== */

const CX_DATA = {
  currentUser: {
    name: "Alex Morgan",
    role: "Head of Customer Experience",
    avatar: "AM",
    email: "alex.morgan@cxpulse.ai",
    status: "Active",
    orbitalTheme: "Autonomous Orbital Intelligence",
    aetherTheme: {
      themeName: "Aether Living Shader Aurora",
      engine: "WebGL 2.0 GPU Shader",
      shaderType: "Aether Cosmic Ray Mesh",
      headline: "Make the impossible feel inevitable.",
      subtitle: "Autonomous CX Intelligence with living shader telemetry & real-time churn radar.",
      dprMax: 2,
      activeStatus: "Online & Synchronized"
    },
    retentionScore: "94.8 CSAT",
    activeHubsCount: 48,
    protectedArr: "₹3,80,00,000",
    aiAutonomyRate: "78.4%",
    orbitalMeshStatus: "Synchronized",
    lastNeuralScan: "Just now"
  },

  metrics: {
    totalCustomers: {
      value: "14,820",
      change: "+8.4%",
      trend: "up-good",
      orbitalBand: "Tier-1 Global Mesh",
      sparkline: [22, 28, 25, 34, 38, 42, 49, 53, 58, 62]
    },
    openTickets: {
      value: "142",
      change: "-18.2%",
      trend: "down-good",
      sparkline: [180, 175, 168, 160, 154, 150, 145, 142]
    },
    atRiskCustomers: {
      value: "28",
      change: "+12%",
      trend: "up-bad",
      sparkline: [18, 19, 21, 20, 24, 25, 27, 28]
    },
    cxScore: {
      value: "89.4",
      change: "+4.1 pts",
      trend: "up-good",
      sparkline: [82, 83, 84, 85, 86, 88, 88.5, 89.4]
    }
  },

  aiHeroInsight: {
    id: "ai-pattern-01",
    tag: "AI DETECTED A PATTERN",
    title: "Delivery-related complaints increased 32% over the last 7 days.",
    impact: "High",
    impactBadge: "badge-critical",
    confidence: "94%",
    affectedCount: "84 Accounts (₹1,42,00,000 ARR)",
    recommendation: "Investigate fulfillment delays in EU West region and proactively notify affected customers with courtesy shipping upgrades.",
    affectedFilter: "delivery"
  },

  // Priority Queue: 5 High-Priority Customer Issues
  priorityQueue: [
    {
      id: "CUST-001",
      name: "Marcus Vance",
      email: "m.vance@finscale.io",
      company: "FinScale Technologies",
      avatar: "MV",
      avatarBg: "#E11D48",
      issue: "Refund delayed for 7 days & Tier 1 API sync offline",
      sentiment: "Negative",
      sentimentScore: -0.84,
      priority: "P1 - Critical",
      waitingTime: "24m ago",
      riskScore: 88,
      riskLevel: "Critical",
      ltv: "₹48,00,000 ARR",
      since: "Mar 2023",
      aiRecommendation: "Issue instant ₹15,000 credit and route to Senior VP engineering",
      intent: "Cancel Subscription / Chargeback Threat",
      emotion: "Extreme Frustration & Urgency",
      whyRisk: [
        "3 unresolved complaints filed in last 14 days",
        "7 day refund delay on order #CX-9021",
        "Negative sentiment detected across last 3 tickets",
        "Customer satisfaction decreased 38% after billing revamp"
      ],
      nextActions: [
        "Issue instant courtesy credit of ₹15,000 and expedited reshipment.",
        "Connect directly with Senior Account Manager via priority line.",
        "Waive renewal price increase for next billing cycle."
      ],
      journey: [
        { label: "Account Created", time: "Mar 2023", status: "completed" },
        { label: "Tier Upgraded", time: "Oct 2023", status: "completed" },
        { label: "Payment Failed", time: "Sep 2026", status: "completed" },
        { label: "Refund Delayed", time: "5d ago", status: "critical" },
        { label: "AI Churn Alert", time: "Today", status: "active" }
      ],
      suggestedResponses: {
        default: "Hi Marcus,\n\nI sincerely apologize for the frustration with the 7-day refund delay and the API synchronization issue. I have personally escalated order #CX-9021 for immediate manual processing, and our VP of Engineering is already deploying a hotfix for your endpoint.\n\nTo make this right, I've credited ₹15,000 to your account and upgraded your support tier to 24/7 dedicated routing.\n\nBest regards,\nAlex Morgan | Head of CX",
        shorter: "Marcus,\n\nDeeply sorry for the delay on #CX-9021 and the API disruption. I've personally expedited your refund immediately and credited ₹15,000 to your balance. Our engineering lead is resolving the API sync now.\n\nAlex Morgan",
        empathetic: "Dear Marcus,\n\nI completely understand how critical this is for FinScale, and I am genuinely sorry for letting you down on both the refund turnaround and the API stability. You deserve immediate resolution, not excuses.\n\nI have issued the refund with top priority, credited ₹15,000 as a goodwill gesture, and assigned our Senior Solutions Architect directly to your integration.\n\nWarm regards,\nAlex Morgan",
        professional: "Marcus,\n\nThank you for bringing the delay with transaction #CX-9021 and the integration latency to our attention. Our finance team has initiated manual clearance today, and the technical incident has been escalated to Tier-3 support.\n\nA courtesy adjustment of ₹15,000 has been applied to your ledger for the inconvenience.\n\nSincerely,\nAlex Morgan"
      }
    },
    {
      id: "CUST-002",
      name: "Sarah Jenkins",
      email: "sarah.j@cloudnest.co",
      company: "CloudNest Networks",
      avatar: "SJ",
      avatarBg: "#F59E0B",
      issue: "Delivery package missing tracking details in EU hub",
      sentiment: "Negative",
      sentimentScore: -0.62,
      priority: "P1 - Urgent",
      waitingTime: "42m ago",
      riskScore: 76,
      riskLevel: "At Risk",
      ltv: "₹28,50,000 ARR",
      since: "Jan 2024",
      aiRecommendation: "Offer priority reshipment via DHL Express at zero charge",
      intent: "Missing Shipment / SLA Inquiry",
      emotion: "Anxiety & Impatience",
      whyRisk: [
        "EU fulfillment node transit bottleneck",
        "2 escalations in 48 hours without status change",
        "Quarterly renewal is pending in 18 days"
      ],
      nextActions: [
        "Dispatch replacement unit via courier next-day air.",
        "Provide direct WhatsApp/SMS courier tracking link.",
        "Schedule follow-up check-in upon delivery confirmation."
      ],
      journey: [
        { label: "Contract Signed", time: "Jan 2024", status: "completed" },
        { label: "Hardware Dispatched", time: "Sep 2026", status: "completed" },
        { label: "Customs Hold", time: "3d ago", status: "critical" },
        { label: "Urgent Escalation", time: "Today", status: "active" }
      ],
      suggestedResponses: {
        default: "Hi Sarah,\n\nThank you for reaching out. I see that your shipment was caught in the EU transit re-routing backlog. I have dispatched a replacement order via DHL Express priority delivery, tracking #DHL-882910.\n\nI will personally monitor the delivery until it arrives at your desk tomorrow morning.\n\nBest,\nAlex Morgan",
        shorter: "Hi Sarah,\n\nWe've dispatched a replacement package via DHL Express (#DHL-882910) arriving tomorrow morning. I'll personally track it through delivery.\n\nAlex",
        empathetic: "Hi Sarah,\n\nI know how stressful delayed hardware deliveries are for product launches. We take full responsibility for the hub delay, and I've already arranged an overnight replacement via DHL Express at our cost.\n\nAlex",
        professional: "Dear Sarah,\n\nRegarding shipment order #EU-402, our logistics team has intercepted the delayed parcel and dispatched an express consignment. Updated manifest details have been forwarded.\n\nAlex Morgan"
      }
    },
    {
      id: "CUST-003",
      name: "David Chen",
      email: "david@nexusai.dev",
      company: "Nexus AI Labs",
      avatar: "DC",
      avatarBg: "#8B5CF6",
      issue: "Enterprise SSO SAML 2.0 federation handshake timeout",
      sentiment: "Neutral",
      sentimentScore: -0.15,
      priority: "P2 - High",
      waitingTime: "1h ago",
      riskScore: 68,
      riskLevel: "At Risk",
      ltv: "₹62,00,000 ARR",
      since: "Jul 2023",
      aiRecommendation: "Provide updated Okta metadata XML and jump on Zoom debug bridge",
      intent: "Technical Configuration / Identity Setup",
      emotion: "Neutral Curiosity",
      whyRisk: [
        "150 enterprise users unable to log in this morning",
        "Contract size ₹62,00,000 with scheduled expansion in Q4"
      ],
      nextActions: [
        "Share pre-validated Okta identity provider certificate.",
        "Host instant 15-minute screen share with security engineer."
      ],
      journey: [
        { label: "Pilot Deployment", time: "Jul 2023", status: "completed" },
        { label: "Enterprise Upgrade", time: "Feb 2024", status: "completed" },
        { label: "SAML Migration", time: "Yesterday", status: "completed" },
        { label: "Handshake Timeout", time: "Today", status: "critical" }
      ],
      suggestedResponses: {
        default: "Hello David,\n\nOur identity security team reviewed your Okta metadata and detected a clock-skew mismatch on the entityID assertion. I've attached the verified XML certificate and opened an on-demand debug bridge if you'd like us to configure it live right now.\n\nAlex Morgan",
        shorter: "David,\n\nThe SAML handshake failure is caused by an entityID clock-skew mismatch. Attached is the corrected certificate. Let me know if you want a 5-minute screen share.\n\nAlex",
        empathetic: "Hi David,\n\nHaving 150 team members blocked on SSO is frustrating on a weekday morning. We're ready on a live bridge right now with the updated Okta metadata to get everyone back in immediately.\n\nAlex",
        professional: "Dear David,\n\nWe have diagnosed the SAML 2.0 handshake anomaly with your identity provider. The revised metadata descriptor is attached for your administrative portal update.\n\nAlex Morgan"
      }
    },
    {
      id: "CUST-004",
      name: "Elena Rostova",
      email: "elena.r@globallogix.de",
      company: "GlobalLogix Europe",
      avatar: "ER",
      avatarBg: "#10B981",
      issue: "Requesting custom webhook payloads for SAP ERP integration",
      sentiment: "Positive",
      sentimentScore: 0.72,
      priority: "P3 - Medium",
      waitingTime: "2h ago",
      riskScore: 22,
      riskLevel: "Satisfied",
      ltv: "₹95,00,000 ARR",
      since: "Nov 2022",
      aiRecommendation: "Share OpenAPI 3.1 webhook schema and SDK sample repo",
      intent: "Feature Enhancement / API Spec",
      emotion: "Collaborative & Engaged",
      whyRisk: [
        "High loyalty customer with 99% satisfaction record",
        "Evaluating ₹1,20,00,000 contract expansion"
      ],
      nextActions: [
        "Send pre-built SAP connector schema.",
        "Invite to Q4 Beta testing cohort for Webhooks v2."
      ],
      journey: [
        { label: "Signed", time: "Nov 2022", status: "completed" },
        { label: "Expansion", time: "2023", status: "completed" },
        { label: "Webhook Inquiry", time: "Today", status: "active" }
      ],
      suggestedResponses: {
        default: "Hi Elena,\n\nGreat to hear from you! We've prepared custom webhook payloads specifically compatible with SAP NetWeaver and S/4HANA schemas. I've linked the full OpenAPI 3.1 definitions and sample payloads below.\n\nAlex Morgan",
        shorter: "Elena, wonderful to hear from you. Here is the OpenAPI 3.1 schema tuned for SAP integrations. Let me know if you need customized JSON payloads!\n\nAlex",
        empathetic: "Hi Elena,\n\nAlways a pleasure working with your team! We love how GlobalLogix is pushing the boundaries of automated logistics. Here is the exact schema you need to streamline the SAP rollout.\n\nAlex",
        professional: "Dear Elena,\n\nPlease find enclosed the technical specifications and payload schema compliant with enterprise SAP ingestion protocols.\n\nAlex Morgan"
      }
    },
    {
      id: "CUST-005",
      name: "Liam Gallagher",
      email: "liam@retailflow.uk",
      company: "RetailFlow Commerce",
      avatar: "LG",
      avatarBg: "#E11D48",
      issue: "Checkout webhook failed during Flash Sale peak traffic",
      sentiment: "Negative",
      sentimentScore: -0.91,
      priority: "P1 - Critical",
      waitingTime: "12m ago",
      riskScore: 92,
      riskLevel: "Critical",
      ltv: "₹34,00,000 ARR",
      since: "Apr 2024",
      aiRecommendation: "Engage priority incident commander and re-run dead-letter queue",
      intent: "Incident Outage / SLA Compensation",
      emotion: "High Outrage & Loss Concern",
      whyRisk: [
        "Missed checkout webhooks during peak flash sale",
        "SLA guarantee threshold breached (99.9%)",
        "High churn risk within 48h"
      ],
      nextActions: [
        "Replay 1,420 failed webhook events from dead-letter backup queue.",
        "Provide root cause post-mortem within 2 hours.",
        "Issue ₹45,000 enterprise infrastructure credit."
      ],
      journey: [
        { label: "Onboarded", time: "Apr 2024", status: "completed" },
        { label: "Sale Launch", time: "Today 09:00", status: "completed" },
        { label: "Webhook Timeout", time: "Today 09:14", status: "critical" },
        { label: "Incident Escalated", time: "Now", status: "active" }
      ],
      suggestedResponses: {
        default: "Liam,\n\nI understand the critical impact on your flash sale. Our infrastructure team isolated the webhook queue bottleneck and is replaying all 1,420 events directly into your database right now. No transactions are lost.\n\nI will stay on this line until all orders are reconciled.\n\nAlex Morgan",
        shorter: "Liam, the webhook buffer is restored and actively replaying all 1,420 missed events into your system now. Zero data lost. Updating you every 15 minutes.\n\nAlex",
        empathetic: "Liam, there is nothing worse than an infrastructure glitch during a flash sale. I am directly on this with our chief architect. Every single transaction has been saved in our cold queue and is completing now.\n\nAlex",
        professional: "Dear Liam,\n\nOur incident command center has mitigated the queue pressure. Replay procedures are active across all 1,420 captured payloads with verified delivery underway.\n\nAlex Morgan"
      }
    }
  ],

  // 35+ Radar Nodes with Indian Rupee (INR) amounts
  radarCustomers: [
    { id: "R-01", name: "Marcus Vance", company: "FinScale", sentiment: -0.84, risk: 88, value: 4800000, segment: "Critical", tickets: 4 },
    { id: "R-02", name: "Liam Gallagher", company: "RetailFlow", sentiment: -0.91, risk: 92, value: 3400000, segment: "Critical", tickets: 5 },
    { id: "R-03", name: "Sarah Jenkins", company: "CloudNest", sentiment: -0.62, risk: 76, value: 2850000, segment: "At Risk", tickets: 3 },
    { id: "R-04", name: "David Chen", company: "NexusAI", sentiment: -0.25, risk: 68, value: 6200000, segment: "At Risk", tickets: 2 },
    { id: "R-05", name: "Elena Rostova", company: "GlobalLogix", sentiment: 0.72, risk: 22, value: 9500000, segment: "Satisfied", tickets: 1 },
    { id: "R-06", name: "Zack Snyder", company: "OmniCorp", sentiment: -0.75, risk: 84, value: 4200000, segment: "Critical", tickets: 3 },
    { id: "R-07", name: "Chloe Bennett", company: "AeroTech", sentiment: -0.45, risk: 65, value: 3100000, segment: "At Risk", tickets: 2 },
    { id: "R-08", name: "Hiroshi Sato", company: "KantoRobotics", sentiment: 0.88, risk: 14, value: 11000000, segment: "Happy", tickets: 0 },
    { id: "R-09", name: "Amara Okafor", company: "FinNova", sentiment: 0.05, risk: 42, value: 2200000, segment: "Neutral", tickets: 1 },
    { id: "R-10", name: "Lucas Meyer", company: "Veloce Mobility", sentiment: 0.92, risk: 10, value: 7800000, segment: "Happy", tickets: 0 },
    { id: "R-11", name: "Priya Sharma", company: "DataPulse India", sentiment: 0.64, risk: 25, value: 5400000, segment: "Satisfied", tickets: 1 },
    { id: "R-12", name: "Mateo Rossi", company: "Milano Fashion", sentiment: -0.58, risk: 72, value: 3600000, segment: "At Risk", tickets: 2 },
    { id: "R-13", name: "Astrid Lindgren", company: "NordicPay", sentiment: 0.85, risk: 15, value: 8900000, segment: "Happy", tickets: 0 },
    { id: "R-14", name: "Carlos Santana", company: "Solaria Energy", sentiment: -0.15, risk: 48, value: 2900000, segment: "Neutral", tickets: 1 },
    { id: "R-15", name: "Fatima Al-Mansoor", company: "GulfLogistics", sentiment: 0.55, risk: 30, value: 6700000, segment: "Satisfied", tickets: 1 },
    { id: "R-16", name: "Julian Thorne", company: "Apex Biotech", sentiment: -0.80, risk: 86, value: 5800000, segment: "Critical", tickets: 4 },
    { id: "R-17", name: "Nadia Volkov", company: "CyberShield", sentiment: 0.12, risk: 38, value: 4500000, segment: "Neutral", tickets: 1 },
    { id: "R-18", name: "Oliver Queen", company: "StarCity Tech", sentiment: 0.78, risk: 18, value: 8200000, segment: "Happy", tickets: 0 },
    { id: "R-19", name: "Tariq Malik", company: "Indus Commerce", sentiment: -0.35, risk: 62, value: 2600000, segment: "At Risk", tickets: 2 },
    { id: "R-20", name: "Grace Hopper", company: "Compiler Works", sentiment: 0.95, risk: 8, value: 12500000, segment: "Happy", tickets: 0 },
    { id: "R-21", name: "Kenji Takahashi", company: "Zenith IoT", sentiment: -0.68, risk: 79, value: 3900000, segment: "Critical", tickets: 3 },
    { id: "R-22", name: "Sophie Martin", company: "Lyon MedTech", sentiment: 0.60, risk: 28, value: 5100000, segment: "Satisfied", tickets: 1 },
    { id: "R-23", name: "Devon Walker", company: "Strata Analytics", sentiment: -0.10, risk: 45, value: 3300000, segment: "Neutral", tickets: 1 },
    { id: "R-24", name: "Maya Angel", company: "BrightPath Ed", sentiment: 0.82, risk: 16, value: 7200000, segment: "Happy", tickets: 0 },
    { id: "R-25", name: "Henrik Ibsen", company: "Fjord Media", sentiment: -0.52, risk: 66, value: 2400000, segment: "At Risk", tickets: 2 }
  ],

  // Executive AI Insights Page Data
  insights: [
    {
      id: "INS-01",
      type: "EMERGING ISSUE",
      badgeClass: "badge-critical",
      title: "Refund complaints increased 21% in 48 hours",
      confidence: "91%",
      affectedCustomers: 84,
      impact: "₹1,18,00,000 ARR exposed",
      rootCause: "Automated webhook retry timeout during payment gateway migration.",
      recommendation: "Investigate refund processing delays and provision automated retry fallbacks.",
      cta: "View affected tickets"
    },
    {
      id: "INS-02",
      type: "CHURN RISK ALERT",
      badgeClass: "badge-warning",
      title: "Mid-Market SaaS cohort showing 24% drop in weekly active sessions",
      confidence: "88%",
      affectedCustomers: 19,
      impact: "₹74,00,000 ARR exposed",
      rootCause: "New navigation menu obscured the custom reporting export tool.",
      recommendation: "Trigger in-app guided walkthrough tooltip and notify customer success managers.",
      cta: "Deploy Retention Campaign"
    },
    {
      id: "INS-03",
      type: "SENTIMENT TREND",
      badgeClass: "badge-positive",
      title: "New AI Response Assistant received 94% positive rating from tier-1 agents",
      confidence: "96%",
      affectedCustomers: 1420,
      impact: "Reduced mean time to resolution by 3.8 minutes",
      rootCause: "Automated empathetic context suggestions reduced agent cognitive fatigue.",
      recommendation: "Enable autonomous auto-pilot drafting on low-risk queries.",
      cta: "Export Intelligence Report"
    }
  ],

  topComplaints: [
    { category: "Delivery & Transit Delays", percentage: 38, count: 184, trend: "+14%" },
    { category: "Refund / Billing Gateway Errors", percentage: 27, count: 129, trend: "+21%" },
    { category: "API Rate Limiting & Webhooks", percentage: 19, count: 92, trend: "-5%" },
    { category: "SAML 2.0 / SSO Configuration", percentage: 16, count: 77, trend: "+2%" }
  ]
};
