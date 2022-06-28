import * as faker from "faker";
import { eq } from "../../node_modules/cypress/types/lodash/index";
import { getForms, FormInterface, QuestionInterface } from "../support/index";

describe("Forms", () => {
  before(() => {
    cy.clearLocalStorageSnapshot();
    cy.login();
    cleanupForms();
  });

  beforeEach(() => {
    cy.restoreLocalStorage();
    cy.login();
  });

  afterEach(() => {
    cy.saveLocalStorage();
  });

  form();
  question();
});

function cleanupForms() {
  cy.clearQuestions();
  cy.clearForms();
}

function form() {
  const name = faker.company.companyName();
  const newName = faker.company.companyName();

  it("should add / edit / delete form", () => {
    cy.visit({
      url: 'forms',
      failOnStatusCode: false
    });
    cy.findByRole("img", { name: /church logo/i }).click();

    // add
    cy.findByRole("button", { name: /addform/i }).click();
    cy.findByRole("textbox", { name: /form name/i }).click().type(name);
    cy.findByRole("button", { name: /save/i }).click();
    cy.findByRole("link", { name: new RegExp(name, "i") }).should("exist");

    //edit
    cy.get('button[aria-label="editButton"]').eq(1).click();
    cy.findByRole("textbox", { name: /form name/i }).clear();
    cy.wait(2000);
    cy.findByRole("textbox", { name: /form name/i })
      .clear()
      .type(newName);
    cy.findByRole("button", { name: /save/i }).click();
    cy.findByRole("link", { name: new RegExp(newName, "i") }).should("exist");

    //delete
    cy.get('button[aria-label="editButton"]').eq(1).click();
    cy.wait(2000);
    cy.findByRole("button", { name: /delete/i }).click();
    cy.findByRole("link", { name: new RegExp(newName, "i") }).should("not.exist");
  });
}

function question() {
  const forms = getForms(1);
  const title = faker.company.companyName();
  const newQuestionTitle = faker.company.companyName();

  it("should add / edit / delete question", () => {
    // add
    cy.createForms(forms).then((forms: FormInterface[]) => {
      cy.visit({
        url: `/forms/${forms[0].id}`,
        failOnStatusCode: false
      });
    });
    cy.findByRole("img", { name: /church logo/i }).click();
    cy.findByRole("button", { name: /addquestion/i }).click();
    cy.findByRole("textbox", { name: /title/i }).clear();
    cy.wait(2000);
    cy.findByRole("textbox", { name: /title/i }).clear().type(title);
    cy.findByRole("button", { name: /save/i }).click();
    cy.findByRole("link", { name: new RegExp(title, "i") }).should("exist");

    // edit
    cy.findByRole("link", { name: new RegExp(title, "i") }).click();
    cy.wait(2000);
    cy.get('#mui-component-select-fieldType').eq(0).parent().click()
    cy.findByRole("option", { name: /Email/i }).click()
    cy.findByRole("textbox", { name: /title/i }).clear().type(newQuestionTitle);
    cy.findByRole("button", { name: /save/i }).click();
    cy.findByRole("link", { name: new RegExp(newQuestionTitle, "i") }).should("exist");
    cy.findByText(/email/i).should("exist");

    // delete
    cy.findByRole("link", { name: new RegExp(newQuestionTitle, "i") }).click();
    cy.wait(2000);
    cy.findByRole("button", { name: /delete/i }).click();
  });
}
