describe('Dashboard Display: User Interface', () => {
  // Note: Using '/' as it is the actual dashboard route in RWA
  beforeEach(() => {
    cy.login();
    cy.visit('/');
  });

  it('should display the correct username in the side navigation', () => {
    cy.fixture('users').then((users) => {
      cy.get('[data-test=sidenav-username]')
        .should('be.visible')
        .and('contain.text', users.standardUser.username);
    });
  });

  it('should display the correct full name in the side navigation', () => {
    cy.fixture('users').then((users) => {
      const expectedFullName = `${users.standardUser.firstName} ${users.standardUser.lastName.charAt(0).toUpperCase()}`;
      cy.get('[data-test=sidenav-user-full-name]') // Adjusted selector to match RWA standard
        .should('be.visible')
        .and('contain.text', expectedFullName);
    });
  });

  it('should display user avatar', () => {
    cy.get('[data-test="sidenav"]');
    cy.get('[class="MuiAvatar-img css-1pqm26d-MuiAvatar-img"]')
      .should('be.visible')
      .and('have.attr', 'src')
      .and('not.be.empty');
  });

  it('should display balance in valid currency format', () => {
    cy.get('[data-test=sidenav-user-balance]')
      .invoke('text')
      .then((balanceText) => {
        // Validates formats like "$1,234.56" or "($1,234.56)"
        expect(balanceText.trim()).to.match(/\(?\$[\d,]+\.\d{2}\)?/);
      });
  });

  it('should load transaction list', () => {
    cy.get('[data-test=transaction-list]').should('be.visible');
  });

  it('should load dashboard within 3 seconds', () => {
    // 1. Record start time
    const startTime = Date.now();

    // 2. Visit and wait for a key element to appear
    cy.visit('/');
    cy.get('[data-test=sidenav-username]').should('be.visible');

    // 3. Calculate and assert load time
    cy.then(() => {
      const loadTime = Date.now() - startTime;
      expect(loadTime, 'Dashboard load time').to.be.lessThan(3000);
    });
  });
});
