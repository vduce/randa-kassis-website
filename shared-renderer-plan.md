# Shared Markdown Renderer Plan

## Objective

Create a shared rendering system so the admin editor preview matches the actual site pages (95%+ accuracy) without duplicating code or affecting existing functionality.

---

## Current State

### Editor Preview (`MarkdownPreview.js`)

- Basic markdown rendering with `react-markdown`
- Simple image path replacement for CDN
- No gallery, PDF viewer, or media buffering

### Site Components (e.g., `EdSingle.jsx`, `MyStory.js`)

- Rich rendering with `PhotoGalleryEd` for image galleries
- `PdfViewer` for PDF documents
- Media buffering logic (groups consecutive images)
- Custom paragraph handling
- Category-specific CDN paths

---

## Proposed Solution

### New Shared Module: `src/utils/markdownRenderer.js`

A utility that provides category-specific markdown component configurations.

```
src/utils/
  └── markdownRenderer.js    # Shared rendering logic
```

### What It Exports

```javascript
// Returns the `components` object for react-markdown
export const getMarkdownComponents = (categoryKey, options = {}) => {
  // Returns { img, p, a, ... } handlers based on category
};

// Returns CDN paths for a category
export const getCategoryPaths = (categoryKey) => {
  // Returns { photos, pdfs, content } paths
};
```

---

## Implementation Steps

### Step 1: Create Shared Renderer Utility

Create `src/utils/markdownRenderer.js` with:

- `getMarkdownComponents(categoryKey, options)` - Returns component handlers
- `getCategoryPaths(categoryKey)` - Returns CDN paths
- Internal media buffering logic (extracted from EdSingle)

### Step 2: Update MarkdownPreview.js

Replace current simple rendering with:

```javascript
import { getMarkdownComponents } from "../../utils/markdownRenderer";

// Use shared components
const components = getMarkdownComponents(category?.key, { isPreview: true });
```

### Step 3: Refactor Site Components (One at a Time)

Update each component to use shared renderer:

1. `EdSingle.jsx` (encounters)
2. `MyStory.js`
3. `Paintings.js`
4. `ExibitionMoments.js`
5. Others as needed

Each refactor:

```javascript
import { getMarkdownComponents } from "../../utils/markdownRenderer";

// Replace inline components object with:
const components = getMarkdownComponents("encounters");
```

---

## Category Mapping

| Category Key             | Component        | CDN Photos Path                      | CDN PDFs Path                      |
| ------------------------ | ---------------- | ------------------------------------ | ---------------------------------- |
| `encounters`             | EdSingle         | `/encounters/photos`                 | `/encounters/pdfs`                 |
| `story`                  | MyStory          | `/mystory/photos`                    | `/mystory/pdf`                     |
| `paintings`              | Paintings        | `/paintings/photos`                  | -                                  |
| `exhibitions`            | ExibitionMoments | `/exhibitions/photos`                | `/exhibitions/pdfs`                |
| `interviews_politicians` | -                | `/interviews/politicians/photos`     | `/interviews/politicians/pdfs`     |
| `interviews_painters`    | -                | `/interviews/painters/photos`        | `/interviews/painters/pdfs`        |
| `interviews_critics`     | -                | `/interviews/essayistcritics/photos` | `/interviews/essayistcritics/pdfs` |
| `articles`               | -                | `/articles/photos`                   | -                                  |

---

## Options Parameter

The `getMarkdownComponents` function accepts options:

```javascript
{
  isPreview: boolean,      // true = editor preview, false = real page
  onNavigate: function,    // Custom navigation handler (for .md links)
  disableLightbox: boolean // Disable gallery lightbox in preview
}
```

This allows slight behavior differences without duplicating code.

---

## Safety Measures

### 1. No Breaking Changes to Existing Pages

- Refactor one component at a time
- Test each component after refactor
- Keep original code commented until verified

### 2. Backward Compatibility

- If `categoryKey` is unknown, fall back to basic rendering
- Graceful handling of missing CDN paths

### 3. Testing Checklist (Per Component)

- [ ] Images render correctly with CDN paths
- [ ] Multiple consecutive images group into gallery
- [ ] PDFs render with PdfViewer
- [ ] Text paragraphs render normally
- [ ] Links work (internal .md links, external links)
- [ ] No console errors

---

## File Changes Summary

| File                                                      | Change Type | Description            |
| --------------------------------------------------------- | ----------- | ---------------------- |
| `src/utils/markdownRenderer.js`                           | **NEW**     | Shared rendering logic |
| `src/components/admin/MarkdownPreview.js`                 | MODIFY      | Use shared renderer    |
| `src/components/EncounterAndDialogue/EdSingle.jsx`        | MODIFY      | Use shared renderer    |
| `src/main-component/MyStory/MyStory.js`                   | MODIFY      | Use shared renderer    |
| `src/main-component/Paintings/Paintings.js`               | MODIFY      | Use shared renderer    |
| `src/main-component/ExhibitionMoment/ExibitionMoments.js` | MODIFY      | Use shared renderer    |

---

## Rollout Order

1. **Phase 1**: Create `markdownRenderer.js` + Update `MarkdownPreview.js`
   - Test editor preview works for all categories
2. **Phase 2**: Refactor `EdSingle.jsx`
   - Test encounters page works identically
3. **Phase 3**: Refactor remaining components one by one
   - Test each after refactor

---

## What Won't Match 100%

These elements are outside markdown rendering and won't be in preview:

- Page header/navbar
- Page title banner
- Previous/Next navigation buttons
- Back button
- Overall page layout/container

This is acceptable since the focus is on **content rendering accuracy**.

---

## Approval

- [ ] Plan reviewed
- [ ] Ready to proceed with Phase 1
