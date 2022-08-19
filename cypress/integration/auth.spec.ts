import * as faker from "faker";

describe("Login / Logout", () => {
  before(() => {
    cy.clearLocalStorageSnapshot();
  });

  login();
  logout();
});

function login() {
  it("login should fail with error for non-registered users", () => {
    cy.visit({
      url: 'login',
      failOnStatusCode: false
    });
    const email = faker.internet.email();
    const password = faker.internet.password();

    cy.findByRole("textbox", { name: /email/i }).type(email);
    cy.findByLabelText(/password/i).type(password);
    cy.findByRole("button", { name: /sign in/i }).click();
    cy.findByRole("alert");
  });

  it("should work with valid credentials", () => {
    cy.visit({
      url: 'login',
      failOnStatusCode: false
    });
    cy.findByRole("textbox", { name: /email/i }).type(Cypress.env("email"));
    cy.findByLabelText(/password/i).type(Cypress.env("password"));
    cy.findByRole("button", { name: /sign in/i }).click();
    cy.findByText(/select church/i);
    cy.findByRole("link", { name: Cypress.env("church") }).click(); 
    //cy.url().should("include", "people"); -- page redirects to dashboard. for confirmation
    cy.getCookie("jwt").should("exist");
  });

  it("should redirect to login when trying to access other routes for a non logged in user", () => {
    cy.visit({
      url: 'groups',
      failOnStatusCode: false
    });
    cy.url().should("include", "login");
  });
}

function logout() {
  it("should logout the user", () => {
    cy.login();
    cy.visit({
      url: 'people',
      failOnStatusCode: false
    });
    cy.findByRole("link", { name: Cypress.env("church") }).click(); 
    cy.findByRole("button", { name: /Cypress Chums/i }).click();
    cy.findByRole("link", { name: /logout/i }).click();
    cy.url().should("include", "login");
  });
}
