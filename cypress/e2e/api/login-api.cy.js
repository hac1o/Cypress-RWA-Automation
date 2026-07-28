describe('Authentication API: Login Endpoint', () => {
  beforeEach(() => {
    // Clean slate for each test
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  it('should return correct payload and simulate authState in localStorage', () => {
    // 1. Load fixture and save it as an alias (Great pattern!)
    cy.fixture('users').as('testUsers');

    cy.get('@testUsers').then((users) => {
      // 2. Hit the correct API endpoint (/login, not /signin)
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/login`,
        body: {
          type: 'LOGIN',
          username: users.standardUser.username,
          password: users.standardUser.password,
        },
      }).then((response) => {
        // 3. Assert success. If this fails, the test stops here. No need for if/else.
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('user'); // Extra safety check

        // 4. Save the response body as an alias for verification
        cy.wrap(response.body).as('expectedAuthState');

        // 5. Simulate the frontend saving it to localStorage
        cy.window().then((win) => {
          win.localStorage.setItem('authState', JSON.stringify(response.body));
        });

        // 6. Verify it was saved correctly using the alias we created
        cy.get('@expectedAuthState').then((expected) => {
          cy.window().then((win) => {
            const stored = win.localStorage.getItem('authState');
            expect(JSON.parse(stored)).to.deep.eq(expected);
          });
        });
      });
    });
  });

  it('should return 401 for invalid credentials', () => {
    cy.fixture('users').then((users) => {
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/login`,
        failOnStatusCode: false,
        body: {
          type: 'LOGIN',
          username: users.invalidUser.username,
          password: users.invalidUser.password,
        },
      }).then((response) => {
        expect(response.status).to.eq(401);
      });
    });
  });

  it('should return 200 with correct user payload', () => {
    cy.fixture('users').then((users) => {
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/login`,
        body: {
          type: 'LOGIN',
          username: users.standardUser.username,
          password: users.standardUser.password,
        },
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('user');
      });
    });
  });

  it('should reject missing username/password fields (400)', () => {
    cy.request({
      method: 'POST',
      url: `${Cypress.env('apiUrl')}/login`,
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(400);
    });
  });

  it('should include user object with id, username, firstName, lastName', () => {
    cy.fixture('users').then((users) => {
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/login`,
        body: {
          type: 'LOGIN',
          username: users.standardUser.username,
          password: users.standardUser.password,
        },
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('user');
        expect(response.body.user).to.have.property('id');
        expect(response.body.user).to.have.property('username');
        expect(response.body.user).to.have.property('firstName');
        expect(response.body.user).to.have.property('lastName');
      });
    });
  });

  it('should handle concurrent login attempts without corruption', () => {
    cy.fixture('users').then((users) => {
      const loginRequests = Array.from({ length: 5 }, () =>
        cy.request({
          method: 'POST',
          url: `${Cypress.env('apiUrl')}/login`,
          body: {
            type: 'LOGIN',
            username: users.standardUser.username,
            password: users.standardUser.password,
          },
        })
      );
    });
  });
});
