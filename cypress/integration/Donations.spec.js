import * as faker from "faker";
import { getPeople, PersonInterface } from "../support/index"

context('Donations', () => {
    before(() => {
        cy.login();
        cleanUpDonations();
    })

    beforeEach(() => {
        cy.login();
        cy.visit({
            url: 'donations',
            failOnStatusCode: false
        });
    })

    addEditFundsList();
    addEditBatchList();
    makeEditDonation();
    donationFromPerson();
    checkFundInfo();
    verifyChart();
    errorCaseMakeDonation();

});

function cleanUpDonations() {
    clearFunds();

    cy.makeApiCall("GET", "/donationbatches", "GivingApi").then(batches => {
        batches.forEach(batch => cy.makeApiCall("DELETE", `/donationbatches/${batch.id}`, "GivingApi"));
    })

    cy.makeApiCall("GET", "/donations", "GivingApi").then(donations => {
        donations.forEach(d => cy.makeApiCall("DELETE", `/donations/${d.id}`, "GivingApi"));
    })

    cy.clearPeople();
}

function addEditFundsList() {
    it("Add / Edit / Delete item from Funds list", () => {
        const FUND_NAME = faker.random.word();
        const NEW_FUND_NAME = faker.random.word();

        // create
        cy.findByRole("img", { name: /church logo/i }).click();
        cy.get('#fundsBox button').click();
        cy.findByRole("textbox", { name: /Name/i })
            .type(FUND_NAME);
        cy.findByRole("button", { name: /Save/i }).click();
        cy.get("[data-cy=funds-box]").contains(FUND_NAME)

        // edit
        cy.existThenClick("[data-cy=edit-0]")
        cy.enterText('[name="fundName"]', NEW_FUND_NAME);
        cy.findByRole("button", { name: /Save/i }).click();
        cy.containsAll("[data-cy=funds-box]", [NEW_FUND_NAME]);

        // delete
        cy.existThenClick("[data-cy=edit-0]");
        cy.existThenClick("#delete");
        cy.visit({
            url: 'donations',
            failOnStatusCode: false
        });
        cy.findByRole("img", { name: /church logo/i }).click();
        cy.notContainAll("[data-cy=funds-box]", [NEW_FUND_NAME]);
    })
}

function addEditBatchList() {
    it("Add / Edit / Delete entry from Batches", () => {
        const batch = { name: "Morning", date: "2021-03-27" };
        const newBatch = { name: "Evening", date: "2021-03-31" };

        // create
        cy.findByRole("img", { name: /church logo/i }).click();
        cy.existThenClick("#batchesBox button");
        cy.enterText("[name='name']", batch.name);
        cy.enterText("[name='date']", batch.date);
        cy.findByRole("button", { name: /Save/i }).click();
        cy.containsAll("#batchesBox", [batch.name, new Date(batch.date).getDate()]);

        // edit
        cy.existThenClick("[data-cy=edit-0]");
        cy.enterText("[name='name']", newBatch.name);
        cy.enterText("[name='date']", newBatch.date);
        cy.findByRole("button", { name: /Save/i }).click();
        cy.containsAll("#batchesBox", [newBatch.name, new Date(newBatch.date).getDate()]);

        // delete
        cy.existThenClick("[data-cy=edit-0]");
        cy.wait(2000);
        cy.existThenClick("#delete");
        cy.visit({
            url: 'donations',
            failOnStatusCode: false
        });
        cy.findByRole("img", { name: /church logo/i }).click();
        cy.notContainAll("#batchesBox", [newBatch.name, batch.name]);        
    })
}

function makeEditDonation() {
    it("Make / Edit / Delete Donation", () => {
        const funds = [{ name: "General Fund" }];
        const batches = [{ name: "Morning Batch", batchDate: new Date() }];
        const amount = 50;
        const note = "Hey, this is some note";
        const newAmount = 100;

        createFunds(funds);
        createBatches(batches).then(res => {
            cy.findByRole("img", { name: /church logo/i }).click();
            cy.containsClick(res[0].id);
        });
        cy.wait(1000);

        // make donation
        cy.existThenClick("#donationsBox button");
        cy.enterText("[name='amount']", amount)
        cy.enterText("[name='notes']", note);
        cy.findByRole("button", { name: /Save/i }).click();
        cy.containsAll("[data-cy=content]", ["Anonymous", `$${amount}`]);

        // edit
        cy.existThenClick("[data-cy=edit-link-0]");
        cy.wait(1000);
        cy.enterText("[name='amount']", newAmount);
        cy.findByRole("button", { name: /Save/i }).click();
        cy.containsAll("[data-cy=content]", ["Anonymous", `$${newAmount}`]);

        // delete
        cy.existThenClick("[data-cy=edit-link-0]");
        cy.wait(1000);
        cy.existThenClick("#delete");
        cy.notContainAll("[data-cy=content]", ["Anonymous", `$${newAmount}`])
    })
}

