import { PersonInterface, getPeople } from "../support/index";

describe("Household", () => {
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

  addRemove();
  changeRole();
  addWithNoChange();
  addWithAddressChange();
});

function addRemove() {
  it("should be able to add and remove a member from household", () => {
    const people = getPeople(2, { withoutAddress: true });
    cy.createPeople(people).then((people: PersonInterface[]) => {
      cy.visit({
        url: `/people/${people[0].id}`,
        failOnStatusCode: false
      });
    });
    cy.findByRole("link", { name: Cypress.env("church") }).click(); 
    cy.findByText(new RegExp(`${people[0].name.last} household`, "i"));
    cy.findByRole("link", { name: new RegExp(`${people[0].name.first} ${people[0].name.last}`, "i") });
    cy.get('button[aria-label="editButton"]').eq(0).click();
    cy.findByRole("button", { name: /Delete/i }).click();
    cy.findByRole("button", { name: /save/i }).click();
    cy.wait(1000)
    cy.get('[data-cy="content"]').eq(0) 
      .should('not.contain', `${people[0].name.first} ${people[0].name.last}`)
    cy.get("#searchText").type(people[1].name.first || "");
    cy.findByRole("button", { name: /search/i }).click();
    cy.findByRole("link", { name: new RegExp(people[1].name.first || "", "i") }).should("exist");
  });
}

function changeRole() {
  it("should be able to change role", () => {
    const people = getPeople(1);
    cy.createPeople(people).then((people: PersonInterface[]) => {
      cy.visit({
        url: `/people/${people[0].id}`,
        failOnStatusCode: false
      });
    });
    cy.findByRole("link", { name: Cypress.env("church") }).click(); 
    cy.findByText(new RegExp(`${people[0].name.last} household`, "i")).should("exist");
    cy.findByRole("link", { name: new RegExp(`${people[0].name.first} ${people[0].name.last}`, "i") });
    cy.get('button[aria-label="editButton"]').eq(1).click();
    cy.get('#household-role').eq(0).parent().click()
    cy.findByRole("option", { name: "Child" }).click()
    cy.findByRole("button", { name: /save/i }).click();
    cy.findByText(/child/i);
  });
}

function addWithNoChange() {
  const people = getPeople(2);

  it("should add member to household without any change", () => {
    addPersonToHousehold(people);
    cy.findByRole("button", { name: /no/i }).click();
    cy.findByRole("button", { name: /save/i }).click();
    cy.findByRole("link", { name: new RegExp(`${people[1].name.first} ${people[1].name.last}`) }).click();
    cy.findByText(
      new RegExp(`${people[0].contactInfo.city}, ${people[0].contactInfo.state} ${people[0].contactInfo.zip}`)
    ).should("not.exist");
  });
}

function addWithAddressChange() {
  const people = getPeople(2);

  it("should add member with address change", () => {
    addPersonToHousehold(people);
    cy.findByRole("button", { name: /yes/i }).click();
    cy.wait(2000);
    cy.findByRole("button", { name: /save/i }).click();
    cy.findByRole("link", { name: new RegExp(`${people[1].name.first} ${people[1].name.last}`) }).click();
    cy.findByText(
      new RegExp(`${people[0].contactInfo.city}, ${people[0].contactInfo.state} ${people[0].contactInfo.zip}`)
    ).should("exist");
  });
}

function addPersonToHousehold(people: PersonInterface[]) {
  cy.createPeople(people).then((people: PersonInterface[]) => {
    cy.visit({
      url: `/people/${people[0].id}`,
      failOnStatusCode: false
    });
  });
  cy.findByRole("link", { name: Cypress.env("church") }).click(); 
  cy.findByText(new RegExp(`${people[0].name.last} household`, "i")).should("exist");
  cy.findByRole("link", { name: new RegExp(`${people[0].name.first} ${people[0].name.last}`, "i") });
  cy.get('button[aria-label="editButton"]').eq(1).click();
  cy.get("#householdBox button").eq(1).click();
  cy.get("[name='personAddText']").type(people[1].name.first || "");
  cy.get("#searchButton").click();
  cy.findByRole("button", { name: /addperson/i }).click();
}
