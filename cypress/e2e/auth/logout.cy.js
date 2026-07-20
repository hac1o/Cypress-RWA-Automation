describe('Authentication: Logout', () => {
  beforeEach(() => {
    cy.login();
  });

  it('should successfully logout and clear session', () => {
    cy.logout();

    cy.url().should('include', '/signin');
    cy.window().its('localStorage.authState').should('be.undefined');
  });

  it('should not restore session when navigating back after logout', () => {
    cy.logout();
    cy.go('back');

    cy.url().should('include', '/signin');
    cy.get('[data-test=sidenav-username]').should('not.exist');
  });
});
