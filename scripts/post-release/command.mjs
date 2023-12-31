import { checkout, pull } from '../common/git.mjs';
import { createPullRequest } from '../common/github.mjs';
import { checkCommitAndGetPkgs } from './tag.mjs';

async function run() {
  const tempBranch = 'main';
  const targetBranch = 'next';

  // Make sure we are on main and having latest changes
  await checkout('main');
  await pull();

  // It shouldn't fail the whole gh action.
  await checkCommitAndGetPkgs().catch((e) => {
    console.log(e);
    process.exit(0);
  });

  await createPullRequest({
    title: '🤖 Post Release',
    branch: tempBranch,
    baseBranch: targetBranch,
    templatePath: '.github/PUBLISH_TEMPLATE.md',
  });
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
