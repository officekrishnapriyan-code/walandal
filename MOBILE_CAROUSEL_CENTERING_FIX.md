# Mobile Carousel Centering Fix

## Issue
Carousel cards on mobile were not properly centered - they were aligned to the left/right and you could see the edge of the next card peeking in from the side. This made the layout look broken and unprofessional.

## Root Cause
1. Cards had gaps between them (`gap: 1rem`)
2. Cards were sized as `calc(100% - 0.5rem)` with margins
3. Carousel wrappers had `overflow: visible` showing adjacent cards
4. JavaScript calculated offsets including gap width, causing misalignment

## Solution

### CSS Changes

**Domains Section:**
- Changed `gap: 1rem` to `gap: 0`
- Changed card width from `calc(100% - 0.5rem)` to `100%`
- Removed `margin: 0 0.25rem` and `padding: 0 0.25rem`
- Changed `overflow: visible` to `overflow: hidden`
- Added `box-sizing: border-box` to ensure proper sizing

**Systems Section:**
- Changed `gap: 1rem` to `gap: 0`
- Changed card width from `calc(100% - 0.5rem)` to `100%`
- Removed margins and padding
- Changed `overflow: visible` to `overflow: hidden`

**Capabilities Section:**
- Changed `gap: 1rem` to `gap: 0`
- Changed card width from `calc(100% - 0.5rem)` to `100%`
- Removed margins and padding
- Changed `overflow: visible` to `overflow: hidden`

### JavaScript Changes

Updated all carousel classes (BentoCarousel, DomainsCarousel, CapabilitiesCarousel):

**cloneCards() method:**
```javascript
// Before
const cardWidth = this.carousel.children[0].offsetWidth;
const gap = parseFloat(getComputedStyle(this.carousel).gap) || 0;
const offset = -(this.totalCards * (cardWidth + gap));

// After
const containerWidth = this.carousel.parentElement.offsetWidth;
const offset = -(this.totalCards * containerWidth);
```

**updateCarousel() method:**
```javascript
// Before
const cardWidth = this.carousel.children[0].offsetWidth;
const gap = parseFloat(getComputedStyle(this.carousel).gap) || 0;
const actualIndex = this.currentIndex + this.totalPages;
const offset = -(actualIndex * (cardWidth + gap));

// After
const containerWidth = this.carousel.parentElement.offsetWidth;
const actualIndex = this.currentIndex + this.totalPages;
const offset = -(actualIndex * containerWidth);
```

## Benefits

1. **Perfect Centering**: Each card now takes exactly 100% of the container width
2. **No Peeking Cards**: Adjacent cards are completely hidden with `overflow: hidden`
3. **Cleaner Transitions**: Smooth sliding without visible gaps
4. **Consistent Behavior**: All three carousels (Domains, Systems, Capabilities) work identically
5. **Better UX**: Users see one complete card at a time without distractions

## Technical Details

### Why Container Width Instead of Card Width?
- Container width is the viewport width (100vw minus padding)
- Card width can vary slightly due to borders, padding, and box-sizing
- Using container width ensures pixel-perfect alignment
- Eliminates cumulative rounding errors in calculations

### Why Remove Gaps?
- Gaps cause cards to be smaller than 100% width
- This creates visible space where adjacent cards peek through
- Without gaps, cards fill the entire viewport cleanly

### Why overflow: hidden?
- Prevents any adjacent cards from being visible
- Creates a clean "window" showing only the current card
- Essential for professional carousel appearance

## Files Modified

- `styles.css`: Lines ~1400-1650 (mobile media query section)
- `script.js`: Lines 307, 415, 535, 607, 707, 777, 898 (all carousel methods)

## Testing Checklist

- [ ] Domains carousel shows one full card at a time
- [ ] Systems carousel shows one full card at a time
- [ ] Capabilities carousel shows one full card at a time
- [ ] No edges of adjacent cards visible
- [ ] Cards are perfectly centered
- [ ] Swipe transitions are smooth
- [ ] Dots navigation works correctly
- [ ] Arrow buttons work correctly
- [ ] Desktop layout unchanged

## Status
✅ All fixes implemented and ready for testing
