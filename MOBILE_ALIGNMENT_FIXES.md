# Mobile Alignment & Spacing Fixes

## Issues Fixed

### 1. Cards Cut Off on Left Side (Corners Hidden)
**Problem**: Domain, Systems, and Capabilities cards were cut off at the left edge, with corners hidden behind the screen bezel.

**Solution**:
- Changed card width from `100%` to `calc(100% - 0.5rem)` 
- Added `margin: 0 0.25rem` to cards
- Added `padding: 0 0.25rem` to carousel containers
- Changed overflow from `overflow-x: hidden` to `overflow: visible` on wrappers

### 2. Empty Spaces at Bottom of Sections
**Problem**: Domains, Systems, and Capabilities sections had excessive empty space at the bottom.

**Solution**:
- Reduced section padding from `2rem 0` to `2rem 0 0.5rem 0`
- Reduced carousel nav margin-bottom from `1rem` to `0.5rem`
- Added `margin-bottom: 0.5rem` to all carousel navigation elements

### 3. Empty Space at Top of Team Section
**Problem**: When clicking Team button, there was unwanted empty space at the top of the page.

**Solution**:
- Changed Founder section padding from `2rem 0` to `0` on mobile
- Maintained `min-height: 100vh` with `display: flex`, `align-items: center`, `justify-content: center`
- This centers the content vertically without extra padding

### 4. Contact Form Too Large
**Problem**: Contact form was unnecessarily large and took up too much space.

**Solution**:
- Reduced form padding from `1.25rem 1rem` to `1rem 0.875rem`
- Reduced gap between form fields from `1rem` to `0.875rem`
- Reduced input min-height from `48px` to `44px`
- Reduced textarea min-height from `100px` to `80px` and max-height from `150px` to `120px`
- Reduced button min-height from `48px` to `44px`
- Reduced button padding from `0.875rem 1.25rem` to `0.75rem 1rem`
- Reduced button font-size from `0.9375rem` to `0.875rem`
- Reduced label font-size from `0.875rem` to `0.8125rem`

### 5. Contact Info Boxes - Removed Carousel
**Problem**: "Who We Work With" and "What We Bring" boxes had unnecessary carousel/slider functionality.

**Solution**:
- Disabled ContactDetailsCarousel class completely
- Changed contact-details from flex row carousel to `flex-direction: column`
- Removed carousel navigation (hidden with `display: none`)
- Changed contact-item from `flex: 0 0 100%` to `flex: none` (normal stacking)
- Reduced gap from `1rem` to `0.75rem`
- Reduced item padding from `1rem 0.875rem` to `0.875rem 1rem`
- Reduced item font-size from `0.875rem` to `0.8125rem`
- Both boxes now show stacked vertically without swiping

### 6. Center Alignment on Mobile
**Problem**: Left-aligned text looked unbalanced on mobile with awkward right-side spacing.

**Solution**: Added `text-align: center` to all mobile components:
- Section headers
- Domain cards (icon, tag, heading, description)
- Systems/Bento cards (headers and main content, kept tech specs list left-aligned)
- Capabilities cards (icon, heading, description)
- Contact section (headings, descriptions, info boxes)

## Files Modified

### styles.css
**Domains Section** (lines ~1400-1470):
- Added padding to carousel grid
- Changed card width calculation
- Added margins to cards
- Reduced bottom padding
- Added center alignment

**Systems Section** (lines ~1470-1550):
- Added padding to bento grid
- Changed card width calculation
- Added margins to cards
- Reduced bottom padding
- Added center alignment

**Capabilities Section** (lines ~1580-1650):
- Added padding to capabilities grid
- Changed card width calculation
- Added margins to cards
- Reduced bottom padding
- Added center alignment

**Founder Section** (lines ~1650-1670):
- Removed padding (changed from `2rem 0` to `0`)
- Maintained centering with flexbox

**Contact Section** (lines ~1700-1850):
- Removed carousel functionality
- Changed to stacked column layout
- Reduced all sizing (form, inputs, buttons)
- Hidden carousel navigation
- Added center alignment

### script.js
**ContactDetailsCarousel** (lines ~1020-1035):
- Removed initialization calls
- Added comment explaining it's disabled
- Carousel class remains but is not instantiated

## Technical Details

### Card Width Calculation
```css
/* Before (cards cut off) */
flex: 0 0 100%;
min-width: 100%;

/* After (cards visible with padding) */
flex: 0 0 calc(100% - 0.5rem);
min-width: calc(100% - 0.5rem);
margin: 0 0.25rem;
```

### Contact Details Layout
```css
/* Before (carousel) */
.contact-details {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  gap: 1rem;
  cursor: grab;
}

/* After (stacked) */
.contact-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
```

### Form Size Reduction
- Padding: 1.25rem → 1rem
- Gap: 1rem → 0.875rem
- Input height: 48px → 44px
- Textarea height: 100-150px → 80-120px
- Button height: 48px → 44px
- Font sizes reduced by 1-2px across the board

## Testing Checklist

- [ ] Domain cards fully visible (no corners cut off)
- [ ] Systems cards fully visible (no corners cut off)
- [ ] Capabilities cards fully visible (no corners cut off)
- [ ] No empty space at bottom of Domains section
- [ ] No empty space at bottom of Systems section
- [ ] No empty space at bottom of Capabilities section
- [ ] No empty space at top of Team section
- [ ] Contact form is compact and appropriately sized
- [ ] Contact info boxes show stacked (no carousel)
- [ ] All text is center-aligned on mobile
- [ ] Desktop layout remains unchanged

## Status
✅ All fixes implemented and ready for testing
