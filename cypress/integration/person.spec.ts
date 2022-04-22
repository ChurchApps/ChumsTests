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
    cy.visit("/")
    cy.findByRole("textbox", { name: /firstname/i }).type(firstName)
    cy.findByRole("textbox", { name: /lastname/i }).type(lastName)
    cy.findByRole("button", { name: /add/i }).click()
    cy.findByRole("heading", { name: new RegExp(`${firstName} ${lastName}`, "i") }).should("exist")
  })
}

function search() {
  const people = getPeople(1)
  const { name: { first, last } } = people[0]
  it("searching people should work", () => {
    cy.createPeople(people)
    cy.visit("/")
    cy.findByRole("textbox", { name: /searchbox/i }).type(`${first} ${last}`)
    cy.findByRole("button", { name: /search/i }).click()
    cy.findByRole("link", { name: new RegExp(`${first} ${last}`, "i") }).should("exist")
  })

}

function cancelAndRemove() {
  const people = getPeople(1)
  const { name: { first, last } } = people[0]

  it("should remove a person record", () => {
    const people = getPeople(1)
    cy.createPeople(people).then((people: PersonInterface[]) => {
      cy.visit(`/people/${people[0].id}`)
    });
    cy.findByRole("button", { name: /editperson/i }).click()
    cy.findByRole("button", { name: /delete/i }).click()
    cy.findByRole("heading", { name: /people/i }).should("exist")
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
    mobile: faker.phone.phoneNumber("###-###-####")
  }

  const dropdown = {
    "membership status": "Member",
    gender: "Female",
    "marital status": "Single",
    state: "CA"
  }

  const dates = {
    birthdate: "1990-01-01",
    anniversary: "2010-10-01"
  }

  it("should be able to edit person record", () => {
    cy.createPeople(people).then((people: PersonInterface[]) => {
      cy.visit(`/people/${people[0].id}`);
    })
    cy.findByRole("button", { name: /editperson/i }).click()

    // fill all textbox values
    for (let key in textbox) {
      let value = textbox[key as keyof typeof textbox]
      cy.findByRole("textbox", { name: new RegExp(key, "i") }).type(value)
    }

    // select all dropdown
    for (let key in dropdown) {
      let value = dropdown[key as keyof typeof dropdown]
      cy.findByRole("combobox", { name: new RegExp(key, "i") }).select(value)
    }

    // pick dates
    for (let key in dates) {
      let value = dates[key as keyof typeof dates]
      cy.findByLabelText(new RegExp(key, "i")).type(value)
    }

    cy.findByRole("button", { name: /save/i }).click()

    // verify after save
    cy.findByText(new RegExp(`${first} "${textbox.nickname}" ${last}`))
    cy.findByText(/female/i)
    cy.findByText(new RegExp(textbox.email), "i")
    cy.findByText(new RegExp(`${textbox.city}, CA ${textbox.zip}`))
    cy.findByRole('cell', { name: textbox.home })
    cy.findByRole('cell', { name: textbox.work })
    cy.findByRole('cell', { name: textbox.mobile })
  });
}

function image() {
  const people = getPeople(1)
  const imagePath = "images/nature.jpg"

  it("should change image of person", () => {
    cy.createPeople(people).then((people: PersonInterface[]) => {
      cy.visit(`/people/${people[0].id}`);
    })
    // add new image
    cy.findByRole("button", { name: /editperson/i }).click()
    cy.findByRole("link", { name: /avatar/i }).click()
    cy.findByText(/crop/i)
    cy.findByRole("button", { name: /upload/i }).click()
    cy.get('input[type="file"]').attachFile(imagePath)
    cy.wait(3000)
    cy.findByRole("button", { name: /update/i }).click()
    cy.findByRole("button", { name: /save/i }).click()
    cy.findByRole("img", { name: /personimage/i }).should("have.attr", "src").should("not.include", "sample-profile.png")
    
    // delete
    cy.findByRole("button", { name: /editperson/i }).click()
    cy.findByRole("link", { name: /avatar/i }).click()
    cy.findByRole("button", { name: /deletephoto/i }).click()
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
      cy.visit(`/people/${people[0].id}`);
    })
    cy.findByRole("button", { name: /editperson/i }).click()
    cy.findByRole("button", { name: /merge/i }).click()
    cy.findByRole("textbox", { name: /searchperson/i }).type(people[1].name.first || "")
    cy.findByRole("button", { name: /search/i }).click()
    cy.findByRole("cell", { name: /merge/i }).within(() => {
      cy.findByRole("button", { name: /merge/i }).click()
    })
    cy.findByText(new RegExp(`would you like to merge ${person1.name.first} ${person1.name.last} with ${person2.name.first} ${person2.name.last}?`, "i")).should("exist")
    cy.findByRole("button", { name: /confirm/i }).click()
    cy.findByText(/Please select atleast 1 value for each field/i)
    cy.get(".col-sm-10 > :nth-child(2) > .form-check-input").check();
    cy.findByRole("button", { name: /confirm/i }).click()
    cy.findByRole("textbox", { name: /searchbox/i }).type(`${person1.name.first} ${person1.name.last}`)
    cy.findByRole("button", { name: /search/i }).click()
    cy.findByRole("link", { name: new RegExp(`${person1.name.first} ${person1.name.last}`, "i") }).should("not.exist")
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
      cy.visit(`/people/${people[0].id}`);
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
    cy.findByText(new RegExp(address1, "i")).should("not.exist")
  })
}

function changeAddressFullHousehold() {
  const people = getPeople(2, { withoutAddress: true })
  const address1 = faker.address.streetName()

  it("should change address of all household members", () => {
    createPeopleWithAddress(people, address1)
    cy.findByRole("button", { name: /yes/i }).click()
    cy.findByRole("link", { name: new RegExp(`${people[1].name.first} ${people[1].name.last}`) }).click()
    cy.findByText(new RegExp(address1, "i")).should("exist")
  })
}

function createPeopleWithAddress(people: PersonInterface[], address1: string) {
  createTestDataWithMembers(people);
  cy.findByRole("button", { name: /editperson/i }).click()
  cy.findByRole("textbox", { name: /line 1/i }).type(address1)
  cy.findByRole("button", { name: /save/i }).click()
  cy.findByText(/update address/i).should("exist")
}
