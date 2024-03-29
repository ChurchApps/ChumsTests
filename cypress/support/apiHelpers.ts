import * as faker from "faker";
import { ChurchInterface, HouseholdInterface, PersonInterface, FormInterface, GroupInterface } from "./index";

Cypress.Commands.add("login", () => {
  cy.request({
    method: "POST",
    url: `${Cypress.env("ACCESS_API")}/users/login`,
    body: {
      appName: Cypress.env("appName"),
      email: Cypress.env("email"),
      password: Cypress.env("password"),
    },
  })
    .its("body.churches")
    .should("exist")
    .then((churches: ChurchInterface[]) => {
      const apis = churches[0].apis;
      apis?.map((api) => {
        cy.setLocalStorage(api.keyName || "", api.jwt);
        if (api.keyName === "AccessApi") {
          cy.setCookie("jwt", api.jwt);
        }
      });
    });
});

Cypress.Commands.add("createPeople", (people: PersonInterface[]) => {
  const housePayload = people.map((p) => ({ name: p.name.last }));

  cy.makeApiCall("POST", "/households", "MembershipApi", housePayload).then((houseHolds: HouseholdInterface[]) => {
    let peoplePayload = houseHolds.map((h) => {
      const person = people.filter((p) => p.name.last === h.name);
      return {
        householdId: h.id,
        ...person[0],
      };
    });
    console.log(peoplePayload);
    cy.makeApiCall("POST", "/people", "MembershipApi", peoplePayload);
  });
});

Cypress.Commands.add("createGroup", (group: GroupInterface) => {
  cy.makeApiCall("POST", "/groups", "MembershipApi", [group]);
});

Cypress.Commands.add("createForms", (forms) => {
  cy.makeApiCall("POST", "/forms", "MembershipApi", forms);
});

Cypress.Commands.add("getPerson", (personId: string) => {
  cy.makeApiCall("GET", `/people/${personId}`, "MembershipApi");
});

Cypress.Commands.add("makeApiCall", (method, route, apiName, payload) => {
  useApi(apiName).then(({ domain, token }) => {
    cy.request({
      method,
      url: domain + route,
      headers: { Authorization: `Bearer ${token}` },
      [payload ? "body" : null]: payload,
    }).its("body");
  });
});

Cypress.Commands.add("makeAsyncApiCall", (method, route, apiName, payload) => {
  return useApi(apiName).then(({ domain, token }) => {
    const requestOptions = {
      method: method,
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
    };
    if (payload !== undefined && payload !== null) requestOptions.body = payload;
    return fetch(domain + route, requestOptions).then(async (response) => {
      try {
        return await response.json();
      } catch {
        return response;
      }
    });
  });
});

Cypress.Commands.add("getQuestionsForForm", (formName) => {
  cy.makeApiCall("GET", `/forms`, "MembershipApi").then((forms) => {
    const formId = forms.filter((f) => f.name === formName)[0]?.id;

    cy.makeApiCall("GET", `/questions?formId=${formId}`, "MembershipApi");
  });
});

Cypress.on("uncaught:exception", (err, runnable) => {
  console.warn(err);
  return false;
});

export function useApi(apiName) {
  const domains = {
    AccessApi: Cypress.env("ACCESS_API"),
    AttendanceApi: Cypress.env("ATTENDANCE_API"),
    GivingApi: Cypress.env("GIVING_API"),
    MembershipApi: Cypress.env("MEMBERSHIP_API"),
  };

  return cy.getLocalStorage(apiName).then((token) => ({ domain: domains[apiName], token: token }));
}

type Options = {
  withoutAddress?: boolean;
};

export function getPeople(amount: number, options?: Options): PersonInterface[] {
  let people: PersonInterface[] = [];
  while (amount > 0) {
    people.push({
      name: {
        first: faker.name.firstName(),
        last: faker.name.lastName(),
      },
      contactInfo: options?.withoutAddress
        ? {}
        : {
            address1: faker.address.streetPrefix(),
            address2: faker.address.streetName(),
            city: faker.address.city(),
            state: "CA",
            zip: faker.address.zipCode(),
          },
    });
    amount--;
  }
  return people;
}

export function getForms(amount: number): FormInterface[] {
  let forms: FormInterface[] = [];
  while (amount > 0) {
    forms.push({
      contentType: "person",
      name: faker.company.companyName(),
    });
    amount--;
  }
  return forms;
}
