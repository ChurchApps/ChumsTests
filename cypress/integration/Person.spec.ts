/// <reference path="../support/index.d.ts" />

import * as faker from "faker"
import { PersonInterface } from "../../appBase/interfaces"

describe("People", () => {
  before(() => {
    cy.login();
    doCleanUp();
  })

  beforeEach(() => {
    cy.login();
    cy.visit("/people");
  });

  create();
  search();
  cancelAndRemove();
  edit();

  // todo - add a test to verify image change
  // updateImage()

  // changeHouseholdName();
  // noAddressChange()
  // withAddressChange();
  // mergePerson();
  // changeAddressOfAllHousehold();
  // changeAddressOfOnlyCurrentPerson();
});

function doCleanUp() {
  cy.clearPeople();
}

function create() {
  const firstName = faker.name.firstName()
  const lastName = faker.name.lastName()

  it("should throw error cause of empty fields", () => {
    cy.findByRole("button", { name: /add/i }).click()
    cy.findByText(/Please enter a first name./i).should("exist")
    cy.findByText(/Please enter a last name./i).should("exist")
  })

  it("should successfully create a person", () => {
    cy.findByRole("textbox", { name: /firstname/i }).type(firstName)
    cy.findByRole("textbox", { name: /lastname/i }).type(lastName)
    cy.findByRole("button", { name: /add/i }).click()
    cy.findByRole("heading", { name: new RegExp(`${firstName} ${lastName}`, "i") }).should("exist")
  })
}

function search() {
  const first = faker.name.firstName()
  const last = faker.name.lastName()

  it("searching people should work", () => {
    cy.createPeople([{ first, last }])
    cy.findByRole("textbox", { name: /searchbox/i }).type(`${first} ${last}`)
    cy.findByRole("button", { name: /search/i }).click()
    cy.findByRole("link", { name: new RegExp(`${first} ${last}`, "i") }).should("exist")
  })

  it("should show a message when searched person is not found", () => {
    cy.findByRole("textbox", { name: /searchbox/i }).type(`${faker.name.firstName()} ${faker.name.lastName()}`)
    cy.findByRole("button", { name: /search/i }).click()
    cy.findByText(/no results found\. please search for a different name or add a new person/i)
  })
}

function cancelAndRemove() {
  const first = faker.name.firstName()
  const last = faker.name.lastName()

  it("should cancel edit person mode", () => {
    cy.createPeople([{ first, last }]).then((people: PersonInterface[]) => {
      cy.visit(`/people/${people[0].id}`)
    });
    cy.findByRole("button", { name: /editperson/i }).click()
    cy.findByRole("button", { name: /cancel/i }).click()
    cy.findByRole("heading", { name: new RegExp(`${first} ${last}`, "i") }).should("exist")
  })

  it("should remove a person record", () => {
    cy.createPeople([{ first: faker.name.firstName(), last: faker.name.lastName() }]).then((people: PersonInterface[]) => {
      cy.visit(`/people/${people[0].id}`)
    });
    cy.findByRole("button", { name: /editperson/i }).click()
    cy.findByRole("button", { name: /delete/i }).click()
    cy.findByRole("heading", { name: /people/i }).should("exist")
  })
}

