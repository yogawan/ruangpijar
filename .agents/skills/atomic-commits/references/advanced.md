# Advanced Atomic Commits Patterns

## Interactive Staging

When a single file contains multiple logical changes:

```bash
git add -p path/to/file.ts
```

This allows staging individual hunks (sections) of changes.

## Using Stash for Isolation

Temporarily hide unrelated changes while committing:

```bash
git stash push -m "unrelated work" -- path/to/unrelated/
git add path/to/related/
git commit -m "feat: specific feature"
git stash pop
```

## Splitting a Large Commit

If you already made a large commit and need to split it:

```bash
git reset HEAD~1          # Undo last commit, keep changes
git add specific/files
git commit -m "first logical change"
git add other/files
git commit -m "second logical change"
```

## Handling Dependencies Between Changes

When changes depend on each other, commit in dependency order:

1. Base/shared code first
2. Dependent features second
3. Tests that verify both last

## Verifying Atomicity

After creating commits, verify each is self-contained:

```bash
# Check each commit builds/works independently
git log --oneline -5
git checkout HEAD~2
# verify build works
git checkout -
```

## Conventional Commit Types Reference

| Type       | Description                          |
|------------|--------------------------------------|
| `feat`     | New feature for the user             |
| `fix`      | Bug fix for the user                 |
| `docs`     | Documentation only changes           |
| `style`    | Formatting, missing semicolons, etc. |
| `refactor` | Code change that neither fixes nor adds |
| `perf`     | Performance improvement              |
| `test`     | Adding or correcting tests           |
| `build`    | Build system or external deps        |
| `ci`       | CI configuration changes             |
| `chore`    | Other changes not modifying src/test |
| `revert`   | Reverts a previous commit            |

## Scope Examples

```
feat(auth): add OAuth2 support
fix(api): handle null response from /users
docs(readme): add installation instructions
refactor(utils): extract date formatting
test(cart): add checkout flow tests
```
