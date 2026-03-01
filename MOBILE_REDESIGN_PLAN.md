# Mobile Redesign - Detailed Analysis

## Target Devices:
- iPhone SE (375x667) - Small
- iPhone 12/13 (390x844) - Standard
- iPhone 14 Pro Max (430x932) - Large
- Android equivalents

## Section-by-Section Analysis:

### 1. NAVIGATION (60px height target)
**Issues:**
- Logo might be too small (28px)
- Hamburger menu needs better spacing
- Menu overlay might be too wide

**Fixes:**
- Logo: 32px height
- Nav height: 60px fixed
- Menu: 85% width, max 300px
- Better touch targets (48px minimum)

### 2. HERO SECTION
**Issues:**
- Title might be too large/small
- Stats box takes too much space
- Glow effect might be distracting
- Buttons need better spacing

**Fixes:**
- Remove/reduce glow effect
- Title: 1.75rem-2.25rem (28-36px)
- Subtitle: 0.95rem (15.2px)
- Stats: Horizontal scroll or 2x2 grid
- Buttons: 48px height minimum
- Total height: ~85vh

### 3. DOMAINS SECTION
**Issues:**
- Cards might be too tall
- Icons might be too large
- Text might overflow

**Fixes:**
- Card padding: 1.5rem (24px)
- Icon: 75px (down from 85px)
- Title: 1.25rem (20px)
- Description: 0.875rem (14px)
- Gap between cards: 1rem (16px)

### 4. SYSTEMS CAROUSEL
**Issues:**
- Cards too tall for viewport
- Text too small to read
- Carousel controls might be hard to tap

**Fixes:**
- Remove min-height constraint
- Card padding: 1.25rem (20px)
- Title: 1.15rem (18.4px)
- Body: 0.875rem (14px)
- Bullets: 0.8rem (12.8px)
- Controls: 48px touch targets
- Max card height: 70vh

### 5. CAPABILITIES SECTION
**Issues:**
- 4 cards might be too many
- Icons might be too large
- Text spacing

**Fixes:**
- Card padding: 1.5rem (24px)
- Icon: 2.25rem (36px)
- Title: 1.15rem (18.4px)
- Body: 0.875rem (14px)
- Gap: 1rem (16px)

### 6. FOUNDER SECTION
**Issues:**
- Avatar might be too large
- Text might be too long
- Quote might overflow

**Fixes:**
- Avatar: 120px (down from 130px)
- Title: 1.35rem (21.6px)
- Bio: 0.9rem (14.4px)
- Quote: 0.95rem (15.2px)
- Card padding: 1.5rem (24px)

### 7. CONTACT SECTION
**Issues:**
- Form might be cramped
- Input fields might be too small
- Info boxes might take too much space

**Fixes:**
- Input height: 48px minimum
- Input font: 16px (prevents zoom on iOS)
- Textarea: 120px min-height
- Button: 48px height
- Info boxes: Compact, 0.875rem text

### 8. FOOTER
**Issues:**
- Logo might be too small
- Text might be hard to read

**Fixes:**
- Logo: 32px
- Text: 0.85rem (13.6px)
- Copyright: 0.75rem (12px)
- Padding: 1.5rem top, 1.25rem bottom

## Typography Scale for Mobile:
- H1 (Hero): 1.75rem-2.25rem (28-36px)
- H2 (Sections): 1.5rem-1.75rem (24-28px)
- H3 (Cards): 1.15rem-1.35rem (18.4-21.6px)
- Body: 0.875rem-0.95rem (14-15.2px)
- Small: 0.75rem-0.85rem (12-13.6px)
- Tiny: 0.65rem-0.7rem (10.4-11.2px)

## Spacing Scale for Mobile:
- Section padding: 2rem-2.5rem (32-40px)
- Card padding: 1.25rem-1.5rem (20-24px)
- Element gaps: 0.75rem-1rem (12-16px)
- Micro spacing: 0.5rem-0.75rem (8-12px)

## Touch Targets:
- Minimum: 44px (Apple HIG)
- Recommended: 48px (Material Design)
- Comfortable: 56px

## Key Principles:
1. Font size minimum 14px for body text
2. Line height 1.5-1.6 for readability
3. Contrast ratio 4.5:1 minimum
4. Touch targets 48px minimum
5. No horizontal scroll
6. Comfortable thumb reach zones
7. Fast loading (optimize images)
8. Smooth animations (60fps)

