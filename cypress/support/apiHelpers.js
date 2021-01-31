const api_domain = Cypress.env("CHUMS_API_URL");

Cypress.Commands.add("login", () => {
  cy.request({
    method: "POST",
    url: `${Cypress.env("ACCESSMANAGEMENT_API_URL")}/users/login`,
    body: {
      appName: Cypress.env("appName"),
      email: Cypress.env("email"),
      password: Cypress.env("password"),
    },
  })
    .its("body.token")
    .should("exist")
    .then(($token) => cy.setCookie("jwt", $token));
});

Cypress.Commands.add("createPeople", (people) => {
  const housePayload = people.map((p) => ({ name: p.last }));

  cy.makeApiCall("POST", "/households", housePayload).then((houseHolds) => {
    let peoplePayload = houseHolds.map((h) => {
      const person = people.filter((p) => p.last === h.name);
      return {
        householdId: h.id,
        name: person[0],
      };
    });

    cy.makeApiCall("POST", "/people", peoplePayload);
  });
});

Cypress.Commands.add("createGroup", (group) => {
  cy.makeApiCall("POST", "/groups", [group]);
});

Cypress.Commands.add("getPerson", (personId) => {
  cy.makeApiCall("GET", `/people/${personId}`);
});

Cypress.Commands.add("getToken", () => {
  return getCookie("jwt");
});

Cypress.Commands.add("makeApiCall", (method, route, payload) => {
  cy.request({
    method,
    url: api_domain + route,
    headers: { Authorization: `Bearer ${getCookie("jwt")}` },
    [payload ? "body" : null]: payload,
  }).its("body");
});

Cypress.Commands.add("makeAsyncApiCall", (method, route, payload) => {
  const requestOptions = {
    method: method,
    headers: {
      Authorization: "Bearer " + getCookie("jwt"),
      "Content-Type": "application/json",
    },
  };
  if (payload !== undefined && payload !== null) requestOptions.body = payload;
  return fetch(api_domain + route, requestOptions).then(async (response) => {
    try {
      return await response.json();
    } catch {
      return response;
    }
  });
});

Cypress.on("uncaught:exception", (err, runnable) => {
  console.warn(err);
  return false;
});

function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}