function donationFromPerson() {
    it("Donation from a person", () => {
        const funds = [{ name: "Owned Fund" }];
        const batches = [{ name: "Afternoon Batch", batchDate: new Date() }];
        const amount = 200;
        const people = getPeople(1)
        const { name: { first, last } } = people[0]
    
        cy.createPeople(people);
        createFunds(funds);
        createBatches(batches).then(res => {
            cy.visit({
                url: 'donations',
                failOnStatusCode: false
            });
            cy.findByRole("img", { name: /church logo/i }).click();
            cy.containsClick(res[0].id);
        });
        cy.wait(1000);

        cy.existThenClick("#donationsBox button");
        cy.enterText("[name='amount']", amount);
        cy.existThenClick("[data-cy=donating-person]");
        cy.enterText("[name='personAddText']", first);
        cy.existThenClick("#searchButton");
        cy.existThenClick("#householdMemberAddTable button");
        cy.containsAll("[data-cy=donation-box]", [first])
        cy.findByRole("button", { name: /Save/i }).click();
        cy.wait(500)
        cy.containsAll("[data-cy=content]", [first, amount]);
    })
}

function checkFundInfo() {
    it("Check fund info using date filters", () => {
        const funds = [{ name: "Check Fund" }];
        const batches = [{ name: "Evening Batch", batchDate: new Date() }];
        const amount1 = 100, amount2 = 50;
        const date1 = "2021-03-25", date2 = "2021-03-28";
        const people = getPeople(1)
        const { name: { first, last } } = people[0]
        const filter = { start: "2021-03-23", end: "2021-03-30" }
        
        createTestData({ funds, batches, amount1, amount2, people, date1, date2 });
        cy.visit({
            url: 'donations',
            failOnStatusCode: false
        });

        cy.findByRole("img", { name: /church logo/i }).click();
        cy.containsClick(funds[0].name);
        cy.get("[data-cy=start-date]").type(filter.start);
        cy.get("[data-cy=end-date]").type(filter.end);
        cy.get("div button.MuiButton-root").eq(1).click()
        cy.containsAll("div div div.MuiGrid-grid-md-8 div[data-cy='']", ["Anonymous", first, amount1, amount2]);
        cy.containsClick(first);
        
        // check person link
        cy.verifyRoute("/people");
        cy.containsAll("div div div.MuiGrid-grid-md-8 div[data-cy='']", [`${first} ${last}`]);
        cy.go('back');

        // check batch link
        cy.makeApiCall("GET", "/donationbatches", "GivingApi").then(db => {
            cy.get("[data-cy=start-date]").type(filter.start);
            cy.get("[data-cy=end-date]").type(filter.end);
            cy.get("div button.MuiButton-root").eq(1).click()
            const batchId = db.filter(d => d.name === batches[0].name)[0].id;
            cy.existThenClick(`[data-cy=batchId-${batchId}-0]`);
            cy.wait(700)
            cy.get("h1")
                .invoke('text')
                .then((text) => {
                    expect(text).to.contain(batchId)
            })
        })
    })
}

function verifyChart() {
    it("Verify chart filters", () => {
        const funds = [{ name: "Graph Fund" }];
        const batches = [{ name: "Night Batch", batchDate: new Date() }];
        const amount1 = 100, amount2 = 50;
        const date1 = "2021-03-12", date2 = "2021-03-18";
        const people = getPeople(1)
        const { name: { first, last } } = people[0]
        const filter = { start: "2021-03-10", end: "2021-03-15" }
        
        createTestData({ funds, batches, amount1, amount2, people, date1, date2 });
        cy.visit({
            url: 'donations',
            failOnStatusCode: false
        });

        cy.findByRole("img", { name: /church logo/i }).click();
        cy.get("[name='startDate']").type(filter.start);
        cy.get("[name='endDate']").type(filter.end);
        cy.get("div button.MuiButton-root").eq(1).click()
        cy.containsAll("div div div.MuiGrid-grid-md-8 div[data-cy='']", [funds[0].name])
    })
}

function errorCaseMakeDonation() {
    it("Verify Error case while making donation", () => {
        const batches = [{ name: "Error Batch", batchDate: new Date() }];

        clearFunds();
        createBatches(batches).then(res => {
            cy.visit({
                url: 'donations',
                failOnStatusCode: false
            });
            cy.findByRole("img", { name: /church logo/i }).click();
            cy.containsClick(res[0].id);
        });
        cy.wait(1000);
        cy.get("[data-cy=error-message]").should('exist');
        cy.get("#donationsBox button").should('not.exist');
    })
}

function createFunds(funds) {
    return cy.makeApiCall("POST", "/funds", "GivingApi", funds)
}

function createBatches(batches) {
    return cy.makeApiCall("POST", "/donationbatches", "GivingApi", batches);
}

function createTestData({ funds, batches, amount1, amount2, people, date1, date2 }) {
    createFunds(funds).then(f => {
        const fundId = f[0].id;
        createBatches(batches).then(b => {
            const batchId = b[0].id;
            cy.createPeople(people).then(p => {
                const payload = [
                    { amount: amount1, batchId: batchId, donationDate: new Date(date1), method: 'Cash', personId: p[0].id }, 
                    { amount: amount2, batchId: batchId, donationDate: new Date(date2), method: 'Cash' }
                ];
                cy.makeApiCall("POST", "/donations", "GivingApi", payload).then(d => {
                    const fdPayload = d.map(fd => ({ amount: fd.amount, fundId: fundId, donationId: fd.id })) 

                    cy.makeApiCall("POST", "/funddonations", "GivingApi", fdPayload);
                });
            })
        })
    });
    
}

function clearFunds() {
    cy.makeApiCall("GET", "/funds", "GivingApi").then(funds => {
        funds.forEach(fund => cy.makeApiCall("DELETE", `/funds/${fund.id}`, "GivingApi"));
    })
}