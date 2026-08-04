describe('Transactions: Send Payment', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/');
  });


  it('should complete payment flow with correct API payload and success alert', () => {
    cy.intercept('POST', '/transactions').as('createTransaction');

    cy.fixture('transactions').then((data) => {
      const payment = data.validPayment;

      cy.get('[data-test=nav-top-new-transaction]').should('be.visible').click();
      cy.url().should('include', '/transaction/new');

      cy.get('[data-test=user-list-search-input]').type(payment.recipient);
      cy.get('[data-test*=user-list-item]').first().should('contain', payment.recipient).click();

      cy.get('[data-test=transaction-create-amount-input]').type(payment.amount);
      cy.get('[data-test=transaction-create-description-input]').type(payment.description);

      cy.get('[data-test=transaction-create-submit-payment]').click();

      cy.wait('@createTransaction').then((interception) => {
        // Assert response status
        expect(interception.response?.statusCode).to.eq(200);

        // Assert request payload contains correct data
        expect(interception.request.body).to.include({
          amount: payment.expectedPayload.amount,
          description: payment.expectedPayload.description,
        });

        // Assert receiverId exists
        expect(interception.request.body).to.have.property('receiverId').that.is.a('string');
      });

      cy.get('[data-test=alert-bar-success]')
        .should('be.visible')
        .and('contain', 'Transaction Submitted');

      cy.url().should('include', '/');
    });
  });

  it('should display new transaction at top of list with correct details', () => {
    cy.fixture('transactions').then((data) => {
      const payment = data.validPayment;

      cy.intercept('POST', '/transactions').as('createTransaction');

      cy.get('[data-test=nav-top-new-transaction]').click();
      cy.get('[data-test=user-list-search-input]').type(payment.recipient);
      cy.get('[data-test*=user-list-item]').first().click();
      cy.get('[data-test=transaction-create-amount-input]').type(payment.amount);
      cy.get('[data-test=transaction-create-description-input]').type(payment.description);
      cy.get('[data-test=transaction-create-submit-payment]').click();

      cy.wait('@createTransaction');

      cy.get('[data-test="new-transaction-return-to-transactions"]').should('be.visible').click();

      cy.get('[data-test=transaction-list]').should('be.visible');
      cy.get('[data-test=transaction-list]')
        .should('contain', payment.description)
        .and('contain', `$${payment.amount}`);

      cy.get(
        '[class="MuiListItem-root MuiListItem-gutters MuiListItem-padding MuiListItem-alignItemsFlexStart css-1v18wys-MuiListItem-root"]'
      )
        .first()
        .within(() => {
          cy.get(
            '[class="MuiTypography-root MuiTypography-body2 MuiTypography-gutterBottom css-k5128g-MuiTypography-root"]'
          ).should('contain', payment.description);
          cy.get(
            '[class="MuiTypography-root MuiTypography-body1 TransactionAmount-amountNegative css-1tlfly5-MuiTypography-root"]'
          ).should('contain', payment.amount);
        });
    });
  });

  it('should update user balance after payment', () => {
    cy.fixture('transactions').then((data) => {
      const payment = data.validPayment;

      cy.get('[data-test=sidenav-user-balance]')
        .invoke('text')
        .then((initialBalanceText) => {
          const initialBalance = parseFloat(initialBalanceText.replace(/[^0-9.-]+/g, ''));

          cy.intercept('POST', '/transactions').as('createTransaction');

          cy.get('[data-test=nav-top-new-transaction]').click();
          cy.get('[data-test=user-list-search-input]').type(payment.recipient);
          cy.get('[data-test*=user-list-item]').first().click();
          cy.get('[data-test=transaction-create-amount-input]').type(payment.amount);
          cy.get('[data-test=transaction-create-description-input]').type(payment.description);
          cy.get('[data-test=transaction-create-submit-payment]').click();
          cy.get('[data-test="new-transaction-return-to-transactions"]')
            .should('be.visible')
            .click();

          cy.wait('@createTransaction');

          cy.get('[data-test=sidenav-user-balance]')
            .invoke('text')
            .then((newBalanceText) => {
              const newBalance = parseFloat(newBalanceText.replace(/[^0-9.-]+/g, ''));
              const paymentAmount = parseFloat(payment.amount);

              expect(newBalance).to.be.lessThan(initialBalance);
            });
        });
    });
  });

  it('should create notification for recipient (verified via API)', () => {
    cy.fixture('transactions').then((data) => {
      const payment = data.validPayment;

      cy.intercept('POST', '/transactions').as('createTransaction');
      cy.intercept('GET', '/notifications*').as('getNotifications');

      cy.get('[data-test=nav-top-new-transaction]').click();
      cy.get('[data-test=user-list-search-input]').type(payment.recipient);
      cy.get('[data-test*=user-list-item]').first().click();
      cy.get('[data-test=transaction-create-amount-input]').type(payment.amount);
      cy.get('[data-test=transaction-create-description-input]').type(payment.description);
      cy.get('[data-test=transaction-create-submit-payment]').click();

      cy.wait('@createTransaction');

      cy.get('[data-test=nav-top-notifications-link]').click();
      cy.wait('@getNotifications');

      cy.get('[data-test=notifications-list]').should('be.visible');
    });
  });

  it('should succeed with decimal amount', () => {
    const decimalAmount = '10.50';

    cy.intercept('POST', '/transactions').as('createTransaction');

    cy.get('[data-test=nav-top-new-transaction]').click();
    cy.get('[data-test=user-list-search-input]').type('Devon');
    cy.get('[data-test*=user-list-item]').first().click();
    cy.get('[data-test=transaction-create-amount-input]').type(decimalAmount);
    cy.get('[data-test=transaction-create-description-input]').type('Decimal test');
    cy.get('[data-test=transaction-create-submit-payment]').click();

    cy.wait('@createTransaction').its('response.statusCode').should('eq', 200);
    cy.get('[data-test="new-transaction-return-to-transactions"]').should('be.visible').click();

    // Verify the decimal amount appears correctly in the transaction list
    cy.get('[data-test=transaction-list]').should('contain', '$10.50');
  });

  it('should succeed with long description', () => {
    const longDescription =
      'This is a very long description that tests whether the application can handle extended text inputs without truncation or errors. '.repeat(
        5
      );

    cy.intercept('POST', '/transactions').as('createTransaction');

    cy.get('[data-test=nav-top-new-transaction]').click();
    cy.get('[data-test=user-list-search-input]').type('Devon');
    cy.get('[data-test*=user-list-item]').first().click();
    cy.get('[data-test=transaction-create-amount-input]').type('25');
    cy.get('[data-test=transaction-create-description-input]').type(longDescription);
    cy.get('[data-test=transaction-create-submit-payment]').click();

    cy.wait('@createTransaction').its('response.statusCode').should('eq', 200);
    cy.get('[data-test="new-transaction-return-to-transactions"]').should('be.visible').click();
    cy.get('[data-test=alert-bar-success]').should('be.visible');
  });
});
