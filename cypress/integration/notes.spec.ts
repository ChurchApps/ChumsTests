import * as faker from "faker";
import { PersonInterface, getPeople } from "../support/index";

describe("Notes", () => {
  before(() => {
    cy.clearLocalStorageSnapshot();
    cy.login();
    cy.clearPeople();
  });

  beforeEach(() => {
    cy.restoreLocalStorage();
    cy.login();
  });

  afterEach(() => {
    cy.saveLocalStorage();
  });

  note();
});

function note() {
  const people = getPeople(1);
  const noteText = faker.lorem.sentence();
  const newNoteText = faker.lorem.sentence();

  it("should add / edit / delete a note", () => {
    cy.createPeople(people).then((people: PersonInterface[]) => {
      cy.visit(`/people/${people[0].id}`);
    });

    // add
    cy.findByRole("button", { name: /addnote/i }).click();
    cy.findByRole("textbox", { name: /add a note/i }).type(noteText);
    cy.findByRole("button", { name: /save/i }).click();
    cy.findByText(new RegExp(noteText, "i"));

    // edit
    cy.findByRole("button", { name: /editnote/i }).click();
    cy.findByRole("textbox", { name: /edit note/i }).should("have.value", noteText);
    cy.findByRole("textbox", { name: /edit note/i })
      .clear()
      .type(newNoteText);
    cy.findByRole("button", { name: /save/i }).click();
    cy.findByText(new RegExp(newNoteText, "i"));

    // delete
    cy.findByRole("button", { name: /editnote/i }).click();
    cy.findByRole("button", { name: /delete/i }).click();
    cy.findByText(new RegExp(newNoteText, "i")).should("not.exist");
  });
}
