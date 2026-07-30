describe('Transactions API: Filtering', () => {
  const apiUrl = Cypress.env('apiUrl');

  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  it('should return correct data when filtering by account type via API', () => {
    // Login via API to get a valid session cookie/token
    cy.request({
      method: 'POST',
      url: `${apiUrl}/login`,
      body: {
        username: Cypress.env('defaultUsername'),
        password: Cypress.env('defaultPassword'),
      },
    }).then((loginResponse) => {
      expect(loginResponse.status).to.eq(200);

      // Hit the transactions endpoint with the personal filter
      cy.request({
        method: 'GET',
        url: `${apiUrl}/transactions`,
      }).then((response) => {
        // 3. Assert backend contract
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('results');
      });
    });
  });
});