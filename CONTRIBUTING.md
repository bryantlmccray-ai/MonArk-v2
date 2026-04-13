# Contributing to MonArk

Thank you for contributing to MonArk! This document outlines the conventions
we follow to keep our commit history clean, readable, and automatable.

---

## Commit Message Convention

We use **[Conventional Commits](https://www.conventionalcommits.org/)** — a
lightweight standard that makes the history scannable and makes it trivial to
understand what changed, why, and in which part of the app.

### Format

```
<type>(<scope>): <short summary>

[optional body]

[optional footer]
```

- The **summary** must be in the imperative mood ("add feature", not "added feature")
- The **summary** must be lowercase after the colon
- The **summary** must not end with a period
- The **body** is optional but strongly encouraged for non-trivial changes
- Keep the summary under **72 characters**

---

### Types

| Type | When to use |
|------|-------------|
| `feat` | A new feature or capability |
| `fix` | A bug fix |
| `refactor` | Code change that is neither a fix nor a feature |
| `perf` | A change that improves performance |
| `style` | Formatting, whitespace, missing semicolons — no logic change |
| `test` | Adding or updating tests |
| `docs` | Documentation only changes (including this file) |
| `chore` | Build scripts, CI config, dependency bumps |
| `revert` | Reverts a previous commit |

---

### Scopes

Use the scope to identify **which part of the app** changed.
Common scopes for MonArk:

| Scope | Area |
|-------|------|
| `auth` | Authentication flow, `useAuth`, session handling |
| `subscription` | `useSubscription`, paywall, feature gating |
| `discover` | Discover Mode, `useDiscover` |
| `rif` | Relational Intelligence Framework |
| `matching` | Sunday matches, curated matches, dating pool |
| `chat` | Messaging, conversations, typing indicators |
| `journal` | Date journal, after-date feedback |
| `onboarding` | Onboarding flow and steps |
| `profile` | Profile creation and editing |
| `admin` | Admin dashboard, curation, analytics |
| `landing` | Public landing page |
| `splash` | Splash screen |
| `ai` | AI companion chat, date concierge, match curator |
| `edge` | Supabase edge functions |
| `db` | Migrations, RLS policies, schema changes |
| `ci` | GitHub Actions workflows |
| `deps` | Dependency updates |
| `ui` | Shared UI components, design tokens |

---

### Examples

**Good:**
```
feat(discover): add server-side daily cap enforcement via DB count

fix(subscription): optimistic hasFeature during loading to prevent flash

fix(rif): normalize DECIMAL(3,2) scores to 0-100 before display

feat(admin): add curation_decisions table and admin override flag

chore(deps): bump @supabase/supabase-js to 2.50.0

docs(contributing): add commit message convention guide
```

**Avoid:**
```
Changes                          # too vague
Work in progress                 # never commit WIP to main directly
Fix 5 bugs at once               # each fix should be its own commit
Preceding changes                # meaningless
fix stuff                        # no scope, no detail
Updated                          # no type, no scope, no detail
```

---

### Breaking Changes

If a commit introduces a breaking change, add `!` after the type/scope and
include a `BREAKING CHANGE:` footer:

```
feat(auth)!: remove legacy session cookie support

BREAKING CHANGE: Sessions are now PKCE-only. Any clients relying on
the old cookie-based session will need to re-authenticate.
```

---

## Branch Naming

| Pattern | Example |
|---------|---------|
| `feat/<short-description>` | `feat/server-side-discover-cap` |
| `fix/<short-description>` | `fix/rif-score-normalization` |
| `refactor/<short-description>` | `refactor/useSubscription-optimistic-load` |
| `chore/<short-description>` | `chore/bump-supabase-client` |

---

## Pull Request Guidelines

- Title should follow the same Conventional Commits format as the commit message
- Link any related issue in the PR body
- Keep PRs focused — one feature or fix per PR
- All admin/backend changes require a brief description of RLS or security impact

---

## Development Setup

See [DEVELOPER_HANDOFF.md](./DEVELOPER_HANDOFF.md) for the full local dev setup guide.
