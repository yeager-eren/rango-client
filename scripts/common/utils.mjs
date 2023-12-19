import path from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';
import { join } from 'path';
import { execa } from 'execa';
import process from 'node:process';
import { NPM_ORG_NAME } from './constants.mjs';

const root = join(printDirname(), '..', '..');

export function printDirname() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  return __dirname;
}

/**
 *
 * @returns {Promise<import('./typedefs.mjs').Package[]>}
 */
export async function workspacePackages() {
  const { stdout } = await execa('yarn', ['workspaces', 'info']);
  const result = JSON.parse(stdout);
  const packagesName = Object.keys(result);
  const output = packagesName.map((name) => {
    const pkgJson = packageJson(result[name].location);
    return {
      name,
      location: result[name].location,
      version: pkgJson.version,
      private: pkgJson.private || false,
    };
  });
  return output;
}

export function packageJson(location) {
  const fullPath = join(root, location, 'package.json');
  const file = readFileSync(fullPath);
  return JSON.parse(file);
}

/**
 * Getting a name and returns info related to that package name.
 *
 * @param {string[]} names Package names for getting information about.
 * @returns {Promise<import('./typedefs.mjs').Package[]>}
 */
export async function packageNamesToPackagesWithInfo(names) {
  const allPackages = await workspacePackages();
  const packages = [];
  names.forEach((pkgName) => {
    const packageInWorkspace = allPackages.find((pkg) => pkg.name === pkgName);
    if (!!packageInWorkspace) {
      packages.push(packageInWorkspace);
    }
  });

  return packages;
}

/*
  Convert:
  @hello-wrold/a-b -> a-b
*/
export function packageNameWithoutScope(name) {
  return name.replace(/@.+\//, '');
}

// we are adding a fallback, to make sure predefiend VERCEL_PACKAGES always will be true.
export function getEnvWithFallback(name) {
  return process.env[name] || 'NOT SET';
}

/**
 *
 * @param {import('./typedefs.mjs').Package} pkg
 * @returns
 */
export function generateTagName(pkg) {
  return `${packageNameWithoutScope(pkg.name)}@${pkg.version}--test`;
}

export function tagNameToPkgName(pkgNameWithoutScope) {
  return `${NPM_ORG_NAME}/${pkgNameWithoutScope}`;
}
