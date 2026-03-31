# Design System Document: The Oasis Aesthetic

## 1. Overview & Creative North Star
**Creative North Star: "The Digital Sanctuary"**

This design system moves away from the clinical, high-frequency nature of traditional mobile apps. Instead, it embraces an editorial, introspective layout that mirrors the experience of writing in a premium physical journal. By utilizing **Intentional Asymmetry** and **Tonal Depth**, we create a space that feels quiet yet authoritative. 

The "Oasis" aesthetic is defined by breathing room (generous white space), overlapping elements that break the standard grid, and high-contrast typography scales that guide the eye through an emotional narrative rather than a task list.

---

## 2. Colors & Surface Philosophy
The palette is rooted in the "Deep Petroleum" of a night sky, punctuated by the organic warmth of Coral and Sage.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to define sections. Content boundaries must be created through:
1.  **Background Color Shifts:** Placing a `surface-container-low` component against a `surface` background.
2.  **Shadow Depth:** Using diffused ambient light to lift an element.
3.  **Negative Space:** Using the spacing scale (e.g., `8` or `10`) to let content breathe.

### Surface Hierarchy & Nesting
We treat the UI as a series of physical layers. Use the following tiers to create "nested" depth:
*   **Base Layer:** `surface` (#041424) for the main application background.
*   **Secondary Layer:** `surface-container` (#102130) for large structural areas like navigation bars or bottom sheets.
*   **Floating Layer:** `surface-container-high` (#1b2b3b) or `surface-container-highest` (#263647) for interactive cards.

### The "Glass & Gradient" Rule
To achieve the Oasis feel, floating elements should utilize **Glassmorphism**. 
*   **Formula:** `surface-container-high` at 75% opacity + `backdrop-blur: 20px`.
*   **Signature Textures:** For primary CTAs, use a subtle linear gradient transitioning from `primary` (#ffb68b) to `primary-container` (#e09a70) at a 135° angle. This adds "soul" to the action, preventing the UI from feeling flat or sterile.

---

## 3. Typography
The typographic system creates a dialogue between the poetic (Serif) and the functional (Sans-Serif).

*   **Display & Headlines (Noto Serif):** Used for emotional anchors—mood summaries, dates, and "Dear Diary" moments. The Serif adds a human, editorial touch that encourages slow reading.
*   **Body & Labels (Manrope):** Used for high-utility data and user input. It provides the clarity and modern "Native Mobile" feel required for legibility on small screens.

**Scale Highlight:**
*   **Display-LG (3.5rem):** Use for "Mood of the Day" percentages to create a bold, asymmetrical focal point.
*   **Title-MD (1.125rem):** The workhorse for list headers, balanced with a `secondary` color token to soften the visual weight.

---

## 4. Elevation & Depth

### The Layering Principle
Depth is achieved by "stacking" tonal tiers. Place a `surface-container-lowest` card on a `surface-container-low` section to create a soft, natural lift. This mimics the way paper sits on a desk—no harsh lines, just subtle occlusion of light.

### Ambient Shadows
When a "floating" effect is required (e.g., a Floating Action Button or a Modal):
*   **Blur:** 40px – 60px.
*   **Opacity:** 6% – 10%.
*   **Color:** Use a tinted version of `on-surface` (Deep Blue) rather than pure black to maintain the petroleum-depth of the background.

### The "Ghost Border" Fallback
If an element lacks sufficient contrast (e.g., a Sage chip on a Petroleum background), use a **Ghost Border**:
*   **Token:** `outline-variant` (#52443c).
*   **Opacity:** 15% Max.
*   **Weight:** 1px.

---

## 5. Components

### Buttons
*   **Primary:** Gradient-filled (`primary` to `primary-container`), roundedness `full`, no border.
*   **Secondary:** `surface-container-highest` background with `on-surface` text.
*   **Tertiary:** Transparent background, `primary` text, no border.

### Cards (The "Diary Entry")
Forbid the use of divider lines. Separate metadata (time/location) from the body text using a `1.5` (0.5rem) spacing gap and a shift to `label-sm` typography. 
*   **Corner Radius:** `lg` (2rem) for the outer container.
*   **Nesting:** Inner elements (like mood tags) should use `sm` (0.5rem) radius.

### Input Fields
*   **Resting State:** `surface-container-low` background, no border.
*   **Focused State:** `surface-variant` background, a "Ghost Border" at 20% opacity using the `primary` token.
*   **Typography:** User-generated text should always be `body-lg` to ensure the diary feels easy to write in.

### Emotional Mood Indicators
Moods are represented by "Glow Orbs" rather than flat circles.
*   **Level 5 (Zen):** #22c55e with a soft outer glow of the same color at 20% opacity.
*   **Level 1 (Crisis):** #ef4444. Use sparingly to draw immediate attention without feeling "punitive."

---

## 6. Do's and Don'ts

### Do
*   **Do** use asymmetrical layouts. For example, left-align a headline but right-align the supporting data point to create visual tension.
*   **Do** use the `24px` (`md`) border radius for almost everything. It is the signature of this system’s friendliness.
*   **Do** prioritize "Tonal Contrast." If a screen feels cluttered, remove a background color rather than adding a line.

### Don't
*   **Don't** use 100% opaque borders. They break the "Oasis" immersion and feel like a standard wireframe.
*   **Don't** use pure black (#000000) for shadows. It muddies the Petroleum Blue background.
*   **Don't** use "Standard" list dividers. Use a `3` (1rem) spacing gap or a subtle `surface` color shift to denote a new list item.