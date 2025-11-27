# 020: UI Polish & Styling

## Summary
Final polish pass on all UI components for a cohesive, polished look.

## Acceptance Criteria
- [ ] Consistent color scheme throughout
- [ ] Spotify-inspired design (optional)
- [ ] Responsive layout (desktop focus, but not broken on tablet)
- [ ] Smooth transitions between states
- [ ] Focus states accessible
- [ ] Loading states feel polished

## Technical Details

### Color Palette
```css
:root {
  --bg-primary: #121212;      /* Dark background */
  --bg-secondary: #181818;    /* Cards */
  --bg-elevated: #282828;     /* Hover states */
  --text-primary: #ffffff;
  --text-secondary: #b3b3b3;
  --accent: #1db954;          /* Spotify green */
  --error: #e91429;
  --success: #1db954;
}
```

### Typography
- Clean sans-serif (system fonts or Spotify Circular if licensed)
- Clear hierarchy: headings, body, captions
- Good line height for readability

### Component Polish
- Consistent border radius
- Consistent spacing (use Tailwind's spacing scale)
- Hover/focus states on all interactive elements
- Disabled states clearly visible
- Buttons have active/pressed states

### Transitions
```css
.transition-default {
  transition: all 150ms ease-in-out;
}
```

### Focus Management
- Visible focus rings (don't remove outlines)
- Logical tab order
- Focus trapped in modals if any

### Layout
- Max-width container (~800px for main content)
- Centered on larger screens
- Comfortable padding on all sides

## Testing
**Visual review:**
- Screenshot each screen
- Check color consistency
- Verify all states render correctly

**Manual verification:**
1. Tab through entire app
2. All focus states visible
3. Transitions smooth
4. No layout jumps or flashes

## Dependencies
- 019_main-app-flow

## Estimated Complexity
Medium
