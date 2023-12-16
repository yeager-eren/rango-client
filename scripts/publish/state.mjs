import { githubReleasesFor, detectChannel } from '../common/github.mjs';
import { getChangedPackagesFor, gitTagsFor } from '../common/git.mjs';
import { analyzeChangesEffects } from '../common/repository.mjs';
import { should } from '../common/features.mjs';
import { npmVersionsFor } from '../common/npm.mjs';
import {
  increaseVersionForNext,
  increaseVersionForProd,
} from '../common/version.mjs';
import { UnableToProceedPublishError } from '../common/errors.mjs';
import { update } from './package.mjs';

/**
 *
 * NOTE: For publish, we only consider `private: false` packages (client will not be included)
 */
export async function state() {
  const current = await getLocalState();
  const next = await getNextState(current);

  return {
    current: current,
    next: next,
  };
}

/**
 *  @deprecated
 * @returns {Promise<Array<import('./typedefs.mjs').PackageState>>}
 */
async function getLocalState() {
  const channel = detectChannel();
  // the source code for these packages have been updated.
  const onlyChangedPackages = await getChangedPackagesFor(channel);
  // changes will affect other packages as well, this is the full list.
  const allAffectedPackages = await analyzeChangesEffects(onlyChangedPackages);
  const targetPackages = allAffectedPackages.filter((pkg) => !pkg.private);

  return targetPackages.map((pkg) => {
    return {
      package: pkg,
      // NOTE: we don't check release and tags for the first state (local), to be avoid unneccary works, we are returning null here.
      release: null,
      tag: null,
      npm: null,
    };
  });
}

/**
 *
 * @param {Array<import('./typedefs.mjs').PackageState>} localStates
 * @returns {Promise<Array<import('./typedefs.mjs').PackageState>>}
 */
async function getNextState(localStates) {
  const channel = detectChannel();
  const currentPackages = localStates.map((pkgState) => pkgState.package);
  // Increase packages version
  const nextPackages = await Promise.all(
    currentPackages.map((pkg) =>
      channel === 'prod'
        ? increaseVersionForProd(pkg)
        : increaseVersionForNext(pkg)
    )
  );

  const tags = should('checkGitTags') ? await gitTagsFor(nextPackages) : null;
  const releases = should('checkGithubRelease')
    ? await githubReleasesFor(packages)
    : null;
  const npmPackages = should('checkNpm')
    ? await npmVersionsFor(nextPackages)
    : null;

  return nextPackages.map((pkg) => {
    const release =
      releases?.find((release) => release.package.name === pkg.name).release ||
      null;
    const tag = tags?.find((tag) => tag.package.name === pkg.name).tag || null;
    const npmPackage =
      npmPackages?.find((npmPkg) => {
        return npmPkg.package.name === pkg.name;
      }) || null;

    return {
      package: pkg,
      release: release,
      tag: tag,
      npm: npmPackage && npmPackage.npm ? npmPackage.npm[channel] : null,
    };
  });
}

/**
 *
 * @param {import('./typedefs.mjs').PackageState[]} current
 * @param {import('./typedefs.mjs').PackageState[]} next
 */
export function throwIfUnableToProceed(current, next) {
  const channel = detectChannel();

  if (channel === 'prod') {
    // TODO: it's better to check `npm` version should be less than `package.version`
    const alreadyPublishedPackages = next.filter(
      (pkgState) => pkgState.package.version === pkgState.npm
    );
    const alreadyHasGithubReleasePackages = next.filter(
      (pkgState) => !!pkgState.release
    );
    const alreadyHasGitTagPackages = next.filter((pkgState) => !!pkgState.tag);

    if (alreadyPublishedPackages.length) {
      const list = alreadyPublishedPackages.map((pkg) => pkg.npm).join(',');
      throw new UnableToProceedPublishError(
        `These packages have been published on NPM already. \n ${list}`
      );
    } else if (alreadyHasGithubReleasePackages.length) {
      const list = alreadyHasGithubReleasePackages
        .map((pkg) => pkg.npm)
        .join(',');
      throw new UnableToProceedPublishError(
        `These packages have been released on Github before. \n ${list}`
      );
    } else if (alreadyHasGitTagPackages.length) {
      const list = alreadyHasGithubReleasePackages
        .map((pkg) => pkg.npm)
        .join(',');
      throw new UnableToProceedPublishError(
        `These packages have git tags. \n ${list}`
      );
    }
  }
}

export class State {
  /** @type {import('../common/typedefs.mjs').Package[]}  */
  pkgs = [];
  /** @type {Object.<string, import('./typedefs.mjs').PackageState>}  */
  state = {
    // 'pkg.name': {
    //   version: '1.0.0',
    //   gitTag: '...',
    //   githubRelease: '...',
    //   npmVersion: '...',
    // },
  };

  /** @param {import('../common/typedefs.mjs').Package[]} pkgs */
  constructor(pkgs) {
    this.pkgs = pkgs;
  }

  toJSON() {
    const output = {
      pkgs: this.pkgs,
      state: this.state,
    };

    return JSON.stringify(output);
  }

  /**
   * try to update affected packages
   */
  async update() {
    // TODO: use throwIfUnableToProceed.
    const updateTasks = this.pkgs.map((pkg) => {
      return update(pkg).then((pkgState) => {
        this.setState(pkg.name, 'gitTag', pkgState.gitTag);
        this.setState(pkg.name, 'githubRelease', pkgState.githubRelease);
        this.setState(pkg.name, 'npmVersion', pkgState.npmVersion);
        this.setState(pkg.name, 'version', pkgState.version);
      });
    });

    await Promise.all(updateTasks);
  }

  /**
   *
   * Get packages in state with latest version.
   *
   */
  list() {
    return this.pkgs.map((pkg) => {
      return {
        ...pkg,
        version: this.getState(pkg.name, 'version'),
      };
    });
  }

  // rollback(pkg, actions) {
  //   const version = this.getState(pkg.name, 'version');
  //   const gitTag = this.getState(pkg.name, 'gitTag');
  //   const githubRelease = this.getState(pkg.name, 'githubRelease');
  //   const npmVersion = this.getState(pkg.name, 'npmVersion');

  //   if (!npmVersion) {
  //     if (!actions.onNpm) {
  //       console.warn('`onNpm` should be defined for rollback.');
  //     }
  //   } else if (!githubRelease) {
  //   } else {
  //     console.log('Unhandled state.', this.toJSON());
  //   }
  // }

  // finalize() {
  //   // git publish commit
  //   // git tags
  //   // git push
  // }

  /**
   *
   * @param {string} pkgName
   * @param {"gitTag" | "githubRelease" | "npmVersion" | "version"} name
   */
  getState(pkgName, name) {
    if (!this.state[pkgName]) {
      return undefined;
    }

    return this.state[pkgName][name];
  }

  /**
   *
   * @param {string} pkgName
   * @param {"gitTag" | "githubRelease" | "npmVersion" | "version"} name
   * @param {string} value
   */
  setState(pkgName, name, value) {
    if (!this.state[pkgName]) {
      this.state[pkgName] = {};
    }

    this.state[pkgName][name] = value;
  }
}
