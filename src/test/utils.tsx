import { render, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'

// Add providers here as needed (e.g., context providers)
function AllTheProviders({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }
