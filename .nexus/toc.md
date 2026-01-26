# Feature Index

> **Master tracking document for all features in this project.**
>
> Each feature has its own folder in `.nexus/features/<feature-slug>/` containing all related documents (plan, execution, review, notes).

## Features

| Feature | Status | Files | Agents | Last Edited |
| ------- | ------ | ----- | ------ | ----------- |
| [snake](features/snake/) | complete | [plan](features/snake/plan.md), [review](features/snake/review.md) | @product-manager, @architect, @tech-lead, @software-developer, @ux-designer, @visual-designer, @qa-engineer, @security, @devops, @gamer | 2026-01-24 |
| [mamba](features/mamba/) | complete | [plan](features/mamba/plan.md), [execution](features/mamba/execution.md), [review](features/mamba/review.md) | @product-manager, @architect, @tech-lead, @software-developer, @ux-designer, @visual-designer, @qa-engineer, @security, @devops, @gamer | 2026-01-25 |
| [beast](features/beast/) | complete | [plan](features/beast/plan.md), [execution](features/beast/execution.md), [review](features/beast/review.md) | @product-manager, @architect, @tech-lead, @software-developer, @ux-designer, @visual-designer, @qa-engineer, @security, @devops, @gamer | 2026-01-25 |
| [pinspiration](features/pinspiration/) | complete | [plan](features/pinspiration/plan.md), [execution](features/pinspiration/execution.md), [review](features/pinspiration/review.md) | @product-manager, @architect, @tech-lead, @software-developer, @ux-designer, @visual-designer, @qa-engineer, @security, @devops, @gamer | 2026-01-25 |
| [landing-page-ux](features/landing-page-ux/) | complete | [review](features/landing-page-ux/review.md) | @ux-designer, @visual-designer, @software-developer | 2026-01-24 |

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
5. Use `project-execution` prompt to begin implementation

## Workflow Quick Reference

```
Planning    → Creates features/<slug>/plan.md (status: draft)
Execution   → Creates features/<slug>/execution.md (status: in-progress)
Review      → Creates features/<slug>/review.md (status: complete)
Summary     → Updates features/<slug>/summary.md (any status)
Sync        → Reconciles this toc.md with actual work done
```
