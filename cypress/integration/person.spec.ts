import * as faker from "faker"
import { getPeople, PersonInterface } from "../support/index"

describe("People", () => {
  before(() => {
    cy.clearLocalStorageSnapshot();
    cy.login();
    doCleanUp();
  })

  beforeEach(() => {
    cy.restoreLocalStorage();
    cy.login();
  });

  afterEach(() => {
    cy.saveLocalStorage();
  })

  create();
  search();
  cancelAndRemove();
  edit();
  image()
  mergePerson();
  changeAddressCurrentPerson();
  changeAddressFullHousehold();
});

function doCleanUp() {
  cy.clearPeople();
}

function create() {
  const firstName = faker.name.firstName()
  const lastName = faker.name.lastName()

  it("should successfully create a person", () => {
    cy.visit({
      url: `/people`,
      failOnStatusCode: false
    })
    cy.findByRole("link", { name: Cypress.env("church") }).click(); 
    cy.get("[name='first']").type(firstName)
    cy.get("[name='last']").type(lastName)
    cy.get("#peopleBox button").eq(1).click()
    cy.wait(1500)
    cy.get("h1")
      .invoke('text')
      .then((text) => {
        expect(text).to.contain(`${firstName} ${lastName}`)
      })
  })
}

function search() {
  const people = getPeople(1)
  const { name: { first, last } } = people[0]
  it("searching people should work", () => {
    cy.createPeople(people)
    cy.visit("/")
    cy.findByRole("link", { name: Cypress.env("church") }).click(); 
    cy.get("[name='searchText']").type(`${first} ${last}`)
    cy.get("#peopleBox button").click()
    cy.findByRole("link", { name: new RegExp(`${first} ${last}`, "i") }).should("exist")
  })

}

function cancelAndRemove() {
  const people = getPeople(1)
  const { name: { first, last } } = people[0]

  it("should remove a person record", () => {
    const people = getPeople(1)
    cy.createPeople(people).then((people: PersonInterface[]) => {
      cy.visit({
        url: `/people/${people[0].id}`,
        failOnStatusCode: false
      })
    });
    cy.findByRole("link", { name: Cypress.env("church") }).click(); 
    cy.wait(1500)
    cy.get("button[aria-label='editButton']").eq(0).click()
    cy.wait(1500)
    cy.get("#delete").click()
    cy.wait(1500)
    cy.get("h1")
      .invoke('text')
      .then((text) => {
        expect(text).to.contain('People')
      })
  })
}

function edit() {
  const people = getPeople(1, { withoutAddress: true })
  const { name: { first, last } } = people[0]

  const textbox = {
    email: faker.internet.email(),
    "middle name": faker.name.middleName(),
    nickname: faker.name.firstName(),
    "line 1": faker.address.streetPrefix(),
    "line 2": faker.address.streetName(),
    city: faker.address.city(),
    zip: faker.address.zipCode(),
    home: faker.phone.phoneNumber("###-###-####"),
    work: faker.phone.phoneNumber("###-###-####"),
    state: "CA"
  }

  const dropdown = {
    "#membershipStatus": "Member",
    '#gender': "Female",
    "#maritalStatus": "Single",
  }

  const dates = {
    birthdate: "1990-01-01",
    anniversary: "2010-10-01"
  }

  it("should be able to edit person record", () => {
    cy.createPeople(people).then((people: PersonInterface[]) => {
      cy.visit({
        url: `/people/${people[0].id}`,
        failOnStatusCode: false
      })
    })
    cy.findByRole("link", { name: Cypress.env("church") }).click(); 
    cy.wait(1500)
    cy.get("button[aria-label='editButton']").eq(0).click()

    // fill all textbox values
    for (let key in textbox) {
      let value = textbox[key as keyof typeof textbox]
      cy.findByRole("textbox", { name: new RegExp(key, "i") }).type(value)
    }

    // select all dropdown
    for (let key in dropdown) {
      let value = dropdown[key as keyof typeof dropdown]
      cy.get(`${key}`).eq(0).parent().click()
      cy.findByRole("option", { name: value }).click()
    }

    // pick dates
    for (let key in dates) {
      let value = dates[key as keyof typeof dates]
      cy.findByLabelText(new RegExp(key, "i")).type(value)
    }

    cy.findByRole("button", { name: /save/i }).click()
    cy.wait(1500)

    // verify after save
    cy.get('[data-cy="content"]').eq(0).contains(`${first} "${textbox.nickname}" ${last}`)
    cy.get('[data-cy="content"]').eq(0).contains('Female')
    cy.get('[data-cy="content"]').eq(0).contains(textbox.email)
    cy.get('[data-cy="content"]').eq(0).contains(`${textbox.city}, CA ${textbox.zip}`)
    cy.get('[data-cy="content"]').eq(0).contains(textbox.home)
    cy.get('[data-cy="content"]').eq(0).contains(textbox.work)
  });
}

