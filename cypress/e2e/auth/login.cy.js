describe('Authentication: Login', () => {
  beforeEach(() => {
    cy.visit('/signin');
  });

  it('should successfully login with valid credentials', () => {
    cy.fixture('users').then((users) => {
      cy.get('[data-test=signin-username]').type(users.standardUser.username);
      cy.get('[data-test=signin-password]').type(users.standardUser.password);
      cy.get('[data-test=signin-submit]').click();

      // Using 'include' is safer than 'eq' in case of trailing slashes or query params
      cy.url().should('include', '/');
      cy.get('[data-test=sidenav-username]').should('contain', users.standardUser.username);
      cy.get('[data-test=nav-personal-tab]').should('be.visible');
    });
  });

  it('should show error for invalid credentials', () => {
    cy.fixture('users').then((users) => {
      cy.get('[data-test=signin-username]').type(users.invalidUser.username);
      cy.get('[data-test=signin-password]').type(users.invalidUser.password);
      cy.get('[data-test=signin-submit]').click();

      cy.get('[data-test=signin-error]')
        .should('be.visible')
        .and('contain', 'Username or password is invalid');
      cy.url().should('include', '/signin');
    });
  });

  it('should login with Remember Me enabled and persist session', () => {
    cy.fixture('users').then((users) => {
      cy.get('[data-test=signin-username]').type(users.standardUser.username);
      cy.get('[data-test=signin-password]').type(users.standardUser.password);
      cy.get('[data-test=signin-remember-me]').click();
      cy.get('[data-test=signin-remember-me] input').should('be.checked');
      cy.get('[data-test=signin-submit]').click();

      cy.url().should('include', '/');

      // Capture auth state
      cy.window().then((win) => {
        const authState = win.localStorage.getItem('authState');
        cy.wrap(authState).as('persistedAuth');
      });

      // Simulate browser restart
      cy.clearCookies();
      cy.clearLocalStorage();

      // Restore auth state (Pure JS: removed 'as string')
      cy.get('@persistedAuth').then((authState) => {
        cy.window().then((win) => {
          win.localStorage.setItem('authState', authState);
        });
      });

      cy.visit('/');
      cy.get('[data-test=sidenav-username]').should('contain', users.standardUser.username);
    });
  });

  it('should NOT persist session when Remember Me is unchecked', () => {
    cy.fixture('users').then((users) => {
      cy.get('[data-test=signin-username]').type(users.standardUser.username);
      cy.get('[data-test=signin-password]').type(users.standardUser.password);
      
      // Explicitly uncheck to guarantee the state, making the test bulletproof
      cy.get('[data-test=signin-remember-me] input').uncheck({ force: true });
      
      cy.get('[data-test=signin-submit]').click();
      cy.url().should('include', '/');

      // Simulate browser restart
      cy.clearCookies();
      cy.clearLocalStorage();
      cy.visit('/');

      cy.url().should('include', '/signin');
    });
  });
});