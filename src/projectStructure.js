const exec = require('./exec');
const path = require('path');

const prefix = "monoproject";
const projectPath = path.join(__dirname, `../../${prefix}`);
const templateFiles = path.join(__dirname, '../project_template')

function getPath() {
  return projectPath;
}

async function createDirectory() {
  console.log(`Creating ${projectPath} directory`);
  await exec(`mkdir ${projectPath}`);
  return projectPath;
}

async function copyTemplates() {
  console.log(`Copying project templates into ${projectPath}`);
  await exec(`cp -r ${templateFiles}/. ${projectPath}`);
}

async function installNodeModules() {
  console.log(`Installing node modules in ${projectPath}`);
  await exec(`npm i`, { cwd: projectPath, forwardStdout: true });
}

async function initializeGit() {
  console.log(`Initializing git it node in ${projectPath}`);
  await exec(`git init`, { cwd: projectPath, forwardStdout: true });
}

async function commitFiles() {
  console.log(`Committing template files in ${projectPath}`);
  await exec(`git add . && git commit -a -m "Initial commit"`, { cwd: projectPath, forwardStdout: true });
}

async function removeProjectDir() {
  console.log(`Removing ${projectPath} directory`);
  await exec(`rm -rf ${projectPath}`);
}

async function build() {
  console.log('Running the build scripts');
  await exec(`npm run build`, { cwd: projectPath, forwardStdout: true });
}

module.exports = {
  createDirectory,
  copyTemplates,
  installNodeModules,
  initializeGit,
  commitFiles,
  removeProjectDir,
  getPath,
  build
}
