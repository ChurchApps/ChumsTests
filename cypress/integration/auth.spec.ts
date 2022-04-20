import * as faker from "faker"

describe("Login / Logout", () => {
    login()
    logout()
})

function login() {

    it("login should fail with error for non-registered users", () => {
        cy.visit("/login")
        const email = faker.internet.email()
        const password = faker.internet.password()

        cy.findByRole("textbox", { name: /email/i }).type(email)
        cy.findByLabelText(/password/i).type(password)
        cy.findByRole("button", { name: /sign in/i }).click()
        cy.findByRole("alert");
    })

    it("should work with valid credentials", () => {
        cy.visit("/login")
        cy.findByRole("textbox", { name: /email/i }).type(Cypress.env("email"))
        cy.findByLabelText(/password/i).type(Cypress.env("password"))
        cy.findByRole("button", { name: /sign in/i }).click()
        cy.findByText(/select church/i)
        cy.findByText(/claim 01/i).click() // TODO - don't hard code church name. Its better to fetch and then search that
        cy.url().should('include', "people")
        cy.getCookie("jwt").should("exist")
    })

    it("should redirect to login when trying to access other routes for a non logged in user", () => {
        cy.visit("/groups")
        cy.url().should('include', "login")
    })

}

function logout() {
    it("should logout the user", () => {
        cy.login()
        cy.visit("/people")
        cy.findByRole("link", { name: /toggle navigation/i }).click()
        cy.findByRole("link", { name: /logout/i }).click()
        cy.url().should('include', "login")
        cy.getCookie("jwt").should("not.exist")
    })
}