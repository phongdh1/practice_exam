# Review Prompt — Admin sidebar Content → Question Bank

Run skill: `bmad-review-adversarial-general` in a **separate session** (no prior chat context). Paste findings back here.

## Scope

One-shot label rename only.

## Changed file

- `packages/ui/src/components/admin-shell.tsx`

## Diff

```diff
-  { id: "content", label: "Content", icon: "edit_note" },
+  { id: "content", label: "Question Bank", icon: "edit_note" },
```

## Notes for reviewer

- Internal nav `id` stays `"content"` (intentional — display label only).
- Route/href still points at `/questions`.
- Check for tests/docs/UI copy that assert the old visible string `"Content"` for this sidebar item.
