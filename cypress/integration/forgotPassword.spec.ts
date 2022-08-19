/**
 * forgot password functionality is shared across all apps via appBase so
 * testing it for chums, verifies it'll work for the rest.
 */

import * as faker from "faker";

describe("Forgot password", () => {
  beforeEach(() => {
    cy.clearLocalStorageSnapshot();
    cy.visit({
      url: 'login',
      failOnStatusCode: false
    });
    cy.findByRole("link", { name: /forgot password/i }).click();
  });

  shouldSendEmail();
  shouldThrowError();
});

// email is only sent if user it's tested for a registered user.
function shouldSendEmail() {
  it("should send forgot password mail", () => {
    cy.findByText(/reset password/i).should("exist");
    cy.findByRole("textbox", { name: "Email" }).type(Cypress.env("email"));
    cy.findByRole("button", { name: /reset/i }).click();
    cy.findByText(/Password reset email sent/i);
  });
}

function shouldThrowError() {
  it("should throw error for non-registered user", () => {
    const email = faker.internet.email();

    cy.findByRole("textbox", { name: "Email" }).type(email);
    cy.findByRole("button", { name: /reset/i }).click();
    cy.findByText(/We could not find an account with this email address/i);
  });
}
