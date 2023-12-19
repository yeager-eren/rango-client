import {
  checkout,
  merge,
  publishTags,
  pull,
  pushToRemote,
} from '../common/git.mjs';
import { checkCommitAndGetPkgs } from './tag.mjs';

async function run() {
  // Make sure we are on main and having latest changes
  await checkout('main');
  await pull();

  // Tag phase
  const pkgs = await checkCommitAndGetPkgs();
  await publishTags(pkgs);
  await pushToRemote();

  // Merge phase
  await checkout('next');
  await pull();
  await merge('main');
  await pushToRemote();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
