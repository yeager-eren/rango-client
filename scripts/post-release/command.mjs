import { checkout, merge, publishTags, pull, push } from '../common/git.mjs';
import { checkCommitAndGetPkgs } from './tag.mjs';

async function run() {
  // Make sure we are on main and having latest changes
  await checkout('main');
  await pull();

  // Tag phase
  const pkgs = await checkCommitAndGetPkgs();
  await publishTags(pkgs);
  await push();

  // Merge phase
  await checkout('next');
  await pull();
  await merge('main');
  await push();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
