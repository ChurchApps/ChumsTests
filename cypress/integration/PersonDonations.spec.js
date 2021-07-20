context("Create person donation", () => {
  before(() => {
    cy.login();
    cleanUpDonations();
    createPaymentGateway();
    createFunds([{ name: "Van Fund"}, { name: "General Fund" }]);
    cy.createPeople([{ first: "Cypress", last: "Tester" }]);
  })
  
  beforeEach(() => {
    cy.login();
    cy.visit("people/");
    cy.loadPerson('Cypress Tester');
    cy.existThenClick("[data-cy=donations-tab]")
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
    cy.existThenClick("[data-cy=add-button]");
    cy.existThenClick("[data-cy=add-card]");
    cy.wait(1000);
    cy.getIframe('.StripeElement > .__PrivateStripeElement > iframe').click().type("4242 4242 4242 4242 1230 123 12345");
    cy.existThenClick("[data-cy=save-button]");
    cy.containsAll("[data-cy=payment-methods-box]", ["visa ****4242"]);
  
    // Bank
    cy.existThenClick("[data-cy=add-button]");
    cy.existThenClick("[data-cy=add-bank]");
    cy.enterText("[data-cy=account-holder-name]", "Tester Cypress");
    cy.enterText("[data-cy=routing-number]", "110000000");
    cy.enterText("[data-cy=account-number]", "000123456789");
    cy.existThenClick("[data-cy=save-button]");
  
    //Verify Bank Account
    cy.existThenClick("[data-cy=verify-account]");
    cy.enterText("[data-cy=amount1]", "32");
    cy.enterText("[data-cy=amount2]", "45");
    cy.existThenClick("[data-cy=save-button]");
    cy.notContainAll("[data-cy=payment-methods-box]", ["Verify Account"]);
  })
}
  
function editPaymentMethods() {
  it("Edit payment methods", () => {
  
    // Edit card
    cy.get("[data-cy=payment-methods-box] [data-cy=edit-button]").eq(0).click();
    cy.enterText("[data-cy=card-exp-month]", "02");
    cy.enterText("[data-cy=card-exp-year]", "32");
    cy.existThenClick("[data-cy=save-button]");
  
    // Edit bank
    cy.get("[data-cy=payment-methods-box] [data-cy=edit-button]").eq(1).click();
    cy.enterText("[data-cy=account-holder-name]", "Cypress Tester");
    cy.selectOption("[data-cy=account-holder-type]", "company");
    cy.existThenClick("[data-cy=save-button]");
  });
}
  
function donateFromPaymentMethods() {
  it("Make donations with Stripe", () => {
  
    // Single donation
    cy.existThenClick("[data-cy=single-donation]");
    cy.get('[data-cy=fund] option').eq(1).invoke('val').then(val => {
      cy.get("[data-cy=fund]").select(val);
    });
    cy.enterText("[data-cy=amount]", "100");
    cy.existThenClick("[data-cy=add-fund-donation]");
    cy.get("[data-cy=amount]").eq(1).type("50");
    cy.enterText("[data-cy=note]", "Test single donation note.");
    cy.existThenClick("[data-cy=save-button]");
    cy.existThenClick("[data-cy=donate-button]");
  
    // Recurring donation
    cy.wait(3000);
    cy.existThenClick("[data-cy=recurring-donation]");
    cy.get('[data-cy=method] option').eq(1).invoke('val').then(val => {
      cy.get("[data-cy=method]").select(val);
    });
    cy.enterText("[data-cy=date]", "2030-01-01");
    cy.get("[data-cy=interval-type]").select("week");
    cy.get('[data-cy=fund] option').eq(1).invoke('val').then(val => {
      cy.get("[data-cy=fund]").select(val);
    });
    cy.enterText("[data-cy=amount]", "25");
    cy.existThenClick("[data-cy=add-fund-donation]");
    cy.get("[data-cy=amount]").eq(1).type("75");
    cy.enterText("[data-cy=note]", "Test recurring donation note.");
    cy.existThenClick("[data-cy=save-button]");
    cy.existThenClick("[data-cy=donate-button]");
  
    // Edit recurring donation
    cy.existThenClick("[data-cy=recurring-donations] [data-cy=edit-button]");
    cy.get("[data-cy=method] option").eq(0).invoke('val').then(val => {
      cy.get("[data-cy=method]").select(val);
    });
    cy.get("[data-cy=interval-type]").select("month");
    cy.existThenClick("[data-cy=save-button]");
  
    // Delete recurring donation
    cy.existThenClick("[data-cy=recurring-donations] [data-cy=edit-button]");
    cy.existThenClick("[data-cy=delete-button]");
  });
}
  
function deletePaymentMethods() {
  it("Delete payment methods", () => {

    // Delete card
    cy.get("[data-cy=payment-methods-box] [data-cy=edit-button]").eq(0).click();
    cy.existThenClick("[data-cy=delete-button]");
  
    // Delete bank account
    cy.get("[data-cy=payment-methods-box] [data-cy=edit-button]").eq(0).click();
    cy.existThenClick("[data-cy=delete-button]");
  
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
    cy.visit("donations/");
    cy.get("[data-cy=eventLogs] [data-cy=content] [data-cy=card]").eq(0).click();
    cy.get("[data-cy=eventLogs] [data-cy=content] [data-cy=card] [data-cy=resolve-button]").eq(0).click();
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
