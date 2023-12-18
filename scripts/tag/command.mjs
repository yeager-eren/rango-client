import { publishTags } from '../common/git.mjs';

const pkgDelimiter = ',';
const versionDelimiter = '__';

async function run() {
  // e.g.: @yeager-dev/widget-embedded__v1.0.0,@yeager-dev/widget-embedded__v1.0.0
  const pkgsNameAndVersion = process.env.PKGS;
  if (!pkgsNameAndVersion) {
    throw new Error('There is no `PKGS` in enviroments.');
  }

  // Turn `pkgsNameAndVersion` into `[ ['pkg_name', 'version'] ]`
  const pkgs = pkgsNameAndVersion
    .split(pkgDelimiter)
    .filter(Boolean)
    .map((pkg) => pkg.split(versionDelimiter))
    .filter((result) => result.length === 2);
  const input = pkgs.map((pkg) => ({
    name: pkg[0],
    version: pkg[1],
  }));
  console.log({ input });

  await publishTags(input);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
