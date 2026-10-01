'use strict';

require('dotenv').config();
const { supabase } = require('../src/config/supabase');
const { hashPassword } = require('../src/utils/password');

async function seedDatabase() {
  console.log('🌱 Starting CXPulse Database Seeder...');

  try {
    // 1. Seed Demo User
    const hashedPassword = await hashPassword('cxpulse2026');
    const { error: userErr } = await supabase.from('users').upsert([
      {
        id: 'usr-alex-morgan',
        email: 'alex.morgan@cxpulse.ai',
        password_hash: hashedPassword,
        name: 'Alex Morgan',
        role: 'Head of Customer Experience',
        avatar: 'AM',
        status: 'Active'
      }
    ]);
    if (userErr) console.warn('User upsert warning:', userErr.message);
    else console.log('✅ Demo user seeded: alex.morgan@cxpulse.ai');

    // 2. Seed Customers
    const customers = [
      { id: 'CUST-001', name: 'Marcus Vance', email: 'm.vance@finscale.io', company: 'FinScale Technologies', avatar: 'MV', avatar_bg: '#E11D48', risk_score: 88, risk_level: 'Critical', ltv: '$48,000 ARR', since: 'Mar 2023', status: 'At Risk' },
      { id: 'CUST-002', name: 'Elena Rostova', email: 'elena.r@nordiclogistics.se', company: 'Nordic Logistics AB', avatar: 'ER', avatar_bg: '#7C3AED', risk_score: 82, risk_level: 'Critical', ltv: '$92,000 ARR', since: 'Nov 2022', status: 'At Risk' },
      { id: 'CUST-003', name: 'David Chen', email: 'david@luminahealth.com', company: 'Lumina Health Systems', avatar: 'DC', avatar_bg: '#059669', risk_score: 74, risk_level: 'High', ltv: '$120,000 ARR', since: 'Jan 2022', status: 'Monitoring' },
      { id: 'CUST-004', name: 'Sarah Jenkins', email: 's.jenkins@apexretail.co.uk', company: 'Apex Retail Group', avatar: 'SJ', avatar_bg: '#D97706', risk_score: 68, risk_level: 'High', ltv: '$64,000 ARR', since: 'Jun 2023', status: 'Monitoring' },
      { id: 'CUST-005', name: 'Amira Al-Mansoor', email: 'a.mansoor@zephtech.ae', company: 'ZephTech Solutions', avatar: 'AA', avatar_bg: '#2563EB', risk_score: 45, risk_level: 'Medium', ltv: '$36,000 ARR', since: 'Oct 2024', status: 'Healthy' }
    ];

    const { error: custErr } = await supabase.from('customers').upsert(customers);
    if (custErr) console.warn('Customers upsert warning:', custErr.message);
    else console.log(`✅ ${customers.length} Customers seeded`);

    // 3. Seed AI Insights
    const { error: insightErr } = await supabase.from('ai_insights').upsert([
      {
        id: 'ai-pattern-01',
        tag: 'AI DETECTED A PATTERN',
        title: 'Delivery-related complaints increased 32% over the last 7 days.',
        impact: 'High',
        impact_badge: 'badge-critical',
        confidence: '94%',
        affected_count: '84 Accounts ($142k ARR)',
        recommendation: 'Investigate fulfillment delays in EU West region and proactively notify affected customers with courtesy shipping upgrades.',
        affected_filter: 'delivery'
      }
    ]);
    if (insightErr) console.warn('Insights upsert warning:', insightErr.message);
    else console.log('✅ AI insights seeded');

    console.log('🎉 Seeding process completed successfully!');
  } catch (err) {
    console.error('❌ Seeder encountered error:', err.message);
  }
}

seedDatabase();
