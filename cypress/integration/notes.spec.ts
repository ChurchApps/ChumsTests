import * as faker from "faker"
import { PersonInterface, getPeople } from "../support/index"

describe("Notes", () => {
  before(() => {
      cy.login()
      cy.clearPeople()
  })

  beforeEach(() => {
    cy.login()
  })

  addEdit()
  cancel()
  deleteNote()
})

function addEdit() {
  const people = getPeople(1)
  const noteText = faker.lorem.sentence()
  const newNoteText = faker.lorem.sentence()

  it("should add/edit/cancel/delete a note", () => {
    cy.createPeople(people).then((people: PersonInterface[]) => {
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
  });
}

function cancel() {
  const people = getPeople(1)
  it("should cancel on note creation", () => {
    cy.createPeople(people).then((people: PersonInterface[]) => {
      cy.visit(`/people/${people[0].id}`)
    })

    cy.findByRole("button", { name: /addnote/i }).click()
    cy.findByRole("button", { name: /cancel/i }).click()
    cy.findByRole("textbox", { name: /add a note/i }).should("not.exist")
  })
}

function deleteNote() {
  const text = faker.lorem.sentence()
  
  it("should delete a note", () => {
    cy.login()
    const people = getPeople(1)
    cy.createPeople(people).then((people: PersonInterface[]) => {
      cy.makeApiCall("POST", "/notes", "MembershipApi", [{ contentId: people[0].id, contentType: "person", contents: text }])
      cy.visit(`/people/${people[0].id}`)
    })
    cy.findByRole("button", { name: /editnote/i }).click()
    cy.findByRole("button", { name: /delete/i }).click()
    cy.findByText(new RegExp(text, "i")).should("not.exist")
  })
}