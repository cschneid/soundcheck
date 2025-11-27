# 002: Testing Infrastructure

## Summary
Set up Vitest for unit testing and React Testing Library for component tests. Establish test patterns and utilities.

## Acceptance Criteria
- [ ] Vitest installed and configured
- [ ] React Testing Library installed
- [ ] Test utility file with common helpers
- [ ] Example unit test passing
- [ ] Example component test passing
- [ ] `npm test` script works
- [ ] Coverage reporting configured

## Technical Details

### Dependencies
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @vitest/coverage-v8
```

### Vitest Config
Create `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    coverage: {
      reporter: ['text', 'html'],
      exclude: ['node_modules/', 'src/test/']
    }
  }
})
```

### Test Setup File
Create `src/test/setup.ts`:
```typescript
import '@testing-library/jest-dom'
```

### Example Test Structure
```
src/
  test/
    setup.ts
    utils.tsx        # render helpers, common mocks
  utils/
    __tests__/
      example.test.ts
  components/
    __tests__/
      Example.test.tsx
```

### Package.json Scripts
```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```

## Testing
1. Run `npm test` - watch mode starts
2. Run `npm run test:run` - single run passes
3. Run `npm run test:coverage` - coverage report generates

## Dependencies
- 001_project-setup

## Estimated Complexity
Small
