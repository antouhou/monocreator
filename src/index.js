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

async function main() {
  const monorepoPath = await project.createDirectory();


  await prepareRepositories();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
})
