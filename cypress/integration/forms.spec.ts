import * as faker from "faker"
import { getForms, FormInterface, QuestionInterface } from "../support/index"

describe('Forms', () => {
    before(() => {
        cy.login();
        cleanupForms();
    })

    beforeEach(() => {
        cy.login();
    })

    verifyPage()
    deleteForm();
    editForm();
    createForm();
    verifyQuestionsPage()
    addQuestion();
    editQuestion();
    deleteQuestion();
    reorderQuestions();
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
    const name = faker.company.companyName()

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
    const newName = faker.company.companyName()

    it("should edit form", () => {
        cy.createForms(forms).then(() => {
            cy.visit("/forms");
            cy.findByRole("row", { name: new RegExp(forms[0].name || "", "i") }).within(() => {
                cy.findByRole("button", { name: /editform/i }).click()
            })
            cy.findByRole("textbox", { name: /form name/i }).clear()
            cy.wait(2000)
            cy.findByRole("textbox", { name: /form name/i }).clear().type(newName)
            cy.findByRole("button", { name: /save/i }).click()
            cy.findByRole("link", { name: new RegExp(newName, "i") }).should("exist")
        })
    })
}

function deleteForm() {
    const forms = getForms(1);
    const newName = faker.company.companyName()

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

function addQuestion() {
    const title = faker.company.companyName()

    it("should add a question", () => {
        const forms = getForms(1)

        cy.createForms(forms).then((forms: FormInterface[]) => {
            cy.visit(`/forms/${forms[0].id}`)
        })
        cy.findByRole("button", { name: /addquestion/i }).click()
        cy.findByRole("textbox", { name: /title/i }).clear()
        cy.wait(2000)
        cy.findByRole("textbox", { name: /title/i }).clear().type(title)
        cy.findByRole("button", { name: /save/i }).click()
        cy.findByRole("link", { name: new RegExp(title, "i") }).should("exist")
    })
}

function editQuestion() {
    const forms = getForms(1)
    const newQuestionTitle = faker.company.companyName()

    it("should edit a question", () => {
        cy.createForms(forms).then((forms: FormInterface[]) => {
            const questions = getQuestions(1, forms[0].id || "")
            cy.makeApiCall("POST", "/questions", "MembershipApi", questions)
            cy.visit(`/forms/${forms[0].id}`)
            cy.findByRole("link", { name: new RegExp(questions[0].title || "", "i") }).click()
        })
        cy.wait(2000)
        cy.findByRole("combobox", { name: /question type/i }).select("Email")
        cy.findByRole("textbox", { name: /title/i }).clear().type(newQuestionTitle)
        cy.findByRole("button", { name: /save/i }).click()
        cy.findByRole("link", { name: new RegExp(newQuestionTitle, "i") }).should("exist")
        cy.findByText(/email/i).should("exist")
    })
}

function deleteQuestion() {
    const forms = getForms(1)

    it("should be able to delete a question", () => {
        cy.createForms(forms).then((forms: FormInterface[]) => {
            const questions = getQuestions(1, forms[0].id || "")
            cy.makeApiCall("POST", "/questions", "MembershipApi", questions)
            cy.visit(`/forms/${forms[0].id}`)
            cy.findByRole("link", { name: new RegExp(questions[0].title || "", "i") }).click()
        })
        cy.findByRole("button", { name: /delete/i }).click()
    })
}

function reorderQuestions() {
    const forms = getForms(1)
    it('Re-order questions', () => {
        cy.createForms(forms).then((forms: FormInterface[]) => {
            const questions = getQuestions(2, forms[0].id || "")
            cy.makeApiCall("POST", "/questions", "MembershipApi", questions)
            cy.visit(`/forms/${forms[0].id}`)
        })
        cy.findByRole("button", { name: /moveup/i }).click()
        cy.findByRole("button", { name: /movedown/i }).click()
    })
}

function getQuestions(amount: number, formId: string): QuestionInterface[] {
    const questions: QuestionInterface[] = []
    while(amount > 0) {
        questions.push({
            fieldType: "Textbox",
            formId,
            title: faker.company.companyName(),
        })
        amount--
    }
    return questions
}