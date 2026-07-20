describe('Session Security: Protected Routes', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  const protectedRoutes = ['/transactions', '/bankaccounts', '/notifications', '/user/settings'];

  protectedRoutes.forEach((route) => {
    it(`should redirect unauthenticated users from ${route} to /signin`, () => {
      cy.visit(route);
      cy.url().should('include', '/signin');
    });
  });

  it('should display auth guard message on redirect', () => {
    cy.visit('/transactions');
    // Note: If the RWA doesn't have a specific 'signin-title' data-test, 
    // you can fallback to cy.contains('Sign in').should('be.visible')
    cy.get('[data-test=signin-title]')
      .should('be.visible')
      .and('contain', 'Sign in');
  });

  it('should reject direct API calls without authentication', () => {
    cy.request({
      method: 'GET',
      url: `${Cypress.config('baseUrl')}/transactions`,
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.be.oneOf([401, 403]);
    });
  });
});