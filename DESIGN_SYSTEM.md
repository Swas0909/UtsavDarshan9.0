# UtsavDarshan Design System - LOCKED ✅

**Status**: Production-ready, Version 1.0
**Last Updated**: December 23, 2025
**Philosophy**: Cultural + devotional, calm, premium, modern, timeless

---

## QUICK REFERENCE

### Fonts
- **Display/Headings**: `var(--font-display)` → Playfair Display
- **Body/UI**: `var(--font-body)` → Inter

### Colors
- **Ivory (text)**: `var(--color-ivory)` → `#F6E7C1`
- **Saffron (action)**: `var(--color-saffron)` → `#D9480F`
- **Gold (accent)**: `var(--color-gold-muted)` → `#CFAE70`
- **Charcoal (base)**: `var(--color-charcoal)` → `#0B0B0B`

### Spacing
- **XS**: `var(--space-xs)` → 8px
- **SM**: `var(--space-sm)` → 16px
- **MD**: `var(--space-md)` → 24px
- **LG**: `var(--space-lg)` → 32px
- **XL**: `var(--space-xl)` → 48px
- **XXL**: `var(--space-xxl)` → 64px

### Transitions
- **Fast**: `var(--transition-fast)` → 150ms
- **Normal**: `var(--transition-normal)` → 200ms
- **Slow**: `var(--transition-slow)` → 300ms

### Shadows
- **SM**: `var(--shadow-sm)`
- **MD**: `var(--shadow-md)`
- **LG**: `var(--shadow-lg)`
- **XL**: `var(--shadow-xl)`

---

## TYPOGRAPHY SCALE

| Size | CSS Var | Usage |
|------|---------|-------|
| 56px (clamped) | `var(--text-h1-size)` | Main headings |
| 32px | `var(--text-h2-size)` | Section headings |
| 24px | `var(--text-h3-size)` | Subsection titles |
| 18px | `var(--text-body-large-size)` | Large body text |
| 16px | `var(--text-body-regular-size)` | Regular body text |
| 14px | `var(--text-small-size)` | Meta, captions |

---

## COMPONENT PATTERNS

### Buttons
```html
<!-- Primary (Saffron) -->
<button class="btn-primary-saffron">Start Exploring</button>

<!-- Secondary (Outline) -->
<button class="btn-secondary-outline">View Pandals</button>
```

**Rules**:
- Min height: `var(--button-min-height)` → 44px
- Padding: `var(--button-padding-y)` `var(--button-padding-x)` → 14px 28px
- Border radius: `var(--radius-md)` → 12px
- No glow, soft shadow only on hover
- Hover: translateY(-2px) + shadow upgrade

### Cards
```html
<div class="card">
  <h3 class="card-title">Title</h3>
  <p class="card-text">Content</p>
</div>
```

**Rules**:
- Background: `var(--color-surface-dark)`
- Border: 1px `var(--color-border-light)`
- Border radius: `var(--radius-lg)` → 16px
- Padding: `var(--space-md)` → 24px
- Hover: translateY(-4px) + shadow + border color upgrade

### Feature Cards
```html
<div class="feature-card">
  <div class="feature-icon"><!-- icon --></div>
  <h4>Title</h4>
  <p>Description</p>
</div>
```

**Rules**:
- Top accent bar animates in on hover (gradient)
- Icon scales and rotates on hover
- Card lifts up on hover

### Pandal Cards
```html
<div class="pandal-card">
  <div class="card-image-wrapper">
    <img class="pandal-image" src="..." />
    <div class="card-overlay"><!-- rating badge --></div>
  </div>
  <h3 class="card-title">Name</h3>
  <p class="card-text">Location</p>
</div>
```

**Rules**:
- Image scales 1.15x on hover
- Card lifts -12px on hover
- Overlay fades in on hover
- Image height: 250px, object-fit: cover

---

## LAYOUT GUIDELINES

### Container Width
```css
max-width: var(--max-width-container); /* 1100px */
padding: 0 var(--padding-container-desktop); /* 24px */
```

### Section Spacing
```css
padding: var(--space-xxl) 0; /* 64px top/bottom */
```

### Mobile Adjustments
```css
@media (max-width: 768px) {
  padding: 0 var(--padding-container-mobile); /* 16px */
  padding: var(--space-lg) 0; /* 32px top/bottom */
}
```

---

## ANIMATION RULES

### Page Load
- **Hero elements**: fadeInUp staggered (0s, 0.15s, 0.3s delays)
- **Sections**: fadeInUp on scroll intersection

### Hover
- **Buttons**: 150ms translateY(-2px)
- **Cards**: 200ms translateY(-4px to -12px)
- **Images**: 300ms scale(1.15)
- **Icons**: 200ms scale(1.1) rotate(5deg)

### No Motion
```css
@media (prefers-reduced-motion: reduce) {
  /* All animations disabled */
}
```

