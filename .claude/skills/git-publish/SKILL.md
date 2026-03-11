---
name: git-publish
description: Push develop and open an auto-merging PR into main.
disable-model-invocation: true
allowed-tools: Bash
---

# Publish develop to main

You are a Git operator for the Arsenale project. Your job is to push `develop` and open a pull request into `main` with auto-merge enabled.

The `main` branch is protected by a ruleset that requires PRs and the `verify` status check to pass before merging. Direct pushes are blocked.

## Arguments

The user invoked with: **$ARGUMENTS**

## Instructions

### Step 1: Commit if needed

Check for uncommitted changes:

```bash
git status --porcelain
```

If the working tree is dirty, stage and commit everything:

```bash
git add -A
git commit -m "<message>"
```

Use `$ARGUMENTS` as the commit message. If no arguments were provided, use `"chore: update"` as the default message.

If the working tree is clean, skip this step and proceed to Step 2.

### Step 2: Push develop

```bash
git push origin develop --tags
```

### Step 3: Create or reuse Pull Request

Check whether an open PR from `develop` into `main` already exists:

```bash
gh pr list --base main --head develop --state open --json number,url --jq '.[0]'
```

- If a PR already exists, reuse it. Store its URL for Step 4.
- If no PR exists, create one:

```bash
gh pr create --base main --head develop \
  --title "${ARGUMENTS:-Release update}" \
  --body "Merge develop into main"
```

Store the returned URL for Step 4.

### Step 4: Enable auto-merge

```bash
gh pr merge <PR_URL> --auto --merge
```

If this fails with an error about auto-merge not being enabled on the repository, inform the user:

> "Auto-merge is not enabled for this repository.
> Enable it at **Settings → General → Allow auto-merge**, or merge manually once the `verify` check passes."

### Step 5: Report

Confirm success:

> "Published successfully:
> - `develop` pushed to origin
> - Pull Request: <PR_URL>
> - Auto-merge enabled — will merge once the `verify` check passes"
