const path = require('path');
const exec = require('./exec');

class Repository {
  constructor(url, name, path, branch) {
    this.url = url;
    this.name = name;
    this.path = path;
    this.branch = branch;
  }
}

const repositoriesDir = path.join(__dirname, `../../repositories`);

function repoInfo(url, branch, dir) {
  return {
    url,
    branch,
    dir,
  }
}

const urlsAndBranches = [
  repoInfo('https://github.com/dashevo/dapi.git', 'v0.22-dev', 'dapi'),
  repoInfo('https://github.com/dashevo/dapi-grpc.git', 'v0.22-dev', 'dapi-grpc'),
  repoInfo('https://github.com/dashevo/dashmate.git', 'v0.22-dev', 'dashmate'),
  repoInfo('https://github.com/dashevo/js-dapi-client.git', 'v0.22-dev', 'dapi-client'),
  repoInfo('https://github.com/dashevo/js-dash-sdk.git', 'v0.22-dev', 'sdk'),
  repoInfo('https://github.com/dashevo/js-drive.git', 'v0.22-dev', 'drive'),
  repoInfo('https://github.com/dashevo/js-dpp.git', 'v0.22-dev', 'dpp'),
  repoInfo('https://github.com/dashevo/js-grpc-common.git', 'master', 'grpc-common'),
  repoInfo('https://github.com/dashevo/dpns-contract.git', 'master', 'dpns-contract'),
  repoInfo('https://github.com/dashevo/feature-flags-contract.git', 'master', 'feature-flags-contract'),
  repoInfo('https://github.com/dashevo/platform-test-suite.git', 'v0.22-dev', 'test-suite'),
  repoInfo('https://github.com/dashevo/wallet-lib.git', 'v0.22-dev', 'wallet-lib'),
  repoInfo('https://github.com/dashevo/dashpay-contract', 'master', 'dashpay-contract'),
];

const repos = urlsAndBranches.map(repoInfo => {
  const repo = new Repository(repoInfo.url);
  repo.name = repoInfo.url.replace(/.*\/dashevo\//, '').replace(/\.git.*/, '');
  repo.path = path.join(repositoriesDir, `/${repo.dir}`);
  repo.branch = repoInfo.branch;
  return repo;
})

module.exports = {
  async clone() {
    console.log('Cloning repositories...');
    const responses = await Promise.all(repos.map(repo => {
      console.log(`Clone ${repo.url} into ${repo.path}`);
      return exec(`git clone --branch ${repo.branch} ${repo.url} ${repo.path}`);
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

