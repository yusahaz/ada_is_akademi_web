import '@testing-library/jest-dom/vitest'
import '../i18n/config'

// Keep unit tests deterministic and isolated.
// (Add global mocks here as the suite grows.)

// JSDOM doesn't implement matchMedia.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => {
    return {
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    }
  },
})

