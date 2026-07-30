describe('Dashboard: Top Navigation', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/');
  });

  it('should navigate to transaction creation when "New" button is clicked', () => {
    cy.get('[data-test=nav-top-new-transaction]').should('be.visible').click();
    cy.url().should('include', '/transaction/new'); 
    cy.get('[data-test="users-list"]').should('be.visible');
  });

  it('should display unread count badge on notifications icon', () => {
    // The RWA typically shows a badge with a number if there are unread notifications.
    // If there are 0, the badge might be hidden. We assert the badge element exists.
    cy.get('[data-test=nav-top-notifications-link]').should('be.visible').within(() => {
        // Check if the badge exists and contains a number (or assert it's hidden if 0)
        // Adjust the selector based on your manual inspection of the DOM
        cy.get('[class="MuiBadge-badge NavBar-customBadge MuiBadge-standard MuiBadge-anchorOriginTopRight MuiBadge-anchorOriginTopRightRectangular MuiBadge-overlapRectangular css-1bdz51l-MuiBadge-badge"]')
          .should('exist'); 
          // Optional: .invoke('text').then(text => expect(parseInt(text)).to.be.gte(0));
      });
  });

  it('should navigate to /notifications when notifications icon is clicked', () => {
    cy.get('[data-test="nav-top-notifications-count"]').should('be.visible').click();
    cy.url().should('include', '/notifications');
    cy.get('[data-test="notifications-list"]').should('be.visible');
  });

  it('should navigate to Home screen when App name is clicked', () => {
    cy.get('[data-test="app-name-logo"]').should('be.visible').click();
    cy.url().should('include', '/');
    cy.get('[data-test="transaction-list"]').should('be.visible');
  });
});