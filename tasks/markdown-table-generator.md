# Task: Implement Markdown Table Generator

## Goal
Add a new tool "Markdown Table Generator" to devtools-hub.

## Requirements
1. **Location**: `app/[locale]/tools/markdown-table-generator/` 
   - `page.tsx` (Server Component with metadata)
   - `client.tsx` (Client Component with logic)
2. **Core Logic**:
   - Input: Textarea for Markdown table syntax or CSV.
   - Output: Live preview of the rendered table.
   - Actions: Copy as Markdown, Copy as HTML, Copy as CSV.
3. **SEO**:
   - Use `generateToolMetadata('markdown-table-generator')` in `page.tsx`.
   - Ensure JSON-LD and hreflang are included (check `lib/metadata.ts`).
4. **i18n**:
   - Add translations for `en`, `zh`, `de`, `pt`, `es`, `ja`, `ko` in `messages/*.json`.
   - Add the tool to `lib/tools.ts` under a suitable category (e.g., "Converters" or "Text").
5. **Testing**:
   - Write Playwright E2E tests in `tests/markdown-table-generator.spec.ts`.
   - Cover: Input parsing, Live preview update, Copy buttons functionality.
6. **Design**:
   - Follow the existing design system (green accent, card layout).
   - Mobile responsive.

## Implementation Steps (TDD)
1. Write failing tests first.
2. Implement `client.tsx` and `page.tsx`.
3. Add translations and tool registry.
4. Run tests until green.
5. Build and verify (`pnpm build`).
6. Commit and push.
