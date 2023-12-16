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
  throwIfUnableToProceed,
} from './utils.mjs';
import { publishCommitAndTags, pushToRemote } from '../common/git.mjs';
import { update } from './package.mjs';

async function run() {
  checkEnvironments();

  // 1. Detect affected packages and increase version
  const affectedPkgs = await getAffectedPackages();
  const state = new State(affectedPkgs);

  const updateTasks = affectedPkgs.map((pkg) => {
    return update(pkg).then((pkgState) => {
      state.setState(pkg.name, 'gitTag', pkgState.gitTag);
      state.setState(pkg.name, 'githubRelease', pkgState.githubRelease);
      state.setState(pkg.name, 'npmVersion', pkgState.npmVersion);
      state.setState(pkg.name, 'version', pkgState.version);
    });
  });
  await Promise.all(updateTasks);

  const pkgs = state.list();

  throwIfUnableToProceed(pkgs.map((pkg) => state.getState(pkg.name)));

  // 2. Build all packacges
  /**
   * IMPORTANT NOTE:
   * We are all the libs in parallel, parcel has a limitation on running `parcel` instances.
   * So if you are trying to build multiple parcel apps it goes through some erros. here, for publishing libs
   * We are using esbuild so don't need to do anything.
   * but if we need, the potential solution is filtering parcel apps and run them secquentially.
   */

  // TODO: uncomment next line.
  //   await build(pkgs);

  // 3. Publish
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
    '🏷️ Tagging and commit...',
    `${listPkgsForTag.length} packages for tagging.`
  );
  if (listPkgsForTag.length > 0) {
    await publishCommitAndTags(listPkgsForTag);
    await pushToRemote();
  } else {
    console.log('Skipping...');
  }

  // 5. Report
  console.log('Report:');
  console.table(
    pkgs.map((pkg) => ({
      name: pkg.name,
      ...state.getState(pkg.name),
    }))
  );
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
