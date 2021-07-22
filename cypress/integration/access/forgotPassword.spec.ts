/**
 * forgot password functionality is shared across all apps via appBase so
 * testing it for chums, verifies it'll work for the rest.
 */

import * as faker from "faker"

describe("Forgot password", () => {
  beforeEach(() => {
    cy.visit("/forgot")
  })

  shouldSendEmail()
  shouldThrowError()
  testLinks()
})

// email is only sent if user it's tested for a registered user.
function shouldSendEmail() {
  it("should send forgot password mail", () => {
    cy.findByText(/reset password/i).should("exist")
    cy.findByRole("textbox").type(Cypress.env("email"))
    cy.findByRole("button", { name: /reset/i }).click()
    cy.findByText(/email sent/i).should("exist")
  })
}

function shouldThrowError() {
  it("should throw error for non-registered user", () => {
    const email = faker.internet.email();

    cy.findByRole("textbox").type(email)
    cy.findByRole("button", { name: /reset/i }).click()
    cy.findByText(/could not find/i, { exact: false}).should("exist")
  })
}

function testLinks() {
  it("should navigate to login page", () => {
    cy.findByRole("link", { name: /login/i }).click()
    cy.findAllByText(/sign in/i).should("exist")
  })

  it("should navigate to churchWebApps site", () => {
    cy.findByRole("link", { name: /register/i }).click()
    cy.url().should('include', Cypress.env("CHURCH_WEB_APPS_URL"))
  })
}