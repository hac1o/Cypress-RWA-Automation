describe('Authentication API: Logout Endpoint', () => {
  const apiUrl = Cypress.env('apiUrl');

  beforeEach(() => {
    // Ensure a clean slate for every API test
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  it('should return 200 or 204 on successful logout API call', () => {
    // 1. Login via API to get a valid session
    cy.request({
      method: 'POST',
      url: `${apiUrl}/login`,
      body: {
        username: Cypress.env('defaultUsername'),
        password: Cypress.env('defaultPassword'),
      },
    }).then((loginResponse) => {
      expect(loginResponse.status).to.eq(200);

      // 2. Call the logout API directly
      cy.request({
        method: 'POST',
        url: `${apiUrl}/logout`,
      }).then((logoutResponse) => {
        // Assert the backend acknowledges the logout
        expect(logoutResponse.status).to.be.oneOf([200, 204]);
      });
    });
  });

  it('should reject subsequent API requests after session is invalidated', () => {
    // 1. Login via API
    cy.request({
      method: 'POST',
      url: `${apiUrl}/login`,
      body: {
        username: Cypress.env('defaultUsername'),
        password: Cypress.env('defaultPassword'),
      },
    }).then((loginResponse) => {
      expect(loginResponse.status).to.eq(200);

      // 2. Invalidate the session via API
      cy.request({
        method: 'POST',
        url: `${apiUrl}/logout`,
      });

      // 3. Attempt to access a protected endpoint
      cy.request({
        method: 'GET',
        url: `${apiUrl}/transactions`,
        failOnStatusCode: false, // CRITICAL: Prevent auto-fail on 401
      }).then((finalResponse) => {
        // The backend MUST reject this because the session was destroyed
        expect(finalResponse.status).to.be.oneOf([401, 403]);
      });
    });
  });

  it('should ensure no session cookies remain after logout', () => {
    // 1. Login via API (which may set cookies depending on backend config)
    cy.request({
      method: 'POST',
      url: `${apiUrl}/login`,
      body: {
        username: Cypress.env('defaultUsername'),
        password: Cypress.env('defaultPassword'),
      },
    });

    // 2. Logout via API
    cy.request({
      method: 'POST',
      url: `${apiUrl}/logout`,
    });

    // 3. Assert security: no cookies should remain
    cy.getCookies().should('be.empty');
  });
});