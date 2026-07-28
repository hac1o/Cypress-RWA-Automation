// cypress.config.js
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    // This is for UI tests (cy.visit)
    baseUrl: process.env.CYPRESS_BASE_URL || 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    supportFile: 'cypress/support/e2e.js',
    
    //Add this env block to store backend-specific variables
    env: {
      apiUrl: process.env.CYPRESS_API_URL || 'http://localhost:3002',
      defaultUsername: 'Heath93',
      defaultPassword: 's3cret',
    },
  },
});