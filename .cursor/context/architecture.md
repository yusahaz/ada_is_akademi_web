# Architecture

## Approach

- Component-based architecture
- Mobile-first responsive system
- Progressive enhancement mindset

## Structure

/src
/components
/layouts
/pages
/hooks
/utils
/features
/styles
/icons

---

## Principles

- Reusability first
- Separation of concerns
- No duplicated logic
- Backward-compatible evolution (do not break existing pages)

---

## State Strategy

- Local state first
- Global only when necessary
- Keep UI state close to component tree

---

## Styling

- Tailwind CSS (preferred)
- Utility-first approach
- Token-driven spacing/typography for consistency

---

## Naming

- Components: PascalCase
- Functions: camelCase
- Files: kebab-case
- Hooks: useXyz

---

## Rules

- Do not create one-off components
- Always think scalable
- New feature must not regress existing screens
- New component APIs should remain simple and composable
