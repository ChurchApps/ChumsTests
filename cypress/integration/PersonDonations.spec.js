import * as faker from "faker"
import { getPeople, PersonInterface } from "../support/index"

context("Create person donation", () => {
  before(() => {
    cy.login();
    cleanUpDonations();
    createPaymentGateway();
    createFunds([{ name: "Van Fund"}, { name: "General Fund" }]);
  })
  
  beforeEach(() => {
    cy.login();
    const people = getPeople(1)
    const { name: { first, last } } = people[0]
    cy.createPeople(people)
    cy.visit({
      url: `/people`,
      failOnStatusCode: false
    })
    cy.findByRole("link", { name: Cypress.env("church") }).click(); 
    cy.loadPerson(`${first} ${last}`);
    cy.findByRole("tab", { name: /Donations/i }).click();
  })
  
  createPaymentMethods();
  editPaymentMethods();
  donateFromPaymentMethods();
  deletePaymentMethods();
  eventLog();
});
  

function createPaymentMethods() {
  it("Create Stripe payment methods", () => {
  
    // Card
    cy.findByRole("button", { name: /editButton/i }).click()
    cy.findByRole("link", { name: /add-card/i }).click()
    cy.wait(1000);
    cy.getIframe('.StripeElement > .__PrivateStripeElement > iframe').click().type("4242 4242 4242 4242 1230 123 12345");
    cy.findByRole("button", { name: /save-button/i }).click()
    cy.findByText(/visa \*\*\*\*4242/i).should("exist");
  
    // Bank
    cy.findByRole("link", { name: /add-button/i }).click()
    cy.findByRole("link", { name: /add-bank/i }).click()
    cy.findByRole("textbox", { name: "account-holder-name" }).type("Tester Cypress");
    cy.findByRole("spinbutton", { name: "routing-number" }).type("110000000");
    cy.findByRole("spinbutton", {name: "account-number"}).type("000123456789");
    cy.findByRole("button", { name: /save-button/i }).click()
  
    //Verify Bank Account
    cy.findByRole("link", { name: /verify-account/i }).click()
    cy.findByRole("textbox", { name: "amount1" }).type("32");
    cy.findByRole("textbox", { name: "amount2" }).type("45");
    cy.findByRole("button", { name: /save-button/i }).click()
    cy.findByRole("link", { name: /verify-account/i }).should("not.exist");
  })
}
  
function editPaymentMethods() {
  it("Edit payment methods", () => {

    // Edit card
    cy.findAllByRole("link", { name: "edit-button"}).then(links => links[0].click());
    cy.findByRole("textbox", { name: "card-exp-month" }).type("02");
    cy.findByRole("textbox", { name: "card-exp-year" }).type("32");
    cy.findByRole("button", { name: /save-button/i }).click()
  
    // // Edit bank
    cy.findAllByRole("link", { name: "edit-button"}).then(links => links[1].click());
    cy.findByRole("textbox", { name: "account-holder-name" }).clear();
    cy.findByRole("textbox", { name: "account-holder-name" }).type("Cypress Tester");
    cy.selectOption("[aria-label=account-holder-type]", "company");
    cy.findByRole("button", { name: /save-button/i }).click()
  });
}
  
function donateFromPaymentMethods() {
  it("Make donations with Stripe", () => {
  
    // Single donation
    cy.findByRole("button", { name: /single-donation/i }).click();
    cy.get('[aria-label=fund] option').eq(1).invoke('val').then(val => {
      cy.get("[aria-label=fund]").select(val);
    });
    cy.findByRole("spinbutton", { name: "amount" }).type("100");
    cy.findByRole("link", { name: /add-fund-donation/i }).click();
    cy.get("[aria-label=amount]").eq(1).type("50");

    cy.findByRole("textbox", { name: "note" }).type("Test single donation note.");
    cy.findByRole("button", { name: /save-button/i }).click();
    cy.findByRole("button", { name: /donate-button/i }).click();
  
    // Recurring donation
    cy.findByRole("button", { name: /recurring-donation/i }).click();
    cy.get('[aria-label=fund] option').eq(1).invoke('val').then(val => {
      cy.get("[aria-label=fund]").select(val);
    });
    cy.enterText("[aria-label=date]", "2030-01-01");
    cy.get("[aria-label=interval-type]").select("week");
    cy.get('[aria-label=fund] option').eq(1).invoke('val').then(val => {
      cy.get("[aria-label=fund]").select(val);
    });
    cy.get("[aria-label=amount]").eq(0).type("25");

    cy.findByRole("link", { name: /add-fund-donation/i }).click();
    cy.get("[aria-label=amount]").eq(1).type("50");
    cy.findByRole("textbox", { name: "note" }).type("Test recurring donation note.");
    cy.findByRole("button", { name: /save-button/i }).click();
    cy.findByRole("button", { name: /donate-button/i }).click();

    // Edit recurring donation
    cy.existThenClick("[data-cy=recurring-donations] [aria-label=edit-button]");
    cy.get("[aria-label=method] option").eq(0).invoke('val').then(val => {
      cy.get("[aria-label=method]").select(val);
    });
    cy.get("[aria-label=interval-type]").select("month");
    cy.findByRole("button", { name: /save-button/i }).click();
  
    // Delete recurring donation
    cy.existThenClick("[data-cy=recurring-donations] [aria-label=edit-button]");
    cy.findByRole("button", { name: /delete-button/i }).click();
  });
}
  
