const pkgDelimiter = ',';
const versionDelimiter = '__';

/**
 *
 * @param {import("../common/typedefs.mjs").Package[]} pkgs
 */
export function serializePkgs(pkgs) {
  return pkgs.map((pkg) => `${pkg.name}__${pkg.version}`).join(',');
}

/**
 *
 * @param {string} input
 * @example @yeager-dev/widget-embedded__v1.0.0,@yeager-dev/widget-embedded__v1.0.0
 */
export function deserializePkgs(input) {
  const pkgs = input
    .split(pkgDelimiter)
    .filter(Boolean)
    .map((pkg) => pkg.split(versionDelimiter))
    .filter((result) => result.length === 2);
  return pkgs.map((pkg) => ({
    name: pkg[0],
    version: pkg[1],
  }));
}
