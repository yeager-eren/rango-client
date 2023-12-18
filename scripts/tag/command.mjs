import { publishTags, pushToRemote } from '../common/git.mjs';
import { deserializePkgs } from './utils.mjs';

const pkgDelimiter = ',';
const versionDelimiter = '__';

async function run() {
  const pkgsNameAndVersion = process.env.PKGS;
  if (!pkgsNameAndVersion) {
    throw new Error('There is no `PKGS` in enviroments.');
  }

  // Turn `pkgsNameAndVersion` into `[ ['pkg_name', 'version'] ]`
  const pkgs = deserializePkgs(pkgsNameAndVersion);
  console.log({ pkgs });

  await publishTags(pkgs);
  await pushToRemote();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
