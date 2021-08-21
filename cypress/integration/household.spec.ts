import * as faker from "faker"
import { PersonInterface, getPeople } from "../support/index"

describe("Household", () => {
    before(() => {
        cy.login();
        cy.clearPeople();
    })

    beforeEach(() => {
        cy.login()
    })

    throwError()
    addRemove()
    changeRole()
    addWithNoChange()
    addWithAddressChange()
})

function throwError() {
    const people = getPeople(1)

    it("Should throw error when saving an empty household name", () => {
        cy.createPeople(people).then((people: PersonInterface[]) => {
            cy.visit(`/people/${people[0].id}`);
        })
        cy.findByText(new RegExp(`${people[0].name.last} household`, "i"))
        cy.findByRole("link", { name: new RegExp(`${people[0].name.first} ${people[0].name.last}`, "i") })
        cy.findByRole("button", { name: /edithousehold/i }).click()
        cy.findByRole("textbox", { name: /household name/i }).clear()
        cy.findByRole("button", { name: /save/i }).click()
        cy.findByText(/household name is required/i)
    })
}

function addRemove() {
    it("should be able to add and remove a member from household", () => {
        const people = getPeople(2, { withoutAddress: true });
        cy.createPeople(people).then((people: PersonInterface[]) => {
            cy.visit(`/people/${people[0].id}`);
        })
        cy.findByText(new RegExp(`${people[0].name.last} household`, "i"))
        cy.findByRole("link", { name: new RegExp(`${people[0].name.first} ${people[0].name.last}`, "i") })
        cy.findByRole("button", { name: /edithousehold/i }).click()
        cy.findByRole("button", { name: /remove/i }).click()
        cy.findByRole("button", { name: /save/i }).click()
        cy.findByRole("link", { name: new RegExp(people[0].name.first || "", "i") }).should("not.exist")
        cy.findByText(new RegExp(`${people[0].name.last} household`, "i"))
        cy.findByRole("button", { name: /edithousehold/i }).click()
        cy.findByRole("button", { name: /addmember/i }).click()
        cy.findByRole("textbox", { name: /searchbox/i }).type(people[1].name.first || "")
        cy.findByRole("button", { name: /search/i }).click()
        cy.findByRole("button", { name: /addperson/i }).click()
        cy.findByRole("button", { name: /save/i }).click()
        cy.findByRole("link", { name: new RegExp(people[1].name.first || "", "i") }).should("exist")
    })
}

function changeRole() {
    it("should be able to change role", () => {
        const people = getPeople(1)
        cy.createPeople(people).then((people: PersonInterface[]) => {
            cy.visit(`/people/${people[0].id}`);
        })
        cy.findByText(new RegExp(`${people[0].name.last} household`, "i")).should("exist")
        cy.findByRole("link", { name: new RegExp(`${people[0].name.first} ${people[0].name.last}`, "i") })
        cy.findByRole("button", { name: /edithousehold/i }).click()
        cy.findByRole("combobox", { name: /role/i }).select("Child")
        cy.findByRole("button", { name: /save/i }).click()
        cy.findByText(/child/i)
    })
}

function addWithNoChange() {
    const people = getPeople(2)

    it("should add member to household without any change", () => {
        cy.createPeople(people).then((people: PersonInterface[]) => {
            cy.visit(`/people/${people[0].id}`);
        })
        cy.findByText(new RegExp(`${people[0].name.last} household`, "i")).should("exist")
        cy.findByRole("link", { name: new RegExp(`${people[0].name.first} ${people[0].name.last}`, "i") })
        cy.findByRole("button", { name: /edithousehold/i }).click()
        cy.findByRole("button", { name: /addmember/i }).click()
        cy.findByRole("textbox", { name: /searchbox/i }).type(people[1].name.first || "")
        cy.findByRole("button", { name: /search/i }).click()
        cy.findByRole("button", { name: /addperson/i }).click()
        cy.findByRole("button", { name: /no/i }).click()
        cy.findByRole("button", { name: /save/i }).click()
        cy.findByRole("link", { name: new RegExp(`${people[1].name.first} ${people[1].name.last}`) }).click()
        cy.findByText(new RegExp(`${people[0].contactInfo.city}, ${people[0].contactInfo.state} ${people[0].contactInfo.zip}`)).should("not.exist")
    })
}

function addWithAddressChange() {
    const people = getPeople(2)

    it("should add member with address change", () => {
        cy.createPeople(people).then((people: PersonInterface[]) => {
            cy.visit(`/people/${people[0].id}`);
        })
        cy.findByText(new RegExp(`${people[0].name.last} household`, "i")).should("exist")
        cy.findByRole("link", { name: new RegExp(`${people[0].name.first} ${people[0].name.last}`, "i") })
        cy.findByRole("button", { name: /edithousehold/i }).click()
        cy.findByRole("button", { name: /addmember/i }).click()
        cy.findByRole("textbox", { name: /searchbox/i }).type(people[1].name.first || "")
        cy.findByRole("button", { name: /search/i }).click()
        cy.findByRole("button", { name: /addperson/i }).click()
        cy.findByRole("button", { name: /yes/i }).click()
        cy.wait(2000)
        cy.findByRole("button", { name: /save/i }).click()
        cy.findByRole("link", { name: new RegExp(`${people[1].name.first} ${people[1].name.last}`) }).click()
        cy.findByText(new RegExp(`${people[0].contactInfo.city}, ${people[0].contactInfo.state} ${people[0].contactInfo.zip}`)).should("exist")
    })
}
