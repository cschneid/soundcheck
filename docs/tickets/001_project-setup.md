# 001: Project Setup

## Summary
Initialize the project with Vite, React, TypeScript, and Tailwind CSS. Establish the foundational project structure.

## Acceptance Criteria
- [ ] Vite + React + TypeScript project created
- [ ] Tailwind CSS configured
- [ ] ESLint + Prettier configured
- [ ] Basic folder structure in place
- [ ] Dev server runs without errors

## Technical Details

### Commands
```bash
npm create vite@latest . -- --template react-ts
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install -D eslint prettier eslint-plugin-react-hooks @typescript-eslint/parser
```

### Folder Structure
```
src/
  components/
  hooks/
  utils/
  types/
  App.tsx
  main.tsx
  index.css
```

### Tailwind Config
Configure `tailwind.config.js` to scan all tsx files.

## Testing
**Manual verification:**
1. Run `npm run dev`
2. App loads in browser at localhost:5173
3. Modify App.tsx, confirm hot reload works
4. Tailwind classes apply correctly (add a test class like `bg-blue-500`)

## Dependencies
None (first ticket)

## Estimated Complexity
Small
