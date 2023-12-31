import { checkout, createAndSwitch, del, pull, push } from '../common/git.mjs';
import { createPullRequest } from '../common/github.mjs';
import { checkCommitAndGetPkgs } from './tag.mjs';

async function run() {
  const tempBranch = 'ci/post-release';
  const targetBranch = 'next';

  // Make sure we are on main and having latest changes
  await checkout('main');
  await pull();

  // await checkCommitAndGetPkgs();

  // Making sure we are deleting the branch then create a new one.
  // Note: it will fails silently since if a branch doesn't exist it goes through error.
  await del(tempBranch);
  await createAndSwitch(tempBranch);
  await push({
    setupRemote: true,
    branch: tempBranch,
  });

  await createPullRequest({
    title: '🤖 Post Release',
    branch: tempBranch,
    baseBranch: targetBranch,
    templatePath: './.github/PUBLISH_TEMPLATE.md',
  });
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
