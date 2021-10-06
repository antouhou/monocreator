Instructions

1. Run `npm ci && npm start` from this directory. This will create `../monoproject`
directory that will contain the newly created multi package project
2. Change directory to monoproject: `cd ../monoproject`
3. Run `npm run setup` in that directory. That will install npm packages, build
everything and configure dashmate and test suite
4. Run `npm run test:suite`. This will start local node, run test suite and stop
local node.
