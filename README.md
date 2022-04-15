# ChumsTests
Automated test scripts for ChumsApp

### Dev Setup Instructions
1. Follow the readme for [ChumsApp](https://github.com/LiveChurchSolutions/ChumsApp) to get it running on your machine.
1. Clone the repo with `git clone https://github.com/LiveChurchSolutions/ChumsTests.git`
2. Run `cd ChumsTests`
3. Pull the [appBase](https://github.com/LiveChurchSolutions/AppBase) submodule with: `git submodule init && git submodule update`
4. Install with `npm i`

### Running Tests
1. Launch GUI with `npm run cy:open`
2. Click on a script to run a block of tests