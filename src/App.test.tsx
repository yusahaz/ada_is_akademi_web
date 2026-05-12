import { render, screen } from '@testing-library/react'

import App from './App'
import { AppTestProviders } from './test/render'

describe('App routing', () => {
  it('renders landing for unauthenticated users', async () => {
    render(
      <AppTestProviders>
        <App />
      </AppTestProviders>,
    )

    // Brand appears in multiple places (logo SVG text + footer), so assert a unique control.
    expect(await screen.findByRole('button', { name: /giriş/i })).toBeInTheDocument()
  })
})

