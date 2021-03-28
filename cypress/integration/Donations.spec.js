context('Donations', () => {
    before(() => {
        cy.login();
        cleanUpDonations();
    })

    beforeEach(() => {
        cy.login();
        cy.visit("/donations")
    })

    addEditFundsList();
    addEditBatchList();
    makeEditDonation();
    donationFromPerson();
    checkFundInfo();
    verifyChart();

});

function cleanUpDonations() {
    cy.makeApiCall("GET", "/funds", "GivingApi").then(funds => {
        funds.forEach(fund => cy.makeApiCall("DELETE", `/funds/${fund.id}`, "GivingApi"));
    })

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
        const fundName = "Treasury";
        const newFundName = "Country"

        // create
        cy.existThenClick("[data-cy=add-fund]");
        cy.enterText("[data-cy=fund-name]", fundName);
        cy.existThenClick(":nth-child(2) > [data-cy=save-button]");
        cy.containsAll("[data-cy=funds-box]", [fundName]);

        // edit
        cy.existThenClick("[data-cy=edit-0]")
        cy.enterText("[data-cy=fund-name]", newFundName);
        cy.existThenClick(":nth-child(3) > [data-cy=save-button]");
        cy.containsAll("[data-cy=funds-box]", [newFundName]);

        // delete
        cy.existThenClick("[data-cy=edit-0]");
        cy.existThenClick("[data-cy=delete-button]");
        cy.notContainAll("[data-cy=funds-box]", [newFundName]);
    })
}

function addEditBatchList() {
    it ("Add / Edit / Delete entry from Batches", () => {
        const batch = { name: "Morning", date: "2021-03-27" };
        const newBatch = { name: "Evening", date: "2021-03-31" };

        // create
        cy.existThenClick("[data-cy=add-batch]");
        cy.enterText("[data-cy=batch-name]", batch.name);
        cy.enterText("[data-cy=batch-date]", batch.date);
        cy.existThenClick(":nth-child(2) > [data-cy=save-button]");
        cy.containsAll("[data-cy=batches-box]", [batch.name, new Date(batch.date).getDate()]);

        // edit
        cy.existThenClick("[data-cy=edit-0]");
        cy.enterText("[data-cy=batch-name]", newBatch.name);
        cy.enterText("[data-cy=batch-date]", newBatch.date);
        cy.existThenClick(":nth-child(3) > [data-cy=save-button]");
        cy.containsAll("[data-cy=batches-box]", [newBatch.name, new Date(newBatch.date).getDate()]);

        // delete
        cy.existThenClick("[data-cy=edit-0]");
        cy.wait(2000);
        cy.existThenClick("[data-cy=delete-button]");
        cy.notContainAll("[data-cy=batches-box]", [newBatch.name, batch.name]);        
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
            cy.containsClick(res[0].id);
        });
        cy.wait(1000);

        // make donation
        cy.existThenClick("[data-cy=make-donation]");
        cy.enterText("[data-cy=amount]", amount)
        cy.enterText("[data-cy=note]", note);
        cy.existThenClick("[data-cy=save-button]");
        cy.containsAll("[data-cy=content]", ["Anonymous", `$${amount}`]);

        // edit
        cy.existThenClick("[data-cy=edit-link-0]");
        cy.wait(1000);
        cy.enterText("[data-cy=amount]", newAmount);
        cy.existThenClick("[data-cy=save-button]");
        cy.containsAll("[data-cy=content]", ["Anonymous", `$${newAmount}`]);

        // delete
        cy.existThenClick("[data-cy=edit-link-0]");
        cy.wait(1000);
        cy.existThenClick("[data-cy=delete-button]");
        cy.notContainAll("[data-cy=content]", ["Anonymous", `$${newAmount}`])
    })
}

function donationFromPerson() {
    it("Donation from a person", () => {
        const funds = [{ name: "Owned Fund" }];
        const batches = [{ name: "Afternoon Batch", batchDate: new Date() }];
        const amount = 200;
        const people = [{ first: "Peter", last: "stokes" }]
    
        cy.createPeople(people);
        createFunds(funds);
        createBatches(batches).then(res => {
            cy.visit("/donations")
            cy.containsClick(res[0].id);
        });
        cy.wait(1000);

        cy.existThenClick("[data-cy=make-donation]");
        cy.enterText("[data-cy=amount]", amount);
        cy.existThenClick("[data-cy=donating-person]");
        cy.enterText("[data-cy=person-search-bar]", people[0].first);
        cy.existThenClick("[data-cy=person-search-button]");
        cy.existThenClick("[data-cy=add-to-list]");
        cy.containsAll("[data-cy=donation-box]", [people[0].first])
        cy.existThenClick("[data-cy=save-button]");
        cy.containsAll("[data-cy=content]", [people[0].first, amount]);
    })
}

function checkFundInfo() {
    it("Check fund info using date filters", () => {
        const funds = [{ name: "Check Fund" }];
        const batches = [{ name: "Evening Batch", batchDate: new Date() }];
        const amount1 = 100, amount2 = 50;
        const date1 = "2021-03-25", date2 = "2021-03-28";
        const people = [{ first: "John", last: "Doe" }];
        
        createTestData({ funds, batches, amount1, amount2, people, date1, date2 });
        cy.visit("/donations");

        cy.containsClick(funds[0].name);
        cy.containsAll("[data-cy=content]", ["Anonymous", people[0].first, amount1, amount2]);
        cy.containsClick(people[0].first);
        
        // check person link
        cy.verifyRoute("/people");
        cy.containsAll("[data-cy=person-details-box]", [`${people[0].first} ${people[0].last}`]);
        cy.go('back');

        // check batch link
        cy.makeApiCall("GET", "/donationbatches", "GivingApi").then(db => {
            
            const batchId = db.filter(d => d.name === batches[0].name)[0].id;
            cy.existThenClick(`[data-cy=batchId-${batchId}-0]`);
            cy.containsAll("[data-cy=batch-heading]", [batchId]);
        })
    })
}

function verifyChart() {
    it("Verify chart filters", () => {
        const funds = [{ name: "Graph Fund" }];
        const batches = [{ name: "Night Batch", batchDate: new Date() }];
        const amount1 = 100, amount2 = 50;
        const date1 = "2021-03-12", date2 = "2021-03-18";
        const people = [{ first: "John", last: "Doe" }];
        const filter = { start: "2021-03-10", end: "2021-03-15" }
        
        createTestData({ funds, batches, amount1, amount2, people, date1, date2 });
        cy.visit("/donations");

        cy.enterText(":nth-child(1) > [data-cy=select-date]", filter.start);
        cy.enterText(":nth-child(2) > [data-cy=select-date]", filter.end);
        cy.existThenClick("[data-cy=save-button]");
        cy.containsAll("[data-cy=chartBox-donationSummary]", [funds[0].name])
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
