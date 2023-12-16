import chalk from 'chalk';
import { should } from '../common/features.mjs';
import { addFileToStage } from '../common/git.mjs';

/**
 *
 * For publishing a package we are changing somefiles,
 * using this function it helps to add them git staging area.
 *
 * @param {import('../common/typedefs.mjs').Package} pkg
 */
export async function addPkgFileChangesToStage(pkg) {
  await addFileToStage(`${pkg.location}/package.json`);
  if (should('generateChangelog')) {
    await addFileToStage(`${pkg.location}/CHANGELOG.md`);
  }
}

/**
 *
 * @param {Promise[]} promises
 * @returns {Promise<Array>}
 */
export async function sequentiallyRun(promises) {
  return promises.reduce((prev, task) => {
    return prev.then(() => {
      return task();
    });
  }, Promise.resolve());
}

export function logAsSection(title, sub = '') {
  let message = chalk.bgBlue.white.bold(title);
  if (!!sub) {
    message += ' ';
    message += sub;
  }
  console.log(message);
}