function edit() {
  const first = faker.name.firstName()
  const last = faker.name.lastName()

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
    cy.createPeople([{ first, last }]).then((people: PersonInterface[]) => {
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

function changeHouseholdName() {
  it("Change household name", () => {
    const first = "Beth", last = "Hart", newHouseHoldName = "Harmon";

    cy.createPeople([{ first, last}]);
    cy.visit('/people');
    cy.containsClick(`${first} ${last}`);
    cy.containsAll("[data-cy=household-box]", [ `${first} ${last}` ]);
    cy.get("[data-cy=edit-button]").should('exist').click();
    cy.enterText("[data-cy=household-name]", newHouseHoldName);
    cy.get(":nth-child(2) > [data-cy=save-button]").should('exist').click();
    cy.containsAll("[data-cy=household-box] > .header", [newHouseHoldName]);
  });  
}

function createTestData(people, contactInfo) {
  cy.createPeople(people).then((people) => {
    people.map((person, index) => {
      const personId = person.id;
     
      cy.getPerson(personId).then(p => {
        const newPerson = {
          ...p,
          contactInfo: {
            ...p.contactInfo,
            ...contactInfo[index]
          }
        }
        cy.makeApiCall("POST", "/people", "MembershipApi", [newPerson]);
      });      
    })

  });
}

function noAddressChange() {
  const people = [
    { first: "James", last: "Bond" },
    { first: "Hayley", last: "Marshall" }
  ]
  const contactInfo = [
    {
    address1: "123 N",
    address2: "North Main",
    city: "Malibu",
    state: "CA",
    zip: "543216"
    }, 
    {
      address1: "Trinity",
      address2: "UK"
    }
  ]
  it("Add member to household without address change", () => {
    createTestData(people, contactInfo);
    cy.visit('/people');
    const person1 = people[0], person2 = people[1];

    cy.containsClick(`${person2.first} ${person2.last}`);
    cy.containsAll("[data-cy=household-box]", [ `${person2.first} ${person2.last}` ]);
    cy.get("[data-cy=edit-button]").should('exist').click();
    cy.get("[data-cy=add-button]").should('exist').click();
    cy.enterText("[data-cy=person-search-bar]", person1.first);
    cy.get("[data-cy=person-search-button]").should('exist').click();
    cy.get("[data-cy=add-to-list]").should('exist').click();
    cy.get("[data-cy=no-button]").should('exist').click();
    cy.get(":nth-child(2) > [data-cy=save-button]").should('exist').click();
    cy.containsClick(`${person1.first} ${person1.last}`);

    const infoOfPerson2 = Object.values(contactInfo[1]);
    cy.notContainAll("[data-cy=person-details-box]", infoOfPerson2)
  });
}

function withAddressChange() {
  const people = [
    { first: "Damon", last: "Lake" },
    { first: "Elena", last: "Marshall" }
  ]
  const contactInfo = [
    {
    address1: "123 N",
    address2: "North Main",
    city: "Malibu",
    state: "CA",
    zip: "543216"
    }, 
    {
      address1: "Trinity",
      address2: "UK"
    }
  ]
  it("Add member to household with its address changed", () => {
    createTestData(people, contactInfo);
    cy.visit("/people");
    const person1 = people[0], person2 = people[1];

    cy.containsClick(`${person1.first} ${person1.last}`);
    cy.containsAll("[data-cy=household-box]", [ `${person1.first} ${person1.last}` ]);
    cy.get("[data-cy=edit-button]").should('exist').click();
    cy.get("[data-cy=add-button]").should('exist').click();
    cy.enterText("[data-cy=person-search-bar]", person2.first);
    cy.get("[data-cy=person-search-button]").should('exist').click();
    cy.get("[data-cy=add-to-list]").should('exist').click();
    cy.get("[data-cy=yes-button]").should('exist').click();
    cy.containsAll("[data-cy=household-box]", [ `${person2.first} ${person2.last}` ]);
    cy.get(":nth-child(2) > [data-cy=save-button]").should('exist').click();
    cy.containsClick(`${person2.first} ${person2.last}`);

    const infoOfPerson1 = Object.values(contactInfo[0]);
    cy.containsAll("[data-cy=person-details-box]", infoOfPerson1)
  });
}


function mergePerson() {
  const people = [
    { first: "Richard", last: "Henricks" },
    { first: "Gilfoyle", last: "smith" }
  ]
  const contactInfo = [
    {
    address1: "123 N",
    address2: "North Main",
    city: "Malibu",
    state: "CA",
    zip: "543216"
    }, 
    {
      address1: "654 six street",
      address2: "opposite maria beach",
      city: "London",
      state: "Scotland",
      zip: "25874"
    }
  ]  
  it("Merge person records", () => {

    createTestData(people, contactInfo)
    cy.visit("/people");
    const person1 = people[0], person2 = people[1];

    cy.containsClick(`${person1.first} ${person1.last}`);
    cy.containsAll("[data-cy=household-box]", [ `${person1.first} ${person1.last}` ]);
    cy.get("[data-cy=edit-person-button]").should('exist').click();
    cy.get("[data-cy=merge-button]").should('exist').click();
    cy.enterText("[data-cy=search-input]", person2.first);
    cy.get("[data-cy=search-button]").should('exist').click();
    cy.get(".text-success").should('exist').click();
    cy.get("[data-cy=merge-modal]").should('exist').should('be.visible');
    cy.get(".col-sm-10 > :nth-child(2) > .form-check-input").check();
    cy.get("[data-cy=confirm-merge]").should('exist').click();
    cy.containsAll("h1", ["People"]);
    cy.notContainAll("[data-cy=content]", [`${person1.first} ${person1.last}`]);
   });
}

function createTestDataWithMembers(peopleToCreate, contactInfo) {
  cy.createPeople(peopleToCreate).then(() => {
    cy.makeApiCall("GET", "/people/search?term=", "MembershipApi").then(people => {
      let members = [];
      const [person1, person2] = peopleToCreate;
      people.map(p => {
        if (p.name.display === `${person1.first} ${person1.last}` || p.name.display === `${person2.first} ${person2.last}`) {
          members.push(p);
        }
      })
      const updatehouseHoldMembers = members.map((m, index) => {
        return {
            ...m,
            householdId: members[0].householdId,
            contactInfo: {
              ...m.contactInfo,
              ...contactInfo[index]
            }
        }
      })
      cy.makeApiCall("POST", "/people", "MembershipApi", updatehouseHoldMembers);
      cy.makeApiCall("POST", `/people/household/${members[0].householdId}`, "MembershipApi", updatehouseHoldMembers);
    })

  });
}

function changeAddressOfAllHousehold() {
  const people = [
    { first: "Richard", last: "Henricks" },
    { first: "Gavin", last: "Belson" }
  ]
  const contactInfo = [
    {
    address1: "123 N",
    address2: "North Main",
    city: "Malibu",
    state: "CA",
    zip: "543216"
    }, 
    {
      address1: "654 six street",
      address2: "opposite maria beach",
      city: "London",
      state: "Scotland",
      zip: "25874"
    }
  ]

  const newAddress1 = "114 PT";
  const newAddress2 = "Saint louis";

  it("Change Address of all household members on changing address of one member", () => {
    createTestDataWithMembers(people, contactInfo);
    cy.visit('/people');
    const person1 = people[0], person2 = people[1];

    cy.containsClick(`${person1.first} ${person1.last}`);
    cy.containsAll("[data-cy=household-box]", [ `${person1.first} ${person1.last}` ]);
    cy.get("[data-cy=edit-person-button]").should('exist').click();
    cy.enterText("[data-cy=address1]", newAddress1);
    cy.enterText("[data-cy=address2]", newAddress2);
    cy.get(":nth-child(3) > [data-cy=save-button]").should('exist').click();
    cy.get("[data-cy=yes-button]").should('exist').click();
    cy.containsAll("h2", [`${person1.first} ${person1.last}`]);

    // verify change
    cy.containsAll("[data-cy=person-details-box]", [newAddress1, newAddress2]);
    cy.containsClick(`${person2.first} ${person2.last}`);
    cy.containsAll("[data-cy=person-details-box]", [newAddress1, newAddress2]);
  })
}

function changeAddressOfOnlyCurrentPerson() {
  const people = [
    { first: "Hank", last: "Moody" },
    { first: "Troye", last: "sivan" }
  ]
  const contactInfo = [
    {
    address1: "123 N",
    address2: "North Main",
    city: "Malibu",
    state: "CA",
    zip: "543216"
    }, 
    {
      address1: "654 six street",
      address2: "opposite maria beach",
      city: "London",
      state: "Scotland",
      zip: "25874"
    }
  ]

  const newAddress1 = "666 street";
  const newAddress2 = "Besides shot cinema";

  it("Verify change in address causes change in address only for that person", () => {
    createTestDataWithMembers(people, contactInfo);
    cy.visit("/people");
    const person1 = people[0], person2 = people[1];

    cy.containsClick(`${person1.first} ${person1.last}`);
    cy.containsAll("[data-cy=household-box]", [ `${person1.first} ${person1.last}` ]);
    cy.get("[data-cy=edit-person-button]").should('exist').click();
    cy.enterText("[data-cy=address1]", newAddress1);
    cy.enterText("[data-cy=address2]", newAddress2);
    cy.get(":nth-child(3) > [data-cy=save-button]").should('exist').click();
    cy.get("[data-cy=no-button]").should('exist').click();
    cy.containsAll("h2", [`${person1.first} ${person1.last}`]);

    // verify
    cy.containsAll("[data-cy=person-details-box]", [newAddress1, newAddress2]);
    cy.containsClick(`${person2.first} ${person2.last}`);
    cy.notContainAll("[data-cy=person-details-box]", [newAddress1, newAddress2]);
  })
}
