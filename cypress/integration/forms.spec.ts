import * as faker from "faker"
import { getForms, FormInterface } from "../support/index"

describe('Forms', () => {
    before(() => {
        cy.login();
        cleanupForms();
    })

    beforeEach(() => {
        cy.login();
    })

    // verifyPage()
    // deleteForm();
    // editForm();
    // createForm();
    // verifyQuestionsPage()
    addQuestions();
    // editQuestion();
    // deleteQuestion();
    // reorderQuestions();
});

function cleanupForms() {
    cy.clearQuestions();
    cy.clearForms();
}

function verifyPage() {
    it("should have forms heading", () => {
        cy.visit("/forms")
        cy.findByRole("heading", { name: /forms/i }).should("exist")
    })

    it("should have a message when there are no forms", () => {
        cy.visit("/forms")
        cy.findByText(/no custom forms have been created yet\. they will appearing here when added\./i)
    })
}

function createForm() {
    const name = faker.lorem.word()

    it('should throw validation error for creating form without name', () => {
        cy.visit("/forms")
        cy.findByRole("button", { name: /addform/i }).click()
        cy.findByRole("button", { name: /save/i }).click()
        cy.findByText(/form name is required/i).should("exist")
    })

    it("should create a form", () => {
        cy.visit("/forms")
        cy.findByRole("button", { name: /addform/i }).click()
        cy.findByRole("textbox", { name: /form name/i }).type(name)
        cy.findByRole("button", { name: /save/i }).click()
        cy.findByRole("link", { name: new RegExp(name, "i") }).should("exist")
    })
}

function editForm() {
    const forms = getForms(1);
    const newName = faker.lorem.word()

    it("should edit form", () => {
        cy.createForms(forms)
        cy.visit("/forms");
        cy.findByRole("button", { name: /editform/i }).click()
        cy.findByRole("textbox", { name: /form name/i }).clear().type(newName)
        cy.findByRole("button", { name: /save/i }).click()
        cy.findByRole("link", { name: new RegExp(newName, "i") }).should("exist")
    })
}

function deleteForm() {
    const forms = getForms(1);
    const newName = faker.lorem.word()

    it("should delete form", () => {
        cy.createForms(forms)
        cy.visit("/forms");
        cy.findByRole("button", { name: /editform/i }).click()
        cy.findByRole("button", { name: /delete/i }).click()
        cy.findByRole("link", { name: new RegExp(newName, "i") }).should("not.exist")
    })
}

function verifyQuestionsPage() {
    it("should verify question page heading", () => {
        const forms = getForms(1)
        cy.createForms(forms).then((forms: FormInterface[]) => {
            cy.visit(`/forms/${forms[0].id}`)
        })
        cy.findByRole("heading", { name: new RegExp(forms[0].name || "", "i") }).should("exist")
    })

    it("should have a message when there are on question", () => {
        const forms = getForms(1)
        cy.createForms(forms).then((forms: FormInterface[]) => {
            cy.visit(`/forms/${forms[0].id}`)
        })
        cy.findByText(/no custom questions have been created yet\. questions will be listed here\./i)
    })
}

function addQuestions() {
    const forms = getForms(1)

    it("should add a question", () => {
        cy.createForms(forms).then((forms: FormInterface[]) => {
            cy.visit(`/forms/${forms[0].id}`)
        })
        cy.findByRole("button", { name: /addquestion/i }).click()
    })
}

function editQuestion() {
    it("Edit question", () => {
        const form = {contentType: "person", name: "Usual"};
        const questions = [{ fieldType: "Textbox", title: "FirstName", description: "Enter your name", placeholder: "Johnny" }];
        const updatedQuestion = { title: "First Name", description: "Your legal name", placeholder: "John" };

        createFormWithQuestions(form, questions);
        cy.visit("/forms");
        cy.containsClick(form.name);
        cy.containsClick(questions[0].title);
        cy.enterText("[data-cy=title]", updatedQuestion.title);
        cy.enterText("[data-cy=description]", updatedQuestion.description);
        cy.enterText("[data-cy=placeholder]", updatedQuestion.placeholder);
        cy.get("[data-cy=save-button]").should('exist').click();
        cy.notContainAll("[data-cy=content]", [questions[0].title]);
        cy.containsAll("[data-cy=content]", [updatedQuestion.title]);
    })
}

function deleteQuestion() {
    it("Delete question", () => {
        const form = {contentType: "person", name: "Signup"};
        const questions = [{ fieldType: "Textbox", title: "Username", description: "A unique handle", placeholder: "gabnorth97" }];

        createFormWithQuestions(form, questions);
        cy.visit("/forms");
        cy.containsClick(form.name);
        cy.containsClick(questions[0].title);
        cy.wait(2000);
        cy.get("[data-cy=delete-button]").should('exist').click();
        cy.visit("/forms");
        cy.containsClick(form.name);
        cy.notContainAll("[data-cy=content]", [questions[0].title]);
    })
}

function reorderQuestions() {
    it('Re-order questions', () => {
        const forms = {contentType: "person", name: "Reorder"}
        const questions = [
            { fieldType: "Textbox", title: "FirstName" },
            { fieldType: "Textbox", title: "LastName" }
        ]

        createFormWithQuestions(forms, questions);
        cy.visit("/forms");
        cy.containsClick(forms.name);
        cy.getQuestionsForForm("Reorder").then(qs => {
            cy.get("tbody tr:first").should('contain', qs[0].title);
            cy.get("tbody tr:first .fa-arrow-down").should('exist').click();
            cy.get("tbody tr:last").should("contain", qs[0].title);
            cy.get("tbody tr:last .fa-arrow-up").should('exist').click();
        })    
    })
}

function createFormWithQuestions(form, questions) {
    cy.createForms([form]).then(result => {
        const formId = result[0].id;

        questions.forEach(q => {
            q.formId = formId;
        })
        cy.makeApiCall("POST", "/questions", "MembershipApi", questions);
    })
}