function deletePaymentMethods() {
  it("Delete payment methods", () => {

    // Delete card
    cy.findAllByRole("link", { name: "edit-button"}).then(links => links[0].click());
    cy.findByRole("button", { name: /delete-button/i }).click();
  
    // Delete bank account
    cy.findAllByRole("link", { name: "edit-button"}).then(links => links[0].click());
    cy.findByRole("button", { name: /delete-button/i }).click();
  
  });
}
  
function eventLog() {
  it("Resolve a failed event log", () => {
    cy.makeApiCall("GET", "/customers", "GivingApi").then(res => {
      if (res.length)  {
        const customer = res[0];
        const created = new Date(new Date()).toISOString().slice(0, 19).replace("T", " ");
        const defaultEventData = { churchId: customer.churchId, customerId: customer.id, personId: customer.personId, provider: 'Stripe', created };
        const events = [{...defaultEventData, id: 'evt_id1', eventType: 'charge.failed', status: 'failed', message: 'Your card was declined.' }];
        cy.makeApiCall("POST", "/eventLog", "GivingApi", events);
      }
    });
    cy.visit({
      url: `/donations`,
      failOnStatusCode: false
    })
    cy.get("[data-cy=eventLogs] [aria-label=card]").eq(0).click();
    cy.findByRole("button", { name: /resolve-button/i }).click();
  });
}
  
function createFunds(funds) {
  return cy.makeApiCall("POST", "/funds", "GivingApi", funds)
}

function cleanUpDonations() {
  cy.makeApiCall("GET", "/eventLog", "GivingApi").then(logs => {
    logs.forEach(log => cy.makeApiCall("DELETE", `/eventLog/${log.id}`, "GivingApi"));
  });
  
  cy.makeApiCall("GET", "/customers", "GivingApi").then(customers => {
    customers.forEach(customer => cy.makeApiCall("DELETE", `/customers/${customer.id}`, "GivingApi"));
  });
  
  cy.makeApiCall("GET", "/subscriptions", "GivingApi").then(subscriptions => {
    subscriptions.forEach(sub => cy.makeApiCall("DELETE", `/subscriptions/${sub.id}`, "GivingApi"));
  });

  cy.makeApiCall("GET", "/subscriptionFunds", "GivingApi").then(subscriptionFunds => {
    subscriptionFunds.forEach(subFunds => cy.makeApiCall("DELETE", `/subscriptionFunds/${subFunds.id}`, "GivingApi"));
  });

  cy.makeApiCall("GET", "/gateways", "GivingApi").then(gateways => {
    gateways.forEach(gateway => cy.makeApiCall("DELETE", `/gateways/${gateway.id}`, "GivingApi"));
  });

  cy.makeApiCall("GET", "/funds", "GivingApi").then(funds => {
    funds.forEach(fund => cy.makeApiCall("DELETE", `/funds/${fund.id}`, "GivingApi"));
  });
  
  cy.clearPeople();
}
  
function createPaymentGateway() {
  // GET FROM GITHUB KEYS
  const gateways = [{ provider: 'Stripe', publicKey: Cypress.env("stripePK"), privateKey: Cypress.env("stripeSK") }];
  return cy.makeApiCall("POST", "/gateways", "GivingApi", gateways)
}
