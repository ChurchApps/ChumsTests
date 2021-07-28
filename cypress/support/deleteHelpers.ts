/// <reference path="./index.d.ts" />

import { PersonInterface, CampusInterface, ServiceInterface, ServiceTimeInterface, FormInterface, QuestionInterface } from "../../appBase/interfaces"

Cypress.Commands.add("clearPeople", () => {
  cy.makeApiCall("GET", "/people/search?term=", "MembershipApi").then((people: PersonInterface[]) => {
    people.map(p => {
      if (p.name.display !== "Pranav Cypress") cy.makeAsyncApiCall("DELETE", `/people/${p.id}`, "MembershipApi");
    })
  });
})

Cypress.Commands.add("clearCampuses", () => {
  cy.makeApiCall("GET", "/campuses", "AttendanceApi").then((campuses: CampusInterface[]) => {
    campuses.map((campus) => { cy.makeAsyncApiCall("DELETE", `/campuses/${campus.id}`, "AttendanceApi") });
  });
})

Cypress.Commands.add("clearServices", () => {
  cy.makeApiCall("GET", "/services", "AttendanceApi").then((services: ServiceInterface[]) => {
    services.map((service) => { cy.makeAsyncApiCall("DELETE", `/services/${service.id}`, "AttendanceApi") });
  });
})

Cypress.Commands.add("clearServiceTimes", () => {
  cy.makeApiCall("GET", "/servicetimes", "AttendanceApi").then((serviceTimes: ServiceTimeInterface[]) => {
    serviceTimes.map((st) => { cy.makeAsyncApiCall("DELETE", `/servicetimes/${st.id}`, "AttendanceApi") });
  });
})

Cypress.Commands.add("clearForms", () => {
  cy.makeApiCall("GET", "/forms", "MembershipApi").then((forms: FormInterface[]) => {
    forms.map((f) => { cy.makeAsyncApiCall("DELETE", `/forms/${f.id}`, "MembershipApi") });
  })
})

Cypress.Commands.add("clearQuestions", () => {
  cy.makeApiCall("GET", "/questions", "MembershipApi").then((questions: QuestionInterface[]) => {
    questions.map(q => { cy.makeAsyncApiCall("DELETE", `/questions/${q.id}`, "MembershipApi") }); 
  })
})