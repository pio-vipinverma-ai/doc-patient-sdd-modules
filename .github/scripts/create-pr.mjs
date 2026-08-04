#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

function printUsage() {
  console.log(`Usage: node .github/scripts/create-pr.mjs [options]\n\nOptions:\n  --title <title>           PR title (defaults to "PR for <branch>")\n  --body-file <path>        Path to the PR body markdown file\n  --base <branch>           Base branch to target (default: main)\n  --head <branch>           Head branch to use (default: current branch)\n  --repo <owner/repo>       GitHub repository override\n  --dry-run                 Print the intended gh command without creating the PR\n  --help                    Show this help text`);
}

function parseArgs(argv) {
  const options = {
    title: undefined,
    bodyFile: undefined,
    base: "main",
    head: undefined,
    repo: undefined,
    dryRun: false,
    help: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    switch (arg) {
      case "--title":
        options.title = argv[++index];
        break;
      case "--body-file":
        options.bodyFile = argv[++index];
        break;
      case "--base":
        options.base = argv[++index];
        break;
      case "--head":
        options.head = argv[++index];
        break;
      case "--repo":
        options.repo = argv[++index];
        break;
      case "--dry-run":
        options.dryRun = true;
        break;
      case "--help":
      case "-h":
        options.help = true;
        break;
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

function runCommand(command, args, cwd, allowFailure = false) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });

  if (result.status !== 0 && !allowFailure) {
    const details = [result.stdout, result.stderr].filter(Boolean).join("\n").trim();
    throw new Error(`Command failed: ${command} ${args.join(" ")}\n${details}`);
  }

  return result;
}

function ensureFileExists(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Body file not found: ${filePath}`);
  }
}

function resolveBodyFile(repoRoot, explicitPath, branchName) {
  if (explicitPath) {
    return path.resolve(repoRoot, explicitPath);
  }

  const defaultCandidates = [
    path.join(repoRoot, ".github", "reviewer-notes", `${branchName}-pr.md`),
    path.join(repoRoot, ".github", "reviewer-notes", `${branchName}-review.md`)
  ];

  for (const candidate of defaultCandidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return defaultCandidates[0];
}

function main() {
  const scriptPath = fileURLToPath(import.meta.url);
  const scriptDir = path.dirname(scriptPath);
  const repoRoot = path.resolve(scriptDir, "..", "..");

  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printUsage();
    process.exit(0);
  }

  const headBranch = options.head || runCommand("git", ["rev-parse", "--abbrev-ref", "HEAD"], repoRoot).stdout.trim();
  const bodyFile = resolveBodyFile(repoRoot, options.bodyFile, headBranch.replace(/\//g, "-"));
  ensureFileExists(bodyFile);

  const title = options.title || `PR for ${headBranch}`;

  const ghVersion = runCommand("gh", ["--version"], repoRoot, true);
  if (ghVersion.status !== 0 || !ghVersion.stdout.trim()) {
    throw new Error("GitHub CLI (gh) is not available or not installed.");
  }

  const authStatus = runCommand("gh", ["auth", "status"], repoRoot, true);
  if (authStatus.status !== 0) {
    throw new Error("GitHub CLI is not authenticated. Run gh auth login first.");
  }

  const remoteResult = runCommand("git", ["remote", "get-url", options.repo ? "origin" : "origin"], repoRoot, true);
  if (remoteResult.status !== 0) {
    throw new Error("No GitHub remote named origin was found.");
  }

  const pushResult = runCommand("git", ["push", "--set-upstream", "origin", headBranch], repoRoot, true);
  if (pushResult.status !== 0) {
    throw new Error(`Failed to push branch ${headBranch} to origin.\n${pushResult.stderr || pushResult.stdout}`);
  }

  const prArgs = ["pr", "create", "--base", options.base, "--head", headBranch, "--title", title, "--body-file", bodyFile];
  if (options.repo) {
    prArgs.splice(3, 0, "--repo", options.repo);
  }

  if (options.dryRun) {
    console.log(`[dry-run] gh ${prArgs.join(" ")}`);
    process.exit(0);
  }

  const prResult = runCommand("gh", prArgs, repoRoot);
  const output = [prResult.stdout, prResult.stderr].filter(Boolean).join("\n").trim();
  console.log(output || `Pull request created for ${headBranch}.`);
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