---

## RESPONSIVE BREAKPOINTS

| Breakpoint | Usage |
|-----------|-------|
| 768px | Mobile-first breakpoint |
| 1100px | Max container width |

### Mobile Rules
- Stack layouts vertically
- Buttons: full-width or max-width 280px
- Font sizes: slightly reduced or clamped
- Line heights: increased
- Hero height: 88vh (same as desktop for consistency)

---

## COLOR PALETTE (DO NOT DEVIATE)

| Color | Hex | Usage |
|-------|-----|-------|
| Ivory | #F6E7C1 | Headings, primary text, focus states |
| Saffron | #D9480F | Primary CTA, accents, hover states |
| Gold | #CFAE70 | Secondary accents, borders on hover |
| Charcoal | #0B0B0B | Page background, text base |
| Surface Dark | rgba(15,15,15,0.85) | Card backgrounds |
| Border Light | rgba(246,231,193,0.25) | Subtle borders |
| Border Medium | rgba(246,231,193,0.4) | Default borders |
| Border Strong | rgba(246,231,193,0.6) | Focus, hover borders |

### Contrast Rules
- **Minimum AA**: 4.5:1 for body text
- **Avoid**: Pure white on warm backgrounds
- **Avoid**: Harsh blacks, only use #0B0B0B

---

## ACCESSIBILITY CHECKLIST

- [ ] Tap targets min 44px height/width
- [ ] Text contrast AA (4.5:1) for body, AAA (7:1) for headings
- [ ] Motion respect: @media (prefers-reduced-motion: reduce)
- [ ] Focus states visible
- [ ] Semantic HTML (h1, h2, button, a)
- [ ] ARIA labels where needed
- [ ] No all-caps except rare labels

---

## IMPLEMENTATION CHECKLIST

When adding new components:

1. **Typography**: Use `var(--font-display)` or `var(--font-body)`
2. **Colors**: Only use CSS variables (no hardcoded hex)
3. **Spacing**: Use `var(--space-*)` multiples
4. **Shadows**: Use `var(--shadow-*)` only
5. **Transitions**: Use `var(--transition-*)` only
6. **Borders**: Use `var(--radius-*)` for borders
7. **Responsive**: Mobile-first, breakpoint at 768px
8. **Motion**: Respect prefers-reduced-motion
9. **Hover**: Subtle only, max 200ms
10. **Accessibility**: Test contrast, keyboard nav, screen readers

---

## FILE STRUCTURE

```
client/src/
├── styles/
│   └── design-system.css          ← CSS variables & base styles
├── components/
│   ├── Home.js                     ← Hero + sections using design system
│   ├── Navbar.js                   ← Update to use design system
│   ├── PandalGrid.js               ← Update to use design system
│   └── ...
├── App.css                         ← Global overrides (minimal)
└── index.js                        ← Import design-system.css first
```

---

## FUTURE COMPONENT EXAMPLES

### When Creating New Sections
```css
section {
  padding: var(--space-xxl) 0; /* Auto-applies 64px spacing */
}

.section-title {
  font-family: var(--font-display);
  font-size: var(--text-h2-size);
  color: var(--color-text-primary);
  margin-bottom: var(--space-lg);
}

.section-description {
  font-size: var(--text-body-regular-size);
  color: var(--color-text-secondary);
  max-width: 680px;
}
```

### When Creating New Cards
```css
.my-card {
  background: var(--color-surface-dark);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  padding: var(--space-md);
  transition: all var(--transition-normal);
}

.my-card:hover {
  border-color: var(--color-border-medium);
  box-shadow: var(--shadow-md);
  transform: translateY(-4px);
}
```

### When Creating New Buttons
```css
.my-btn {
  padding: var(--button-padding-y) var(--button-padding-x);
  border-radius: var(--radius-md);
  min-height: var(--button-min-height);
  transition: all var(--transition-fast);
}

.my-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
```

---

## LOCKED RULES (NEVER BREAK)

1. ✅ Only use CSS variables for styling
2. ✅ Only use these two fonts: Playfair Display + Inter
3. ✅ Only use these four core colors: Ivory, Saffron, Gold, Charcoal
4. ✅ Spacing: 8px grid only
5. ✅ Transitions: 150–300ms ease-out only
6. ✅ Shadows: Only predefined `var(--shadow-*)` vars
7. ✅ No pure white, no bright neons
8. ✅ No flashy animations (calm, devotional tone)
9. ✅ Mobile first: test at 768px and below
10. ✅ Respect motion preferences

---

## DOCUMENTATION & SUPPORT

- **Design Variables**: `client/src/styles/design-system.css`
- **Hero Example**: `client/src/components/Home.js`
- **Questions**: Refer to this document first

**This design system is production-ready and should not be redesigned unnecessarily.**
