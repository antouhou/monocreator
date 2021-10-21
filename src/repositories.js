const path = require('path');
const exec = require('./exec');

class Repository {
  constructor(url, name, path) {
    this.url = url;
    this.name = name;
    this.path = path;
  }
}

const repositoriesDir = path.join(__dirname, `../../repositories`);

const urls = [
  'https://github.com/dashevo/dapi.git',
  'https://github.com/dashevo/dapi-grpc.git',
  'https://github.com/dashevo/dashmate.git',
  'https://github.com/dashevo/js-abci.git',
  'https://github.com/dashevo/js-dapi-client.git',
  'https://github.com/dashevo/js-dash-sdk.git',
  'https://github.com/dashevo/js-drive.git',
  'https://github.com/dashevo/js-dpp.git',
  'https://github.com/dashevo/js-grpc-common.git',
  'https://github.com/dashevo/dpns-contract.git',
  'https://github.com/dashevo/feature-flags-contract.git',
  'https://github.com/dashevo/platform-test-suite.git',
  'https://github.com/dashevo/wallet-lib.git',
];

const repos = urls.map(url => {
  const repo = new Repository(url);
  repo.name = url.replace(/.*\/dashevo\//, '').replace(/\.git.*/, '');
  repo.path = path.join(repositoriesDir, `/${repo.name}`);
  return repo;
})

module.exports = {
  async clone() {
    console.log('Cloning repositories...');
    const responses = await Promise.all(repos.map(repo => {
      console.log(`Clone ${repo.url} into ${repo.path}`);
      return exec(`git clone ${repo.url} ${repo.path}`);
    }));
    console.log('Repositories cloned');
  },

  async import(projectPath) {
    console.log('Importing repositories to packages directory');
    for (let repo of repos) {
      // It has to be sequential, hence the loop
      console.log(`Importing ${repo.name} from ${repo.path}`);
      await exec(
        `lerna import ${repo.path} --preserve-commit --flatten -y`,
        { cwd: projectPath, forwardStdout: true }
      );
      console.log(`Imported ${repo.name}`);
    }
    console.log('Import finished');
  },

  async convertLinks(projectPath) {
    console.log('Converting commit message issue links');
    for (let repo of repos) {
      console.log(`Converting for ${repo.name}`);
      await exec(
        `git filter-repo --source ${repo.path} --target ${repo.path} --message-callback "
          if b'(#' in message:
            message = message.replace(b'(#', b'(dashevo/${repo.name}#')
          return message"`,
        { cwd: projectPath, forwardStdout: true }
      );
      console.log(`Converted ${repo.name}`);
    }
    console.log('Converting finished');
  },

  async cleanup() {
    console.log(`Removing ${repositoriesDir} if exists`);
    return exec(`rm -rf ${repositoriesDir}`);
  },

  async revert() {
    await this.cleanup();
  }
}

