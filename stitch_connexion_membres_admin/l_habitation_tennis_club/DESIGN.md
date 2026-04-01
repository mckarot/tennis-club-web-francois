# Design System Document: Eco-Luxe Tennis Collective

## 1. Overview & Creative North Star: "The Tropical Veranda"
This design system is built to evoke the high-end, serene atmosphere of a premier tennis club in Martinique. The "Creative North Star" is **The Tropical Veranda**—a concept where the structured precision of the sport meets the organic fluidity of the Caribbean landscape. 

To move beyond a "generic template" look, we utilize an intentional **Asymmetric Bento Grid**. This means while the grid provides a structural foundation, we break the "boxiness" through varying card heights, overlapping glass elements, and dramatic typography scales. The goal is an editorial feel that breathes with the humidity and luxury of the island, rejecting rigid lines in favor of tonal depth and soft edges.

---

## 2. Color Strategy & The "No-Line" Rule
The palette is rooted in the natural elements of the court and the forest.

*   **Primary (`#1A3C34`):** Deep Forest Green. Used for core brand moments and high-contrast containers.
*   **Secondary (`#D46F4D`):** Clay Ocre. A direct nod to the tennis court surfaces; used for CTAs and interactive accents.
*   **Neutral Background (`#F8F9F7`):** A crisp Off-White that prevents the "digital glare" of pure white.

### The "No-Line" Rule
Standard 1px borders are strictly prohibited for sectioning. We define boundaries through:
*   **Tonal Shifts:** Placing a `surface-container-low` card against a `surface` background.
*   **Soft Contrast:** Using the `Clay Ocre` against the `Deep Forest Green` to create natural edge definition without a stroke.

### Surface Hierarchy & Nesting
Treat the UI as physical layers of fine paper and frosted glass. 
*   **Base:** `surface` (#F9FAF8)
*   **Nesting Level 1:** `surface-container-low` (#F3F4F2) for large background sections.
*   **Nesting Level 2:** `surface-container-highest` (#E1E3E1) for interactive elements or prioritized cards.

### The Glass & Gradient Rule
To achieve the "Luxe" in "Eco-Luxe," use **Glassmorphism** for floating navigational elements and overlays. Apply `backdrop-blur-md` with a background of `on-surface` at 5% opacity. For primary CTAs, use a subtle linear gradient from `primary` (#1A3C34) to `primary_container` (#1A3C34 at 85% opacity) to add a sense of "soul" and dimension.

---

## 3. Typography: The Editorial Balance
We pair the geometric confidence of **Lexend** with the functional elegance of **Manrope**.

*   **Display & Headlines (Lexend):** These should feel authoritative. Use `display-lg` (3.5rem) for hero statements with tight tracking (-0.02em). This conveys the prestige of a private club.
*   **Body & Labels (Manrope):** Chosen for its exceptional legibility in outdoor (high-glare) environments. 
*   **Hierarchy Note:** Use `headline-sm` in `Clay Ocre` for sub-headers to create a warm, inviting path for the eye to follow.

---

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are too "software-like." This system uses **Ambient Light Physics**.

*   **The Layering Principle:** Depth is achieved by stacking. A `surface-container-lowest` card sitting on a `surface-container-low` background creates a natural "lift" through color value alone.
*   **Ambient Shadows:** When an element must float (e.g., a modal or floating action button), use an extra-diffused shadow: `shadow-[0_20px_50px_rgba(25,28,27,0.06)]`. The shadow is tinted with the `on-surface` color, never pure black.
*   **The "Ghost Border" Fallback:** If a container requires more definition, use the `outline_variant` token at **15% opacity**. High-contrast, 100% opaque borders are forbidden.
*   **Glassmorphism:** Use `surface-tint` with low opacity (approx. 10%) and a high blur radius to create "frosted" surfaces that allow the Deep Forest Green or Clay Ocre to bleed through from the background.

---

## 5. Components

### Cards (The Bento Unit)
The cornerstone of the system. Cards must use `rounded-xl` (3rem) or `rounded-lg` (2rem). 
*   **Style:** No borders. Backgrounds should be `surface-container-lowest`.
*   **Interaction:** On hover, the card should translate -8px Y-axis with a transition-timing of `cubic-bezier(0.2, 0, 0, 1)`.

### Buttons
*   **Primary:** `bg-secondary` (Clay Ocre), `text-on-secondary`. Shape: `rounded-full`. 
*   **Secondary:** `bg-primary` (Deep Forest Green), `text-on-primary`.
*   **Tertiary:** Transparent background, `text-primary`, with a `Ghost Border` (15% opacity `outline-variant`) that becomes 40% on hover.

### Inputs & Fields
*   **Style:** `surface-container-high` backgrounds. 
*   **Focus State:** A subtle 2px glow of `secondary_fixed` instead of a harsh outline. Forbid the use of standard blue focus rings.

### Navigation & Lists
*   **The "No-Divider" Rule:** Forbid 1px horizontal lines between list items. Use vertical padding (Spacing `3` or `4`) and subtle background shifts on hover to separate content.

### Specialty Component: The "Court Status" Chip
Use a glassmorphism effect: `bg-white/20` with `backdrop-blur-sm` and a `primary_fixed` dot to indicate court availability.

---

## 6. Do’s and Don’ts

### Do:
*   **Do** embrace negative space. Use the `24` (8.5rem) spacing token for section margins to let the "Eco" aesthetic breathe.
*   **Do** use asymmetrical Bento layouts. A large `2x2` card next to two `1x1` stacked cards creates visual interest.
*   **Do** use the `Clay Ocre` sparingly as a "heat map" to guide the user to the most important actions (Book a Court, Join Lesson).

### Don’t:
*   **STRICTLY NO PINK:** Under no circumstances should any tint or shade of pink be used, including in error states (use `error` #BA1A1A).
*   **Don't** use `rounded-none`. Everything must have a minimum radius of `sm` (0.5rem) to maintain the "Soft Luxe" feel.
*   **Don't** use standard "Drop Shadows." If it looks like a default CSS shadow, it is wrong. It must be an ambient, tinted glow.
*   **Don't** use dividers. If you feel the need for a line, increase the white space instead.

---

## 7. Token Summary

| Category | Token | Value |
| :--- | :--- | :--- |
| **Corner** | `xl` | 3rem (Main Bento Containers) |
| **Corner** | `lg` | 2rem (Internal Cards/Buttons) |
| **Spacing** | `20` | 7rem (Section Padding) |
| **Shadow** | `Ambient` | `0 20px 50px rgba(25,28,27,0.06)` |
| **Border** | `Ghost` | `outline-variant` @ 15% opacity |
| **Blur** | `Glass` | `backdrop-blur-md` |