import * as faker from "faker";

context("Attendance", () => {
  before(() => {
    cy.clearLocalStorageSnapshot();
    cy.login();
    cleanupAttendance();
  });

  beforeEach(() => {
    cy.restoreLocalStorage();
    cy.login();
    cy.visit({
      url: 'attendance',
      failOnStatusCode: false
    });
  });

  afterEach(() => {
    cy.saveLocalStorage();
  });

  campus();
  service();
  serviceTime();
});

function cleanupAttendance() {
  cy.clearCampuses();
  cy.clearServices();
  cy.clearServiceTimes();
}

function campus() {
  it("should add / edit / delete Campus", () => {
    const BEFORE_CAMPUS_NAME = faker.random.word();
    const AFTER_CAMPUS_NAME = faker.random.word();

    // add
    cy.findByRole("link", { name: /Cypress Church/i }).click();
    cy.wait(1000)
    cy.get('[data-cy="add-button"]').click();
    cy.findByRole("menuitem", { name: /add campus/i }).click();
    cy.findByRole("textbox", { name: /campus name/i })
      .clear()
      .type(BEFORE_CAMPUS_NAME);
    cy.findByRole("button", { name: /save/i }).click();
    cy.findByRole("link", { name: new RegExp(BEFORE_CAMPUS_NAME, "i") }).should("exist");

    // edit
    cy.findByRole("link", { name: new RegExp(BEFORE_CAMPUS_NAME, "i") }).click();
    cy.findByRole("textbox", { name: /campus name/i })
      .clear()
      .type(AFTER_CAMPUS_NAME);
    cy.findByRole("button", { name: /save/i }).click();
    cy.findByRole("link", { name: new RegExp(AFTER_CAMPUS_NAME, "i") }).should("exist");

    // delete
    cy.findByRole("link", { name: new RegExp(AFTER_CAMPUS_NAME, "i") }).click();
    cy.findByRole("button", { name: /delete/i }).click();
    cy.findByRole("link", { name: new RegExp(AFTER_CAMPUS_NAME, "i") }).should("not.exist");
  });
}

function service() {
  it("should add / edit / delete a Service", () => {
    const CAMPUS_NAME = faker.random.word();
    const BEFORE_SERVICE_NAME = faker.random.word();
    const AFTER_SERVICE_NAME = faker.random.word();

    // add
    cy.makeApiCall("POST", "/campuses", "AttendanceApi", [{ name: CAMPUS_NAME }]);
    cy.findByRole("link", { name: /Cypress Church/i }).click();
    cy.findByRole("link", { name: new RegExp(CAMPUS_NAME, "i") }).should("exist");
    cy.wait(1000)
    cy.get('[data-cy="add-button"]').click();
    cy.findByRole("menuitem", { name: /addService/i }).click();
    cy.findByRole("textbox", { name: /service name/i })
      .clear()
      .type(BEFORE_SERVICE_NAME);
    cy.wait(2000);

    cy.get('#mui-component-select-campus').eq(0).parent().click()
    cy.findByRole("option", { name: CAMPUS_NAME }).click()
    cy.findByRole("button", { name: /save/i }).click();
    cy.findByRole("link", { name: new RegExp(BEFORE_SERVICE_NAME, "i") }).should("exist");

    // edit
    cy.findByRole("link", { name: new RegExp(BEFORE_SERVICE_NAME, "i") }).click();
    cy.findByRole("textbox", { name: /service name/i })
      .clear()
      .type(AFTER_SERVICE_NAME);
    cy.wait(2000);
    cy.get('#mui-component-select-campus').parent().click()
    cy.findByRole("option", { name: CAMPUS_NAME }).click();
    cy.findByRole("button", { name: /save/i }).click();
    cy.findByRole("link", { name: new RegExp(AFTER_SERVICE_NAME, "i") }).should("exist");

    // delete
    cy.findByRole("link", { name: new RegExp(AFTER_SERVICE_NAME, "i") }).click();
    cy.findByRole("button", { name: /delete/i }).click();
    cy.findByRole("link", { name: new RegExp(AFTER_SERVICE_NAME, "i") }).should("not.exist");
  });
}

function serviceTime() {
  it("should add / edit / delete Service Time", () => {
    const CAMPUS_NAME = faker.random.word();
    const SERVICE_NAME = faker.random.word();
    const BEFORE_SERVICE_TIME = faker.random.word();
    const AFTER_SERVICE_TIME = faker.random.word();

    cy.makeApiCall("POST", "/campuses", "AttendanceApi", [{ name: CAMPUS_NAME }]).then((res) => {
      const campus = res[0];
      cy.makeApiCall("POST", "/services", "AttendanceApi", [{ campusId: campus.id, name: SERVICE_NAME }]);
    });cy.findByRole("link", { name: /Cypress Church/i }).click();
    cy.findByRole("link", { name: new RegExp(CAMPUS_NAME, "i") }).should("exist");
    cy.findByRole("link", { name: new RegExp(SERVICE_NAME, "i") }).should("exist");

    // add
    cy.get('[data-cy="add-button"]').click();
    cy.findByRole("menuitem", { name: /Add Service Time/i }).click();
    cy.findByRole("textbox", { name: /service time name/i })
      .clear()
      .type(BEFORE_SERVICE_TIME);
    cy.wait(2000);
    cy.get('#mui-component-select-service').parent().click()
    cy.findByRole("option", { name: SERVICE_NAME }).click();
    cy.findByRole("button", { name: /save/i }).click();
    cy.findByRole("link", { name: new RegExp(BEFORE_SERVICE_TIME, "i") }).should("exist");

    // edit
    cy.findByRole("link", { name: new RegExp(BEFORE_SERVICE_TIME, "i") }).click();
    cy.findByRole("textbox", { name: /service time name/i })
      .clear()
      .type(AFTER_SERVICE_TIME);
    cy.wait(2000);
    cy.get('#mui-component-select-service').parent().click()
    cy.findByRole("option", { name: SERVICE_NAME }).click();
    cy.findByRole("button", { name: /save/i }).click();
    cy.findByRole("link", { name: new RegExp(AFTER_SERVICE_TIME, "i") }).should("exist");

    // delete
    cy.findByRole("link", { name: new RegExp(AFTER_SERVICE_TIME, "i") }).click();
    cy.findByRole("button", { name: /delete/i }).click();
    cy.findByRole("link", { name: new RegExp(AFTER_SERVICE_TIME, "i") }).should("not.exist");
  });
}

// TODO - implement test cases for chart testing (with filters). Also make sure delete all session data on start
