import { publishTags } from '../common/git.mjs';

const pkgDelimiter = ',';
const versionDelimiter = '__';

async function run() {
  // e.g.: @yeager-dev/widget-embedded__v1.0.0,@yeager-dev/widget-embedded__v1.0.0
  const pkgsNameAndVersion = process.env.PGKS;
  if (!pkgsNameAndVersion) {
    throw new Error('There is no `PGKS` in enviroments.');
  }

  const pkgs = pkgsNameAndVersion.split(pkgDelimiter).filter(Boolean);
  const input = pkgs
    .map((pkg) => pkg.split(versionDelimiter))
    .filter((result) => result.length === 2);

  console.log({ input });

  //   await publishTags();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
