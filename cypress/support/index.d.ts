/// <reference types="cypress" />
// todo: bring appbase for all the interfaces

type ApiListType = "AccessApi" | "MembershipApi" | "AttendanceApi" | "GivingApi" | "MessagingApi" | "StreamingLiveApi" | "B1Api" | "LessonsApi";

declare namespace Cypress {
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
    }
}