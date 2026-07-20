// cypress/support/commands.js

/**
 * Custom Cypress commands for authentication and common operations
 */

/**
 * Login command with session support
 * @param {string} username - The username to login with
 * @param {string} password - The password to login with
 * @param {boolean} rememberMe - Whether to enable remember me option
 */
Cypress.Commands.add('login', (username, password, rememberMe = false) => {
  const user = username || Cypress.env('defaultUsername') || 'Heath93';
  const pass = password || Cypress.env('defaultPassword') || 's3cret';

  cy.session([user, pass, rememberMe], () => {
    cy.visit('/signin');
    cy.get('[data-test=signin-username]').type(user);
    cy.get('[data-test=signin-password]').type(pass);

    if (rememberMe) {
      cy.get('[data-test=signin-remember-me]').click();
      cy.get('[data-test=signin-remember-me] input').should('be.checked');
    }

    cy.get('[data-test=signin-submit]').click();
    cy.url().should('include', '/');
    cy.get('[data-test=sidenav-username]').should('contain', user);
  });
});

/**
 * Logout command - clears session and verifies redirect
 */
Cypress.Commands.add('logout', () => {
  cy.get('[data-test=sidenav-signout]')
    .should('be.visible')
    .click();
  cy.url().should('include', '/signin');
  cy.window().its('localStorage.authState').should('be.undefined');
});

/**
 * Login via API - faster alternative to UI login
 * @param {string} username - The username to login with
 * @param {string} password - The password to login with
 */
Cypress.Commands.add('loginViaApi', (username, password) => {
  const user = username || Cypress.env('defaultUsername') || 'Heath93';
  const pass = password || Cypress.env('defaultPassword') || 's3cret';

  cy.request({
    method: 'POST',
    url: `${Cypress.config('baseUrl')}/login`,
    body: { username: user, password: pass },
  }).then((response) => {
    expect(response.status).to.eq(200);
    cy.window().then((win) => {
      win.localStorage.setItem('authState', JSON.stringify(response.body));
    });
  });
});
