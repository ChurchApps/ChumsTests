/// <reference types="cypress" />

declare namespace Cypress {
    interface Chainable {
      /**
       * login programatically via api calls.
       * @example cy.login()
       */
      login(): Chainable
    }
}