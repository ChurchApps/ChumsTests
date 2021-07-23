/// <reference path="../../support/index.d.ts" />

import * as faker from "faker"

describe("Login / Logout", () => {
    login()
})

function login() {

    it("sign in heading should be present", () => {
        cy.visit("/login")
        cy.findAllByText(/sign in/i).should("exist")
    })

    it("should throw error for empty fields", () => {
        cy.visit("/login")
        cy.findByRole("button", { name: /sign in/i }).click()
        cy.findByRole("alert").should("have.text", "Please enter your email address.Please enter your password.")
    })

    it("login should fail with error for non-registered users", () => {
        cy.visit("/login")
        const email = faker.internet.email()
        const password = faker.internet.password()

        cy.findByRole("textbox", { name: /email/i }).type(email)
        cy.findByLabelText(/password/i).type(password)
        cy.findByRole("button", { name: /sign in/i }).click()
        cy.findByRole("alert").should("have.text", "Invalid login. Please check your email or password.")
    })

    it("should work with valid credentials", () => {
        cy.visit("/login")
        cy.findByRole("textbox", { name: /email/i }).type(Cypress.env("email"))
        cy.findByLabelText(/password/i).type(Cypress.env("password"))
        cy.findByRole("button", { name: /sign in/i }).click()
        cy.url().should('include', "people")
        cy.getCookie("jwt").should("exist")
    })

    it("should redirect to login when trying to access other routes for a non logged in user", () => {
        cy.visit("/groups")
        cy.url().should('include', "login")
    })

    it("should be able to redirect to other routes when logged in", () => {
        cy.login()
        cy.visit("/groups")
        cy.url().should('include', "groups")
        cy.visit("/attendance")
        cy.url().should('include', "attendance")
    })

    it("after login redirect to the original route where user was redirected for login", () => {
        cy.visit("/settings")
        cy.login()
        cy.reload()
        cy.url().should('include', "settings")
    })
}