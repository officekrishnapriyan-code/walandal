# Mobile Carousel Fixes

## Issues Fixed:

### 1. Cards Stacking Instead of Carousel
**Problem:** All 4 cards showing vertically stacked instead of carousel on mobile

**Root Cause:** Desktop grid CSS was overriding mobile flex layout

**Fix:** Added `!important` to force flex display on mobile:
```css
.domains-grid {
  display: flex !important; /* Override desktop grid */
  grid-template-columns: unset;
}

.capabilities-grid {
  display: flex !important; /* Override desktop grid */
  grid-template-columns: unset;
}

.contact-details {
  display: flex !important;
  flex-direction: row;
}
```

### 2. Square Appearing Above Carousel Buttons
**Problem:** A square/box showing above the circular carousel buttons on tap

**Root Cause:** Default button styling and focus states on mobile browsers

**Fix:** Added appearance reset and proper styling:
```css
.carousel-btn {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  outline: none;
  background: rgba(15, 20, 32, 0.6);
  border: 1px solid var(--color-border);
  border-radius: 50%;
}

.carousel-btn:active {
  transform: scale(0.95);
}
```

### 3. Hero Content Jumping on Reload
**Problem:** Hero content position shifts/jumps when page reloads

**Root Cause:** Content visibility not explicitly set, causing layout shift

**Fix:** Added explicit visibility and opacity:
```css
.hero-content {
  visibility: visible;
  opacity: 1;
}
```

### 4. Contact Button Padding
**Problem:** "Contact" button in navigation too tight/packed

**Fix:** Increased padding:
```css
.nav-cta {
  padding: 0.65rem 1.75rem; /* Was 0.6rem 1.5rem */
}
```

### 5. Percentage Symbol
**Status:** Already fixed in HTML (100%)

## Mobile Carousels Now Working:

✅ **Domains (WAL & AL):** 4 cards, 1 visible at a time
✅ **Systems:** 4 cards (2 pages of 2), working correctly
✅ **Capabilities:** 4 cards, 1 visible at a time
✅ **Contact Info:** 2 boxes, 1 visible at a time

## Testing Checklist:

- ✅ Cards show one at a time (not stacked)
- ✅ Swipe left/right works
- ✅ Carousel buttons work (no square artifact)
- ✅ Dots show correct position
- ✅ Infinite loop works
- ✅ Hero content doesn't jump on reload
- ✅ Contact button has proper spacing
- ✅ 100% shows correctly

## Desktop Unchanged:

All fixes are mobile-only (`@media (max-width: 768px)`):
- Desktop still shows grid layouts
- No carousel on desktop
- No visual changes to desktop experience

