import { execa } from 'execa';
import { GitError } from './errors.mjs';
import { detectChannel } from './github.mjs';
import { generateTagName, workspacePackages } from './utils.mjs';

export async function isReleaseTagExistFor(pkg) {
  const tag = generateTagName(pkg);

  const result = await execa('git', ['tag', '-l', tag])
    .then((result) => result.stdout)
    .catch((err) => {
      throw new GitError(
        `An error occured on getting tags \n ${err.message} \n ${err.stderr}`
      );
    });

  const isExist = !!result;
  return isExist;
}

/**
 *
 * @param {import('./typedefs.mjs').Package} pkg
 * @returns {Promise<string | null>}
 */
export async function gitTagFor(pkg) {
  const tagExist = await isReleaseTagExistFor(pkg);

  if (tagExist) {
    const tagName = generateTagName(pkg);
    return tagName;
  }

  return null;
}

/**
 * Get git tags for a list of packages
 * @deprecated
 *
 * @param {Array<import("./typedefs.mjs").Package>} packages
 * @returns {Promise<Array<import("./typedefs.mjs").PackageAndTag>>}
 *
 */
export async function gitTagsFor(packages) {
  const result = packages.map((pkg) => {
    return isReleaseTagExistFor(pkg).then((tagExist) => {
      if (tagExist) {
        const tagName = generateTagName(pkg);

        return {
          package: pkg,
          tag: {
            tagName,
          },
        };
      }

      return {
        package: pkg,
        tag: null,
      };
    });
  });

  return await Promise.all(result);
}

// TODO: Check for when there is no tag.
/**
 *
 * @param {boolean} useTag - if true, we looking up for a git relase tag, if not, we use commit message.
 * @returns {Promise<string>} commit hash
 */
export async function getLastReleasedHashId(useTag = false) {
  if (useTag) {
    const { stdout: hash } = await execa('git', [
      'rev-list',
      '--max-count',
      1,
      '--tags',
    ]);
    return hash.toString();
  } else {
    const { stdout: hash } = await execa('git', [
      'log',
      '--grep',
      '^chore(release): publish',
      '-n',
      1,
      '--pretty=format:%H',
    ]);
    return hash.toString();
  }
}

/**
 * Returns a list of changed packages since an specific commit.
 *
 * @param {string} since - commit hash
 * @returns {Promise<import('./typedefs.mjs').Package>}
 */
export async function changed(since) {
  const pkgs = await workspacePackages();
  const all = await Promise.all(
    pkgs.map((pkg) => {
      let command = ['log', `${since}..HEAD`, '--oneline', '--', pkg.location];
      if (!since) {
        command = ['log', '--oneline', '--', pkg.location];
      }

      return execa('git', command).then(({ stdout: result }) => {
        console.log({ command, result });
        return {
          ...pkg,
          changed: !!result,
        };
      });
    })
  );

  // Kepp only changed packages and then clean up the object to remove `changed` property.
  return all.filter((pkg) => pkg.changed).map(({ changed, ...pkg }) => pkg);
}

/**
 * Getting changed packages by passing a distribution channel name.
 *
 * @param {'prod' | 'next'} channel
 * @returns {Promise<Array<import("./typedefs.mjs").Package>>}
 */
export async function getChangedPackagesFor(channel) {
  // Detect last release and what packages has changed since then.
  const useTagForDetectLastRelease = channel === 'prod';
  const baseCommit = await getLastReleasedHashId(useTagForDetectLastRelease);

  console.log({ channel, useTagForDetectLastRelease, baseCommit });
  const changedPkgs = await changed(baseCommit);

  return changedPkgs;
}

/**
 * Tagging and create a publish commit.
 *
 * @param {import('./typedefs.mjs').Package[]} pkgs
 * @param {string} options.subject - Commit subject
 *
 */
export async function publishCommitAndTags(pkgs) {
  const skipGitTagging = detectChannel() !== 'prod';
  const subject = 'chore(release): publish\n\n';
  const tags = pkgs.map(generateTagName);

  const list = tags.map((tag) => `- ${tag}`).join('\n');
  const message = subject + list;

  // Making a publish commit
  const output = await execa('git', [
    'commit',
    '-m',
    message,
    '-m',
    `Affected packages: ${tags.join(',')}`,
  ]).catch((error) => {
    throw new GitError(`git commit failed. \n ${error.stderr}`);
  });

  // Creating annotated tags based on packages
  if (!skipGitTagging) {
    const commitId = await getLastCommitId();

    console.log({ commitId });
    console.log({ err: output.stderr });
    console.log({ out: output.stdout });

    const tempCommand = await execa('git', ['log', '-n', 3]);
    console.log({
      tempLog: tempCommand.stdout,
    });

    const res = await Promise.all(
      tags.map((tag) => {
        console.log({
          command: ['git', 'tag', '-a', tag, '-m', tag, commitId].join(' '),
        });

        return execa('git', ['tag', '-a', tag, '-m', tag, commitId]).catch(
          (error) => {
            throw new GitError(`git tag failed. \n ${error.stderr}`);
          }
        );
      })
    );

    const tempCommand2 = await execa('git', ['log', '-n', 3]);

    console.log({
      tempLog2: tempCommand2.stdout,
    });
    console.log('------------------------------------------------');
    console.log({ err: res.map((r) => r.stderr) });
    console.log(res.map((r) => r.stdout));
    console.log('------------------------------------------------');
  }

  return tags;
}

export async function addFileToStage(path) {
  await execa('git', ['add', path]).catch((e) => {
    throw new GitError(`"git add" failed. ${e.stderr}`);
  });
}

export async function pushToRemote(remote = 'origin') {
  const branch = detectChannel() === 'prod' ? 'main' : 'next';

  const output = await execa('git', [
    'push',
    '--follow-tags',
    '--no-verify',
    '--atomic',
    remote,
    branch,
  ])
    .then(({ stdout }) => stdout)
    .catch((error) => {
      throw new GitError(`git push failed. \n ${error.stderr}`);
    });

  return output;
}

export async function getLastCommitId() {
  const commitId = await execa('git', ['log', '--format=%H', '-n', 1])
    .then(({ stdout }) => stdout)
    .catch((e) => {
      throw new GitError(
        `Getting last commit using git log failed \n ${e.stderr}`
      );
    });

  return commitId;
}
