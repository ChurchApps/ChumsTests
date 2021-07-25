import * as faker from "faker"
import { PersonInterface } from "../../appBase/interfaces"

describe("Notes", () => {
  before(() => {
      cy.login()
      cy.clearPeople()
  })

  const first = faker.name.firstName()
  const last = faker.name.lastName()
  const noteText = faker.lorem.sentence()
  const newNoteText = faker.lorem.sentence()

  it("should add/edit/cancel/delete a note", () => {
    cy.createPeople([{ first, last }]).then((people: PersonInterface[]) => {
      cy.visit(`/people/${people[0].id}`)
    })

    // add
    cy.findByRole("button", { name: /addnote/i }).click()
    cy.findByRole("textbox", { name: /add a note/i }).type(noteText)
    cy.findByRole("button", { name: /save/i }).click()
    cy.findByText(new RegExp(noteText, "i"))

    // edit
    cy.findByRole("button", { name: /editnote/i }).click()
    cy.findByRole("textbox", { name: /edit note/i }).should("have.value", noteText)
    cy.findByRole("textbox", { name: /edit note/i }).clear().type(newNoteText)
    cy.findByRole("button", { name: /save/i }).click()
    cy.findByText(new RegExp(newNoteText, "i"))

    // cancel
    cy.findByRole("button", { name: /addnote/i }).click()
    cy.findByRole("button", { name: /cancel/i }).click()
    cy.findByRole("textbox", { name: /add a note/i }).should("not.exist")

    // delete
    cy.findByRole("button", { name: /editnote/i }).click()
    cy.findByRole("button", { name: /delete/i }).click()
    cy.findByText(new RegExp(newNoteText, "i")).should("not.exist")
    cy.findByText(/create a note and they'll start appearing here\./i)
  });
})