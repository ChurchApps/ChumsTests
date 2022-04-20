# ChumsTests
Automated test scripts for ChumsApp

### Dev Setup Instructions
1. Follow the readme for [ChumsApp](https://github.com/LiveChurchSolutions/ChumsApp) to get it running on your machine.
2. Clone the repo with `git clone https://github.com/LiveChurchSolutions/ChumsTests.git`
3. Run `cd ChumsTests`
4. Pull the [appBase](https://github.com/LiveChurchSolutions/AppBase) submodule with: `git submodule init && git submodule update`
5. Install with `npm i`
6. Copy `cypress.env.json.template` environment file to `cypress.env.json` and adjust as needed.

#### Dev Setup Videos
1. [APIs](https://youtu.be/M81I6gmKqdI)
2. [ChumsApp](https://youtu.be/5zsEJEp6yMw)
3. [Create Account](https://youtu.be/LjeSzT7OXw4)

### Running Tests
1. Launch GUI with `npm run cy:open`
2. Click on a script to run a block of tests