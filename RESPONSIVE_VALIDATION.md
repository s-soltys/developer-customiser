# Responsive Design Validation Checklist

This document provides manual testing guidelines for validating the responsive design of the "How to Work With Me" application across different device sizes.

## Test Viewports

Use browser DevTools to test the following viewport sizes:

- **Mobile**: 375px width (iPhone SE, iPhone 12/13 mini)
- **Tablet**: 768px width (iPad, iPad Mini)
- **Desktop**: 1024px width and above (laptop, desktop)

## Validation Checklist

### 1. NameEntry Page (`/`)

**Mobile (375px)**
- [ ] Form card is centered and has appropriate padding
- [ ] "How to Work With Me" heading is readable (not truncated)
- [ ] Name input field is full width within the card
- [ ] "Get Started" button is full width
- [ ] Category list (6 items) is readable and not overflowing
- [ ] No horizontal scrolling
- [ ] Touch targets (button, input) are minimum 44px height

**Tablet (768px)**
- [ ] Form card maintains max-width and is centered
- [ ] All text is readable with comfortable line lengths
- [ ] Category list items have proper spacing
- [ ] Layout is visually balanced

**Desktop (1024px+)**
- [ ] Card has max-width constraint (doesn't stretch too wide)
- [ ] Gradient background displays properly
- [ ] All content is centered and visually appealing

### 2. Questionnaire Page (`/questionnaire`)

**Mobile (375px)**
- [ ] Progress indicator shows "Step X of 6" clearly
- [ ] Progress bar is visible and fills correctly
- [ ] Category heading (e.g., "Communication Preferences") is readable
- [ ] Question text wraps properly (no overflow)
- [ ] TEXT inputs (textareas) are full width and at least 100px tall
- [ ] CHOICE inputs (radio buttons) stack vertically with labels
- [ ] MULTICHOICE inputs (checkboxes) stack vertically with labels
- [ ] "Next" and "Back" buttons are full width or appropriately sized
- [ ] No horizontal scrolling
- [ ] All interactive elements have adequate spacing

**Tablet (768px)**
- [ ] CategoryScreen maintains readable width (max-2xl: 672px)
- [ ] Progress indicator displays inline elements with proper spacing
- [ ] Questions and inputs are comfortable to read and interact with
- [ ] Button layout is appropriate (not too wide)

**Desktop (1024px+)**
- [ ] CategoryScreen has max-width constraint (doesn't stretch too wide)
- [ ] Layout is visually balanced with white space
- [ ] Multi-column layout (if applicable) works correctly

### 3. Summary Page (`/summary`)

**Mobile (375px)**
- [ ] Profile name header is prominent and readable
- [ ] Category cards stack vertically
- [ ] Each category card:
  - [ ] Has readable heading
  - [ ] Shows questions and responses clearly
  - [ ] Has proper spacing between items
  - [ ] Response text wraps correctly (whitespace-pre-wrap)
- [ ] "Edit Profile" button is accessible
- [ ] "Generate Shareable Link" button is accessible
- [ ] Shareable link input and "Copy Link" button stack on mobile
- [ ] Link input is readable (text doesn't overflow)
- [ ] Footer metadata is centered and readable
- [ ] No horizontal scrolling

**Tablet (768px)**
- [ ] SummaryCard maintains max-width (max-w-4xl: 896px)
- [ ] Category cards have comfortable spacing
- [ ] Shareable link section uses flex-row layout
- [ ] Buttons are appropriately sized (not full width)

**Desktop (1024px+)**
- [ ] Content is centered with max-width constraint
- [ ] Category cards have proper shadow and hover effects
- [ ] Button group layout is horizontal (md:flex-row)
- [ ] All whitespace and visual hierarchy is appropriate

### 4. ProfileView Page (`/share/:shareableId`)

**Mobile (375px)**
- [ ] Gradient header (blue-600 to blue-700) displays correctly
- [ ] Profile name is readable and prominent
- [ ] "How to Work With Me" subtitle is visible
- [ ] Introduction box (blue background) is readable
- [ ] Category cards stack vertically
- [ ] Each category:
  - [ ] Has left border accent (blue-600)
  - [ ] Heading is readable
  - [ ] Q&A items have proper spacing
  - [ ] Responses wrap correctly
- [ ] "Get Started" footer link is visible
- [ ] Metadata (last updated) is centered
- [ ] No horizontal scrolling

**Tablet (768px)**
- [ ] ProfileViewCard maintains max-width (max-w-4xl: 896px)
- [ ] Header has appropriate padding and text sizing
- [ ] Category cards are visually appealing with hover effects

**Desktop (1024px+)**
- [ ] Layout is centered with proper max-width
- [ ] Gradient header spans full width within container
- [ ] All visual elements are polished and professional

## Testing Instructions

### Using Chrome DevTools

1. Open Chrome DevTools (F12 or Cmd+Option+I)
2. Click "Toggle Device Toolbar" (Cmd+Shift+M)
3. Select "Responsive" mode
4. Set width to test viewport (375px, 768px, 1024px)
5. Test in both portrait and landscape orientations
6. Check each page systematically using the checklist above

### Using Firefox DevTools

1. Open Firefox DevTools (F12 or Cmd+Option+I)
2. Click "Responsive Design Mode" (Cmd+Option+M)
3. Select preset device or enter custom dimensions
4. Test each page systematically

### Manual Device Testing (Optional)

If available, test on actual devices:
- iPhone SE / iPhone 12 mini (small mobile)
- iPhone 14 / 15 (standard mobile)
- iPad / iPad Mini (tablet)
- Laptop (desktop)

## Common Issues to Check

- **Text Overflow**: Long responses or names should wrap, not overflow
- **Horizontal Scroll**: Should never occur on any page
- **Touch Targets**: Buttons and inputs should be at least 44x44px on mobile
- **Spacing**: Adequate padding between elements (no cramped layouts)
- **Readability**: Text should be minimum 16px on mobile
- **Form Inputs**: Should be easy to tap and type on mobile
- **Navigation**: Buttons should be accessible and easy to tap

## Tailwind Breakpoints Reference

- `sm:` - 640px and above
- `md:` - 768px and above
- `lg:` - 1024px and above
- `xl:` - 1280px and above

Default styles apply to mobile-first (below 640px).

## Success Criteria

All checkboxes above should be marked ✓ for the application to be considered fully responsive and mobile-ready.

## Notes

- The application uses Tailwind CSS responsive utilities
- Most components use `max-w-*` classes to constrain width on large screens
- Flex and grid layouts adjust based on breakpoints
- Text sizing uses responsive scale where appropriate
