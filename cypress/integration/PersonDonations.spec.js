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
    cy.existThenClick("[aria-label=donations-tab]")
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
    cy.existThenClick("[aria-label=add-button]");
    cy.existThenClick("[aria-label=add-card]");
    cy.wait(1000);
    cy.getIframe('.StripeElement > .__PrivateStripeElement > iframe').click().type("4242 4242 4242 4242 1230 123 12345");
    cy.existThenClick("[aria-label=save-button]");
    cy.containsAll("[aria-label=payment-methods-box]", ["visa ****4242"]);
  
    // Bank
    cy.existThenClick("[aria-label=add-button]");
    cy.existThenClick("[aria-label=add-bank]");
    cy.enterText("[aria-label=account-holder-name]", "Tester Cypress");
    cy.enterText("[aria-label=routing-number]", "110000000");
    cy.enterText("[aria-label=account-number]", "000123456789");
    cy.existThenClick("[aria-label=save-button]");
  
    //Verify Bank Account
    cy.existThenClick("[aria-label=verify-account]");
    cy.enterText("[aria-label=amount1]", "32");
    cy.enterText("[aria-label=amount2]", "45");
    cy.existThenClick("[aria-label=save-button]");
    cy.notContainAll("[aria-label=payment-methods-box]", ["Verify Account"]);
  })
}
  
function editPaymentMethods() {
  it("Edit payment methods", () => {
  
    // Edit card
    cy.get("[aria-label=payment-methods-box] [aria-label=edit-button]").eq(0).click();
    cy.enterText("[aria-label=card-exp-month]", "02");
    cy.enterText("[aria-label=card-exp-year]", "32");
    cy.existThenClick("[aria-label=save-button]");
  
    // Edit bank
    cy.get("[aria-label=payment-methods-box] [aria-label=edit-button]").eq(1).click();
    cy.enterText("[aria-label=account-holder-name]", "Cypress Tester");
    cy.selectOption("[aria-label=account-holder-type]", "company");
    cy.existThenClick("[aria-label=save-button]");
  });
}
  
function donateFromPaymentMethods() {
  it("Make donations with Stripe", () => {
  
    // Single donation
    cy.existThenClick("[aria-label=single-donation]");
    cy.get('[aria-label=fund] option').eq(1).invoke('val').then(val => {
      cy.get("[aria-label=fund]").select(val);
    });
    cy.enterText("[aria-label=amount]", "100");
    cy.existThenClick("[aria-label=add-fund-donation]");
    cy.get("[aria-label=amount]").eq(1).type("50");
    cy.enterText("[aria-label=note]", "Test single donation note.");
    cy.existThenClick("[aria-label=save-button]");
    cy.existThenClick("[aria-label=donate-button]");
  
    // Recurring donation
    cy.wait(3000);
    cy.existThenClick("[aria-label=recurring-donation]");
    cy.get('[aria-label=method] option').eq(1).invoke('val').then(val => {
      cy.get("[aria-label=method]").select(val);
    });
    cy.enterText("[aria-label=date]", "2030-01-01");
    cy.get("[aria-label=interval-type]").select("week");
    cy.get('[aria-label=fund] option').eq(1).invoke('val').then(val => {
      cy.get("[aria-label=fund]").select(val);
    });
    cy.enterText("[aria-label=amount]", "25");
    cy.existThenClick("[aria-label=add-fund-donation]");
    cy.get("[aria-label=amount]").eq(1).type("75");
    cy.enterText("[aria-label=note]", "Test recurring donation note.");
    cy.existThenClick("[aria-label=save-button]");
    cy.existThenClick("[aria-label=donate-button]");
  
    // Edit recurring donation
    cy.existThenClick("[aria-label=recurring-donations] [aria-label=edit-button]");
    cy.get("[aria-label=method] option").eq(0).invoke('val').then(val => {
      cy.get("[aria-label=method]").select(val);
    });
    cy.get("[aria-label=interval-type]").select("month");
    cy.existThenClick("[aria-label=save-button]");
  
    // Delete recurring donation
    cy.existThenClick("[aria-label=recurring-donations] [aria-label=edit-button]");
    cy.existThenClick("[aria-label=delete-button]");
  });
}
  
function deletePaymentMethods() {
  it("Delete payment methods", () => {

    // Delete card
    cy.get("[aria-label=payment-methods-box] [aria-label=edit-button]").eq(0).click();
    cy.existThenClick("[aria-label=delete-button]");
  
    // Delete bank account
    cy.get("[aria-label=payment-methods-box] [aria-label=edit-button]").eq(0).click();
    cy.existThenClick("[aria-label=delete-button]");
  
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
    cy.get("[aria-label=eventLogs] [aria-label=card]").eq(0).click();
    cy.get("[aria-label=eventLogs] [aria-label=card] [aria-label=resolve-button]").eq(0).click();
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
