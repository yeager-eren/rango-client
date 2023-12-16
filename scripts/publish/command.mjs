#!/usr/bin/env node
'use strict';
import process from 'node:process';

import { State, state, throwIfUnableToProceed } from './state.mjs';
import { checkEnvironments } from '../common/github.mjs';
import { tryPublish } from './publish.mjs';
import { getAffectedPackages } from '../common/repository.mjs';
import { addPkgFileChangesToStage } from './utils.mjs';
import { publishCommitAndTags, pushToRemote } from '../common/git.mjs';

async function run() {
  // 0. Check prerequisite
  checkEnvironments();
  // checkGitWorkingDirectoryAndStage();

  // TODO: rename and put value
  const affectedPkgs = await getAffectedPackages();
  const state = new State(affectedPkgs);
  await state.update();
  const pkgs = state.list();

  // const { current, next } = await state();
  // throwIfUnableToProceed(current, next);
  // const pkgs = next.map((pkgState) => pkgState.package);

  // 1. Build all packacges
  /**
   * IMPORTANT NOTE:
   * We are all the libs in parallel, parcel has a limitation on running `parcel` instances.
   * So if you are trying to build multiple parcel apps it goes through some erros. here, for publishing libs
   * We are using esbuild so don't need to do anything.
   * but if we need, the potential solution is filtering parcel apps and run them secquentially.
   */

  // TODO: uncomment next line.
  //   await build(pkgs);

  // 2. Publish
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

  // 3. Tag and Push

  /**
   * Our final list will includes only packages that published on NPM.
   * If a package failed on making changelog, github release, ...
   * We are considering it's published and should handle those cases manually.
   */
  const listPkgsForTag = state.list().filter((pkg) => {
    const isPublishedOnNpm = !!state.getState(pkg.name, 'npmVersion');
    return isPublishedOnNpm;
  });

  await publishCommitAndTags(listPkgsForTag);
  await pushToRemote();

  // 4. Report
  console.log('Report:');
  console.table(
    next.map((pkgState) => ({
      name: pkgState.package.name,
      version: pkgState.package.version,
    }))
  );
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
