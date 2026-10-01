'use strict';

require('dotenv').config();
const { supabase } = require('../src/config/supabase');
const { hashPassword } = require('../src/utils/password');

async function seedDatabase() {
  console.log('====================================================');
  console.log('🌱 Starting CXPulse Comprehensive Database Seeder...');
  console.log('====================================================');

  try {
    // ---------------------------------------------------------------------------
    // 1. SEED 3 USERS (Admin & Support Agents)
    // ---------------------------------------------------------------------------
    console.log('🔐 Seeding Users...');
    const hashedAdminPassword = await hashPassword('cxpulse2026');
    const hashedAgentPassword = await hashPassword('password123');

    const users = [
      {
        email: 'alex.morgan@cxpulse.ai',
        password_hash: hashedAdminPassword,
        name: 'Alex Morgan',
        role: 'admin',
        avatar: 'AM',
        status: 'Active'
      },
      {
        email: 'priya.sharma@cxpulse.ai',
        password_hash: hashedAgentPassword,
        name: 'Priya Sharma',
        role: 'support_agent',
        avatar: 'PS',
        status: 'Active'
      },
      {
        email: 'lucas.meyer@cxpulse.ai',
        password_hash: hashedAgentPassword,
        name: 'Lucas Meyer',
        role: 'support_agent',
        avatar: 'LM',
        status: 'Active'
      }
    ];

    const { data: seededUsers, error: userErr } = await supabase
      .from('users')
      .upsert(users, { onConflict: 'email' })
      .select('id, email, name, role');

    if (userErr) {
      console.warn('⚠️ Users seeding warning:', userErr.message);
    } else {
      console.log(`✅ ${seededUsers ? seededUsers.length : users.length} Users seeded successfully`);
    }

    const defaultAgentId = seededUsers && seededUsers.length > 0 ? seededUsers[0].id : null;

    // ---------------------------------------------------------------------------
    // 2. SEED 30 CUSTOMERS
    // ---------------------------------------------------------------------------
    console.log('🏢 Seeding 30 Customers...');
    const rawCustomers = [
      { name: 'Marcus Vance', email: 'm.vance@finscale.io', company: 'FinScale Technologies', phone: '+1 (415) 890-1201', avatar: 'MV', avatar_bg: '#E11D48', total_orders: 14, total_spent: 48000, satisfaction_score: 1.8, customer_risk: 'Critical', risk_score: 88, ltv: '$48,000 ARR', since: 'Mar 2023', risk_factors: ['3 unresolved complaints in last 14 days', '7 day refund delay on order #CX-9021', 'Negative sentiment across 3 tickets', 'Satisfaction decreased 38% after billing revamp'] },
      { name: 'Sarah Jenkins', email: 'sarah.j@cloudnest.co', company: 'CloudNest Networks', phone: '+1 (650) 441-9982', avatar: 'SJ', avatar_bg: '#F59E0B', total_orders: 8, total_spent: 28500, satisfaction_score: 2.3, customer_risk: 'High', risk_score: 76, ltv: '$28,500 ARR', since: 'Jan 2024', risk_factors: ['EU fulfillment node transit bottleneck', '2 escalations in 48 hours without status change', 'Quarterly renewal pending in 18 days'] },
      { name: 'David Chen', email: 'david@nexusai.dev', company: 'Nexus AI Labs', phone: '+1 (206) 555-0144', avatar: 'DC', avatar_bg: '#8B5CF6', total_orders: 22, total_spent: 62000, satisfaction_score: 3.1, customer_risk: 'High', risk_score: 68, ltv: '$62,000 ARR', since: 'Jul 2023', risk_factors: ['150 enterprise users unable to log in via SSO', 'Contract size $62K with scheduled expansion in Q4'] },
      { name: 'Elena Rostova', email: 'elena.r@globallogix.de', company: 'GlobalLogix Europe', phone: '+49 30 901820', avatar: 'ER', avatar_bg: '#10B981', total_orders: 45, total_spent: 95000, satisfaction_score: 4.8, customer_risk: 'Low', risk_score: 22, ltv: '$95,000 ARR', since: 'Nov 2022', risk_factors: ['High loyalty customer with 99% satisfaction record', 'Evaluating $120k contract expansion'] },
      { name: 'Liam Gallagher', email: 'liam@retailflow.uk', company: 'RetailFlow Commerce', phone: '+44 20 7946 0912', avatar: 'LG', avatar_bg: '#E11D48', total_orders: 19, total_spent: 34000, satisfaction_score: 1.2, customer_risk: 'Critical', risk_score: 92, ltv: '$34,000 ARR', since: 'Apr 2024', risk_factors: ['Missed checkout webhooks during peak flash sale', 'SLA guarantee threshold breached (99.9%)', 'Threatening public social escalation'] },
      { name: 'Zack Snyder', email: 'zack@omnicorp.net', company: 'OmniCorp Dynamics', phone: '+1 (312) 555-0199', avatar: 'ZS', avatar_bg: '#E11D48', total_orders: 12, total_spent: 42000, satisfaction_score: 2.1, customer_risk: 'Critical', risk_score: 84, ltv: '$42,000 ARR', since: 'Aug 2023', risk_factors: ['Repeated database latency spikes', 'Unanswered ticket over 48h'] },
      { name: 'Chloe Bennett', email: 'chloe@aerotech.io', company: 'AeroTech Avionics', phone: '+1 (213) 555-0188', avatar: 'CB', avatar_bg: '#F59E0B', total_orders: 7, total_spent: 31000, satisfaction_score: 3.4, customer_risk: 'Medium', risk_score: 65, ltv: '$31,000 ARR', since: 'Feb 2024', risk_factors: ['Invoice mismatch on quarterly billing'] },
      { name: 'Hiroshi Sato', email: 'sato@kantorobotics.jp', company: 'Kanto Robotics', phone: '+81 3 5555 0123', avatar: 'HS', avatar_bg: '#10B981', total_orders: 60, total_spent: 110000, satisfaction_score: 4.9, customer_risk: 'Low', risk_score: 14, ltv: '$110,000 ARR', since: 'Jan 2022', risk_factors: ['Champion account, active beta tester'] },
      { name: 'Amara Okafor', email: 'amara@finnova.ng', company: 'FinNova Africa', phone: '+234 1 234 5678', avatar: 'AO', avatar_bg: '#6366F1', total_orders: 11, total_spent: 22000, satisfaction_score: 3.8, customer_risk: 'Medium', risk_score: 42, ltv: '$22,000 ARR', since: 'Sep 2023', risk_factors: ['Payment gateway timeout in Lagos region'] },
      { name: 'Lucas Meyer', email: 'lucas@velocemobility.fr', company: 'Veloce Mobility', phone: '+33 1 42 68 55 00', avatar: 'LM', avatar_bg: '#10B981', total_orders: 38, total_spent: 78000, satisfaction_score: 4.7, customer_risk: 'Low', risk_score: 10, ltv: '$78,000 ARR', since: 'May 2022', risk_factors: ['Zero unresolved complaints in 12 months'] },
      { name: 'Priya Sharma', email: 'priya@datapulse.in', company: 'DataPulse Systems', phone: '+91 80 2345 6789', avatar: 'PS', avatar_bg: '#10B981', total_orders: 29, total_spent: 54000, satisfaction_score: 4.6, customer_risk: 'Low', risk_score: 25, ltv: '$54,000 ARR', since: 'Nov 2023', risk_factors: ['Expanding seats from 50 to 120'] },
      { name: 'Mateo Rossi', email: 'm.rossi@milanofashion.it', company: 'Milano Fashion Group', phone: '+39 02 8899 1122', avatar: 'MR', avatar_bg: '#F59E0B', total_orders: 15, total_spent: 36000, satisfaction_score: 2.7, customer_risk: 'High', risk_score: 72, ltv: '$36,000 ARR', since: 'Apr 2023', risk_factors: ['Cart abandonment tracking discrepancy'] },
      { name: 'Astrid Lindgren', email: 'astrid@nordicpay.se', company: 'NordicPay AB', phone: '+46 8 123 4567', avatar: 'AL', avatar_bg: '#10B981', total_orders: 52, total_spent: 89000, satisfaction_score: 4.8, customer_risk: 'Low', risk_score: 15, ltv: '$89,000 ARR', since: 'Jan 2023', risk_factors: ['High usage tier 1 partner'] },
      { name: 'Carlos Santana', email: 'carlos@solariaenergy.es', company: 'Solaria Energy', phone: '+34 91 555 4321', avatar: 'CS', avatar_bg: '#6366F1', total_orders: 10, total_spent: 29000, satisfaction_score: 3.6, customer_risk: 'Medium', risk_score: 48, ltv: '$29,000 ARR', since: 'Jul 2024', risk_factors: ['Telemetry ingestion rate limit hits'] },
      { name: 'Fatima Al-Mansoor', email: 'fatima@gulflogistics.ae', company: 'Gulf Logistics UAE', phone: '+971 4 321 9876', avatar: 'FA', avatar_bg: '#10B981', total_orders: 34, total_spent: 67000, satisfaction_score: 4.4, customer_risk: 'Low', risk_score: 30, ltv: '$67,000 ARR', since: 'Aug 2023', risk_factors: ['Custom reporting dashboard request'] },
      { name: 'Julian Thorne', email: 'julian@apexbiotech.com', company: 'Apex BioTech Corp', phone: '+1 (617) 555-0133', avatar: 'JT', avatar_bg: '#E11D48', total_orders: 18, total_spent: 58000, satisfaction_score: 1.9, customer_risk: 'Critical', risk_score: 86, ltv: '$58,000 ARR', since: 'Feb 2023', risk_factors: ['HIPAA compliance certification documentation missing', 'Legal counsel inquiry'] },
      { name: 'Nadia Volkov', email: 'nadia@cybershield.io', company: 'CyberShield Systems', phone: '+1 (408) 555-0177', avatar: 'NV', avatar_bg: '#6366F1', total_orders: 16, total_spent: 45000, satisfaction_score: 3.9, customer_risk: 'Medium', risk_score: 38, ltv: '$45,000 ARR', since: 'May 2023', risk_factors: ['API token rotation assistance'] },
      { name: 'Oliver Queen', email: 'oliver@starcitytech.com', company: 'StarCity Tech', phone: '+1 (206) 555-0191', avatar: 'OQ', avatar_bg: '#10B981', total_orders: 40, total_spent: 82000, satisfaction_score: 4.7, customer_risk: 'Low', risk_score: 18, ltv: '$82,000 ARR', since: 'Dec 2022', risk_factors: ['Annual renewal approved'] },
      { name: 'Tariq Malik', email: 'tariq@induscommerce.pk', company: 'Indus Commerce', phone: '+92 21 3456 7890', avatar: 'TM', avatar_bg: '#F59E0B', total_orders: 9, total_spent: 26000, satisfaction_score: 3.0, customer_risk: 'High', risk_score: 62, ltv: '$26,000 ARR', since: 'Jan 2024', risk_factors: ['Multi-currency conversion rounding error'] },
      { name: 'Grace Hopper', email: 'grace@compilerworks.org', company: 'Compiler Works', phone: '+1 (212) 555-0100', avatar: 'GH', avatar_bg: '#10B981', total_orders: 80, total_spent: 125000, satisfaction_score: 5.0, customer_risk: 'Low', risk_score: 8, ltv: '$125,000 ARR', since: 'Jan 2021', risk_factors: ['VIP Founder account'] },
      { name: 'Kenji Takahashi', email: 'kenji@zenithiot.jp', company: 'Zenith IoT Japan', phone: '+81 6 6666 0199', avatar: 'KT', avatar_bg: '#E11D48', total_orders: 14, total_spent: 39000, satisfaction_score: 2.2, customer_risk: 'Critical', risk_score: 79, ltv: '$39,000 ARR', since: 'Mar 2023', risk_factors: ['Firmware OTA update payload rejected by CDN'] },
      { name: 'Sophie Martin', email: 'sophie@lyonmedtech.fr', company: 'Lyon MedTech', phone: '+33 4 78 90 12 34', avatar: 'SM', avatar_bg: '#10B981', total_orders: 26, total_spent: 51000, satisfaction_score: 4.5, customer_risk: 'Low', risk_score: 28, ltv: '$51,000 ARR', since: 'Oct 2023', risk_factors: ['Requesting additional sandbox environment'] },
      { name: 'Devon Walker', email: 'devon@strataanalytics.com', company: 'Strata Analytics', phone: '+1 (512) 555-0166', avatar: 'DW', avatar_bg: '#6366F1', total_orders: 13, total_spent: 33000, satisfaction_score: 3.7, customer_risk: 'Medium', risk_score: 45, ltv: '$33,000 ARR', since: 'Aug 2023', risk_factors: ['Snowflake data connector setup guidance'] },
      { name: 'Maya Angel', email: 'maya@brightpathed.org', company: 'BrightPath Education', phone: '+1 (415) 555-0155', avatar: 'MA', avatar_bg: '#10B981', total_orders: 33, total_spent: 72000, satisfaction_score: 4.6, customer_risk: 'Low', risk_score: 16, ltv: '$72,000 ARR', since: 'Jun 2023', risk_factors: ['Student onboarding webinar request'] },
      { name: 'Henrik Ibsen', email: 'henrik@fjordmedia.no', company: 'Fjord Media Group', phone: '+47 22 33 44 55', avatar: 'HI', avatar_bg: '#F59E0B', total_orders: 8, total_spent: 24000, satisfaction_score: 2.9, customer_risk: 'High', risk_score: 66, ltv: '$24,000 ARR', since: 'Nov 2023', risk_factors: ['Video streaming transcode buffer error'] },
      { name: 'Arthur Pendelton', email: 'arthur@camelotlogistics.co.uk', company: 'Camelot Logistics', phone: '+44 161 999 8888', avatar: 'AP', avatar_bg: '#10B981', total_orders: 25, total_spent: 59000, satisfaction_score: 4.3, customer_risk: 'Low', risk_score: 32, ltv: '$59,000 ARR', since: 'Jul 2023', risk_factors: ['Custom barcode scanning plugin feedback'] },
      { name: 'Beatrice Vane', email: 'beatrice@vectorcapital.ch', company: 'Vector Capital Partners', phone: '+41 22 700 8090', avatar: 'BV', avatar_bg: '#6366F1', total_orders: 17, total_spent: 46000, satisfaction_score: 3.8, customer_risk: 'Medium', risk_score: 40, ltv: '$46,000 ARR', since: 'May 2023', risk_factors: ['SOC2 Type II compliance report download'] },
      { name: 'Connor MacLeod', email: 'connor@highlandenergy.scot', company: 'Highland Renewable Energy', phone: '+44 131 555 7766', avatar: 'CM', avatar_bg: '#10B981', total_orders: 28, total_spent: 63000, satisfaction_score: 4.7, customer_risk: 'Low', risk_score: 19, ltv: '$63,000 ARR', since: 'Sep 2022', risk_factors: ['SCADA telemetry dashboard integration'] },
      { name: 'Daria Petrova', email: 'daria@aurorasoftware.pl', company: 'Aurora Software Sp.', phone: '+48 22 123 4567', avatar: 'DP', avatar_bg: '#F59E0B', total_orders: 10, total_spent: 27000, satisfaction_score: 3.2, customer_risk: 'High', risk_score: 64, ltv: '$27,000 ARR', since: 'Feb 2024', risk_factors: ['Kubernetes Helm chart deployment question'] },
      { name: 'Elijah Sterling', email: 'elijah@sterlingfintech.com', company: 'Sterling Fintech Global', phone: '+1 (212) 555-0189', avatar: 'ES', avatar_bg: '#10B981', total_orders: 48, total_spent: 105000, satisfaction_score: 4.9, customer_risk: 'Low', risk_score: 12, ltv: '$105,000 ARR', since: 'Aug 2021', risk_factors: ['Enterprise Platinum tier partner'] }
    ];

    const { data: seededCustomers, error: custErr } = await supabase
      .from('customers')
      .upsert(rawCustomers, { onConflict: 'email' })
      .select('id, email, name, company, customer_risk, risk_score');

    if (custErr) {
      console.warn('⚠️ Customers seeding warning:', custErr.message);
    } else {
      console.log(`✅ ${seededCustomers ? seededCustomers.length : rawCustomers.length} Customers seeded successfully`);
    }

    // Map customer email to ID for foreign key assignment
    const customerMap = {};
    if (seededCustomers) {
      seededCustomers.forEach(c => {
        customerMap[c.email] = c.id;
      });
    }

    // ---------------------------------------------------------------------------
    // 3. SEED 80 REALISTIC TICKETS (Varied Cases, Sentiments, Intents, Risks)
    // ---------------------------------------------------------------------------
    console.log('🎫 Seeding 80 Tickets & Priority Queue...');

    const ticketTemplates = [
      // 1. Refund Delays & Payment Issues
      { subject: 'Refund delayed for 7 days & Tier 1 API sync offline', issue: 'Refund delayed for 7 days on order #CX-9021. Our finance team cannot reconcile transactions while API sync is dead.', email: 'm.vance@finscale.io', status: 'open', priority: 'P1 - Critical', intent: 'Refund Delay / Chargeback Threat', sentiment: 'Critical', sentiment_score: -0.84, emotion: 'Extreme Frustration & Urgency', customer_risk: 'Critical', risk_score: 88, requires_escalation: true, ai_recommendation: 'Issue instant $150 credit and route to Senior VP engineering' },
      { subject: 'Double charge on invoice #INV-2026-08', issue: 'We were billed twice for the enterprise license renewal on March 28th.', email: 'm.vance@finscale.io', status: 'resolved', priority: 'P2 - High', intent: 'Billing Dispute / Double Charge', sentiment: 'Negative', sentiment_score: -0.65, emotion: 'Concerned & Annoyed', customer_risk: 'Critical', risk_score: 85, requires_escalation: false, ai_recommendation: 'Void second transaction and notify customer ledger' },
      { subject: 'Stripe webhook retry failure during flash sale', issue: 'Checkout webhook failed during Flash Sale peak traffic with 1,420 missed payloads.', email: 'liam@retailflow.uk', status: 'open', priority: 'P1 - Critical', intent: 'Incident Outage / SLA Compensation', sentiment: 'Critical', sentiment_score: -0.91, emotion: 'High Outrage & Loss Concern', customer_risk: 'Critical', risk_score: 92, requires_escalation: true, ai_recommendation: 'Engage priority incident commander and re-run dead-letter queue' },
      { subject: 'Credit card update failing with error code 402', issue: 'Trying to update our corporate Visa card but your billing portal returns 402 Gateway error.', email: 'liam@retailflow.uk', status: 'in_progress', priority: 'P2 - High', intent: 'Payment Gateway Error', sentiment: 'Negative', sentiment_score: -0.58, emotion: 'Impatient', customer_risk: 'Critical', risk_score: 80, requires_escalation: false, ai_recommendation: 'Send secure 3D-Secure direct link' },

      // 2. Delivery & Transit Delays
      { subject: 'Delivery package missing tracking details in EU hub', issue: 'Consignment #EU-402 has been stuck in Frankfurt transit hub with no scan updates for 4 days.', email: 'sarah.j@cloudnest.co', status: 'open', priority: 'P1 - Urgent', intent: 'Missing Shipment / SLA Inquiry', sentiment: 'Negative', sentiment_score: -0.62, emotion: 'Anxiety & Impatience', customer_risk: 'High', risk_score: 76, requires_escalation: true, ai_recommendation: 'Offer priority reshipment via DHL Express at zero charge' },
      { subject: 'Customs clearance documents requested for UK dispatch', issue: 'Border control in Dover requires commercial invoice with EORI identifier.', email: 'sarah.j@cloudnest.co', status: 'resolved', priority: 'P3 - Medium', intent: 'Customs Clearance Support', sentiment: 'Neutral', sentiment_score: 0.1, emotion: 'Inquiry', customer_risk: 'High', risk_score: 60, requires_escalation: false, ai_recommendation: 'Provide pre-populated customs manifest' },

      // 3. Technical, Identity & SSO Problems
      { subject: 'Enterprise SSO SAML 2.0 federation handshake timeout', issue: '150 enterprise engineers unable to authenticate via Okta SAML this morning due to clock-skew assertion error.', email: 'david@nexusai.dev', status: 'open', priority: 'P2 - High', intent: 'Technical Configuration / Identity Setup', sentiment: 'Neutral', sentiment_score: -0.15, emotion: 'Neutral Curiosity & Urgency', customer_risk: 'High', risk_score: 68, requires_escalation: true, ai_recommendation: 'Provide updated Okta metadata XML and jump on Zoom debug bridge' },
      { subject: 'OAuth2 refresh token expiring prematurely', issue: 'Our background daemon tokens are expiring after 1 hour instead of 30 days.', email: 'david@nexusai.dev', status: 'in_progress', priority: 'P2 - High', intent: 'OAuth2 Authentication Defect', sentiment: 'Negative', sentiment_score: -0.40, emotion: 'Frustrated', customer_risk: 'High', risk_score: 65, requires_escalation: false, ai_recommendation: 'Verify offline_access scope in client configuration' },

      // 4. Feature Requests & Positive Feedback
      { subject: 'Requesting custom webhook payloads for SAP ERP integration', issue: 'We want to ingest JSON events into our SAP S/4HANA instance. Do you support custom header signing?', email: 'elena.r@globallogix.de', status: 'open', priority: 'P3 - Medium', intent: 'Feature Enhancement / API Spec', sentiment: 'Positive', sentiment_score: 0.72, emotion: 'Collaborative & Engaged', customer_risk: 'Low', risk_score: 22, requires_escalation: false, ai_recommendation: 'Share OpenAPI 3.1 webhook schema and SDK sample repo' },
      { subject: 'Compliments to the support team on 2.0 release', issue: 'The new analytics UI is 10x faster. Our operations team is loving the automated retention predictions!', email: 'elena.r@globallogix.de', status: 'resolved', priority: 'P4 - Low', intent: 'Positive Feedback / Testimonial', sentiment: 'Positive', sentiment_score: 0.95, emotion: 'Delighted', customer_risk: 'Low', risk_score: 10, requires_escalation: false, ai_recommendation: 'Send appreciation note and request G2 badge quote' },

      // 5. Damaged Goods & Product Faults
      { subject: 'Damaged packaging on hardware shipment batch #91', issue: 'Two sensor enclosures arrived cracked during courier transport.', email: 'zack@omnicorp.net', status: 'open', priority: 'P1 - Critical', intent: 'Damaged Product / RMA Replacement', sentiment: 'Negative', sentiment_score: -0.75, emotion: 'Disappointment & Frustration', customer_risk: 'Critical', risk_score: 84, requires_escalation: true, ai_recommendation: 'Authorize immediate zero-cost RMA replacement' },
      { subject: 'Sensor calibration drift on unit SN-8821', issue: 'Temperature telemetry is reading 4 degrees higher than calibrated reference.', email: 'zack@omnicorp.net', status: 'resolved', priority: 'P3 - Medium', intent: 'Hardware Diagnostics', sentiment: 'Neutral', sentiment_score: -0.2, emotion: 'Analytical', customer_risk: 'Critical', risk_score: 70, requires_escalation: false, ai_recommendation: 'Run remote OTA sensor offset recalibration' },

      // 6. Regulatory & Legal
      { subject: 'HIPAA Business Associate Agreement (BAA) signing needed', issue: 'Our legal team requires signed BAA prior to ingesting patient telemetry records next week.', email: 'julian@apexbiotech.com', status: 'open', priority: 'P1 - Critical', intent: 'Compliance / Legal Clearance', sentiment: 'Negative', sentiment_score: -0.80, emotion: 'Legal Anxiety & Urgency', customer_risk: 'Critical', risk_score: 86, requires_escalation: true, ai_recommendation: 'Forward standard enterprise BAA DocuSign packet to VP Legal' },
      { subject: 'Audit logs export for SOC2 compliance review', issue: 'Need CSV export of all admin actions taken in the last 180 days.', email: 'julian@apexbiotech.com', status: 'resolved', priority: 'P2 - High', intent: 'Audit Export Request', sentiment: 'Neutral', sentiment_score: 0.0, emotion: 'Formal', customer_risk: 'Critical', risk_score: 75, requires_escalation: false, ai_recommendation: 'Generate encrypted audit log bundle in S3' },

      // 7. IoT & Firmware OTA Issues
      { subject: 'OTA firmware rollout failed on 45 edge nodes', issue: 'Node gateway bootloader rejected v3.4 firmware signature verification.', email: 'kenji@zenithiot.jp', status: 'open', priority: 'P1 - Critical', intent: 'Firmware Deployment Outage', sentiment: 'Critical', sentiment_score: -0.68, emotion: 'High Stress', customer_risk: 'Critical', risk_score: 79, requires_escalation: true, ai_recommendation: 'Re-issue signed cryptographic keys and initiate roll-back' },

      // 8. General Inquiries & Account Expansion
      { subject: 'Upgrading license tier to Enterprise Unlimited', issue: 'We are expanding to 200 seats and want to lock in annual volume pricing.', email: 'sato@kantorobotics.jp', status: 'resolved', priority: 'P3 - Medium', intent: 'Account Upgrade / Expansion', sentiment: 'Positive', sentiment_score: 0.88, emotion: 'Enthusiastic', customer_risk: 'Low', risk_score: 14, requires_escalation: false, ai_recommendation: 'Connect with VP Enterprise Sales' },
      { subject: 'API Rate limit increase request for Q4 shopping festival', issue: 'Expecting 50,000 req/min during Golden Week. Need quota boost on /v1/telemetry.', email: 'sato@kantorobotics.jp', status: 'open', priority: 'P2 - High', intent: 'Infrastructure Quota Upgrade', sentiment: 'Positive', sentiment_score: 0.65, emotion: 'Proactive Planning', customer_risk: 'Low', risk_score: 18, requires_escalation: false, ai_recommendation: 'Increase provisioned rate limiter ceiling in Redis' },

      { subject: 'Snowflake Direct Share setup question', issue: 'How do we configure our Snowflake reader account to stream live sentiment tables?', email: 'devon@strataanalytics.com', status: 'open', priority: 'P3 - Medium', intent: 'Data Warehouse Integration', sentiment: 'Neutral', sentiment_score: -0.10, emotion: 'Curious', customer_risk: 'Medium', risk_score: 45, requires_escalation: false, ai_recommendation: 'Provide step-by-step Snowflake Data Marketplace guide' },

      { subject: 'Video streaming buffer underrun in Nordic region', issue: 'HLS video fragments experiencing 600ms latency spikes in Oslo edge cluster.', email: 'henrik@fjordmedia.no', status: 'open', priority: 'P2 - High', intent: 'CDN Performance Degradation', sentiment: 'Negative', sentiment_score: -0.52, emotion: 'Concerned', customer_risk: 'High', risk_score: 66, requires_escalation: true, ai_recommendation: 'Re-route CDN edge node traffic to Stockholm POP' },

      { subject: 'Inquiry regarding SCADA Modbus protocol driver', issue: 'Does CXPulse support ingestion of industrial Modbus TCP telemetry payloads?', email: 'connor@highlandenergy.scot', status: 'resolved', priority: 'P4 - Low', intent: 'Protocol Capability Inquiry', sentiment: 'Positive', sentiment_score: 0.70, emotion: 'Collaborative', customer_risk: 'Low', risk_score: 19, requires_escalation: false, ai_recommendation: 'Send industrial IoT connector architecture sheet' }
    ];

    // Generate up to 80 diverse tickets by synthesizing variations across the customer pool
    const fullTicketsList = [];
    const intentPool = [
      'Refund Delay / Chargeback Threat',
      'Delivery Delay / SLA Inquiry',
      'Damaged Product / RMA Replacement',
      'Billing Dispute / Invoice Mismatch',
      'SSO SAML / Login Friction',
      'Cancellation / Churn Warning',
      'Repeat Outage Complaint',
      'Positive Feedback / Expansion',
      'Product Feature Request',
      'API Rate Limit & Webhooks'
    ];
    const sentimentPool = ['Positive', 'Neutral', 'Negative', 'Critical'];
    const priorityPool = ['P1 - Critical', 'P2 - High', 'P3 - Medium', 'P4 - Low'];
    const statusPool = ['open', 'open', 'in_progress', 'resolved', 'closed'];

    // First push the hand-crafted core tickets
    ticketTemplates.forEach((tpl, i) => {
      const custId = customerMap[tpl.email] || null;
      const custObj = rawCustomers.find(c => c.email === tpl.email) || rawCustomers[0];

      fullTicketsList.push({
        customer_id: custId,
        customer_name: custObj.name,
        customer_email: custObj.email,
        company: custObj.company,
        avatar: custObj.avatar,
        avatar_bg: custObj.avatar_bg,
        subject: tpl.subject,
        message: tpl.issue,
        issue: tpl.issue,
        status: tpl.status,
        priority: tpl.priority,
        intent: tpl.intent,
        sentiment: tpl.sentiment,
        sentiment_score: tpl.sentiment_score,
        emotion: tpl.emotion,
        customer_risk: tpl.customer_risk,
        risk_score: tpl.risk_score,
        ai_summary: `Customer is experiencing ${tpl.intent.toLowerCase()}. Immediate resolution advised.`,
        ai_response: `Hi ${custObj.name.split(' ')[0]},\n\nThank you for contacting CXPulse Executive Support regarding "${tpl.subject}". I have taken personal ownership of this matter.\n\nBest regards,\nAlex Morgan`,
        recommended_action: tpl.ai_recommendation,
        requires_escalation: tpl.requires_escalation,
        assigned_to: defaultAgentId,
        why_risk: custObj.risk_factors || [],
        next_actions: [
          `Review ${tpl.subject} details with engineering lead.`,
          `Verify SLA delivery within 2 hours.`,
          `Follow up directly with customer.`
        ],
        journey: [
          { label: 'Ticket Filed', time: 'Today', status: 'completed' },
          { label: 'AI Risk Analyzed', time: 'Today', status: 'completed' },
          { label: 'Assigned to Lead', time: 'Today', status: 'active' }
        ],
        suggested_responses: {
          default: `Hi ${custObj.name.split(' ')[0]},\n\nI sincerely apologize for the inconvenience regarding: "${tpl.issue}". I have personally escalated this ticket to our senior technical team.\n\nBest regards,\nAlex Morgan`,
          shorter: `Hi ${custObj.name.split(' ')[0]},\n\nWe are actively resolving the issue with "${tpl.subject}". A senior engineer is on this now.\n\nAlex`,
          empathetic: `Dear ${custObj.name.split(' ')[0]},\n\nI understand how critical this issue is for ${custObj.company}. You have our complete dedication to making this right immediately.\n\nAlex Morgan`,
          professional: `Dear ${custObj.name.split(' ')[0]},\n\nYour support inquiry regarding ticket #${1000 + i} has been routed to Tier-3 operations under priority SLA.\n\nAlex Morgan`
        },
        waiting_time: `${10 + (i * 7)}m ago`
      });
    });

    // Generate remaining tickets up to 80 total
    let indexCounter = ticketTemplates.length;
    while (fullTicketsList.length < 80) {
      const cust = rawCustomers[indexCounter % rawCustomers.length];
      const custId = customerMap[cust.email] || null;
      const intent = intentPool[indexCounter % intentPool.length];
      const priority = priorityPool[indexCounter % priorityPool.length];
      const status = statusPool[indexCounter % statusPool.length];
      const sentiment = sentimentPool[indexCounter % sentimentPool.length];

      let sentimentScore = 0.0;
      if (sentiment === 'Positive') sentimentScore = 0.75;
      else if (sentiment === 'Negative') sentimentScore = -0.60;
      else if (sentiment === 'Critical') sentimentScore = -0.88;

      const issueText = `Automated telemetry and customer interaction regarding: ${intent} for ${cust.company}.`;

      fullTicketsList.push({
        customer_id: custId,
        customer_name: cust.name,
        customer_email: cust.email,
        company: cust.company,
        avatar: cust.avatar,
        avatar_bg: cust.avatar_bg,
        subject: `[${intent}] Incident report #${2000 + indexCounter}`,
        message: issueText,
        issue: issueText,
        status: status,
        priority: priority,
        intent: intent,
        sentiment: sentiment,
        sentiment_score: sentimentScore,
        emotion: sentiment === 'Positive' ? 'Satisfied' : sentiment === 'Critical' ? 'Urgent & Frustrated' : 'Neutral Concern',
        customer_risk: cust.customer_risk,
        risk_score: cust.risk_score,
        ai_summary: `Summary of ${intent} incident affecting ${cust.name} at ${cust.company}.`,
        ai_response: `Hi ${cust.name.split(' ')[0]},\n\nThank you for reaching out. We have logged ticket #${2000 + indexCounter} and are investigating promptly.\n\nAlex Morgan`,
        recommended_action: `Monitor service health and verify resolution for ${cust.company}`,
        requires_escalation: priority === 'P1 - Critical',
        assigned_to: defaultAgentId,
        why_risk: cust.risk_factors || [],
        next_actions: [`Acknowledge SLA window`, `Provide fix within SLA`],
        journey: [{ label: 'Created', time: '1h ago', status: 'completed' }, { label: 'In Progress', time: 'Now', status: 'active' }],
        suggested_responses: {
          default: `Hi ${cust.name.split(' ')[0]},\n\nWe are actively working on your request regarding ${intent}.\n\nAlex Morgan`
        },
        waiting_time: `${5 + (indexCounter * 3)}m ago`
      });

      indexCounter++;
    }

    const { data: seededTickets, error: ticketErr } = await supabase
      .from('tickets')
      .insert(fullTicketsList)
      .select('id, customer_id, subject, status, priority');

    if (ticketErr) {
      console.warn('⚠️ Tickets seeding warning:', ticketErr.message);
    } else {
      console.log(`✅ ${seededTickets ? seededTickets.length : fullTicketsList.length} Tickets seeded successfully`);
    }

    // ---------------------------------------------------------------------------
    // 4. SEED TICKET MESSAGES (Multi-turn conversations)
    // ---------------------------------------------------------------------------
    console.log('💬 Seeding Ticket Conversation Messages...');
    if (seededTickets && seededTickets.length > 0) {
      const messagesToSeed = [];
      seededTickets.slice(0, 15).forEach((t, idx) => {
        messagesToSeed.push(
          {
            ticket_id: t.id,
            sender_type: 'customer',
            sender_name: 'Customer',
            message: `Hello, I need urgent assistance regarding: ${t.subject}. This is impacting our active workflow.`
          },
          {
            ticket_id: t.id,
            sender_type: 'ai',
            sender_name: 'CXPulse AI Copilot',
            message: `AI Analysis Complete: Intent detected as high priority. Suggested immediate review of affected integration endpoints.`
          },
          {
            ticket_id: t.id,
            sender_type: 'agent',
            sender_name: 'Alex Morgan',
            message: `Hi there, I have reviewed your case and escalated this directly to our senior response team.`
          }
        );
      });

      const { error: msgErr } = await supabase.from('ticket_messages').insert(messagesToSeed);
      if (msgErr) console.warn('⚠️ Messages seeding warning:', msgErr.message);
      else console.log(`✅ ${messagesToSeed.length} Ticket Messages seeded successfully`);
    }

    // ---------------------------------------------------------------------------
    // 5. SEED AI INSIGHTS
    // ---------------------------------------------------------------------------
    console.log('🧠 Seeding AI Executive Insights...');
    const insights = [
      {
        tag: 'AI DETECTED A PATTERN',
        title: 'Delivery-related complaints increased 32% over the last 7 days.',
        impact: 'High',
        impact_badge: 'badge-critical',
        confidence: '94%',
        affected_count: '84 Accounts ($142k ARR)',
        recommendation: 'Investigate fulfillment delays in EU West region and proactively notify affected customers with courtesy shipping upgrades.',
        affected_filter: 'delivery',
        summary: 'Delivery bottlenecks in EU transit hub have caused a spike in negative sentiment across 84 enterprise accounts.',
        top_issues: [
          { issue: 'EU Transit Hub Bottleneck', count: 42, severity: 'High' },
          { issue: 'Missing Tracking Webhooks', count: 28, severity: 'Medium' },
          { issue: 'Customs Paperwork Delay', count: 14, severity: 'Medium' }
        ],
        risk_areas: [
          { area: 'Enterprise Accounts with upcoming renewals', exposed_arr: '$142,000' },
          { area: 'Customer Satisfaction NPS drop', score_delta: '-12 pts' }
        ],
        recommendations: [
          { action: 'Dispatch replacement orders via DHL Express priority', priority: 'Immediate' },
          { action: 'Provision automated webhook retry fallback', priority: 'High' },
          { action: 'Schedule executive outreach to FinScale and CloudNest', priority: 'High' }
        ],
        trends: [
          { day: 'Mon', complaints: 12 },
          { day: 'Tue', complaints: 18 },
          { day: 'Wed', complaints: 24 },
          { day: 'Thu', complaints: 32 },
          { day: 'Fri', complaints: 28 }
        ]
      }
    ];

    const { error: insightErr } = await supabase.from('ai_insights').insert(insights);
    if (insightErr) console.warn('⚠️ Insights seeding warning:', insightErr.message);
    else console.log('✅ AI Executive Insights seeded successfully');

    // ---------------------------------------------------------------------------
    // 6. SEED INTEGRATIONS (For Radar & Ecosystem)
    // ---------------------------------------------------------------------------
    const integrations = [
      { name: 'Zendesk Support', status: 'Connected', sync_state: 'Healthy', last_sync: '2m ago' },
      { name: 'Intercom Messenger', status: 'Connected', sync_state: 'Healthy', last_sync: '5m ago' },
      { name: 'Stripe Billing API', status: 'Connected', sync_state: 'Healthy', last_sync: '1m ago' },
      { name: 'Salesforce CRM', status: 'Connected', sync_state: 'Healthy', last_sync: '12m ago' },
      { name: 'Jira Software', status: 'Connected', sync_state: 'Healthy', last_sync: '8m ago' }
    ];

    const { error: integErr } = await supabase.from('integrations').insert(integrations);
    if (integErr) console.warn('⚠️ Integrations seeding warning:', integErr.message);
    else console.log('✅ Integrations telemetry seeded successfully');

    console.log('====================================================');
    console.log('🎉 CXPulse Database Seeding Finished Successfully!');
    console.log('====================================================');
  } catch (err) {
    console.error('❌ Seeder encountered fatal error:', err);
  }
}

seedDatabase();
