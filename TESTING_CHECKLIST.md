# Production Testing Checklist — UtsavDarshan 9.0

**Target**: Verify final polish & smoothness implementation  
**Status**: Ready for QA Testing  
**Date**: December 2024

---

## Pre-Launch Testing

### Global Transitions
- [ ] Hover over any element → smooth fade in color
- [ ] Hover over buttons → lift with shadow (-1px, 280ms)
- [ ] Hover over cards → gentle lift (-6px, 280ms)
- [ ] All transitions use ease-out (no bounce/spring)
- [ ] Transitions work consistently across all browsers (Chrome, Safari, Firefox)

### Sign In Functionality
- [ ] User logged out → "Sign In" link visible in navbar
- [ ] User logged in → "Sign In" link hidden, profile icon shows
- [ ] Click "Sign In" → redirects to `/login` page
- [ ] Sign In link has gold dot hover animation
- [ ] Sign In link color matches navbar styling (rgba(246, 231, 193, 0.75))

### Navbar Behavior
- [ ] Navbar is fixed at top, 64px height (desktop)
- [ ] Navbar is fixed at top, 56px height (mobile)
- [ ] Scroll down 88vh (hero height) → background darkens (0.35 → 0.85 opacity)
- [ ] Scroll down 88vh → blur increases (8px → 10px)
- [ ] All navbar items have smooth hover animations
- [ ] Logo, Nav Links, Button, User Icon all present and aligned

### Hero Section
- [ ] Hero min-height: 100vh (full viewport)
- [ ] Hero padding-top: 64px (accounts for navbar)
- [ ] Background image visible (golden Ganesh)
- [ ] Radial overlay darkens edges (center 0.35 → edges 0.7 opacity)
- [ ] Bottom fade gradient smooth (transparent to charcoal)
- [ ] Content centered with slight upward offset (-60px)
- [ ] No white band at bottom (dark background covers)

### Button States
- [ ] "Start Exploring" (saffron) → hover lifts -1px, shadow upgrades
- [ ] "View Pandals" (outline) → hover lifts -1px, border brightens
- [ ] Buttons are min 44px height (accessibility)
- [ ] No text scaling on hover (only color/opacity)

### Card Interactions
- [ ] Featured pandal cards → hover lifts -6px, shadow upgrades
- [ ] Cards have border-color transition (smooth)
- [ ] Image inside card → slight zoom on hover
- [ ] Overlay badges appear on hover
- [ ] All card transitions smooth (280ms ease-out)

### Design System Compliance
- [ ] All colors match CSS variables (no hardcoded hex values)
- [ ] All spacing uses 8px grid (--space-* variables)
- [ ] All typography uses font scale (--text-* variables)
- [ ] All transitions use standard timing (200ms/280ms)
- [ ] All shadows use 4-level system (--shadow-sm/md/lg/xl)
- [ ] All border radius uses scale (--radius-md/lg/xl)

### Responsive Behavior
- [ ] Desktop (1024px+) → full navbar, desktop layout
- [ ] Tablet (768px-1023px) → hamburger menu, mobile layout
- [ ] Mobile (480px-767px) → touch-friendly spacing
- [ ] Very small (< 480px) → no horizontal overflow, readable
- [ ] Portrait & landscape orientations both work

### Accessibility
- [ ] All interactive elements have 44px+ tap targets
- [ ] Color contrast meets AA standard (4.5:1 for small text)
- [ ] @prefers-reduced-motion respected (transitions disabled)
- [ ] Keyboard navigation works (tab through links/buttons)
- [ ] Focus states visible on all interactive elements
- [ ] SVG icons have proper `title` attributes

### Performance
- [ ] Page loads in < 3 seconds (with images)
- [ ] No layout shifts on transitions
- [ ] No flickering or jank on hover
- [ ] GPU acceleration working (transform/opacity only)
- [ ] Transitions smooth at 60fps (no dropped frames)

### Cross-Browser Testing
- [ ] Chrome 120+ ✅
- [ ] Safari 17+ ✅
- [ ] Firefox 121+ ✅
- [ ] Edge 121+ ✅
- [ ] Mobile Safari (iOS 15+) ✅

### Mobile Testing
- [ ] iOS: All transitions smooth, no jank
- [ ] Android: All transitions smooth, no jank
- [ ] Touch interactions responsive (no delay)
- [ ] Hamburger menu opens/closes smoothly
- [ ] Scroll behavior smooth (no stuttering)

---

## Detailed Test Cases

