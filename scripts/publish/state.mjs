import { update } from './package.mjs';

/**
 *
 * NOTE: For publish, we only consider `private: false` packages (client will not be included)
 */

export class State {
  /** @type {import('../common/typedefs.mjs').Package[]}  */
  pkgs = [];
  /** @type {Object.<string, import('./typedefs.mjs').PackageState>}  */
  state = {};

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
   *
   * Get packages in state **with latest version**.
   *
   * @returns {import('../common/typedefs.mjs').Package[]}
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
   * @param {"gitTag" | "githubRelease" | "npmVersion" | "version" | undefined} name
   */
  getState(pkgName, name) {
    if (!this.state[pkgName]) {
      return undefined;
    }

    // Return whole state
    if (!name) {
      return this.state[pkgName];
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
