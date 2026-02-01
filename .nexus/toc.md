# Feature Index

> **Master tracking document for all features in this project.**
>
> Each feature has its own folder in `.nexus/features/<feature-slug>/` containing all related documents (plan, execution, review, notes).

## Features

| Feature                      | Status   | Files                                                                                                                                                                                                                                                                                                                                             | Agents                                                                                                                                  | Last Edited |
| ---------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| [splashy](features/splashy/) | complete | [plan](features/splashy/plan.md), [execution](features/splashy/execution.md), [review](features/splashy/review.md), [hotfixes](features/splashy/hotfixes/2025-01-28-confetti-persist.md), [hotfix-2](features/splashy/hotfixes/2026-01-28-palette-overflow.md), [hotfix-3](features/splashy/hotfixes/2026-02-01-duplicate-clicks-locked-cells.md) | @product-manager, @architect, @ux-designer, @visual-designer, @gamer, @software-developer, @tech-lead, @qa-engineer, @security, @devops | 2026-02-01  |

<!--
USAGE:

When adding a new feature, add a row to the table above:

| [feature-name](features/<slug>/) | draft | [plan](features/<slug>/plan.md) | @architect, @dev | YYYY-MM-DD |

STATUS VALUES:
- `draft` - Plan created, work not started
- `in-progress` - Currently being implemented
- `review` - Implementation complete, under review
- `complete` - Reviewed and finished
- `on-hold` - Paused, not actively worked on
- `archived` - No longer relevant

FILES column: Comma-separated list of documents that exist for this feature
- plan, execution, review, summary, notes/*

AGENTS column: List all agents who contributed using @mentions
- @architect, @software-developer, @qa-engineer, etc.

LAST EDITED: Date of most recent change to any document in the feature folder
-->

## Quick Links

- **Templates**: [.nexus/templates/](templates/) - Document templates for new features
- **Memory**: [.nexus/memory/](memory/) - Agent preference files
- **Workflows**: [.github/prompts/](../.github/prompts/) - Workflow prompts

## Status Legend

| Status        | Icon | Meaning                                    |
| ------------- | ---- | ------------------------------------------ |
| `draft`       | 📝   | Plan created, implementation not started   |
| `in-progress` | 🔄   | Actively being implemented                 |
| `review`      | 🔍   | Implementation complete, under code review |
| `complete`    | ✅   | Reviewed, tested, and finished             |
| `on-hold`     | ⏸️   | Temporarily paused                         |
| `archived`    | 📦   | No longer active/relevant                  |

## Adding a New Feature

1. Create folder: `.nexus/features/<feature-slug>/`
2. Copy template: `cp .nexus/templates/plan.template.md .nexus/features/<slug>/plan.md`
3. Add row to table above
4. Fill out the plan document
5. Use `nexus-execution` prompt to begin implementation

## Workflow Quick Reference

```
Planning    → Creates features/<slug>/plan.md (status: draft)
Execution   → Creates features/<slug>/execution.md (status: in-progress)
Review      → Creates features/<slug>/review.md (status: complete)
Summary     → Updates features/<slug>/summary.md (any status)
Sync        → Reconciles this toc.md with actual work done
```