### Test 1: Sign In Flow
```
1. Open site (logged out)
2. Verify "Sign In" link visible in navbar right side
3. Hover over "Sign In" → gold dot appears
4. Click "Sign In" → redirects to /login
5. (After login) Verify "Sign In" hidden, profile icon shows
6. Click profile icon → redirects to /profile
Expected: Smooth transitions, no flickering, auth state syncs
```

### Test 2: Button Hover Mechanics
```
1. Move mouse to "Start Exploring" button
2. Observe: Button moves UP 1px, shadow increases
3. Move mouse away → button returns to original position
4. Timing should be exactly 280ms (smooth, no snap)
5. Repeat with "View Pandals" button (outline style)
Expected: Subtle lift, shadow depth, 280ms timing
```

### Test 3: Card Hover Mechanics
```
1. Move mouse to featured pandal card
2. Observe: Card moves UP 6px, border brightens
3. Inside card image → slight zoom effect
4. Overlay badges fade in
5. Move mouse away → all reverse smoothly
Expected: Gentle lift (6px > 1px), 280ms timing, no jank
```

### Test 4: Scroll Transition
```
1. Scroll down from top
2. At 88vh (hero bottom) → observe navbar changes:
   - Background opacity: 0.35 → 0.85
   - Blur: 8px → 10px
   - Border appears (gold, 15% opacity)
3. All changes smooth (200-300ms)
4. Scroll back up → reverse smoothly
Expected: Seamless transition, no hard cuts
```

### Test 5: Typography Stability
```
1. Hover over all heading text
2. Observe: Color/opacity changes only
3. Size MUST NOT change (no scale transform)
4. Line spacing MUST NOT change
5. Repeat with body text, link text, button text
Expected: Text stays pixel-perfect, no wobble
```

### Test 6: Motion Preference Test
```
1. OS Settings → Enable "Reduce Motion"
2. Refresh page
3. Hover over buttons → NO smooth transitions
4. Scroll page → NO animation transitions
5. All interactions instant (no delay)
Expected: App respects accessibility preference
```

---

## Sign Off Criteria

✅ All transitions smooth and consistent  
✅ Sign In link functional and styled correctly  
✅ Button/card hover values match spec (-1px / -6px)  
✅ No hardcoded transition values in components  
✅ All colors from design system variables  
✅ Responsive layout works at all breakpoints  
✅ Performance smooth at 60fps  
✅ Accessibility standards met (AA+)  
✅ Cross-browser compatibility verified  
✅ Mobile touch interactions responsive  

---

## Known Limitations / Future Work

1. **Section Transitions**: Background colors change abruptly between sections
   - *Future*: Add soft gradient overlays between section boundaries
   - *Priority*: Low (not critical for launch)

2. **Sign In Integration**: Currently placeholder route
   - *Needed*: Connect to actual authentication backend
   - *Priority*: High (blocks user auth)

3. **Typography Motion**: Headers don't scale on hover (good)
   - *Future*: Consider subtle weight change on hover (optional)
   - *Priority*: Low (not in spec)

4. **Mobile Menu Animation**: Hamburger menu lacks reveal animation
   - *Future*: Add smooth slide-in animation
   - *Priority*: Medium (nice-to-have)

---

## Test Environment Setup

```bash
# Terminal 1: Start backend server
cd server
npm start
# Expected: "Server running on http://localhost:5000"

# Terminal 2: Start frontend dev server
cd client
npm start
# Expected: "Webpack compiled with X assets"

# Browser: Open http://localhost:3001
# Expected: UtsavDarshan 9.0 loads, hero section visible
```

---

## Debug Checklist

If transitions not working:
- [ ] Check design-system.css imports in index.js (should be first)
- [ ] Verify CSS variables defined in :root (check DevTools)
- [ ] Check for !important rules overriding transitions
- [ ] Verify browser supports CSS transitions (all modern browsers)
- [ ] Check DevTools → Styles → confirm transition rules applied

If Sign In link not visible:
- [ ] Check Navbar.js user state (console.log(user))
- [ ] Verify user state initialized (check auth context)
- [ ] Check CSS display property (should be flex/inline)
- [ ] Verify Navbar.css .navbar-link-signin imported correctly

If performance issues:
- [ ] Check DevTools → Performance → record interaction
- [ ] Look for long tasks (should be < 50ms)
- [ ] Verify GPU acceleration (use `will-change` if needed)
- [ ] Check for layout thrashing in console

---

## Sign-Off

**Tested By**: [QA Engineer Name]  
**Date**: [Test Date]  
**Status**: ✅ PASS / ❌ FAIL  
**Notes**: [Any issues found]  

---

**Next**: Deploy to staging environment for final review

