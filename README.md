# ChumsTests
Automated test scripts for ChumsApp

### Dev Setup Instructions
1. Follow the readme for [ChumsApp](https://github.com/LiveChurchSolutions/ChumsApp) to get it running on your machine.
1. Clone the repo with `git clone https://github.com/LiveChurchSolutions/ChumsTests.git`
1. Run `cd ChumsTests`
1. Pull the [appBase](https://github.com/LiveChurchSolutions/AppBase) submodule with: `git submodule init && git submodule update`
1. Install with `npm i`


#### Copy the environment variable template:

```sh
cp cypress.env.json.template cypress.env.json
# cypress.env.json is in .gitignore to prevent accidental publication
```

### Running Tests
1. Launch GUI with `npm run cy:open`
2. Click on a script to run a block of tests