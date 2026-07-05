# Widget Capture And Annotation Recipe

This recipe captures the browser behavior Feedy expects from the modal reference widget and full evidence widget.

It exists because a thin text panel can prove the data path, but rich agent-ready feedback depends on correct screenshot and annotation behavior.

## Annotation Mode

Annotation mode must make the real page inspectable.

Required behavior:

- Hide the feedback modal while annotating.
- Remove modal blur, scrim, tint, or backdrop while annotating.
- Keep only a transparent capture layer and a small annotation toolbar.
- Show hover preview before click.
- Use the same target-resolution path for hover preview and committed annotation.

Do not leave the normal modal backdrop active in annotation mode. It makes users annotate a blurred/tinted approximation of the page rather than the actual UI they are reporting.

## Hit Testing

The capture layer must not become the annotation target.

During `elementFromPoint` or `elementsFromPoint`:

1. Temporarily disable pointer events on the full feedback overlay root, not just the visible capture button.
2. Read the underlying DOM target.
3. Restore pointer events immediately.
4. Resolve the low-level target to a meaningful component anchor.

Target resolution order:

1. Explicit app anchors: `[data-feedback-target]`.
2. Controls: `button`, `a[href]`, `input`, `textarea`, `select`, `label`.
3. ARIA and component slots: `[role='button']`, `[role='link']`, `[aria-label]`, `[data-slot]`.
4. Meaningful containers: `article`, `header`, `nav`, `aside`, `section`.
5. Fallback click-area rectangle when no usable target exists.

Avoid selecting tiny SVG/path/span nodes when the user meant the surrounding button, card, row, or section.

## Screenshot Capture

If the UI says "screenshot," Feedy should capture and persist a real bitmap.

Required behavior:

- Capture the page as an image before or during annotation mode.
- Exclude the feedback modal, overlay, capture layer, and toolbar from the bitmap.
- Render the captured bitmap in the modal preview when available.
- Overlay annotation boxes on the captured bitmap.
- Show capture status: capturing, captured, failed.

Recommended browser strategy:

1. Try `modern-screenshot`.
2. Fall back to `html2canvas`.
3. Log or surface diagnostic details when both fail.

Do not treat annotation geometry alone as a screenshot. If no bitmap is captured, label the UI as page annotation or context rather than screenshot capture.

## Screenshot Size Budget

Screenshot payloads should be compressed before submit.

Recommended first-pass budget:

- Max dimensions around `1280x900`.
- JPEG/WebP output.
- Iterative quality reduction.
- Iterative dimension reduction if quality reduction is not enough.
- Keep final `data:image/*` payload below `FEEDY_SCREENSHOT_DATA_URL_MAX_LENGTH`.

If compression cannot bring the screenshot under budget, fail before submit with a clear message.

## Annotation Metadata

DOM-derived annotation labels are untrusted input.

Before submit:

- Trim whitespace.
- Collapse repeated whitespace.
- Fall back to `Selected element` when empty.
- Cap with `sanitizeFeedbackAnnotationLabel`.
- Send annotation notes separately from labels.

Long container text is common when users select cards, sections, tables, or app-shell regions. Do not pass raw `textContent` directly into the contract.

## Validation Errors

Validation failures should show the rejected field path.

Good examples:

- `annotations.0.label: String must contain at most 120 character(s)`
- `screenshot.dataUrl: String must contain at most 5500000 character(s)`

Use `formatZodIssues` or return an equivalent `issues` array from the API. Generic `Invalid input` errors are not enough for implementers to debug capture and annotation payloads.

## Admin Detail Requirements

Feedback detail should show the evidence bundle, not just the original text.

Include:

- Original description.
- Screenshot preview when available.
- Annotation list and notes.
- Technical context: viewport, pixel ratio, language/locale, timezone, capture time, and user agent.
- Staff notes or comments.
- Activity thread for status, priority, complexity, assignment, and roadmap changes.

Staff notes/activity are separate from the original feedback text. They are internal by default and should not be exposed to public/product surfaces without a separate reviewed workflow.
