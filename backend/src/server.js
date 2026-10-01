'use strict';

const app = require('./app');
const env = require('./config/env');
const { testConnection } = require('./config/supabase');

const PORT = env.port || 5000;

async function startServer() {
  console.log('----------------------------------------------------');
  console.log('⚡ Starting CXPulse AI Backend Platform...');
  console.log(`🌍 Environment: ${env.nodeEnv}`);
  console.log(`🔌 Port: ${PORT}`);
  console.log('----------------------------------------------------');

  // Verify Supabase connectivity
  await testConnection();

  const server = app.listen(PORT, () => {
    console.log(`🚀 CXPulse Backend is running at: http://localhost:${PORT}`);
    console.log(`📡 Health check available at:     http://localhost:${PORT}/api/v1/health`);
    console.log(`🤖 AI Copilot endpoints ready at: http://localhost:${PORT}/api/v1/ai`);
    console.log('----------------------------------------------------');
  });

  // Graceful shutdown handling
  const shutdown = (signal) => {
    console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
    server.close(() => {
      console.log('🔒 HTTP server closed. Process exiting.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

startServer();
