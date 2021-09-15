const project = require('./projectStructure');
const repositories = require('./repositories');

async function prepareRepositories() {
  try {
    await repositories.clone();
    await repositories.import();
    await repositories.cleanup();
  } catch (e) {
    console.log('Error happened while preparing repositories, reverting');
    await repositories.revert();
    console.error(e);
    process.exit(1);
  }

}

async function prepareProjectDirectory() {
  await project.removeProjectDir();
  await project.createDirectory();
  await project.copyTemplates();

  await project.installNodeModules();

  await project.initializeGit();
  await project.commitFiles();

  return project.getPath();
}

async function main() {
  const projectPath = await prepareProjectDirectory();


  //await prepareRepositories();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
})
