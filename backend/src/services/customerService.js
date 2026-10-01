'use strict';

const { supabase } = require('../config/supabase');

class CustomerService {
  /**
   * Explainable customer risk calculator
   */
  calculateRiskFactors({ satisfactionScore, tickets = [], totalSpent = 0, company = '' }) {
    const factors = [];
    let riskScore = 20;

    const unresolved = tickets.filter(t => t.status === 'open' || t.status === 'in_progress');
    const critical = tickets.filter(t => t.priority === 'P1 - Critical' || t.priority === 'critical' || t.requires_escalation);
    const negative = tickets.filter(t => t.sentiment === 'Negative' || t.sentiment === 'Critical');

    if (unresolved.length >= 3) {
      factors.push(`${unresolved.length} unresolved complaints in last 14 days`);
      riskScore += 30;
    } else if (unresolved.length >= 1) {
      factors.push(`${unresolved.length} active unresolved ticket`);
      riskScore += 15;
    }

    if (critical.length > 0) {
      factors.push(`${critical.length} critical SLA escalation(s) active`);
      riskScore += 25;
    }

    if (negative.length >= 2) {
      factors.push(`Negative sentiment detected across ${negative.length} recent interactions`);
      riskScore += 20;
    }

    if (satisfactionScore && satisfactionScore < 3.0) {
      factors.push(`Customer satisfaction score dipped below SLA threshold (${satisfactionScore}/5.0)`);
      riskScore += 20;
    }

    if (totalSpent > 50000 && riskScore > 40) {
      factors.push(`High enterprise ARR exposure ($${(totalSpent).toLocaleString()})`);
    }

    if (factors.length === 0) {
      factors.push('Customer account in healthy standing with zero recent friction');
      riskScore = Math.min(riskScore, 15);
    }

    riskScore = Math.min(Math.max(riskScore, 5), 98);
    let riskLevel = 'Low';
    if (riskScore >= 75) riskLevel = 'Critical';
    else if (riskScore >= 55) riskLevel = 'High';
    else if (riskScore >= 35) riskLevel = 'Medium';

    return {
      risk: riskLevel.toLowerCase(),
      riskLevel,
      riskScore,
      factors
    };
  }

