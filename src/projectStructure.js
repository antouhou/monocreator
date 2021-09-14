const exec = require('./exec');
const path = require('path');

const prefix = "monoproject";

async function createDirectory() {
  const projectPath = path.join(__dirname, `../../${prefix}`);
  await exec(`mkdir ${projectPath}`);
  return projectPath;
}

module.exports = {
  createDirectory
}