function image() {
  const people = getPeople(1)
  const imagePath = "images/nature.jpg"

  it("should change image of person", () => {
    cy.createPeople(people).then((people: PersonInterface[]) => {
      cy.visit({
        url: `/people/${people[0].id}`,
        failOnStatusCode: false
      })
    })
    // add new image
    cy.findByRole("link", { name: Cypress.env("church") }).click(); 
    cy.wait(1500)
    cy.get("button[aria-label='editButton']").eq(0).click()
    cy.findByRole("link", { name: /avatar/i }).click()
    cy.findByText(/crop/i)
    cy.get("button[aria-label='editButton']").eq(0).click()
    cy.get('input[type="file"]').attachFile(imagePath)
    cy.wait(3000)
    cy.get("#cropperBox button").eq(3).click()
    cy.findByRole("button", { name: /save/i }).click()
    cy.findByRole("img", { name: /personimage/i }).should("have.attr", "src").should("not.include", "sample-profile.png")
    
    // delete
    cy.get("button[aria-label='editButton']").eq(0).click()
    cy.findByRole("link", { name: /avatar/i }).click()
    cy.wait(2000)
    cy.get("[aria-label='deletePhoto']").click()
    cy.findByRole("button", { name: /save/i }).click()
    cy.findByRole("img", { name: /personimage/i }).should("have.attr", "src").should("include", "sample-profile.png")
  })
}

function mergePerson() {
  const people = getPeople(2)
  const person1 = people[0]
  const person2 = people[1]

  it("Merge person records", () => {
    cy.createPeople(people).then((people: PersonInterface[]) => {
      cy.visit({
        url: `/people/${people[0].id}`,
        failOnStatusCode: false
      })
    })
    cy.findByRole("link", { name: Cypress.env("church") }).click(); 
    cy.wait(1500)
    cy.get("button[aria-label='editButton']").eq(0).click()
    cy.findByRole("button", { name: /merge/i }).click()
    cy.get("[name='personAddText']").type(people[1].name.first || "")
    cy.get("#mergeBox button").eq(0).click()
    cy.findByRole("cell", { name: /merge/i }).within(() => {
      cy.findByRole("button", { name: /merge/i }).click()
    })
    cy.findByText(new RegExp(`would you like to merge ${person1.name.first} ${person1.name.last} with ${person2.name.first} ${person2.name.last}?`, "i")).should("exist")
    cy.findByRole("button", { name: /confirm/i }).click()
    cy.wait(3000)
    cy.get("[name='searchText']").type(`${person1.name.first} ${person1.name.last}`)
    cy.findByRole("button", { name: /search/i }).click()
    cy.findByRole("link", { name: new RegExp(`${person1.name.first} ${person1.name.last}`, "i") }).should("exist")
  });
}

function createTestDataWithMembers(people: PersonInterface[]) {
  cy.createPeople(people).then((people: PersonInterface[]) => {
    const peopleIds = people.map(p => p.id).join(",")
    cy.makeApiCall("GET", `/people/ids?ids=${peopleIds}`, "MembershipApi").then((result: PersonInterface[]) => {
      const updatedPeople = result.map(p => ({
        ...p,
        householdId: result[0].householdId
      }))

      cy.makeApiCall("POST", "/people", "MembershipApi", updatedPeople);
      cy.makeApiCall("POST", `/people/household/${people[0].householdId}`, "MembershipApi", updatedPeople);
      cy.visit({
        url: `/people/${people[0].id}`,
        failOnStatusCode: false
      })
    })
  })
}

function changeAddressCurrentPerson() {
  const people = getPeople(2, { withoutAddress: true })
  const address1 = faker.address.streetName()

  it("should only change address of current person", () => {
    createPeopleWithAddress(people, address1)
    cy.findByRole("button", { name: /no/i }).click()
    cy.findByRole("link", { name: new RegExp(`${people[1].name.first} ${people[1].name.last}`) }).click()
    cy.get('[data-cy="content"]').eq(0).should('not.contain', address1)
  })
}

function changeAddressFullHousehold() {
  const people = getPeople(2, { withoutAddress: true })
  const address1 = faker.address.streetName()

  it("should change address of all household members", () => {
    createPeopleWithAddress(people, address1)
    cy.findByRole("button", { name: /yes/i }).click()
    cy.findByRole("link", { name: new RegExp(`${people[1].name.first} ${people[1].name.last}`) }).click()
    cy.get('[data-cy="content"]').eq(0).contains(address1)
  })
}

function createPeopleWithAddress(people: PersonInterface[], address1: string) {
  createTestDataWithMembers(people);
  cy.findByRole("link", { name: Cypress.env("church") }).click(); 
  cy.wait(1500)
  cy.get("button[aria-label='editButton']").eq(0).click()
  cy.findByRole("textbox", { name: /line 1/i }).type(address1)
  cy.findByRole("button", { name: /save/i }).click()
}
