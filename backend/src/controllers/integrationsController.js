'use strict';

const { sendSuccess } = require('../utils/response');

const INTEGRATIONS = [
  { id: "int-zendesk", name: "Zendesk", status: "Connected", syncState: "Healthy", lastSync: "2 mins ago", icon: "zendesk" },
  { id: "int-intercom", name: "Intercom", status: "Connected", syncState: "Healthy", lastSync: "4 mins ago", icon: "intercom" },
  { id: "int-salesforce", name: "Salesforce CRM", status: "Connected", syncState: "Healthy", lastSync: "12 mins ago", icon: "salesforce" },
  { id: "int-slack", name: "Slack Alerts", status: "Connected", syncState: "Healthy", lastSync: "Real-time", icon: "slack" },
  { id: "int-jira", name: "Jira Service Management", status: "Connected", syncState: "Healthy", lastSync: "18 mins ago", icon: "jira" }
];

class IntegrationsController {
  async getIntegrations(req, res, next) {
    try {
      return sendSuccess(res, INTEGRATIONS, 'Integrations retrieved');
    } catch (err) {
      next(err);
    }
  }

  async syncIntegration(req, res, next) {
    try {
      const { id } = req.params;
      const integration = INTEGRATIONS.find(i => i.id === id);
      if (integration) {
        integration.lastSync = 'Just now';
      }
      return sendSuccess(res, { id, status: 'synced', lastSync: 'Just now' }, 'Integration sync triggered');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new IntegrationsController();
