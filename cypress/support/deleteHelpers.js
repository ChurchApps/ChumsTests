Cypress.Commands.add("clearPeople", () => {
  cy.makeApiCall("GET", "/people/search?term=").then((people) => {
    people.map(p => {
      if (p.name.display !== "Pranav Cypress") cy.makeAsyncApiCall("DELETE", `/people/${p.id}`);
    })
  });
})

Cypress.Commands.add("clearCampuses", () => {
  cy.makeApiCall("GET", "/campuses").then(campuses => {
    campuses.map((campus) => { cy.makeAsyncApiCall("DELETE", `/campuses/${campus.id}`) });
  });
})

Cypress.Commands.add("clearServices", () => {
  cy.makeApiCall("GET", "/services").then(services => {
    services.map((service) => { cy.makeAsyncApiCall("DELETE", `/services/${service.id}`) });
  });
})

Cypress.Commands.add("clearServiceTimes", () => {
  cy.makeApiCall("GET", "/servicetimes").then(serviceTimes => {
    serviceTimes.map((st) => { cy.makeAsyncApiCall("DELETE", `/servicetimes/${st.id}`) });
  });
})