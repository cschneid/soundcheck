# 014: Answer Input UI

## Summary
Create the answer input form with two fields for artist and title guesses.

## Acceptance Criteria
- [ ] Two text inputs: Artist, Title
- [ ] Submit button
- [ ] Enter key submits form
- [ ] Inputs cleared between rounds
- [ ] Visual focus states
- [ ] Disabled state after submission

## Technical Details

### Component (`src/components/AnswerInput.tsx`)
```typescript
interface Props {
  onSubmit: (artistGuess: string, titleGuess: string) => void
  disabled?: boolean
}

interface AnswerInputHandle {
  focus: () => void
  clear: () => void
}

export const AnswerInput = forwardRef<AnswerInputHandle, Props>((props, ref) => {
  // ...
})
```

### Layout
```
┌─────────────────────────────────┐
│ Artist:                         │
│ [________________________]      │
│                                 │
│ Song Title:                     │
│ [________________________]      │
│                                 │
│           [Submit Answer]       │
└─────────────────────────────────┘
```

### Behavior
- Focus artist field on mount/round start
- Tab moves to title field
- Enter on title field submits
- Both fields can be empty (counts as wrong)
- After submit, inputs disabled until next round

### Styling
- Clear input styling with Tailwind
- Focus rings visible
- Disabled state visually distinct
- Submit button primary color

## Testing
**Component tests:**
```typescript
describe('AnswerInput', () => {
  it('renders two input fields')
  it('renders submit button')
  it('calls onSubmit with both values')
  it('allows empty submissions')
  it('submits on Enter in title field')
  it('clears inputs via ref.clear()')
  it('focuses artist input via ref.focus()')
  it('disables inputs when disabled prop true')
  it('disables submit button when disabled')
})
```

**Manual verification:**
1. Type in both fields → values captured
2. Press Enter → submits
3. Click Submit → submits
4. After submit → inputs disabled
5. New round → inputs cleared and enabled

## Dependencies
- 001_project-setup
- 002_testing-infrastructure

## Estimated Complexity
Small
