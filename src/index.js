const project = require('./projectStructure');
const repositories = require('./repositories');
const buildModifications = require('./buildModifications');

async function prepareRepositories(projectPath) {
  try {
    await repositories.cleanup();
    await repositories.clone();
    await repositories.import(projectPath);
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

  // To install lerna. There's also a separate install
  // after the project was initialized
  await project.installNodeModules();

  await project.initializeGit();
  await project.commitFiles();
}

const skipProjectCreation = false;

async function main() {
  const projectPath = project.getPath();

  if (!skipProjectCreation) {
    await prepareProjectDirectory();
    await prepareRepositories(projectPath);
  }

  buildModifications.init(projectPath);
  // By that point the repository has been initialized, can do modifications to build files

  await buildModifications.fixSDKBuild();

  // Fixing docker-related stuff in dapi, drive and dashmate
  await buildModifications.fixDapiDockerfile();
  await buildModifications.fixDriveDockerfile();
  await buildModifications.fixDashmateDockerCompose()

  // After the modification to build files were done, can install node modules. This is needed
  // because otherwise npm i for the SDK won't work, as there will be no build of grpc for example
  await project.installNodeModules();

  await project.build();

  console.log("The multi package repo has been successfully created");
}

main().catch(e => {
  console.error(e);
  process.exit(1);
})
