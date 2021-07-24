/// <reference types="cypress" />

declare namespace Cypress {
  type ApiListType = import("../../appBase/interfaces").ApiListType
  type NameInterface = import("../../appBase/interfaces").NameInterface

  interface Chainable {
      /**
       * login programatically via api calls.
       * @example cy.login()
       */
      login(): Chainable

      /**
       * remove all person records.
       * @example cy.clearPeople()
       */
      clearPeople(): Chainable

      /**
       * make synchronous api call to specific api.
       * @example cy.makeApiCall(method, route, apiName, payload)
       */
      makeApiCall(method: string, route: string, apiName: ApiListType, payload?:any): Chainable

      /**
       * make asynchronous api call to specific api.
       * @example cy.makeAsyncApiCall(method, route, apiName, payload)
       */
      makeAsyncApiCall(method: string, route: string, api: ApiListType, payload?: any): Chainable

      /**
       * remove all person records.
       * @example cy.clearPeople()
       */
       clearPeople(): Chainable

      /**
       * remove all campus records.
       * @example cy.clearCampuses()
       */
       clearCampuses(): Chainable

      /**
       * remove all service records.
       * @example cy.clearServices()
       */
       clearServices(): Chainable

      /**
       * remove all service time records.
       * @example cy.clearServiceTimes()
       */
       clearServiceTimes(): Chainable

      /**
       * remove all form records.
       * @example cy.clearForms()
       */
       clearForms(): Chainable

      /**
       * remove all question records.
       * @example cy.clearQuestions()
       */
       clearQuestions(): Chainable

       /**
        * create person records.
        * @example cy.createPeople([{ firstName, lastName }])
        */
       createPeople(people: NameInterface[]): Chainable
    }
}