import * as faker from "faker"
import { GroupInterface, getPeople, PersonInterface, ServiceInterface } from "../support/index"

context("Groups", () => {
  before(() => {
    cy.login();
    cleanupGroups();
  });

  beforeEach(() => {
    cy.login();
    cy.visit("/groups");
  });

  createGroup();
  deleteGroup();
  trackAttendanceAndTabs();
  addRemovePersonGroup();
  addPersonToSession();
});

function cleanupGroups() {
  cy.clearPeople();
  cy.clearCampuses();
  cy.clearServices();
  cy.clearServiceTimes();

  // remove groups
  cy.makeApiCall("GET", "/groups", "MembershipApi").then(groups => {
    groups.map((group: GroupInterface) => { cy.makeAsyncApiCall("DELETE", `/groups/${group.id}`, "MembershipApi") });
  });
}

function createGroup() {
  
  it("should throw error for empty fields", () => {
    cy.findByRole("button", { name: /addgroup/i }).click()
    cy.findByRole("button", { name: /add group/i }).click()
    cy.findByText(/category name is required/i)
    cy.findByText(/group name is required/i)
  })

  it("should create group", () => {
    const categoryName = faker.commerce.department();
    const groupName = faker.commerce.product();

    cy.findByRole("button", { name: /addgroup/i }).click()
    cy.findByRole("textbox", { name: /category name/i }).type(categoryName)
    cy.findByRole("textbox", { name: /group name/i }).type(groupName)
    cy.findByRole("button", { name: /add group/i }).click()
    cy.findByRole("link", { name: new RegExp(groupName, "i") }).should("exist")
  });
}

function deleteGroup() {
  it("should delete a group", () => {
    const group = getGroups(1)[0]

    cy.createGroup(group);
    cy.findByRole("link", { name: new RegExp(group.name || "", "i") }).click()
    cy.findByRole("heading", { name: new RegExp(group.name || "", "i") }).should("exist")
    cy.findByRole("button", { name: /editbutton/i }).click()
    cy.findByRole("button", { name: /delete/i }).click()
    cy.findByRole("link", { name: new RegExp(group.name || "", "i") }).should("not.exist")
  });
}

function trackAttendanceAndTabs() {
  it("should enable track attendance", () => {
    const group = getGroups(1)[0]

    cy.createGroup(group);
    cy.findByRole("link", { name: new RegExp(group.name || "", "i") }).click()
    cy.findByRole("heading", { name: new RegExp(group.name || "", "i") }).should("exist")
    cy.findByRole("button", { name: /editbutton/i }).click()
    cy.findByRole("combobox", { name: /track attendance/i }).select("Yes").should("have.value", "true")
    cy.findByRole("button", { name: /save/i }).click()
    cy.findByText("Yes")
    cy.findByRole("link", { name: /sessions/i }).should("exist")
  });
}

function addRemovePersonGroup() {
  it("should add / remove person to/from group", () => {
    const person = getPeople(1)[0];
    const group = getGroups(1)[0]

    cy.createGroup(group);
    cy.createPeople([person]);
    cy.findByRole("link", { name: new RegExp(group.name || "", "i") }).click()
    cy.findByRole("heading", { name: new RegExp(group.name || "", "i") }).should("exist")
    cy.findByRole("textbox", { name: /searchbox/i }).type(person.name.first || "")
    cy.findByRole("button", { name: /search/i }).click()
    cy.findByRole("button", { name: /addperson/i }).click()
    cy.findByRole("link", { name: new RegExp(`${person.name.first} ${person.name.last}`, "i") }).should("exist")
    cy.findByRole("link", { name: /remove/i }).click()
    cy.findByRole("link", { name: new RegExp(`${person.name.first} ${person.name.last}`, "i") }).should("not.exist")
  });
}

function addPersonToSession() {
  it("should add person to session", () => {
    const people = getPeople(1)
    const group = getGroups(1)[0]
    const service = {
      campusName: faker.name.jobTitle(),
      name: faker.name.firstName(),
      time: "7:00"
    }

    createTestData(people, group, service);
    cy.visit("/groups");

    // enable attendance tracking
    cy.findByRole("link", { name: new RegExp(group.name || "", "i") }).click()
    cy.findByRole("heading", { name: new RegExp(group.name || "", "i") }).should("exist")
    cy.findByRole("button", { name: /editbutton/i }).click()
    cy.findByRole("combobox", { name: /track attendance/i }).select("Yes").should("have.value", "true")

    // add service to the group
    const fullServiceName = `${service.campusName} - ${service.name} - ${service.time}`;
    cy.findByRole("combobox", { name: /servicetime/i }).select(fullServiceName)
    cy.findByRole("button", { name: /add/i }).click()
    cy.findByRole("button", { name: /save/i }).click()
    cy.findByText(fullServiceName)

    // create a new session
    cy.findByRole("link", { name: /sessions/i }).click()
    cy.findByRole("alert").should("exist")
    cy.findByText(/available group members/i)
    cy.findByRole("button", { name: /new/i }).click()
    cy.findByRole("combobox", { name: /service time/i }).select(fullServiceName)
    cy.findByRole("button", { name: /save/i }).click()

    // add user to session
    cy.wait(2000)
    cy.findByRole("link", { name: /add/i }).click()
    cy.findByRole("link", { name: new RegExp(`${people[0].name.first} ${people[0].name.last}`) }).should("exist")
  });
}

function createTestData(people: PersonInterface[], group: GroupInterface, service: any) {
  cy.createGroup(group).then((groups) => {
    const groupId = groups[0].id;

    cy.createPeople(people).then((people) => {
      const personId = people[0].id;

      cy.getPerson(personId).then((person) => {
        cy.makeApiCall("POST", "/groupmembers", "MembershipApi", [{ groupId, personId, person }])
      });
    });
  });

  cy.makeApiCall("POST", "/campuses", "AttendanceApi", [{ name: service.campusName }]).then((res) => {
    const campusId = res[0].id;

    cy.makeApiCall("POST", "/services", "AttendanceApi", [{ campusId, name: service.name }]).then((services) => {
      const serviceId = services[0].id;

      cy.makeApiCall("POST", "/servicetimes", "AttendanceApi", [{ serviceId, name: service.time }])
    });
  });
}

function getGroups(amount: number): GroupInterface[] {
  let groups: GroupInterface[] = []
  while (amount > 0) {
    groups.push({
      categoryName: faker.random.words(),
      name: faker.company.companyName()
    })
    amount--
  }

  return groups
}