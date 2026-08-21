# Workspace Hygiene And Commit Split Implementation Plan

> For agentic workers: use superpowers:executing-plans to implement this plan task-by-task with verification checkpoints.

**Goal:** Preserve all current user work, move explicitly approved historical/generated material out of the repository into a verified external archive, normalize repository text handling, and split the remaining changes into focused Git commits.

**Architecture:** Treat the current working tree as the source of truth. First create an external, checksummed archive and verify it before removing approved paths. Then make repository-level hygiene changes (.gitattributes, .gitignore, documentation references), audit sensitive/configuration files, and stage changes by ownership boundary: repository hygiene, backend, display-v2, admin-frontend, sjg-datav, scripts/data, and current documentation.

**Tech Stack:** Git, SHA-256 checksums, Vue/Vite, React/Vite, Spring Boot/Maven, existing project tests and build scripts.

---

### Task 1: Capture baseline and archive approved historical material

**Files and paths:**
- Create outside the repository: /mnt/e/Aohs/vibecoding/sjg-new-archive-20260821/
- Archive before removal: repository else/ in full.
- Review for archive/removal after inventory: output/, display-v2/output/, scripts/imagegen/, superseded generator scripts and generated SQL/log artifacts.
- Create outside-repository manifests: MANIFEST.sha256 and ARCHIVE-README.md.

- [x] Record git status --short, git diff --stat, and git diff --cached --stat to an external baseline file.
- [x] Copy the complete else/ tree with metadata preservation to the external archive.
- [x] Generate a sorted SHA-256 manifest for every archived file and verify it immediately.
- [x] Do not remove any source path until the copy exists and checksum verification succeeds.

### Task 2: Remove approved archive-only paths and repair references

**Files:**
- Delete from repository after verification: else/.
- Delete only confirmed generated/intermediate artifacts after dependency search: output/, display-v2/output/, scripts/imagegen/, obsolete generator scripts, duplicate SQL dumps/logs.
- Modify: CLAUDE.md, relevant README/docs, and .gitignore to remove stale repository references and explain external archive ownership without exposing credentials.

- [x] Search runtime code, build scripts, package manifests, and docs for every candidate path.
- [x] Remove only paths with no runtime/build dependency; retain current runtime media and migration assets.
- [x] Replace references to removed local paths with the current source or the external archive manifest.
- [ ] Scan tracked text for credentials and redact/remove secrets from versioned documentation and configuration.

### Task 3: Normalize text line endings and repository ignore policy

**Files:**
- Create: .gitattributes.
- Modify: root .gitignore, backend/.gitignore, admin-frontend/.gitignore, display-v2/.gitignore as needed.
- Normalize tracked text files to LF without changing semantic content.

- [x] Define LF normalization for source, config, docs, scripts, and SQL while keeping binary files binary.
- [ ] Normalize only text files and verify git diff --ignore-space-at-eol contains semantic changes only.
- [ ] Add ignores for dependency folders, build output, local archives, logs, and generated intermediates that are not runtime assets.
- [ ] Run git diff --check and inspect the resulting stat.

### Task 4: Split and verify functional changes

**Commit boundaries:**
1. chore(repo): normalize line endings and repository hygiene
2. chore(repo): archive obsolete assets and backups
3. feat(backend): add public dynasty and event endpoints and migrations
4. feat(display): consolidate themes and add cultural media
5. feat(admin): update management interface
6. feat(datav): update visualization dashboard
7. chore(scripts): maintain current migration and asset tooling
8. docs(repo): refresh current plans and project guidance

- [ ] Stage each boundary explicitly with git add pathspecs; never stage the whole tree blindly.
- [ ] Review git diff --cached before each commit and confirm no unrelated paths are included.
- [ ] Run focused verification before the commit that owns each subsystem.
- [ ] Create commits only after the staged diff and verification are clean.

### Task 5: Final verification and handoff

- [ ] Run display-v2 unit tests and build.
- [ ] Run admin-frontend build.
- [ ] Run sjg-datav build.
- [ ] Run backend tests (and package when the local environment supports it).
- [ ] Run final git diff --check, status, path-reference scan, and sensitive-value scan.
- [ ] Verify every archive manifest checksum again and report archive location, commits, tests, and any residual risk.
