import { checkout, del, merge, pull, push } from '../common/git.mjs';
import { checkCommitAndGetPkgs } from './tag.mjs';

async function run() {
  const tempBranch = 'ci/post-release';
  const targetBranch = 'next';
  const prTitle = '🤖 Post Release';
  const prTemplatePath = '...';

  // gh --titile

  // Make sure we are on main and having latest changes
  await checkout('main');
  await pull();

  await checkCommitAndGetPkgs();

  // Making sure we are deleting the branch then create a new one.
  await del(tempBranch);
  await createAndSwitch(tempBranch);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
