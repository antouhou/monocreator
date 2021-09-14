const exec = require('./exec');

class Repository {
  constructor(url, name, path) {
    this.url = url;
    this.name = name;
    this.path = path;
  }
}

const urls = [
  'https://github.com/dashevo/dapi.git'
]

const repos = urls.map(url => {
  const repo = new Repository(url);
  repo.name = url.replace(/.*\/dashevo\//, '').replace(/\.git.*/, '');
  repo.path = `../repositories/${repo.name}`;
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

  async import() {
    console.log('Importing repositories to packages directory');
    const responses = await Promise.all(repos.map(repo => {
      console.log(`Importing ${repo.name} from ${repo.path}`);
      return exec(`lerna import ${repo.path} --preserve-commit --flatten`);
    }));
    console.log(responses);
    console.log('Import finished')
  },

  async cleanup() {

  },

  async revert() {
    console.log('Aborting repository changes');
    const res = await Promise.all(repos.map(repo => {
      console.log(`Removing ${repo.path}`);
      return exec(`rm -rf ${repo.path}`);
    }));
    console.log(res);
  }
}

