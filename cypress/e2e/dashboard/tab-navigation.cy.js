describe('Dashboard: Tabs Navigation)', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/');
  });

  it('should update aria-selected states when switching tabs', () => {
    // 1. Assert initial state: Personal tab is active
    cy.get('[data-test=nav-personal-tab]').click();
    cy.get('[data-test=nav-personal-tab]').should('have.attr', 'aria-selected', 'true');
    cy.get('[data-test=nav-contacts-tab]').should('have.attr', 'aria-selected', 'false');
    cy.get('[data-test=nav-public-tab]').should('have.attr', 'aria-selected', 'false');
  });

  it('should switch back to Personal tab and restore states', () => {
    cy.get('[data-test=nav-public-tab]').click();
    cy.get('[data-test=nav-personal-tab]').click();
    cy.get('[data-test=nav-personal-tab]').should('have.attr', 'aria-selected', 'true');
    cy.get('[data-test=nav-public-tab]').should('have.attr', 'aria-selected', 'false');
  });

  it('should display correct content for Public tab', () => {
    cy.get('[data-test=nav-public-tab]').click();
    cy.get('[data-test=transaction-list]').should('be.visible');
  });

  it('should persist tab state on page refresh', () => {
    cy.get('[data-test=nav-public-tab]').click();
    cy.get('[data-test=nav-public-tab]').should('have.attr', 'aria-selected', 'true');
    cy.reload();
    cy.get('[data-test=nav-public-tab]').should('have.attr', 'aria-selected', 'true');
  });
});