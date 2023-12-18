import chalk from 'chalk';
import { generateChangelog } from '../common/changelog.mjs';
import { should } from '../common/features.mjs';
import { makeGithubRelease } from '../common/github.mjs';
import { publishOnNpm } from '../common/npm.mjs';
import { upgradeDependents } from './upgrade.mjs';
import {
  addPkgFileChangesToStage,
  logAsSection,
  sequentiallyRun,
} from './utils.mjs';

/**
 *
 * By giving a list of packages, we will try to publish all of them.
 * Publishing includes some steps to be done.
 *
 * @param {import("../common/utils.mjs").Package[]} pkgs
 */
export async function tryPublish(pkgs, { onUpdateState }) {
  const tasks = pkgs.map(
    (pkg) => () =>
      publishTask(pkg, { onUpdateState }).catch((e) => {
        e.cause = {
          pkg,
        };
        throw e;
      })
  );
  await sequentiallyRun(tasks);

  console.log(`Published.`);
}

/**
 *
 * There are some few steps to be finshed to publish a package.
 * This function contains these steps.
 *
 * @param {import('../common/typedefs.mjs').Package} pkg
 */
async function publishTask(pkg, { onUpdateState }) {
  console.log(chalk.green('[1/4]'), `Publish ${pkg.name} to npm`);
  await publishOnNpm(pkg);
  onUpdateState(pkg.name, 'npmVersion', pkg.version);

  if (should('generateChangelog')) {
    console.log(chalk.green('[2/4]'), `Making changelog and github release`);
    await generateChangelog(pkg, { saveToFile: true });
    // await makeGithubRelease(pkg);
    onUpdateState(pkg.name, 'githubRelease', pkg.version);
  } else {
    console.log(chalk.green('[2/4]'), `Skipping changelog and github release.`);
  }

  console.log(
    chalk.green('[3/4]'),
    `Upgrade all the dependent packages to latest version`
  );
  await upgradeDependents(pkg);

  console.log(chalk.green('[4/4]'), `Adding files to staging area`);
  await addPkgFileChangesToStage(pkg);

  console.log(`🚀 ${pkg.name} published.`);
}
