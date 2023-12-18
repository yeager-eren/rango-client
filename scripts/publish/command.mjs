#!/usr/bin/env node
'use strict';
import process from 'node:process';

import { State } from './state.mjs';
import { checkEnvironments } from '../common/github.mjs';
import { tryPublish } from './publish.mjs';
import { getAffectedPackages } from '../common/repository.mjs';
import {
  addPkgFileChangesToStage,
  logAsSection,
  sequentiallyRun,
  throwIfUnableToProceed,
} from './utils.mjs';
import {
  addFileToStage,
  publishCommitAndTags,
  pushToRemote,
} from '../common/git.mjs';
import { update } from './package.mjs';
import { build } from './build.mjs';
import { execa } from 'execa';
import { EOL } from 'node:os';

async function run() {
  logAsSection('::group::🔍 Checking environments...');
  checkEnvironments();
  console.log('::endgroup::');

  console.log({ GITHUB_OUTPUT: process.env['$GITHUB_OUTPUT'] });
  const { stdout } = await execa('echo', ['PKGS=pkg1,pkg2,pkg3']).pipeStdout(
    `$GITHUB_OUTPUT`
  );
  console.log({ stdout });

  console.log(EOL);
  console.log('::set-output yyy=yes');
  console.log(EOL);
  console.log('xxx=no');
  return;

  // 1. Detect affected packages and increase version
  logAsSection('::group::🔍 Anlyzing dependencies...');
  const affectedPkgs = await getAffectedPackages();
  const libPkgs = affectedPkgs.filter((pkg) => !pkg.private);
  const clientPkgs = affectedPkgs.filter((pkg) => pkg.private);

  if (libPkgs.length === 0) {
    console.log('No library has changed. Skip.');
    process.exit(0);
  }

  console.log('current state is this:');
  console.table(libPkgs);

  const state = new State(libPkgs);
  const updateTasks = libPkgs.map((pkg) => {
    return update(pkg).then((pkgState) => {
      state.setState(pkg.name, 'gitTag', pkgState.gitTag);
      state.setState(pkg.name, 'githubRelease', pkgState.githubRelease);
      state.setState(pkg.name, 'npmVersion', pkgState.npmVersion);
      state.setState(pkg.name, 'version', pkgState.version);
    });
  });
  await Promise.all(updateTasks);

  const pkgs = state.list();
  const pkgStates = pkgs.map((pkg) => state.getState(pkg.name));

  console.log('The next state is this:');
  console.table(
    pkgs.map((pkg) => {
      return {
        name: pkg.name,
        ...state.getState(pkg.name),
      };
    })
  );

  throwIfUnableToProceed(pkgStates);

  console.log('::endgroup::');

  // 2. Build all packacges
  /**
   * IMPORTANT NOTE:
   * We are all the libs in parallel, parcel has a limitation on running `parcel` instances.
   * So if you are trying to build multiple parcel apps it goes through some erros. here, for publishing libs
   * We are using esbuild so don't need to do anything.
   * but if we need, the potential solution is filtering parcel apps and run them secquentially.
   */

  logAsSection(`::group::🔨 Start building...`);
  await build(pkgs);
  console.log('::endgroup::');

  // 3. Publish
  logAsSection(`::group::🚀 Start publishing...`);
  try {
    await tryPublish(pkgs, {
      onUpdateState: state.setState.bind(state),
    });
  } catch (e) {
    console.error(e);

    /** @type {import('../common/typedefs.mjs').Package | undefined} */
    const pkg = e.cause.pkg;
    if (!pkg) {
      console.error(
        "🚨 The error hasn't thrown `pkg`. Here is more information to debug"
      );
      console.log(state.toJSON());
    } else {
      // Ignoring error since it's possible to file hasn't changed yet.
      await addPkgFileChangesToStage(pkg).catch(console.warn);
    }
  }

  console.log('::endgroup::');

  // 4. Tag and Push

  /**
   * Our final list will includes only packages that published on NPM.
   * If a package failed on making changelog, github release, ...
   * We are considering it's published and should handle those cases manually.
   */
  const listPkgsForTag = state.list().filter((pkg) => {
    const isPublishedOnNpm = !!state.getState(pkg.name, 'npmVersion');
    return isPublishedOnNpm;
  });

  logAsSection(
    '::group::🏷️ Tagging and commit...',
    `${listPkgsForTag.length} packages for tagging.`
  );
  if (listPkgsForTag.length > 0) {
    /**
     * We don't need to tag and mention them while publishing, they have a separate github action.
     * But we updated their package json to use the latest version of published libs
     * So we should includes them in our commit.
     */
    await sequentiallyRun(
      clientPkgs.map(
        (pkg) => () => addFileToStage(`${pkg.location}`).catch(console.warn)
      )
    );

    await publishCommitAndTags(listPkgsForTag);
    const pushResult = await pushToRemote();
    console.log({ pushResult });
  } else {
    console.log('Skipped.');
  }

  console.log('::endgroup::');

  // 5. Report
  console.log('::group::📊 Report');
  console.table(
    pkgs.map((pkg) => ({
      name: pkg.name,
      ...state.getState(pkg.name),
    }))
  );
  console.log('::endgroup::');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
