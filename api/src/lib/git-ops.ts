import { simpleGit } from 'simple-git'
import { env } from '../env.js'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getGit() {
  const git = simpleGit(env.REPO_ROOT, {
    config: [
      `user.name=${env.GIT_USER_NAME}`,
      `user.email=${env.GIT_USER_EMAIL}`,
    ],
  })
  return git
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface GitLogEntry {
  hash: string
  shortHash: string
  message: string
  author: string
  email: string
  date: string       // ISO-8601
  filesChanged: string[]
}

export interface GitStatus {
  branch: string
  ahead: number
  behind: number
  staged: string[]
  unstaged: string[]
  untracked: string[]
}

export interface CommitResult {
  hash: string
  message: string
  filesChanged: string[]
}

/**
 * Returns the current git status (branch, ahead/behind, staged/unstaged/untracked).
 */
export async function getStatus(): Promise<GitStatus> {
  const git = getGit()
  const raw = await git.status()

  return {
    branch: raw.current ?? 'unknown',
    ahead: raw.ahead,
    behind: raw.behind,
    staged: raw.staged,
    unstaged: raw.modified.filter((f) => !raw.staged.includes(f)),
    untracked: raw.not_added,
  }
}

/**
 * Returns the last N commits that touched src/content/ (or all files if pathFilter is empty).
 * Uses `git log --name-only` via raw output to reliably capture changed file names.
 */
export async function getLog(
  limit = 20,
  pathFilter = 'src/content',
): Promise<GitLogEntry[]> {
  const git = getGit()

  // Use raw git log with a machine-readable separator so we can parse file lists reliably.
  const SEP = '---ENTRY---'
  const FORMAT = `${SEP}%H%n%an%n%ae%n%aI%n%s`
  const args = [
    'log',
    `--max-count=${limit}`,
    `--format=${FORMAT}`,
    '--name-only',
  ]
  if (pathFilter) args.push('--', pathFilter)

  const raw = await git.raw(args)

  // Split on our separator, filter empty chunks
  const chunks = raw.split(SEP).filter((c) => c.trim())

  return chunks.map((chunk): GitLogEntry => {
    const lines = chunk.split('\n').filter(Boolean)
    const [hash = '', author = '', email = '', date = '', ...rest] = lines

    // rest[0] is the commit message (subject); remaining lines after a blank are file names
    const msgIndex = 0
    const message = rest[msgIndex] ?? ''
    // Files follow after the message (there may be a blank line gap)
    const filesChanged = rest.slice(1).filter(
      (l) => !l.startsWith(' ') && l.length > 0 && l !== message,
    )

    return {
      hash,
      shortHash: hash.slice(0, 8),
      message,
      author,
      email,
      date,
      filesChanged,
    }
  })
}

/**
 * Stages specified files (or all src/content changes if files is empty),
 * commits with the given message, and pushes.
 */
export async function stageAndCommit(
  files: string[],
  message: string,
  authorName: string,
  authorEmail: string,
): Promise<CommitResult> {
  const git = getGit()

  // Configure author explicitly for this commit
  await git.addConfig('user.name', authorName)
  await git.addConfig('user.email', authorEmail)

  if (files.length > 0) {
    await git.add(files)
  } else {
    // Stage all changes within src/content/
    await git.add(['src/content'])
  }

  const status = await git.status()
  if (status.staged.length === 0) {
    throw new Error('Nothing to commit — no staged changes found')
  }

  const commitResult = await git.commit(message)
  await git.push(env.GIT_REMOTE, env.GIT_BRANCH)

  return {
    hash: commitResult.commit,
    message,
    filesChanged: status.staged,
  }
}

/**
 * Pushes the current branch to the configured remote.
 */
export async function push(remote = env.GIT_REMOTE, branch = env.GIT_BRANCH): Promise<void> {
  const git = getGit()
  await git.push(remote, branch)
}

/**
 * Reverts a specific commit (creates a new revert commit) and pushes.
 */
export async function revert(hash: string): Promise<{ revertHash: string; originalHash: string }> {
  const git = getGit()

  // --no-edit: do not open an editor for the revert message
  // simple-git revert takes a commit string; extra flags passed via raw
  await git.raw(['revert', '--no-edit', hash])
  await git.push(env.GIT_REMOTE, env.GIT_BRANCH)

  const log = await git.log({ '--max-count': '1' })
  const revertHash = log.latest?.hash ?? 'unknown'

  return { revertHash, originalHash: hash }
}
