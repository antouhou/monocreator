const fs = require('fs');
const path = require('path');

let projectPath;
let packagesPath;

/**
 * Removes resolve that breaks SDK's build in monorepo from webpack config
 *
 * @returns {Promise<void>}
 */
async function fixSDKBuild() {
  console.log('Fixing SDK webpack config');
  const baseConfigPath = `${packagesPath}/js-dash-sdk/webpack.base.config.js`;
  const baseConfigFile = fs.readFileSync(baseConfigPath, { encoding: "utf-8" });
  const fixedBaseConfigFile = baseConfigFile.replace(`
    alias: {
      'bn.js': path.resolve(__dirname, 'node_modules', 'bn.js')
    }`, '');

  fs.writeFileSync(baseConfigPath + '.old', baseConfigFile);
  fs.writeFileSync(baseConfigPath, fixedBaseConfigFile);

  const configPath = `${packagesPath}/js-dash-sdk/webpack.config.js`;
  const configFile = fs.readFileSync(configPath, { encoding: "utf-8" });
  const fixedConfigFile = configFile.replace(`
    alias: {
      'bn.js': path.resolve(__dirname, 'node_modules', 'bn.js')
    }`, '');

  fs.writeFileSync(configPath + '.old', configFile);
  fs.writeFileSync(configPath, fixedConfigFile);
}

async function fixDapiDockerfile() {
  console.log('Fixing dapi Dockerfile');
  const dapiDockerfilePath = `${packagesPath}/dapi/Dockerfile`;
  const dapiDockerfile = fs.readFileSync(dapiDockerfilePath, { encoding: "utf-8" });

  let newFile = dapiDockerfile
    .replace(`    npm config set node_gyp node-gyp-cache`, `    npm config set node_gyp node-gyp-cache

# Update npm to version 7 to work with workspaces
RUN npm install -g npm@7`)
    .replace(`COPY package.json package-lock.json /

RUN --mount=type=cache,target=/root/.npm --mount=type=cache,target=/root/.cache npm ci --production`, `WORKDIR /platform

COPY package.json package-lock.json /platform/

COPY packages/ /platform/packages/

# Remove packages that dapi won't need
RUN rm -rf /platform/packages/drive /platform/packages/dashmate /platform/packages/platform-test-suite platform/packages/js-dash-sdk /platform/packages/wallet-lib

# Install dapi-specific dependencies
RUN --mount=type=cache,target=/root/.npm --mount=type=cache,target=/root/.cache npm ci -w @dashevo/dapi --production`)
    .replace(`# Copy NPM modules
COPY --from=node_modules /node_modules/ /node_modules
COPY --from=node_modules /package.json /package.json
COPY --from=node_modules /package-lock.json /package-lock.json`, `# Copy packages dir to create symlinks to modules available locally
COPY --from=node_modules /platform/packages/ /packages
# Copy hoisted NPM modules
COPY --from=node_modules /platform/node_modules/ /node_modules
COPY --from=node_modules /platform/package.json /package.json
COPY --from=node_modules /platform/package-lock.json /package-lock.json`)
    .replace(`COPY . .`, `COPY packages/dapi/ .
# Copy dapi-specific NPM modules that are in conflict with the root node_modules (if any)
COPY --from=node_modules /platform/packages/dapi/node_modules/ ./node_modules`)

  fs.writeFileSync(dapiDockerfilePath, newFile);
  fs.writeFileSync(dapiDockerfilePath + '.old', dapiDockerfile);
}

async function fixDriveDockerfile() {
  console.log('Fixing drive Dockerfile');
  const driveDockerfilePath = `${packagesPath}/js-drive/Dockerfile`;
  const driveDockerfile = fs.readFileSync(driveDockerfilePath, { encoding: "utf-8" });

  let newFile = driveDockerfile
    .replace(`ENV npm_config_zmq_external=true

COPY package.json package-lock.json /

RUN --mount=type=cache,target=/root/.npm --mount=type=cache,target=/root/.cache npm ci --production`, `# Update npm to version 7 to work with workspaces
RUN npm install -g npm@7

ENV npm_config_zmq_external=true

WORKDIR /platform

COPY package.json package-lock.json /platform/

COPY packages/ /platform/packages/

# Remove packages that drive won't need
RUN rm -rf /platform/packages/dapi /platform/packages/dashmate /platform/packages/platform-test-suite platform/packages/js-dash-sdk /platform/packages/wallet-lib

# Install drive-specific dependencies
RUN --mount=type=cache,target=/root/.npm --mount=type=cache,target=/root/.cache npm ci -w @dashevo/drive --production
`)
    .replace(`# Copy NPM modules
COPY --from=node_modules /node_modules/ /node_modules
COPY --from=node_modules /package.json /package.json
COPY --from=node_modules /package-lock.json /package-lock.json`, `# Copy packages dir to create symlinks to modules available locally
COPY --from=node_modules /platform/packages/ /packages
# Copy hoisted NPM modules
COPY --from=node_modules /platform/node_modules/ /node_modules
COPY --from=node_modules /platform/package.json /package.json
COPY --from=node_modules /platform/package-lock.json /package-lock.json`)
    .replace(`COPY . .`, `COPY packages/js-drive/ .
# Copy drive-specific NPM modules that are in conflict with the root node_modules (if any)
COPY --from=node_modules /platform/packages/js-drive/node_modules/ ./node_modules`);

  fs.writeFileSync(driveDockerfilePath, newFile);
  fs.writeFileSync(driveDockerfilePath + '.old', driveDockerfile);
}

async function fixDashmateDockerCompose() {}

// Those two seems to be working so far
async function fixGrpcCommonBuild() {}
async function fixDapiGrpcBuild() {}

module.exports = {
  init(pathToProject) {
    projectPath = pathToProject;
    packagesPath = path.join(projectPath, './packages');
  },
  fixSDKBuild,
  fixDapiDockerfile,
  fixDriveDockerfile,
  fixGrpcCommonBuild,
  fixDashmateDockerCompose,
  fixDapiGrpcBuild,
}
