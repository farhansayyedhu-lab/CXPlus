'use strict';

const { sendSuccess } = require('../utils/response');

const TEAM_MEMBERS = [
  { id: "tm-1", name: "Alex Morgan", role: "Head of CX", email: "alex.morgan@cxpulse.ai", avatar: "AM", activeTickets: 3, csat: 98 },
  { id: "tm-2", name: "Jordan Reed", role: "Senior Solutions Engineer", email: "jordan.r@cxpulse.ai", avatar: "JR", activeTickets: 5, csat: 94 },
  { id: "tm-3", name: "Maya Lin", role: "Escalations Specialist", email: "maya.l@cxpulse.ai", avatar: "ML", activeTickets: 4, csat: 96 },
  { id: "tm-4", name: "Carlos Santana", role: "CX Analyst", email: "carlos.s@cxpulse.ai", avatar: "CS", activeTickets: 2, csat: 92 }
];

class TeamController {
  async getTeam(req, res, next) {
    try {
      return sendSuccess(res, TEAM_MEMBERS, 'Team members retrieved');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new TeamController();
