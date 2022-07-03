declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to load an existing person
     * @example cy.loadPerson('John Doe')
     */
    loadPerson(name: string): Chainable<Element>;

    /**
     * Custom command to click an existing selector
     * @example cy.containsClick('#main')
     */
    containsClick(value: string): Chainable<Element>;

    /**
     * Custom command to verify if all expected values exist on the given selector
     * @example cy.containsAll('data-cy=people-list')
     */
    containsAll(selector: string, values: string): Chainable<Element>;

    /**
     * Custom command to enter text to an editable textbox/area
     * @example cy.enterText('John Doe')
     */
    enterText(selector: string, text: string): Chainable<Element>;

    /**
     * Custom command to verify if all non-expected values is not present on the given selector
     * @example cy.notContainAll('John Doe')
     */
    notContainAll(selector: string, values: string): Chainable<Element>;

    /**
     * Custom command to verify if path name contains expected route
     * @example cy.verifyRoute('/login')
     */
    verifyRoute(route: string): Chainable<Element>;

    /**
     * Custom command to select an option within an element
     * @example cy.selectOption('Gender')
     */
    selectOption(selector: string, value: string): Chainable<Element>;

    /**
     * Custom command to check if element exists before clicking
     * @example cy.existThenClick('[data-cy="save"]]')
     */
    existThenClick(selector: string): Chainable<Element>;

    getIframe(value: string): Chainable

    verifyLinkExistsAfterDeletion(linkText: string): Chainable<Element>;
  }
}

Cypress.Commands.add("loadPerson", (name) => {
  cy.get("#searchText").type(name);
  cy.get("#searchButton").click();
  cy.get("body").should("contain", name);
  cy.get("a:contains('" + name + "')").click();
  cy.get("h2").should("contain", name);
});

Cypress.Commands.add("containsAll", (selector, values) => {
  cy.get(selector).should("exist");
  values.map((v) => cy.get(selector).contains(v));
});

Cypress.Commands.add("enterText", (selector, text) => {
  cy.wait(250);
  cy.get(selector).should("exist").should("not.be.disabled").clear();
  cy.get(selector).type(text);
});

Cypress.Commands.add("notContainAll", (selector, values) => {
  cy.get(selector).should("exist");
  values.map((v) => cy.get(selector).should("not.contain", v));
});

Cypress.Commands.add("containsClick", (selector) => {
  cy.get(`a:contains('${selector}')`).should("exist").click();
});

Cypress.Commands.add("verifyRoute", (route) => {
  cy.location("pathname").should("exist").should("contain", route);
});

Cypress.Commands.add("selectOption", (selector, value) => {
  cy.get(selector).should('exist').select(value);   
})

Cypress.Commands.add("existThenClick", (selector) => {
  cy.get(selector).should('exist').click();
})

Cypress.Commands.add('getIframe', (iframe) => {
  return cy.get(iframe).its('0.contentDocument.body').should('be.visible').then(cy.wrap);
})

Cypress.Commands.add('verifyLinkExistsAfterDeletion', (linkText) => {
  cy.xpath(`//a[contains(., ${linkText})]`)
    .its('length')
    .then(length => {
      if (length >= 1) {
        throw new Error(`${linkText} exists in the DOM`)
      } else {
        cy.log(`${linkText} does not exist after deletion`)
      }
    })
})