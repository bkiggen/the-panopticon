# Sync education class markdown → classes.ts

The markdown files in `client/src/pages/Education/data/` are the source of truth for class content. This command syncs one or all of them into `classes.ts`.

## Files

- Source: `client/src/pages/Education/data/class-01-pontecorvo-ogro.md` (and future `class-02-*.md` etc.)
- Target: `client/src/pages/Education/data/classes.ts`

## Markdown format

Each file has a YAML frontmatter block followed by sections:

```
---
id: pontecorvo-ogro
number: "01"
title: "Pontecorvo's Ogro"
subtitle: and the Question of Political Violence
film: Ogro
director: Gillo Pontecorvo
year: "1979"
teaser: > (multiline)
posterSrc: "https://..."   ← optional; omit or leave empty for placeholder
---

## I — Section Title [optional timing in brackets]

- Top-level item with no children → plain text bullet (no accordion)
- Top-level item with children → accordion header
  - Child item → plain text inside accordion
  - Child with its own children → nested accordion
    - Grandchild → plain text inside nested accordion
- Embed: https://www.youtube.com/watch?v=VIDEO_ID  → YouTube iframe
- Image: /images/file.jpg  → inline image (local or external URL)
```

## Mapping rules (markdown → TypeScript)

| Markdown | TypeScript |
|---|---|
| `## numeral — Title [timing]` | `OutlineSection { id, numeral, title, timing?, items[] }` |
| `- text` (no sub-bullets) | `OutlineItem { text }` (no `items`) |
| `- text` (has sub-bullets) | `OutlineItem { text, items[] }` |
| `  - child` (no sub-bullets) | `OutlineItem { text }` nested inside parent |
| `  - child` (has sub-bullets) | `OutlineItem { text, items[] }` nested inside parent |

Nesting is purely structural — items with children become accordions, items without become plain text. Depth can go arbitrarily deep.

Section `id` is derived from the numeral/title. Use the existing id values in `classes.ts` for continuity; for new sections, generate a short kebab-case string from the title.

Timing in brackets after the title (e.g. `[5–7 min]`) maps to `timing?: string` on the section.

## What to do

1. Read the markdown file(s) that changed
2. Read the current `classes.ts`
3. For each changed class: replace its entry in the `classes` array with a freshly parsed version from the markdown
4. Preserve the TypeScript interfaces and any classes not being synced
5. Commit with message: `sync class [number] from markdown source`

Only sync sections that exist in the markdown. If sections were removed from the markdown, remove them from `classes.ts` too — the markdown is the authority.
