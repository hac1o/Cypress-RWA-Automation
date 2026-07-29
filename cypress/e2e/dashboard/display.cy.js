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
    cy.get('[data-test="sidenav"]')
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
    cy.get('[data-test=transaction-item]').should('have.length.greaterThan', 0);
  });

  it('should show empty state when no transactions', () => {
    // 1. Intercept BEFORE visiting to catch the initial load
    cy.intercept('GET', '/transactions*', {
      statusCode: 200,
      body: { pageParams: {}, results: [] },
    }).as('emptyTransactions');

    // 2. Visit the page (this triggers the intercepted empty response)
    cy.visit('/');
    cy.wait('@emptyTransactions');

    // 3. Assert the UI naturally reflects the empty state (NO DOM mutation!)
    cy.get('[data-test=transaction-list]').should('be.visible');
    cy.get('[data-test=transaction-empty-state]').should('be.visible');
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

  it('should match API response for user balance', () => {
    cy.intercept('GET', '/accounts*').as('getAccounts');
    cy.visit('/');
    cy.wait('@getAccounts').then((interception) => {
      // Note: Adjust [0] based on actual RWA API response structure (array vs object)
      const apiBalance = interception.response.body[0]?.balance || interception.response.body.balance;
      
      cy.get('[data-test=sidenav-user-balance]').invoke('text').then((uiText) => {
        // Strip "$" and "," to compare raw numbers
        const uiBalance = parseFloat(uiText.replace(/[^0-9.-]+/g, ''));
        expect(uiBalance).to.eq(apiBalance);
      });
    });
  });

  it('should match API response for transaction list', () => {
    cy.intercept('GET', '/transactions*').as('getTransactions');
    cy.visit('/');
    cy.wait('@getTransactions').then((interception) => {
      const apiTransactions = interception.response.body.results;
      
      // Assert the UI renders the exact number of items the API returned
      cy.get('[data-test=transaction-item]').should('have.length', apiTransactions.length);
      
      // Bonus: Assert the first transaction's description matches
      if (apiTransactions.length > 0) {
        cy.get('[data-test=transaction-item]').first()
          .should('contain', apiTransactions[0].description);
      }
    });
  });
});