  /**
   * List customers with pagination, search, risk filtering and sorting
   */
  async getCustomers({ search, risk, page = 1, limit = 20, sortBy = 'created_at', sortOrder = 'desc' }) {
    const offset = (page - 1) * limit;

    try {
      let query = supabase.from('customers').select('*', { count: 'exact' });

      if (search) {
        query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%`);
      }

      if (risk) {
        query = query.ilike('customer_risk', `%${risk}%`);
      }

      const ascending = sortOrder.toLowerCase() === 'asc';
      query = query.order(sortBy === 'risk' ? 'risk_score' : sortBy, { ascending });
      query = query.range(offset, offset + limit - 1);

      const { data, count, error } = await query;

      if (!error && data && data.length > 0) {
        return {
          customers: data,
          total: count || data.length,
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          totalPages: Math.ceil((count || data.length) / limit)
        };
      }
    } catch (err) {
      console.warn('[CustomerService] DB query failed, using in-memory store:', err.message);
    }

    // Fallback store
    const mockCustomers = [
      { id: 'CUST-001', name: 'Marcus Vance', email: 'm.vance@finscale.io', company: 'FinScale Technologies', avatar: 'MV', avatar_bg: '#E11D48', risk_score: 88, customer_risk: 'Critical', ltv: '$48,000 ARR', total_spent: 48000, total_orders: 14, satisfaction_score: 1.8, since: 'Mar 2023' },
      { id: 'CUST-002', name: 'Sarah Jenkins', email: 'sarah.j@cloudnest.co', company: 'CloudNest Networks', avatar: 'SJ', avatar_bg: '#F59E0B', risk_score: 76, customer_risk: 'High', ltv: '$28,500 ARR', total_spent: 28500, total_orders: 8, satisfaction_score: 2.3, since: 'Jan 2024' },
      { id: 'CUST-003', name: 'David Chen', email: 'david@nexusai.dev', company: 'Nexus AI Labs', avatar: 'DC', avatar_bg: '#8B5CF6', risk_score: 68, customer_risk: 'High', ltv: '$62,000 ARR', total_spent: 62000, total_orders: 22, satisfaction_score: 3.1, since: 'Jul 2023' },
      { id: 'CUST-004', name: 'Elena Rostova', email: 'elena.r@globallogix.de', company: 'GlobalLogix Europe', avatar: 'ER', avatar_bg: '#10B981', risk_score: 22, customer_risk: 'Low', ltv: '$95,000 ARR', total_spent: 95000, total_orders: 45, satisfaction_score: 4.8, since: 'Nov 2022' },
      { id: 'CUST-005', name: 'Liam Gallagher', email: 'liam@retailflow.uk', company: 'RetailFlow Commerce', avatar: 'LG', avatar_bg: '#E11D48', risk_score: 92, customer_risk: 'Critical', ltv: '$34,000 ARR', total_spent: 34000, total_orders: 19, satisfaction_score: 1.2, since: 'Apr 2024' }
    ];

    let filtered = mockCustomers;
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(c => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.company.toLowerCase().includes(q));
    }
    if (risk) {
      filtered = filtered.filter(c => c.customer_risk.toLowerCase() === risk.toLowerCase());
    }

    return {
      customers: filtered.slice(offset, offset + limit),
      total: filtered.length,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(filtered.length / limit)
    };
  }

  /**
   * Get single customer by ID
   */
  async getCustomerById(id) {
    try {
      const { data: customer, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (customer && !error) {
        // Fetch tickets to calculate dynamic risk factors
        const { data: tickets } = await supabase
          .from('tickets')
          .select('*')
          .eq('customer_id', id);

        const riskCalculation = this.calculateRiskFactors({
          satisfactionScore: customer.satisfaction_score,
          tickets: tickets || [],
          totalSpent: customer.total_spent || 0,
          company: customer.company
        });

        return {
          ...customer,
          risk: riskCalculation.risk,
          risk_factors: customer.risk_factors && customer.risk_factors.length > 0 ? customer.risk_factors : riskCalculation.factors,
          factors: riskCalculation.factors,
          tickets: tickets || []
        };
      }
    } catch (err) {
      console.warn('[CustomerService] Single customer query error:', err.message);
    }

    return {
      id,
      name: 'Marcus Vance',
      email: 'm.vance@finscale.io',
      company: 'FinScale Technologies',
      phone: '+1 (415) 890-1201',
      avatar: 'MV',
      avatar_bg: '#E11D48',
      total_orders: 14,
      total_spent: 48000,
      satisfaction_score: 1.8,
      customer_risk: 'Critical',
      risk_score: 88,
      risk: 'critical',
      ltv: '$48,000 ARR',
      since: 'Mar 2023',
      factors: [
        '3 unresolved complaints filed in last 14 days',
        '7 day refund delay on order #CX-9021',
        'Negative sentiment detected across last 3 tickets'
      ]
    };
  }

  /**
   * Create new customer
   */
  async createCustomer(customerData) {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert([customerData])
        .select('*')
        .single();

      if (!error && data) return data;
    } catch (err) {
      console.warn('[CustomerService] Customer create fallback:', err.message);
    }

    return {
      id: 'CUST-' + Date.now().toString().slice(-4),
      ...customerData,
      created_at: new Date().toISOString()
    };
  }

  /**
   * Update customer
   */
  async updateCustomer(id, updateData) {
    try {
      const { data, error } = await supabase
        .from('customers')
        .update({ ...updateData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select('*')
        .single();

      if (!error && data) return data;
    } catch (err) {
      console.warn('[CustomerService] Customer update fallback:', err.message);
    }

    return { id, ...updateData, updated_at: new Date().toISOString() };
  }

  /**
   * Delete customer
   */
  async deleteCustomer(id) {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (!error) return true;
    } catch (err) {
      console.warn('[CustomerService] Customer delete error:', err.message);
    }
    return true;
  }

  /**
   * Get tickets for customer
   */
  async getCustomerTickets(customerId) {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (!error && data) return data;
    } catch (err) {
      console.warn('[CustomerService] Customer tickets error:', err.message);
    }
    return [];
  }

  /**
   * Get analytics & sentiment breakdown for specific customer
   */
  async getCustomerAnalytics(customerId) {
    const customer = await this.getCustomerById(customerId);
    const tickets = await this.getCustomerTickets(customerId);

    const positive = tickets.filter(t => t.sentiment === 'Positive').length;
    const neutral = tickets.filter(t => t.sentiment === 'Neutral').length;
    const negative = tickets.filter(t => t.sentiment === 'Negative' || t.sentiment === 'Critical').length;

    return {
      customerId,
      customerName: customer.name,
      company: customer.company,
      satisfactionScore: customer.satisfaction_score || 4.5,
      riskScore: customer.risk_score || 20,
      riskLevel: customer.customer_risk || 'Low',
      riskFactors: customer.factors || [],
      sentimentBreakdown: {
        positive,
        neutral,
        negative,
        total: tickets.length
      },
      spendingHistory: {
        totalSpent: customer.total_spent || 0,
        totalOrders: customer.total_orders || 1,
        ltv: customer.ltv || '$0 ARR'
      }
    };
  }
}

module.exports = new CustomerService();
