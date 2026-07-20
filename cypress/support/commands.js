// cypress/support/commands.js

Cypress.Commands.add('login', (username = 'Heath93', password = 's3cret', rememberMe = false) => {
  cy.session([username, password, rememberMe], () => {
    cy.visit('/signin');
    cy.get('[data-test=signin-username]').type(username);
    cy.get('[data-test=signin-password]').type(password);

    if (rememberMe) {
      cy.get('[data-test=signin-remember-me]').click();
      cy.get('[data-test=signin-remember-me] input').should('be.checked');
    }

    cy.get('[data-test=signin-submit]').click();
    cy.url().should('include', '/');
    cy.get('[data-test=sidenav-username]').should('contain', username);
  });
});

Cypress.Commands.add('logout', () => {
  cy.get('[data-test=sidenav-signout]')
    .should('be.visible')
    .click();
  cy.url().should('include', '/signin');
  cy.window().its('localStorage.authState').should('be.undefined');
});

Cypress.Commands.add('loginViaApi', (username = 'Heath93', password = 's3cret') => {
  cy.request({
    method: 'POST',
    url: `${Cypress.config('baseUrl')}/login`,
    body: { username, password },
  }).then((response) => {
    expect(response.status).to.eq(200);
    cy.window().then((win) => {
      win.localStorage.setItem('authState', JSON.stringify(response.body));
    });
  });
});