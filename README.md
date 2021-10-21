Instructions

1. Install git-filter-repo. [Install guide](https://github.com/newren/git-filter-repo/blob/main/INSTALL.md).
2. Run `npm ci && npm start` from this directory. This will create `../monoproject`
directory that will contain the newly created multi package project
3. Change directory to monoproject: `cd ../monoproject`
4. Run `npm run setup` in that directory. That will install npm packages, build
everything and configure dashmate and test suite
5. Run `npm run test:suite`. This will start local node, run test suite and stop
local node.
