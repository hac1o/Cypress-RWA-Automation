describe('Authentication: Logout', () => {
  beforeEach(() => {
    cy.login();
  });

  it('should successfully logout and clear session', () => {
    cy.logout();

    // Assert URL redirect
    cy.url().should('include', '/signin');

    // Assert localStorage cleared
    cy.window().its('localStorage.authState').should('be.undefined');
  });

  it('should not restore session when navigating back after logout', () => {
    cy.logout();
    cy.go('back');

    // Should still be on login page, not dashboard
    cy.url().should('include', '/signin');
    cy.get('[data-test=sidenav-username]').should('not.exist');
  });
});