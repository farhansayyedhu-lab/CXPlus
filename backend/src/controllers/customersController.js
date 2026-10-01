'use strict';

const { supabase } = require('../config/supabase');
const { sendSuccess, sendError } = require('../utils/response');

class CustomersController {
  /**
   * Get list of customers with risk levels and metrics
   */
  async getCustomers(req, res, next) {
    try {
      const { search, riskLevel } = req.query;

      const { data: dbCustomers, error } = await supabase
        .from('customers')
        .select('*')
        .order('risk_score', { ascending: false });

      let customers = (!error && dbCustomers && dbCustomers.length > 0) ? dbCustomers : [
        {
          id: "CUST-001",
          name: "Marcus Vance",
          email: "m.vance@finscale.io",
          company: "FinScale Technologies",
          avatar: "MV",
          riskScore: 88,
          riskLevel: "Critical",
          ltv: "$48,000 ARR",
          since: "Mar 2023",
          status: "At Risk",
          ticketsCount: 4
        },
        {
          id: "CUST-002",
          name: "Elena Rostova",
          email: "elena.r@nordiclogistics.se",
          company: "Nordic Logistics AB",
          avatar: "ER",
          riskScore: 82,
          riskLevel: "Critical",
          ltv: "$92,000 ARR",
          since: "Nov 2022",
          status: "At Risk",
          ticketsCount: 2
        },
        {
          id: "CUST-003",
          name: "David Chen",
          email: "david@luminahealth.com",
          company: "Lumina Health Systems",
          avatar: "DC",
          riskScore: 74,
          riskLevel: "High",
          ltv: "$120,000 ARR",
          since: "Jan 2022",
          status: "Monitoring",
          ticketsCount: 5
        },
        {
          id: "CUST-004",
          name: "Sarah Jenkins",
          email: "s.jenkins@apexretail.co.uk",
          company: "Apex Retail Group",
          avatar: "SJ",
          riskScore: 68,
          riskLevel: "High",
          ltv: "$64,000 ARR",
          since: "Jun 2023",
          status: "Monitoring",
          ticketsCount: 1
        },
        {
          id: "CUST-005",
          name: "Amira Al-Mansoor",
          email: "a.mansoor@zephtech.ae",
          company: "ZephTech Solutions",
          avatar: "AA",
          riskScore: 45,
          riskLevel: "Medium",
          ltv: "$36,000 ARR",
          since: "Oct 2024",
          status: "Healthy",
          ticketsCount: 1
        }
      ];

      if (search) {
        const q = search.toLowerCase();
        customers = customers.filter(c => c.name.toLowerCase().includes(q) || c.company.toLowerCase().includes(q) || c.email.toLowerCase().includes(q));
      }

      if (riskLevel && riskLevel !== 'all') {
        customers = customers.filter(c => c.riskLevel?.toLowerCase() === riskLevel.toLowerCase());
      }

      return sendSuccess(res, customers, 'Customers retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get single customer by ID
   */
  async getCustomerById(req, res, next) {
    try {
      const { id } = req.params;
      const { data: customer, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (!error && customer) {
        return sendSuccess(res, customer, 'Customer found');
      }

      return sendSuccess(res, {
        id,
        name: "Marcus Vance",
        email: "m.vance@finscale.io",
        company: "FinScale Technologies",
        avatar: "MV",
        riskScore: 88,
        riskLevel: "Critical",
        ltv: "$48,000 ARR",
        since: "Mar 2023",
        status: "At Risk"
      }, 'Customer found (fallback)');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new CustomersController();
